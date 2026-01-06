import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  selectedUser: null,
  backendHealth: {
    isHealthy: false,
    isChecking: false,
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUser: action.payload,
      };
    case 'SET_BACKEND_HEALTH':
      return {
        ...state,
        backendHealth: {
          isHealthy: action.payload.isHealthy,
          isChecking: action.payload.isChecking ?? state.backendHealth.isChecking,
        },
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

