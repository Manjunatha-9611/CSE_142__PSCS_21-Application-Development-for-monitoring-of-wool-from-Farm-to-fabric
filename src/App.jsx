/**
 * Main Application Component - Karnataka Wool Monitoring System
 * 
 * This is the root component that sets up the entire application structure
 * including routing, authentication, context providers, and global state management.
 * 
 * Features:
 * - Role-based routing and access control
 * - Firebase authentication integration
 * - Multi-language support (English/Kannada)
 * - KLWB government theme styling
 * - Error boundary for graceful error handling
 * - Real-time connection status monitoring
 */

// React core imports
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context providers for global state management
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Core UI components
import Navbar from './components/Navbar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';

// Authentication and security components
import Login from './pages/Login.jsx';
import RoleGuard from './components/RoleGuard.jsx';

// Page components organized by user role
// Public pages
import ECommerceHome from './pages/ECommerceHome.jsx';
import ProductCatalog from './pages/ProductCatalog.jsx';
import TrackingPage from './pages/TrackingPage.jsx';

// Farmer-specific pages
import FarmerTraceability from './pages/FarmerTraceability.jsx';
import WoolProcessing from './pages/WoolProcessing.jsx';

// Buyer-specific pages
import ShoppingCart from './pages/ShoppingCart.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import SimpleMarketplace from './pages/SimpleMarketplace.jsx';

// Government and inspector pages
import GovernmentDashboard from './pages/GovernmentDashboard.jsx';
import InspectorDashboard from './pages/InspectorDashboard.jsx';
import InspectorQuality from './pages/InspectorQuality.jsx';
import MarketInfo from './pages/MarketInfo.jsx';
import InventoryManagement from './pages/InventoryManagement.jsx';
import ProcessingServices from './pages/ProcessingServices.jsx';

// Shared pages
import SimpleDashboard from './pages/SimpleDashboard.jsx';
import UserProfile from './pages/UserProfile.jsx';
import EducationTraining from './pages/EducationTraining.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import FAQ from './pages/FAQ.jsx';

// Core UI components
import Footer from './components/Footer.jsx';

// Services
import authService from './services/authService.jsx';

// Styling imports - KLWB government theme
import './styles/government-theme.css';  // Primary KLWB styling
import './styles/modern.css';            // Modern UI enhancements
import './styles/global.css';            // Global styles and Bootstrap overrides
import './styles/theme.css';             // Theme variables and utilities
import './styles/modern-ui.css';         // Additional modern UI components
import './styles/payment.css';           // Payment-specific styling
import './styles/tracking.css';          // Tracking and logistics styling
import './styles/footer-sidebar.css';    // Footer and Sidebar styling

/**
 * Main App Component
 * 
 * Manages global application state including user authentication,
 * loading states, and shopping cart functionality.
 */
function App() {
  // Global state management
  const [user, setUser] = useState(null);           // Current authenticated user
  const [isLoading, setIsLoading] = useState(true);  // App initialization loading state
  const [cart, setCart] = useState([]);              // Shopping cart items (for buyers)

  /**
   * Initialize authentication listener on component mount
   * 
   * Sets up Firebase authentication state listener to automatically
   * update user state when authentication status changes.
   */
  useEffect(() => {
    // Subscribe to Firebase authentication state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        // User is authenticated - set user data
        setUser(user);
      } else {
        // User is not authenticated - clear user data
        setUser(null);
      }
      // Authentication check complete - stop loading
      setIsLoading(false);
    });

    // Cleanup: Unsubscribe from auth listener when component unmounts
    return () => unsubscribe();
  }, []);

  /**
   * Handle successful user login
   * 
   * Called by Login component when user successfully authenticates.
   * Updates global user state with authenticated user data.
   * 
   * @param {Object} userData - Authenticated user data from Firebase
   */
  const handleLogin = (userData) => {
    setUser(userData);
  };

  /**
   * Handle user logout
   * 
   * Signs out user from Firebase authentication and clears global user state.
   * Includes error handling for logout failures.
   */
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await authService.signOut();
    } catch (error) {
      // Log logout errors but don't prevent UI update
      console.error('Logout error:', error);
    }
    // Clear user state regardless of Firebase signOut result
    setUser(null);
  };

  /**
   * Loading Screen
   * 
   * Displayed while the app initializes and checks authentication status.
   * Prevents flash of unauthenticated content during app startup.
   */
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-3"></div>
          <p className="text-white">Loading Wool Monitor...</p>
        </div>
      </div>
    );
  }

  /**
   * Main App Render
   * 
   * Renders the complete application with all providers, routing, and components.
   * Uses nested provider pattern for context management.
   */
  return (
    // Error boundary catches and handles JavaScript errors gracefully
    <ErrorBoundary>
      {/* Theme provider manages KLWB government styling */}
      <ThemeProvider>
        {/* Language provider manages English/Kannada translations */}
        <LanguageProvider>
          {/* Router setup with future flags for React Router v7 compatibility */}
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App modern-ui">
              {/* Connection status indicator for offline/online state */}
              <ConnectionStatus />

              {/* Main navigation bar with user context */}
              <Navbar user={user} onLogout={handleLogout} />

              {/* Main content area with conditional KLWB styling */}
              <div className={user ? 'klwb-main-content' : ''}>

                {/* Development Tools - Only visible in development mode */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ position: 'fixed', top: '70px', right: '10px', zIndex: 9999 }}>
                    <button
                      className="btn btn-sm btn-warning mb-2"
                      onClick={() => window.seedSampleData && window.seedSampleData()}
                      title="Seed sample data for testing"
                    >
                      🌱 Seed Data
                    </button>
                  </div>
                )}



                {/* Application Routes */}
                <Routes>
                  {/* Public Routes - Accessible without authentication */}
                  <Route path="/" element={<ECommerceHome user={user} />} />
                  <Route path="/login" element={<Login onLogin={handleLogin} />} />
                  <Route path="/products" element={<ProductCatalog user={user} />} />
                  <Route path="/tracking/:batchId" element={<TrackingPage />} />

                  {/* Protected Routes - Require authentication and specific roles */}
                  <Route path="/profile" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'buyer', 'government']}>
                      <UserProfile user={user} />
                    </RoleGuard>
                  } />

                  {/* Multi-Role Dashboard */}
                  <Route path="/dashboard" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'buyer', 'government']}>
                      <SimpleDashboard user={user} />
                    </RoleGuard>
                  } />

                  {/* Farmer and Buyer Routes */}
                  <Route path="/traceability" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'buyer']}>
                      <FarmerTraceability user={user} />
                    </RoleGuard>
                  } />
                  <Route path="/processing" element={
                    <RoleGuard user={user} allowedRoles={['farmer']}>
                      <WoolProcessing user={user} />
                    </RoleGuard>
                  } />

                  {/* Buyer-Specific Routes */}
                  <Route path="/cart" element={
                    <RoleGuard user={user} allowedRoles={['buyer']}>
                      <ShoppingCart user={user} cart={cart} setCart={setCart} />
                    </RoleGuard>
                  } />

                  {/* Buyer and Farmer Shared Routes */}
                  <Route path="/orders" element={
                    <RoleGuard user={user} allowedRoles={['buyer', 'farmer']}>
                      <OrderHistory user={user} />
                    </RoleGuard>
                  } />
                  <Route path="/marketplace" element={
                    <RoleGuard user={user} allowedRoles={['buyer', 'farmer']}>
                      <SimpleMarketplace user={user} />
                    </RoleGuard>
                  } />

                  {/* Market Information - All Roles */}
                  <Route path="/market-info" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'buyer', 'government', 'inspector']}>
                      <MarketInfo />
                    </RoleGuard>
                  } />

                  {/* Inventory Management - Farmers and Government */}
                  <Route path="/inventory" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'government']}>
                      <InventoryManagement user={user} />
                    </RoleGuard>
                  } />

                  {/* Processing Services - Farmers, Buyers, and Government */}
                  <Route path="/processing-services" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'buyer', 'government']}>
                      <ProcessingServices user={user} />
                    </RoleGuard>
                  } />

                  {/* Government-Only Routes */}
                  <Route path="/government" element={
                    <RoleGuard user={user} allowedRoles={['government']}>
                      <GovernmentDashboard user={user} />
                    </RoleGuard>
                  } />

                  {/* Quality Assessment Routes - Inspectors and Government */}
                  <Route path="/inspect" element={
                    <RoleGuard user={user} allowedRoles={['inspector', 'government']}>
                      <InspectorDashboard user={user} />
                    </RoleGuard>
                  } />
                  <Route path="/inspector-quality" element={
                    <RoleGuard user={user} allowedRoles={['inspector']}>
                      <InspectorQuality user={user} />
                    </RoleGuard>
                  } />

                  {/* Education & Training - All Roles */}
                  <Route path="/education" element={
                    <RoleGuard user={user} allowedRoles={['farmer', 'buyer', 'government', 'inspector']}>
                      <EducationTraining user={user} />
                    </RoleGuard>
                  } />
                  {/* Public Information Routes */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/faq" element={<FAQ />} />
                </Routes>

                {/* Footer Component */}
                <Footer />
              </div>
            </div>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Export App component as default export
export default App;