import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {LoginPage} from './pages/Auth/LoginPage';
import {DashboardLayout} from './templates/DashboardLayout/DashboardLayout';
import {DashboardPage} from './pages/Dashboard/DashboardPage';
import {PromptsPage} from './pages/Prompts/PromptsPage';
import {FilesPage} from './pages/Files/FilesPage';
import {AuthState} from './utils/types/auth';
import {apiService} from './services/api/apiService';

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

  if (!auth.isAuthenticated) {
    return <LoginPage onLogin={handleLogin}/>;
  }

  return (
    <Router basename="/apps/nexusboard">
      <DashboardLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage/>}/>
          <Route path="/prompts" element={<PromptsPage/>}/>
          <Route path="/files" element={<FilesPage/>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;