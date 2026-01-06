import { useEffect, useReducer } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const initialState = {
  reasons: [],
  loading: false,
  error: null,
};

function reasonsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, reasons: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function useReportReasons() {
  const { state: appState } = useApp();
  const [state, dispatch] = useReducer(reasonsReducer, initialState);

  useEffect(() => {
    if (!appState.backendHealth.isHealthy || !appState.selectedUser) {
      return;
    }

    const fetchReasons = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const response = await axios.get('/api/report-reasons', {
          headers: { 'x-user-id': appState.selectedUser.id },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    };

    fetchReasons();
  }, [appState.backendHealth.isHealthy, appState.selectedUser]);

  return state;
}

