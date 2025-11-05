import { useEffect, useState, useRef, useCallback } from "react";
import { useBoardStore } from "../stores/board-store";
import { useChatStore, ChatMessage } from "../stores/chat-store";
import { FreeStroke } from "../strokes";

export const useWebSocket = (url: string = "ws://localhost:8000/ws") => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { roomId, messages, } = useChatStore();
  const { clearStrokes, updateAllStrokes } = useBoardStore();

  const send = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.log("Error sending message to websocket server.");
    }
  };

  const sendBoardUpdate = useCallback(() => {
    const { version, strokes } = useBoardStore.getState();
    send({ type: "board_update", board_state: { version, strokes } });
  }, []);

  const sendChatUpdate = useCallback(() => {
    send({ type: "chat_update", chat_state: { roomId, messages } });
  }, [roomId, messages]);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    setIsConnecting(true);
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("Received message:");

      if (msg.type === "initial_state") {
        clearStrokes();
        console.log(
          `updating to a total of ${msg.board_state.strokes.length} strokes`
        );

        var incoming_strokes = [];
        for (const stroke of msg.board_state.strokes) {
          if (stroke.id.includes("pen")) {
            incoming_strokes.push(
              new FreeStroke(
                stroke.id,
                stroke.color,
                stroke.size,
                stroke.points
              )
            );
          }
        }

        updateAllStrokes(incoming_strokes);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [url, clearStrokes, updateAllStrokes]);

  useEffect(() => {
    connectWebSocket();

    return () => socketRef.current?.close();
  }, [connectWebSocket]);

  return {
    connectionStatus: { isConnected, isConnecting },
    sendBoardUpdate,
    sendChatUpdate,
    connectWebSocket,
    disconnect: () => socketRef.current?.close(),
  };
};
