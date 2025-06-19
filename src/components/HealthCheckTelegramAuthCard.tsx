import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { fetchTelegramHealth, type TelegramHealthResponse } from '@/services/HealthService.ts';

export const HealthCheckTelegramAuthCard: React.FC = () => {
  const [initDataString, setInitDataString] = useState<string | null>(null);
  const [isTelegramClient, setIsTelegramClient] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<TelegramHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      const raw = WebApp.initData;
      if (raw) setInitDataString(raw);
      if (WebApp.initDataUnsafe?.user?.id) setIsTelegramClient(true);
    }
  }, []);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setHealthData(null);
    try {
      if (!initDataString) return;
      const data = await fetchTelegramHealth(initDataString);
      setHealthData(data);
    } catch {
      setError('Failed to fetch Telegram health data');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">Health Check – Telegram Init Data</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <span className="font-medium mr-2">Telegram Client:</span>
              {isTelegramClient ? (
                  <span className="text-green-600 font-semibold">Yes</span>
              ) : (
                  <span className="text-red-600 font-semibold">No</span>
              )}
            </div>
          </div>

          {!initDataString && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Initialization data is not available. Please open this page in Telegram Web App.
                </AlertDescription>
              </Alert>
          )}

          <Button
              onClick={handleFetch}
              disabled={!initDataString || loading}
              className="w-full justify-center mb-4"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Fetching...' : 'Fetch Telegram Health'}
          </Button>

          {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {healthData && (
              <Alert variant="default" className="mt-4">
                <AlertTitle>Telegram Health Data</AlertTitle>
                <AlertDescription>
                  <div><strong>ID:</strong> {healthData.telegramId}</div>
                  <div><strong>First Name:</strong> {healthData.firstName}</div>
                  <div><strong>Email:</strong> {healthData.currentUserProfileEmail}</div>
                  <div><strong>Sheet Name:</strong> {healthData.currentSheetProfileName}</div>
                </AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
  );
};
