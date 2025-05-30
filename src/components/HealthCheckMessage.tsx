import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {fetchHealthMessage} from '@/services/HealthService';

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
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Send Custom Health Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message" className="mb-1">Message</Label>
            <Input
                id="message"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
            />
          </div>
          <Button onClick={handleSend} disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
          {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
          {response && (
              <Alert variant="default">
                <AlertTitle>Response</AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap">{response}</pre>
                </AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
  );
};
