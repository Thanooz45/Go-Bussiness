import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import { formatDate, formatMoney } from '../utils/formatters';
import './ReferralDetailPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '');
const REFERRALS_URL = API_BASE_URL ? `${API_BASE_URL}/referrals` : '';

function findReferral(data, id) {
  if (data?.id !== undefined && String(data.id) === String(id)) return data;
  if (!Array.isArray(data?.referrals)) return null;
  return data.referrals.find((referral) => String(referral.id) === String(id)) || null;
}

function ReferralDetailPage() {
  const { id } = useParams();
  const token = Cookies.get('jwt_token');
  const [referral, setReferral] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function loadReferral() {
      setStatus('loading');

      try {
        if (!REFERRALS_URL) {
          throw new Error('The API URL is not configured.');
        }

        const response = await fetch(`${REFERRALS_URL}?id=${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus('missing');
          return;
        }

        const match = findReferral(body.data || body, id);
        setReferral(match);
        setStatus(match ? 'ready' : 'missing');
      } catch (error) {
        if (error.name !== 'AbortError') setStatus('error');
      }
    }

    loadReferral();
    return () => controller.abort();
  }, [id, token]);

  return (
    <div className="detail-page">
      <Navbar />
      <main className="detail-main">
        <Link to="/" className="back-link">← Back to dashboard</Link>

        {status === 'loading' && (
          <div className="detail-loading">
            <div className="spinner" aria-hidden="true"></div>
            <p>Loading referral…</p>
          </div>
        )}

        {(status === 'missing' || status === 'error') && (
          <section className="detail-message">
            <p className="detail-eyebrow">Referral #{id}</p>
            <h1 className="detail-title">
              {status === 'error' ? 'We could not load this referral' : 'Referral not found'}
            </h1>
            <p className="detail-subtitle">
              {status === 'error'
                ? 'Please check your connection and try again.'
                : 'It may have been removed, or the link may be incorrect.'}
            </p>
          </section>
        )}

        {status === 'ready' && referral && (
          <>
            <header className="detail-heading">
              <p className="detail-eyebrow">Referral #{referral.id}</p>
              <h1 className="detail-title">Referral details</h1>
              <p className="detail-subtitle">Partner information and recorded earnings.</p>
            </header>

            <section className="detail-card" aria-label="Referral information">
              <div className="detail-card-header">
                <div>
                  <p className="detail-card-label">Partner</p>
                  <h2 className="partner-name">{referral.name}</h2>
                </div>
                <span className="service-badge">{referral.serviceName}</span>
              </div>

              <dl className="detail-list">
                <div className="detail-row">
                  <dt className="detail-dt">Referral ID</dt>
                  <dd className="detail-dd">{referral.id}</dd>
                </div>
                <div className="detail-row">
                  <dt className="detail-dt">Service</dt>
                  <dd className="detail-dd">{referral.serviceName}</dd>
                </div>
                <div className="detail-row">
                  <dt className="detail-dt">Joined</dt>
                  <dd className="detail-dd">{formatDate(referral.date)}</dd>
                </div>
                <div className="detail-row">
                  <dt className="detail-dt">Profit</dt>
                  <dd className="detail-dd detail-profit">{formatMoney(referral.profit)}</dd>
                </div>
              </dl>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ReferralDetailPage;
