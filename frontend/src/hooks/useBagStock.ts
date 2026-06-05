import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface InventoryUpdatedEvent {
    bagId: number;
    restaurantId: number;
    availableQuantity: number;
    bagName: string;
    status: string;
}

export function useBagStock(bagId: number, initialQuantity: number) {
    const [quantity, setQuantity] = useState<number>(initialQuantity);
    const [status, setStatus] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // Create STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            onConnect: () => {
                console.log('WebSocket connected for bagId:', bagId);
                setConnected(true);

                // Subscribe to this specific bag's updates
                client.subscribe(`/topic/bags/${bagId}`, (message) => {
                    try {
                        const event: InventoryUpdatedEvent = JSON.parse(message.body);
                        console.log('Received inventory update:', event);
                        setQuantity(event.availableQuantity);
                        setStatus(event.status);
                    } catch (e) {
                        console.error('Failed to parse WebSocket message:', e);
                    }
                });
            },

            onDisconnect: () => {
                console.log('WebSocket disconnected for bagId:', bagId);
                setConnected(false);
            },

            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                setConnected(false);
            },

            // Reconnect automatically after 5 seconds if disconnected
            reconnectDelay: 5000,
        });

        client.activate();
        clientRef.current = client;

        // Cleanup on unmount — prevents memory leaks
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [bagId]); // Re-run if bagId changes

    return { quantity, status, connected };
}