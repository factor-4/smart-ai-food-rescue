import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
export function useOrderNotifications(userId) {
    const [lastNotification, setLastNotification] = useState(null);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);
    useEffect(() => {
        // Don't connect if no userId
        if (!userId)
            return;
        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            onConnect: () => {
                console.log('Order notifications connected for userId:', userId);
                setConnected(true);
                // Subscribe to private user queue
                client.subscribe(`/topic/orders/${userId}`, (message) => {
                    try {
                        const event = JSON.parse(message.body);
                        console.log('Received order update:', event);
                        setLastNotification(event);
                    }
                    catch (e) {
                        console.error('Failed to parse order notification:', e);
                    }
                });
            },
            onDisconnect: () => {
                setConnected(false);
            },
            reconnectDelay: 5000,
        });
        client.activate();
        clientRef.current = client;
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [userId]);
    return { lastNotification, connected };
}
