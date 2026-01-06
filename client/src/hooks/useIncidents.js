import { useEffect, useReducer } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const initialState = {
  incidents: [],
  loading: false,
  error: null,
};

function incidentsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, incidents: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_START':
      return { ...state, loading: true, error: null };
    case 'CREATE_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        incidents: [action.payload, ...state.incidents] 
      };
    case 'CREATE_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        incidents: state.incidents.map(incident =>
          incident.id === action.payload.id ? action.payload : incident
        ),
      };
    default:
      return state;
  }
}

export function useIncidents() {
  const { state: appState } = useApp();
  const [state, dispatch] = useReducer(incidentsReducer, initialState);

  useEffect(() => {
    if (!appState.backendHealth.isHealthy || !appState.selectedUser) {
      return;
    }

    const fetchIncidents = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const response = await axios.get('/api/incidents', {
          headers: { 'x-user-id': appState.selectedUser.id },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    };

    fetchIncidents();
  }, [appState.backendHealth.isHealthy, appState.selectedUser]);

  const createIncident = async (reportReasonId, details, reportedUserId = null) => {
    dispatch({ type: 'CREATE_START' });
    try {
      const response = await axios.post(
        '/api/incidents',
        { reportReasonId, details, reportedUserId: reportedUserId || null },
        { headers: { 'x-user-id': appState.selectedUser.id } }
      );
      dispatch({ type: 'CREATE_SUCCESS', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({ type: 'CREATE_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateIncident = async (incidentId, updates) => {
    try {
      const response = await axios.patch(
        `/api/incidents/${incidentId}`,
        updates,
        { headers: { 'x-user-id': appState.selectedUser.id } }
      );
      dispatch({ type: 'UPDATE_SUCCESS', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  return {
    ...state,
    createIncident,
    updateIncident,
  };
}

