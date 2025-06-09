import React, {useEffect, useState} from 'react';
import WebApp from '@twa-dev/sdk';

export const HealthCheckTelegramLog: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState<boolean>(false);
  const [initData, setInitData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      if (WebApp.initDataUnsafe && Object.keys(WebApp.initDataUnsafe).length > 0) {
        setIsTelegramAvailable(true);
        setInitData(WebApp.initDataUnsafe);
        const user = WebApp.initDataUnsafe.user;
        if (user?.id) {
          setUserId(user.id);
        } else {
          console.error('User data not available');
        }
      } else {
        console.error('Telegram WebApp is not available');
      }
    }
  }, []);

  return (
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Telegram WebApp Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Available:</span>
              <span>{isTelegramAvailable ? 'Yes' : 'No'}</span>
            </div>
            {isTelegramAvailable && userId ? (
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span>{userId}</span>
                </div>
            ) : isTelegramAvailable && !userId ? (
                <div className="flex items-center space-x-2">
                  <div
                      className="h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading user...</span>
                </div>
            ) : null}
          </div>
        </div>

        {initData && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Init Data</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(initData, null, 2)}
          </pre>
            </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">WebApp Object</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(WebApp, null, 2)}
        </pre>
        </div>
      </div>
  );
};
