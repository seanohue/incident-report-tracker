import { useEffect, useReducer } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const initialState = {
  users: [],
  loading: false,
  error: null,
};

function usersReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function useUsers() {
  const { state: appState } = useApp();
  const [state, dispatch] = useReducer(usersReducer, initialState);

  useEffect(() => {
    if (!appState.backendHealth.isHealthy) {
      return; // Don't fetch if backend is down
    }

    const fetchUsers = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const response = await axios.get('/api/test/users');
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    };

    fetchUsers();
  }, [appState.backendHealth.isHealthy]);

  const banUser = async (userId) => {
    try {
      const response = await axios.patch(
        `/api/users/${userId}`,
        { banned: true },
        { headers: { 'x-user-id': appState.selectedUser?.id } }
      );
      // Refresh users list
      const usersResponse = await axios.get('/api/test/users');
      dispatch({ type: 'FETCH_SUCCESS', payload: usersResponse.data });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { ...state, banUser };
}
