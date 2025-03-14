import React, {useState} from 'react';
import {LogIn, AlertCircle} from 'lucide-react';
import {Card} from '../../molecules/Card/Card';
import {FormField} from '../../molecules/FormField/FormField';
import {Button} from '../../atoms/Button/Button';
import {login} from '../../services/auth/auth';
import {useServerStatus} from '../../utils/hooks/useServerStatus';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({onLogin}: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {status, statusText} = useServerStatus();

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-96 p-8">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-12 h-12 text-blue-600"/>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">
          Dashboard Anmeldung
        </h1>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${
            status === 'online' ? 'bg-green-500' : 'bg-red-500'
          }`}/>
          <span className="text-sm text-gray-600">{statusText}</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5"/>
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Benutzername"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Username"
          />

          <FormField
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Passwort"
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading || status === 'offline'}
          >
            {isLoading ? 'Anmeldung...' : 'Anmelden'}
          </Button>
        </form>
      </Card>
    </div>
  );
}