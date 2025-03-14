import React, {useState, useEffect} from 'react';
import {Activity, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Code} from 'lucide-react';
import {Button} from '../../../atoms/Button/Button';
import {Card} from '../../../molecules/Card/Card';

interface EndpointStatus {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  status: 'online' | 'offline' | 'error';
  latency?: number;
  lastChecked: Date;
  error?: string;
  requestExample?: string;
  responseExample?: string;
  headers?: Record<string, string>;
}

export default function APIStatus() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    {
      name: 'Backend Health',
      endpoint: '/health',
      method: 'GET',
      description: 'Überprüft den Status des Backends und der Datenbankverbindung',
      status: 'offline',
      lastChecked: new Date(),
      headers: {
        'Content-Type': 'application/json'
      },
      responseExample: JSON.stringify({
        success: true,
        message: 'API is running',
        database: 'connected'
      }, null, 2)
    },
    {
      name: 'Prompts API',
      endpoint: '/prompts',
      method: 'GET',
      description: 'Ruft alle verfügbaren Prompts ab',
      status: 'offline',
      lastChecked: new Date(),
      headers: {
        'Authorization': 'Bearer <token>',
        'Content-Type': 'application/json'
      },
      responseExample: JSON.stringify({
        success: true,
        data: {
          prompts: [
            {
              id: '1',
              title: 'Example Prompt',
              prompt: 'This is an example prompt',
              keywords: 'example, test',
              expected_runs: '10',
              successful_runs: '5'
            }
          ]
        }
      }, null, 2)
    },
    {
      name: 'Login',
      endpoint: '/login',
      method: 'POST',
      description: 'Authentifiziert einen Benutzer',
      status: 'offline',
      lastChecked: new Date(),
      headers: {
        'Content-Type': 'application/json'
      },
      requestExample: JSON.stringify({
        username: 'user',
        password: 'password'
      }, null, 2),
      responseExample: JSON.stringify({
        success: true,
        data: {
          token: 'jwt-token',
          user: {
            id: 1,
            username: 'user',
            email: 'user@example.com'
          }
        }
      }, null, 2)
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const checkEndpoint = async (endpoint: EndpointStatus): Promise<Partial<EndpointStatus>> => {
    const startTime = performance.now();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint.endpoint}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const latency = Math.round(performance.now() - startTime);
      const responseData = await response.json();

      if (response.ok) {
        return {
          status: 'online',
          latency,
          error: undefined,
          responseExample: JSON.stringify(responseData, null, 2)
        };
      } else {
        return {
          status: 'error',
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseExample: JSON.stringify(responseData, null, 2)
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
    const interval = setInterval(checkAllEndpoints, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500"/>;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500"/>;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-500"/>;
      default:
        return <Activity className="w-5 h-5 text-gray-500"/>;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">API Status</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={checkAllEndpoints}
          disabled={isChecking}
          icon={<RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`}/>}
        >
          Aktualisieren
        </Button>
      </div>

      <div className="space-y-3">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.endpoint} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedEndpoint(
                expandedEndpoint === endpoint.endpoint ? null : endpoint.endpoint
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{endpoint.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{endpoint.endpoint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {endpoint.latency && (
                    <span className="text-sm text-gray-600">
                      {endpoint.latency}ms
                    </span>
                  )}
                  {expandedEndpoint === endpoint.endpoint ? (
                    <ChevronUp className="w-5 h-5 text-gray-400"/>
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400"/>
                  )}
                </div>
              </div>
            </div>

            {expandedEndpoint === endpoint.endpoint && (
              <div className="border-t">
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Beschreibung</h4>
                    <p className="text-sm text-gray-600">{endpoint.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Headers</h4>
                    <pre className="text-sm bg-gray-50 p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(endpoint.headers, null, 2)}
                    </pre>
                  </div>

                  {endpoint.requestExample && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Request Beispiel</h4>
                      <pre className="text-sm bg-gray-50 p-3 rounded-md overflow-x-auto">
                        {endpoint.requestExample}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Response Beispiel</h4>
                    <pre className="text-sm bg-gray-50 p-3 rounded-md overflow-x-auto">
                      {endpoint.responseExample}
                    </pre>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Code className="w-4 h-4"/>
                    Zuletzt geprüft: {endpoint.lastChecked.toLocaleTimeString()}
                  </div>

                  {endpoint.error && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
                      <p className="text-sm text-red-600">{endpoint.error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}