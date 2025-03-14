import React, {useState, useEffect} from 'react';
import {AlertCircle} from 'lucide-react';
import {apiService} from '../../../services/api/apiService';

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  expected_runs: string;
  successful_runs: string;
}

export default function PendingPrompts() {
  const [pendingPrompts, setPendingPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingPrompts();
    // Aktualisiere alle 30 Sekunden
    const interval = setInterval(loadPendingPrompts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingPrompts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrompts();
      const prompts = response.prompts || [];

      // Filtere Prompts, die noch nicht vollständig abgearbeitet sind
      const pending = prompts.filter(prompt =>
        parseInt(prompt.successful_runs) < parseInt(prompt.expected_runs)
      );

      setPendingPrompts(pending);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Prompts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5"/>
        <span>{error}</span>
      </div>
    );
  }

  if (pendingPrompts.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>Keine ausstehenden Prompts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-900">
          {pendingPrompts.length} {pendingPrompts.length === 1 ? 'Prompt' : 'Prompts'} ausstehend
        </div>
      </div>

      <div className="space-y-2">
        {pendingPrompts.map(prompt => {
          const progress = Math.round((parseInt(prompt.successful_runs) / parseInt(prompt.expected_runs)) * 100);

          return (
            <div key={prompt.id} className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                <span className="text-sm text-gray-500">
                  {prompt.successful_runs}/{prompt.expected_runs}
                </span>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{width: `${progress}%`}}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}