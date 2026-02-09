// src/navigation/CapacitorNavigator.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';

const CapacitorNavigator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Handle Deep Links
    const handleDeepLink = async () => {
      App.addListener('appUrlOpen', (event) => {
        // Strip the domain to get the path
        const slug = event.url.split('.com').pop(); 
        if (slug) {
          navigate(slug);
        }
      });
    };

    // 2. Handle Android Hardware Back Button
    const handleBackButton = async () => {
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1);
        } else {
          App.exitApp();
        }
      });
    };

    handleDeepLink();
    handleBackButton();

    // Cleanup listeners on unmount
    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);

  return null; // This component doesn't render any UI
};

export default CapacitorNavigator;