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
          // Prüfe ob der Token noch gültig ist
          const isAvailable = await apiService.getServerStatus();
          if (isAvailable) {
            // Dekodiere den Base64-Token
            const decodedToken = atob(token);
            const [username, timestamp] = decodedToken.split(':');

            // Prüfe ob der Token nicht zu alt ist (24 Stunden)
            const tokenAge = Date.now() - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden

            if (tokenAge <= maxAge) {
              setAuth({
                isAuthenticated: true,
                user: {
                  username,
                  role: 'admin'
                }
              });
            } else {
              // Token ist abgelaufen
              localStorage.removeItem('token');
            }
          }
        } catch (error) {
          console.error('Auto-login failed:', error);
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
