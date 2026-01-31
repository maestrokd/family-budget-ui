import React, {useEffect, useState} from 'react';
import WebApp from '@twa-dev/sdk';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2} from 'lucide-react';

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
        <div className="bg-background py-0 px-0 sm:py-8 sm:px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Telegram WebApp Status</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                    <span>Loading user...</span>
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                {initData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Init Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                                {JSON.stringify(initData, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>WebApp Object</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                            {JSON.stringify(WebApp, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
