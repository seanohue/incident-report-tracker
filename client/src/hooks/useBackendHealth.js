import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

export function useBackendHealth() {
  const { state, dispatch } = useApp();
  const intervalRef = useRef(null);

  const checkHealth = async () => {
    dispatch({ type: 'SET_BACKEND_HEALTH', payload: { isChecking: true } });
    
    try {
      const response = await axios.get('/api/health');
      if (response.status === 200) {
        dispatch({ 
          type: 'SET_BACKEND_HEALTH', 
          payload: { isHealthy: true, isChecking: false } 
        });
        
        // Clear polling interval once healthy
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_BACKEND_HEALTH', 
        payload: { isHealthy: false, isChecking: false } 
      });
      
      // Start polling if not already polling
      if (!intervalRef.current) {
        intervalRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
      }
    }
  };

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isHealthy: state.backendHealth.isHealthy,
    isChecking: state.backendHealth.isChecking,
    checkHealth,
  };
}

