import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface PriceUpdatedEvent {
    bagId: number;
    newDiscount: number;   // discount percentage (0.25 = 25%)
}

export function useBagPrice(bagId: number | null | undefined) {
    const [currentDiscount, setCurrentDiscount] = useState<number | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!bagId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            onConnect: () => {
                console.log('WebSocket connected for bag price, bagId:', bagId);
                setConnected(true);

                // Subscribe to price updates for this specific bag
                client.subscribe(`/topic/bags/${bagId}/price`, (message) => {
                    try {
                        const event: PriceUpdatedEvent = JSON.parse(message.body);
                        console.log('Received price update:', event);

                        setCurrentDiscount(event.newDiscount);

                    } catch (e) {
                        console.error('Failed to parse price update:', e);
                    }
                });
            },

            onDisconnect: () => {
                console.log('WebSocket disconnected for bag price, bagId:', bagId);
                setConnected(false);
            },

            onStompError: (frame) => {
                console.error('STOMP error on price channel:', frame);
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
    }, [bagId]);

    return { currentDiscount, connected };
}