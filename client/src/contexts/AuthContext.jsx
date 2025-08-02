import { createContext, useContext, useReducer, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        error: null, 
        isAuthenticated: true, 
        user: action.payload.user,
        token: action.payload.token 
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false, user: null, token: null };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, token: null, loading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.getCurrentUser();
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.data.user, 
          token: localStorage.getItem('token') 
        } 
      });
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.data.user, 
          token: response.data.token 
        } 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(name, email, password);
      localStorage.setItem('token', response.data.token);
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { 
          user: response.data.user, 
          token: response.data.token 
        } 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
