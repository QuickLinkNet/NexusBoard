import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AuthState } from './types/auth';
import { apiService } from './lib/apiService';

function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
              setAuth({
                isAuthenticated: true,
                user: data.data.user
              });
            } else {
              localStorage.removeItem('token');
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (user: any) => {
    setAuth({
      isAuthenticated: true,
      user,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth({
      isAuthenticated: false,
      user: null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {!auth.isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
