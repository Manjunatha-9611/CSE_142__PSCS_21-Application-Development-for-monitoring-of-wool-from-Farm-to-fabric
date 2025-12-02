import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { t, changeLanguage, languages, currentLanguage } = useLanguage();
  useTheme(); // For theme context
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showMobileLanguageDropdown, setShowMobileLanguageDropdown] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Two-Tier KLWB Header */}
      {/* Top Tier - Identity Bar */}
      <div className="klwb-header-identity">
        <div className="container">
          <div className="klwb-identity-content">
            <div className="klwb-identity-left">
              <h2 className="klwb-kannada-text">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h2>
              <p className="klwb-system-title">Wool Traceability System</p>
            </div>
            <div className="klwb-identity-center">
              <img src="/karnataka_emblem.png" alt="Karnataka Government Emblem" className="klwb-emblem" />
            </div>
            <div className="klwb-identity-right">
              <h2 className="klwb-govt-text">Government of Karnataka</h2>
              <p className="klwb-monitoring-text">Farm to Fabric Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tier - Navigation Bar */}
      <div className="klwb-header-nav">
        <div className="container">
          <div className="klwb-nav-content">
            <div className="d-flex align-items-center">
              {user && (
                <>
                  <div className="d-none d-lg-flex klwb-nav-menu">
                    <Link className="klwb-nav-item" to="/">{t('home')}</Link>
                    <Link className="klwb-nav-item" to="/products">{t('products')}</Link>
                    {user.role === 'farmer' && (
                      <>
                        <Link className="klwb-nav-item" to="/dashboard">{t('dashboard')}</Link>
                        <Link className="klwb-nav-item" to="/traceability">My Batches</Link>
                        <Link className="klwb-nav-item" to="/marketplace">{t('marketplace')}</Link>
                        <Link className="klwb-nav-item" to="/inventory">{t('inventory')}</Link>
                        <Link className="klwb-nav-item" to="/processing-services">{t('processing')}</Link>
                        <Link className="klwb-nav-item" to="/profile">{t('profile')}</Link>
                      </>
                    )}
                    {user.role === 'buyer' && (
                      <>
                        <Link className="klwb-nav-item" to="/dashboard">{t('dashboard')}</Link>
                        <Link className="klwb-nav-item" to="/traceability">Track Batches</Link>
                        <Link className="klwb-nav-item" to="/cart">Cart</Link>
                        <Link className="klwb-nav-item" to="/orders">Orders</Link>
                        <Link className="klwb-nav-item" to="/processing-services">{t('processing')}</Link>
                        <Link className="klwb-nav-item" to="/profile">{t('profile')}</Link>
                      </>
                    )}
                    {user.role === 'government' && (
                      <>
                        <Link className="klwb-nav-item" to="/dashboard">{t('dashboard')}</Link>
                        <Link className="klwb-nav-item" to="/government">Admin Panel</Link>
                        <Link className="klwb-nav-item" to="/market-info">Market Info</Link>
                        <Link className="klwb-nav-item" to="/inventory">{t('inventory')}</Link>
                        <Link className="klwb-nav-item" to="/processing-services">{t('processing')}</Link>
                        <Link className="klwb-nav-item" to="/profile">{t('profile')}</Link>
                      </>
                    )}
                    {user.role === 'inspector' && (
                      <>
                        <Link className="klwb-nav-item" to="/dashboard">{t('dashboard')}</Link>
                        <Link className="klwb-nav-item" to="/inspector-quality">Quality Assessment</Link>
                        <Link className="klwb-nav-item" to="/profile">{t('profile')}</Link>
                      </>
                    )}
                  </div>
                  <button
                    className="klwb-hamburger d-lg-none"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sidebarMenu"
                  >
                    <i className="fas fa-bars"></i>
                  </button>
                </>
              )}
            </div>
            <div className="klwb-user-section">
              {user ? (
                <>
                  {/* Language Selector */}
                  <div className="dropdown" style={{ position: 'relative' }}>
                    <button
                      className="btn btn-sm btn-outline-light dropdown-toggle"
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      onBlur={() => setTimeout(() => setShowLanguageDropdown(false), 200)}
                    >
                      <i className="fas fa-language me-1"></i>
                      {languages.find(l => l.code === currentLanguage)?.nativeName || 'English'}
                    </button>
                    {showLanguageDropdown && (
                      <div
                        className="dropdown-menu show"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          minWidth: '200px',
                          zIndex: 1050
                        }}
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            className={`dropdown-item ${currentLanguage === lang.code ? 'active' : ''}`}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setShowLanguageDropdown(false);
                            }}
                          >
                            <span className="me-2">{lang.flag}</span>
                            {lang.nativeName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="klwb-user-info">
                    <i className="fas fa-user me-2"></i>
                    {user.name} ({user.role})
                  </span>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i>{t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-light me-2" to="/login">{t('login')}</Link>
                  <Link className="btn btn-light" to="/login">Registration</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {user && (
        <div className="offcanvas offcanvas-start klwb-sidebar" tabIndex="-1" id="sidebarMenu">
          <div className="offcanvas-header" style={{ background: 'var(--klwb-primary)', color: 'var(--klwb-white)' }}>
            <h5 className="offcanvas-title">Navigation Menu</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body p-0">
            <nav className="nav flex-column">
              <button className="nav-link" onClick={() => { handleNavClick('/'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                <i className="fas fa-home"></i>Home
              </button>
              <button className="nav-link" onClick={() => { handleNavClick('/products'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                <i className="fas fa-shopping-bag"></i>Products
              </button>

              {user.role === 'farmer' && (
                <>
                  <button className="nav-link" onClick={() => { handleNavClick('/dashboard'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-tachometer-alt"></i>Dashboard
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/traceability'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-seedling"></i>My Batches
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/marketplace'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-store"></i>Marketplace
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/inventory'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-warehouse"></i>Inventory
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/processing-services'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-cogs"></i>Processing Services
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/processing'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-industry"></i>Wool Processing
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/education'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-graduation-cap"></i>Training
                  </button>
                </>
              )}

              {user.role === 'inspector' && (
                <>
                  <button className="nav-link" onClick={() => { handleNavClick('/dashboard'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-tachometer-alt"></i>Dashboard
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/inspector-quality'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-microscope"></i>Quality Assessment
                  </button>
                </>
              )}

              {user.role === 'buyer' && (
                <>
                  <button className="nav-link" onClick={() => { handleNavClick('/dashboard'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-tachometer-alt"></i>Dashboard
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/cart'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-shopping-cart"></i>Cart
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/orders'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-receipt"></i>Orders
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/marketplace'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-store"></i>Marketplace
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/processing-services'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-cogs"></i>Processing Services
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/education'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-graduation-cap"></i>Training
                  </button>
                </>
              )}

              {user.role === 'government' && (
                <>
                  <button className="nav-link" onClick={() => { handleNavClick('/dashboard'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-tachometer-alt"></i>Dashboard
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/government'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-shield-alt"></i>Admin Panel
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/inspect'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-clipboard-check"></i>Assess Batches
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/market-info'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-chart-line"></i>Market Info
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/inventory'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-warehouse"></i>Inventory
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/processing-services'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-cogs"></i>Processing Services
                  </button>
                  <button className="nav-link" onClick={() => { handleNavClick('/education'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                    <i className="fas fa-graduation-cap"></i>Training
                  </button>
                </>
              )}

              <hr className="my-2" />
              <button className="nav-link" onClick={() => { handleNavClick('/profile'); document.querySelector('[data-bs-dismiss="offcanvas"]').click(); }}>
                <i className="fas fa-user-edit"></i>Profile
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;