import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="notfound-bg">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-message">Page not found</p>
        <Link to="/" className="notfound-link">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
