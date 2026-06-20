import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Go to dashboard home">
          Go Business
        </Link>
        <nav aria-label="Primary" className="navbar-nav">
          <Link to="/" className="nav-link">Home</Link>
        </nav>
        <div className="navbar-actions">
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
