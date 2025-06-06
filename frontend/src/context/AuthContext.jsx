import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    let newIsAuthenticated = false;
    let newUser = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && 
            typeof decoded.user_id === 'string' && decoded.user_id.trim() !== '' &&
            typeof decoded.username === 'string' && decoded.username.trim() !== '' &&
            typeof decoded.role === 'string' && decoded.role.trim() !== '') {
          
          newUser = {
            userId: decoded.user_id,
            username: decoded.username,
            role: decoded.role,
          };
          newIsAuthenticated = true;
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('studentId');
        }
      } catch (error) {
        console.error("Erro ao decodificar token, limpando token:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('studentId');
        setToken(null);
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('studentId');
    }

    if (isMounted) {
      setUser(newUser);
      setIsAuthenticated(newIsAuthenticated);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const loginUser = (newToken) => {
    setToken(newToken);
  };

  const logoutUser = () => {
    // Limpeza completa do estado
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Limpeza do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    
    // Redirecionar para login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 