import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
export function useBagStock(bagId, initialQuantity) {
    const [quantity, setQuantity] = useState(initialQuantity);
    const [status, setStatus] = useState('');
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);
    useEffect(() => {
        // Create STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            onConnect: () => {
                console.log('WebSocket connected for bagId:', bagId);
                setConnected(true);
                // Subscribe to this specific bag's updates
                client.subscribe(`/topic/bags/${bagId}`, (message) => {
                    try {
                        const event = JSON.parse(message.body);
                        console.log('Received inventory update:', event);
                        setQuantity(event.availableQuantity);
                        setStatus(event.status);
                    }
                    catch (e) {
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
