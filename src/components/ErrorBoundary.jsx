import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Firebase Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-warning">
            <h4>Connection Issue</h4>
            <p>Having trouble connecting to Firebase. The app will work in offline mode.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;