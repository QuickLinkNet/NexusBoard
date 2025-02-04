import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../../../lib/apiService';

interface EndpointStatus {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  status: 'online' | 'offline' | 'error';
  latency?: number;
  lastChecked: Date;
  error?: string;
}

export default function APIStatus() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    {
      name: 'Backend Health',
      endpoint: '/api/health',
      method: 'GET',
      status: 'offline',
      lastChecked: new Date()
    },
    {
      name: 'Prompts API',
      endpoint: '/api/prompts',
      method: 'GET',
      status: 'offline',
      lastChecked: new Date()
    },
    {
      name: 'Meta Generator',
      endpoint: '/api/meta/generate',
      method: 'POST',
      status: 'offline',
      lastChecked: new Date()
    },
    {
      name: 'Authentication',
      endpoint: '/api/me',
      method: 'GET',
      status: 'offline',
      lastChecked: new Date()
    }
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<Partial<EndpointStatus>> => {
    const startTime = performance.now();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint.endpoint}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        ...(endpoint.method === 'POST' ? {
          body: JSON.stringify({
            imagesPath: 'test',
            outputPath: 'test'
          })
        } : {})
      });
      const latency = Math.round(performance.now() - startTime);

      if (response.ok) {
        return {
          status: 'online',
          latency,
          error: undefined
        };
      } else {
        return {
          status: 'error',
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        status: 'offline',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkAllEndpoints = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const updatedEndpoints = await Promise.all(
        endpoints.map(async (endpoint) => {
          const status = await checkEndpoint(endpoint);
          return {
            ...endpoint,
            ...status,
            lastChecked: new Date()
          };
        })
      );
      setEndpoints(updatedEndpoints);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAllEndpoints();

    // Cleanup previous interval if it exists
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    // Set new interval
    const interval = setInterval(checkAllEndpoints, 30000);
    setCheckInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []); // Empty dependency array to run only once on mount

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">API Status</h2>
        <button
          onClick={checkAllEndpoints}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          Aktualisieren
        </button>
      </div>

      <div className="grid gap-4">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.endpoint}
            className="p-4 bg-white border rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(endpoint.status)}
                <div>
                  <h3 className="font-semibold">{endpoint.name}</h3>
                  <p className="text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-1 rounded">{endpoint.method}</span>
                    {' '}{endpoint.endpoint}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {endpoint.latency && (
                  <span className="text-sm text-gray-600">
                    {endpoint.latency}ms
                  </span>
                )}
                <span className={`px-3 py-1 text-sm border rounded-full ${getStatusBadgeColor(endpoint.status)}`}>
                  {endpoint.status}
                </span>
              </div>
            </div>
            {endpoint.error && (
              <div className="mt-2 text-sm text-red-600">
                {endpoint.error}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Zuletzt geprüft: {endpoint.lastChecked.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
