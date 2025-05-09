'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface RoyaltyEvent {
  id: string;
  timestamp: string;
  amount: number;
  source: string;
  certificateId: string;
  certificateTitle: string;
  recipientWallet: string;
}

export default function RoyaltyWsClient() {
  const { publicKey } = useWallet();
  const [events, setEvents] = useState<RoyaltyEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);

  // Connect to WebSocket when wallet is connected
  useEffect(() => {
    // Cleanup function to close WebSocket
    const closeWs = () => {
      if (wsInstance) {
        wsInstance.close();
        setWsInstance(null);
        setConnected(false);
      }
    };

    // Only connect if we have a public key
    if (!publicKey) {
      closeWs();
      return;
    }

    // Create WebSocket connection
    const walletAddress = publicKey.toString();
    const ws = new WebSocket(`ws://localhost:3001?wallet=${walletAddress}`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);

      // Register wallet for filtering events
      ws.send(JSON.stringify({
        type: 'register_wallet',
        walletAddress
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'royalty_event') {
          console.log('Received royalty event:', data.event);
          setEvents(prev => [data.event, ...prev]);
        } else if (data.type === 'connection') {
          console.log('Connection message:', data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    setWsInstance(ws);

    // Cleanup on unmount
    return () => {
      closeWs();
    };
  }, [publicKey]);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!wsInstance || !connected) return;

    const pingInterval = setInterval(() => {
      if (wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  }, [wsInstance, connected]);

  return (
    <div className="p-4 rounded-lg bg-slate-800 shadow-lg">
      <h2 className="text-xl font-bold mb-4">Real-time Royalty Stream</h2>

      <div className="mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {publicKey ? (
        <div className="text-sm text-slate-400 mb-4">
          Listening for royalties sent to: {publicKey.toString()}
        </div>
      ) : (
        <div className="text-sm text-amber-400 mb-4">
          Connect your wallet to see royalty events
        </div>
      )}

      <div className="overflow-auto max-h-80">
        {events.length === 0 ? (
          <div className="text-slate-500 text-center py-4">
            No royalty events received yet
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="p-3 bg-slate-700 rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{event.certificateTitle}</span>
                  <span className="text-green-400">+{event.amount} USDC</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}