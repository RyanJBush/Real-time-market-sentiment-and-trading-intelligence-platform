import { useEffect, useState } from 'react';

import type { StreamEvent } from '../types/market';
import { connectStream, startMockStream } from '../services/stream';

export function useMarketStream(limit = 30) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let stopMock: (() => void) | null = null;
    const socket = connectStream((message) => {
      setEvents((prev) => [message, ...prev].slice(0, limit));
      setIsLive(true);

      if (stopMock) {
        stopMock();
        stopMock = null;
      }
    });

    stopMock = startMockStream((message) => {
      setEvents((prev) => [message, ...prev].slice(0, limit));
    });

    socket.onopen = () => setIsLive(true);
    socket.onerror = () => setIsLive(false);

    return () => {
      if (stopMock) {
        stopMock();
      }
      socket.close();
    };
  }, [limit]);

  return { events, isLive };
}
