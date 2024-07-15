// src/components/WebSocketClient.js
import { useEffect, useRef } from "react";

export const WebSocketClient = ({
  url,
  onMessage,
  sendMessageRef,
  userId,
}: {
  url: string;
  userId: string;
  onMessage: (message: string) => void;
  sendMessageRef: React.MutableRefObject<(message: string) => void>;
}) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log("WebSocket connected");
      const onConnectionMessage = JSON.stringify({
        type: "onConnection",
        userId: userId,
        message: null,
      });
      console.log("Sending:", ws.current, onConnectionMessage);
      if (ws.current) ws.current.send(onConnectionMessage);
    };

    ws.current.onclose = () => console.log("WebSocket closed");

    ws.current.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      if (onMessage) {
        onMessage(event.data);
      }
    };

    ws.current.onerror = (error) => console.error("WebSocket error:", error);

    sendMessageRef.current = (message) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(message);
      } else {
        console.error("WebSocket is not connected.");
      }
    };

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, [url, onMessage, sendMessageRef, userId]);

  return null; // Este componente no necesita renderizar nada
};
