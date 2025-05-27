import React, { useState } from 'react';
import {fetchHealthCheck, type HealthResponse} from '../services/HealthService';

export const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthCheck();
      setHealth(data);
    } catch (err) {
      setError('Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-4">
        {/* Environment Indicator */}
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="font-medium">FE Env: {import.meta.env.VITE_APP_TEST_VAR}</span>
        </div>
        <button
            onClick={handleCheck}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Health'}
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {health && (
            <div className="flex space-x-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
            <span
                className={
                  health.status === 'OK'
                      ? 'w-3 h-3 bg-green-500 rounded-full'
                      : 'w-3 h-3 bg-red-500 rounded-full'
                }
            />
                <span className="font-medium">Status: {health.status}</span>
              </div>

              {/* Environment Indicator */}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-medium">BE Env: {health.env}</span>
              </div>
            </div>
        )}
      </div>
  );
};
