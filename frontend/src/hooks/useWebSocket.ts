"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

type WebSocketMessage = Record<string, unknown>;

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  onMessage?: (data: WebSocketMessage) => void;
  onReconnect?: () => void;
}

interface WebSocketStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url: customUrl,
    autoConnect = true,
    onMessage,
    onReconnect,
  } = options;

  const token = useAuthStore((state) => state.token);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
  });

  const WS_URL =
    customUrl || process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        reconnectAttemptsRef.current = 0;
        setStatus((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        onReconnect?.();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          setStatus((prev) => ({ ...prev, lastMessage: data }));
          onMessage?.(data);
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setStatus((prev) => ({
          ...prev,
          error: "Koneksi WebSocket gagal",
          isConnecting: false,
        }));
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Auto-reconnect with exponential backoff
        const maxAttempts = 10;
        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat koneksi WebSocket";
      setStatus((prev) => ({ ...prev, error: message, isConnecting: false }));
    }
  }, [token, WS_URL, onMessage, onReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setStatus({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastMessage: null,
    });
  }, []);

  const send = useCallback((data: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (autoConnect && token) {
      connect();
    }
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    ...status,
    connect,
    disconnect,
    send,
  };
}
