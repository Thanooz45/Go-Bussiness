import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import { formatDate, formatMoney } from '../utils/formatters';
import './DashboardPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '');
const REFERRALS_URL = API_BASE_URL ? `${API_BASE_URL}/referrals` : '';
const PAGE_SIZE = 10;

function getMetricIcon(label) {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes('discount')) return '%';
  if (normalizedLabel.includes('referral')) return 'R';
  if (normalizedLabel.includes('commission')) return 'C';
  if (normalizedLabel.includes('transfer')) return 'T';
  return '$';
}

function DashboardPage() {
  const navigate = useNavigate();
  const token = Cookies.get('jwt_token');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [referral, setReferral] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedField, setCopiedField] = useState('');
  const filtersReady = useRef(false);

  const fetchReferrals = useCallback(async (query, order, includeSummary = false) => {
    setErrorMessage('');

    try {
      if (!REFERRALS_URL) {
        throw new Error('The API URL is not configured.');
      }

      const params = new URLSearchParams({ sort: order });
      if (query) params.set('search', query);

      const response = await fetch(`${REFERRALS_URL}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.message || `Request failed with status ${response.status}.`);
      }

      const data = body.data || body;
      if (includeSummary) {
        setMetrics(data.metrics || []);
        setServiceSummary(data.serviceSummary || null);
        setReferral(data.referral || null);
      }
      setReferrals(data.referrals || []);
      setCurrentPage(1);
    } catch (error) {
      setErrorMessage(error.message || 'Could not load your referrals.');
    } finally {
      if (includeSummary) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReferrals('', 'desc', true);
  }, [fetchReferrals]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(search.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!filtersReady.current) {
      filtersReady.current = true;
      return;
    }
    fetchReferrals(searchQuery, sortOrder);
  }, [searchQuery, sortOrder, fetchReferrals]);

  const totalPages = Math.ceil(referrals.length / PAGE_SIZE);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return referrals.slice(start, start + PAGE_SIZE);
  }, [currentPage, referrals]);
  const firstVisibleRow = referrals.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastVisibleRow = Math.min(currentPage * PAGE_SIZE, referrals.length);

  const copyReferralValue = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(''), 1800);
    } catch {
      setErrorMessage('Could not copy to your clipboard.');
    }
  };

  const openReferral = (id) => {
    navigate(`/referral/${id}`);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <p className="dashboard-eyebrow">Partner workspace</p>
          <h1 className="dashboard-title">Referral dashboard</h1>
          <p className="dashboard-subtitle">
            A quick look at your referrals, earnings, and recent partner activity.
          </p>
        </header>

        {errorMessage && (
          <div className="dashboard-error" role="alert">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage('')}>Dismiss</button>
          </div>
        )}

        <section className="dash-section" aria-labelledby="overview-title">
          <h2 id="overview-title" className="section-title">Overview</h2>
          <div className="metrics-grid">
            {metrics.map((metric) => (
              <div key={metric.id || metric.label} className="metric-card">
                <div className="metric-icon" aria-hidden="true">
                  {getMetricIcon(metric.label)}
                </div>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        {serviceSummary && (
          <section className="dash-section" aria-labelledby="summary-title">
            <h2 id="summary-title" className="section-title">Service summary</h2>
            <div className="service-summary-card">
              <div className="ss-item">
                <div className="ss-label">Service</div>
                <div className="ss-value ss-service">{serviceSummary.service}</div>
              </div>
              <div className="ss-item">
                <div className="ss-label">Your referrals</div>
                <div className="ss-value">{serviceSummary.yourReferrals}</div>
              </div>
              <div className="ss-item">
                <div className="ss-label">Active referrals</div>
                <div className="ss-value">{serviceSummary.activeReferrals}</div>
              </div>
              <div className="ss-item">
                <div className="ss-label">Total earnings</div>
                <div className="ss-value">{serviceSummary.totalRefEarnings}</div>
              </div>
            </div>
          </section>
        )}

        {referral && (
          <section className="dash-section" aria-labelledby="share-title">
            <h2 id="share-title" className="section-title">Share your referral</h2>
            <p className="section-description">
              Send your link or code to someone who may benefit from the service.
            </p>
            <div className="referral-share-row">
              <div className="referral-share-field">
                <label htmlFor="referral-link" className="rs-label">Referral link</label>
                <div className="rs-input-row">
                  <input id="referral-link" readOnly value={referral.link} className="rs-input" />
                  <button
                    type="button"
                    className="btn-copy"
                    onClick={() => copyReferralValue('link', referral.link)}
                  >
                    {copiedField === 'link' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="referral-share-field">
                <label htmlFor="referral-code" className="rs-label">Referral code</label>
                <div className="rs-input-row">
                  <input id="referral-code" readOnly value={referral.code} className="rs-input" />
                  <button
                    type="button"
                    className="btn-copy"
                    onClick={() => copyReferralValue('code', referral.code)}
                  >
                    {copiedField === 'code' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="dash-section" aria-labelledby="referrals-title">
          <div className="section-heading-row">
            <div>
              <h2 id="referrals-title" className="section-title">All referrals</h2>
              <p className="section-description">Select a row to see the full referral details.</p>
            </div>
            <span className="result-count">{referrals.length} total</span>
          </div>

          <div className="table-controls">
            <div className="search-wrapper">
              <label htmlFor="referral-search" className="search-label">Search</label>
              <div className="search-input-wrapper">
                <input
                  id="referral-search"
                  type="search"
                  className="search-input"
                  placeholder="Name or service"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="sort-wrapper">
              <label htmlFor="sort-select" className="sort-label">Date</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No referrals match your search.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr
                      key={row.id}
                      className="table-row"
                      onClick={() => openReferral(row.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') openReferral(row.id);
                      }}
                      tabIndex={0}
                    >
                      <td className="name-cell">{row.name}</td>
                      <td>{row.serviceName}</td>
                      <td>{formatDate(row.date)}</td>
                      <td className="profit-cell">{formatMoney(row.profit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <span className="pagination-info">
              Showing {firstVisibleRow}–{lastVisibleRow} of {referrals.length}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`page-num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <Link to="/" className="footer-brand">Go Business</Link>
          <nav className="footer-links" aria-label="Footer">
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </nav>
          <span className="footer-copy">© {new Date().getFullYear()} Go Business Inc.</span>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;
