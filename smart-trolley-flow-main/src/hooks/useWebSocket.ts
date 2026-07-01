import { useEffect, useRef, useCallback } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8081/ws-stomp';

export const useWebSocket = (topic: string, onMessage: (data: any) => void) => {
    const clientRef = useRef<Client | null>(null);

    const connect = useCallback(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            client.subscribe(topic, (message: Message) => {
                if (message.body) {
                    try {
                        const data = JSON.parse(message.body);
                        onMessage(data);
                    } catch (e) {
                        console.error('Failed to parse WebSocket message body', e);
                    }
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        clientRef.current = client;
    }, [topic, onMessage]);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            console.log('Disconnected');
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return { connect, disconnect };
};
