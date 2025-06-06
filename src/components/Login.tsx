import React, {useState, useEffect} from 'react';
import {LogIn, AlertCircle, Server} from 'lucide-react';
import {login} from '../lib/auth';
import {apiService} from '../lib/apiService';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({onLogin}: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      const isAvailable = await apiService.getServerStatus();
      setServerStatus(isAvailable ? 'online' : 'offline');
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result) {
        onLogin(result.user);
      } else {
        setError('Ungültige Anmeldedaten');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online':
        return 'Backend verbunden';
      case 'offline':
        return 'Backend nicht erreichbar';
      default:
        return 'Prüfe Server...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-12 h-12 text-blue-600"/>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Dashboard Anmeldung</h1>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Server className={`w-5 h-5 ${getServerStatusColor()}`}/>
          <span className="text-sm text-gray-600">{getServerStatusText()}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5"/>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Benutzername
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Passwort"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || serverStatus === 'offline'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Anmeldung...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}