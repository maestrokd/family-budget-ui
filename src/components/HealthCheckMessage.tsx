import React, { useState } from 'react';
import { fetchHealthMessage } from '../services/HealthService';

export const HealthCheckMessage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await fetchHealthMessage(message);
      setResponse(data);
    } catch {
      setError('Failed to fetch message');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-4 mt-6">
        <label className="block">
          {/*<span className="text-gray-700">Message:</span>*/}
          <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </label>
        <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {response && (
            <div className="p-4 bg-gray-100 rounded">
              {/*<p className="font-medium">Response:</p>*/}
              <p>{response}</p>
            </div>
        )}
      </div>
  );
};
