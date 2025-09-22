import React, {useEffect, useState} from 'react';
import WebApp from '@twa-dev/sdk';
import {useLocation} from 'react-router-dom';
import {fetchHealthMessage} from '@/services/HealthService.ts';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Loader2} from 'lucide-react';

export const HealthCheckTelegram: React.FC = () => {
  const {search} = useLocation();

  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);
  const [authQueryParam, setAuthQueryParam] = useState<string | null>(null);
  const [isTelegramClient, setIsTelegramClient] = useState<boolean>(false);

  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
    }

    const initData = WebApp?.initDataUnsafe;
    const userId = initData?.user?.id;
    if (userId) {
      setIsTelegramClient(true);
      setTelegramUserId(userId);
    } else {
      setIsTelegramClient(false);
      console.error('Telegram WebApp user data is not available');
    }

    const params = new URLSearchParams(search);
    const telegramAuthQueryParam = params.get('telegram_auth');
    if (telegramAuthQueryParam) {
      setAuthQueryParam(telegramAuthQueryParam);
    }
  }, [search]);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const messagePayload = `${telegramUserId}`;
      const data = await fetchHealthMessage(messagePayload);
      setResponse(data);
    } catch {
      setError('Failed to fetch message');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">Health Check – Telegram</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <span className="font-medium mr-2">Telegram Client:</span>
              {isTelegramClient ? (
                  <span className="text-green-600 dark:text-green-500 font-semibold">Yes</span>
              ) : (
                  <span className="text-red-600 dark:text-red-500 font-semibold">No</span>
              )}
            </div>

            <div className="flex items-center">
              <span className="font-medium mr-2">User ID:</span>
              <span>{telegramUserId ?? '—'}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium mr-2">Query Auth Param:</span>
              <span>{authQueryParam ?? '—'}</span>
            </div>
          </div>

          <Button
              onClick={handleSend}
              disabled={loading}
              className="w-full justify-center"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            {loading ? 'Sending...' : 'Send Message'}
          </Button>

          {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {response && (
              <Alert variant="default" className="mt-4">
                <AlertTitle>Response</AlertTitle>
                <AlertDescription>{response}</AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
  );
};
