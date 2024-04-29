// src/components/WebSocketClient.js
import { useEffect, useRef } from "react";

const WebSocketClient = ({ url }: { url: string }) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");
    ws.current.onmessage = (event) => console.log("ws message", event.data);
    ws.current.onerror = (error) => console.error("ws error", error);

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, [url]);

  // Función para enviar mensajes
  const sendTextMessage = (message: string) => {
    if (ws.current) {
      ws.current.send(message);
    } else {
      console.error("Error sending msg, WebSocket is not connected.");
    }
  };

//   const sendMessage = (message: any) => {
//     if (ws.current) {
//       ws.current.send(JSON.stringify(message));
//     } else {
//       console.error("Error sending msg, WebSocket is not connected.");
//     }
//   };

  return (
    <div>
      <h2>WebSocket Client</h2>
      <button onClick={() => sendTextMessage("Hello Server!")}>
        Send Message
      </button>
    </div>
  );
};

export default WebSocketClient;
