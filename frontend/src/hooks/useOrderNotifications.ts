import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface OrderStatusChangedEvent {
    orderId: number;
    userId: number;
    bagId: number;
    oldStatus: string;
    newStatus: string;
    message: string;
}

export function useOrderNotifications(userId: number | null) {
    const [lastNotification, setLastNotification] = useState<OrderStatusChangedEvent | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // Don't connect if no userId
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            onConnect: () => {
                console.log('Order notifications connected for userId:', userId);
                setConnected(true);

                // Subscribe to private user queue
                client.subscribe(`/topic/orders/${userId}`, (message) => {
                    try {
                        const event: OrderStatusChangedEvent = JSON.parse(message.body);
                        console.log('Received order update:', event);
                        setLastNotification(event);
                    } catch (e) {
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