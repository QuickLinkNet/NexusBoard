import { useState, useEffect } from 'react';
import { apiService } from '../lib/apiService';

type ServerStatus = 'online' | 'offline' | 'checking';

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setStatus('checking');
        const isAvailable = await apiService.getServerStatus();
        setStatus(isAvailable ? 'online' : 'offline');
      } catch (err) {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Backend verbunden';
      case 'offline':
        return 'Offline Modus';
      default:
        return 'Prüfe Server...';
    }
  };

  return {
    status,
    statusText: getStatusText()
  };
}