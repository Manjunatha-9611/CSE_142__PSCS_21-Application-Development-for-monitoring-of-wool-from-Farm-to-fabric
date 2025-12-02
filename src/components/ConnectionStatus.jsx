import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if starting offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <div className={`alert ${isOnline ? 'alert-warning' : 'alert-danger'} alert-dismissible fade show position-fixed`} 
         style={{top: '10px', right: '10px', zIndex: 9999, maxWidth: '400px'}}>
      <div className="d-flex align-items-center">
        <i className={`fas ${isOnline ? 'fa-wifi' : 'fa-exclamation-triangle'} me-2`}></i>
        <div>
          <strong>{isOnline ? 'Connection Issue' : 'Offline Mode'}</strong>
          <div className="small">
            {isOnline 
              ? 'Having trouble connecting to Firebase. The app will work in offline mode.'
              : 'No internet connection. Some features may be limited.'
            }
          </div>
        </div>
      </div>
      <button 
        type="button" 
        className="btn-close" 
        onClick={() => setShowOfflineMessage(false)}
      ></button>
    </div>
  );
};

export default ConnectionStatus;