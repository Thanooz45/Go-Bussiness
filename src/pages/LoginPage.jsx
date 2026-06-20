import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './LoginPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '');
const LOGIN_URL = API_BASE_URL ? `${API_BASE_URL}/auth/signin` : '';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (Cookies.get('jwt_token')) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (!LOGIN_URL) {
        throw new Error('The API URL is not configured.');
      }

      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok || !body.data?.token) {
        setErrorMessage(body.message || 'The email or password is incorrect.');
        return;
      }

      Cookies.set('jwt_token', body.data.token, {
        sameSite: 'strict',
        secure: window.location.protocol === 'https:',
      });
      navigate('/');
    } catch (error) {
      setErrorMessage(
        error.message === 'The API URL is not configured.'
          ? error.message
          : 'We could not sign you in. Check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-bg">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title" className="login-brand">Go Business</h1>
        <p className="login-tagline">Welcome back. Sign in to manage your referrals.</p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email" className="login-label">Email address</label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage && (
            <p className="login-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button className="login-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
