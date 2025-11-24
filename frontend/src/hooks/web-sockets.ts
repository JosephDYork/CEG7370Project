import { useEffect, useCallback } from "react";
import { useChatStore } from "../stores/chat-store";
import { useEditorStore } from "../stores/editor-store";
import { PolyboardMessage } from "../models/polyboard-message";
import type { Stroke } from "../models/strokes";
import { useBoardStore } from "../stores/board-store";
import { FreeStroke } from "../models/free-stroke";
import { TextStroke } from "../models/text-stroke";
import { LineStroke } from "../models/line-stroke";
import { ShapeStroke } from "../models/shape-stroke";

export const useWebSocket = (url: string = "ws://localhost:8000/ws") => {
  const { getWebSocket, setWebSocket, setIsSocketConnected } = useEditorStore();
  const { roomId, messages } = useChatStore();
  const { addStrokes, removeStrokes, updateStrokes } = useBoardStore();

  const send = (message: any) => {
    const webSocket = getWebSocket();
    if (webSocket?.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    }
  };

  const sendAddBoardMessage = (strokesToAdd: Stroke[]) => {
    send(
      new PolyboardMessage(
        "user1",
        "room1",
        "AddStrokes",
        "whiteboard",
        strokesToAdd
      )
    );
  };

  const sendRemoveBoardMessage = (strokesToRemove: Stroke[]) => {
    send(
      new PolyboardMessage(
        "user1",
        "room1",
        "RemoveStrokes",
        "whiteboard",
        strokesToRemove
      )
    );
  };

  const sendUpdateBoardMessage = (strokesToUpdate: Stroke[]) => {
    send(
      new PolyboardMessage(
        "user1",
        "room1",
        "UpdateStrokes",
        "whiteboard",
        strokesToUpdate
      )
    );
  };

  const buildStroke = (s: any): Stroke => {
    switch (s.type) {
      case "free":
        return new FreeStroke(s.id, s.color, s.size, s.points);
      case "text":
        return new TextStroke(s.id, s.color, s.size, s.position, s.text);
      case "line":
        return new LineStroke(s.id, s.color, s.size, s.startPoint, s.endPoint);
      case "shape":
        return new ShapeStroke(s.id, s.shapeType, s.color, s.lineSize, s.origin, s.termination);
      default:
        throw new Error(`Unknown stroke type: ${s.type}`);
    }
  };

  const processMessage = (msg: PolyboardMessage) => {
    if (msg.subsystem !== "whiteboard") return;

    switch (msg.type) {
      case "AddStrokes":
        addStrokes(msg.payload.map(buildStroke));
        break;
      case "RemoveStrokes":
        removeStrokes(msg.payload.map(buildStroke));
        break;
      case "UpdateStrokes":
        updateStrokes(msg.payload.map(buildStroke));
        break;
    }
  }

  const sendChatUpdate = useCallback(() => {
    // TODO: Reimpliment chat functionality.
    // I'm gonna just leave this temp disabled so I can get the PR in.
    // send({ type: "chat_update", chat_state: { roomId, messages } });
  }, [roomId, messages]);

  const connectWebSocket = useCallback(() => {
    const currSocket = getWebSocket();

    if (
      currSocket?.readyState === WebSocket.CONNECTING ||
      currSocket?.readyState === WebSocket.OPEN
    ) { return; }

    const socket = new WebSocket(url);
    setWebSocket(socket);

    socket.onopen = () => {
      setIsSocketConnected(true);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      processMessage(msg);
    };

    socket.onclose = () => {
      setIsSocketConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsSocketConnected(false);
    };
  }, [url, setWebSocket, setIsSocketConnected]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      const socket = useEditorStore.getState().webSocket;
      socket?.close();
      setWebSocket(null);
    };
  }, [connectWebSocket, setWebSocket]);

  return {
    sendAddBoardMessage,
    sendRemoveBoardMessage,
    sendUpdateBoardMessage,
    sendChatUpdate,
    connectWebSocket,
    disconnect: () => {
      const socket = getWebSocket();
      socket?.close();
      setWebSocket(null);
    },
  };
};
