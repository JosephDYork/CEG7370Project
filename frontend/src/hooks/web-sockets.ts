import { useEffect, useCallback } from "react";
import { ChatMessage } from "../stores/chat-store";
import { useEditorStore } from "../stores/editor-store";
import { PolyboardMessage } from "../models/polyboard-message";
import type { Stroke } from "../models/strokes";
import { useBoardStore } from "../stores/board-store";
import { FreeStroke } from "../models/free-stroke";
import { TextStroke } from "../models/text-stroke";
import { LineStroke } from "../models/line-stroke";
import { ShapeStroke } from "../models/shape-stroke";
import { useChatStore } from "../stores/chat-store";

export const useWebSocket = (url: string = "ws://localhost:8000/ws") => {
  const { addMessages, getAllMessages, setAllMessages } = useChatStore();
  const {
    addStrokes,
    removeStrokes,
    updateStrokes,
    getAllStrokes,
    setAllStrokes,
  } = useBoardStore();
  const {
    getWebSocket,
    setWebSocket,
    setIsSocketConnected,
    getCurrentLanguage,
  } = useEditorStore();

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

  const sendChatMessage = (chatMessage: ChatMessage) => {
    send(
      new PolyboardMessage("user1", "room1", "NewMessage", "chat", [
        chatMessage,
      ])
    );
  };

  const buildStroke = (s: any): Stroke => {
    switch (s.type) {
      case "free":
        return new FreeStroke(s.id, s.color, s.size, s.points);
      case "text":
        return new TextStroke(s.id, s.color, s.size, s.position, s.srcText, s.srcLang, s.translations);
      case "line":
        return new LineStroke(s.id, s.color, s.size, s.startPoint, s.endPoint);
      case "shape":
        return new ShapeStroke(s.id, s.shapeType, s.color, s.lineSize, s.origin, s.termination);
      default:
        throw new Error(`Unknown stroke type: ${s.type}`);
    }
  };

  const processMessage = async (msg: PolyboardMessage) => {
    if (msg.subsystem === "whiteboard") {
      switch (msg.type) {
        case "AddStrokes":
          const newStrokes = msg.payload.map(buildStroke);
          const translatedStrokes = await TranslateTextStrokes(
            newStrokes as TextStroke[]
          );

          addStrokes(translatedStrokes);
          break;
        case "RemoveStrokes":
          removeStrokes(msg.payload.map(buildStroke));
          break;
        case "UpdateStrokes":
          updateStrokes(msg.payload.map(buildStroke));
          break;
      }
    } else if (msg.subsystem === "chat") {
      switch (msg.type) {
        case "NewMessage":
          const chatMessages = msg.payload.map(
            (m: any) =>
              new ChatMessage(
                m.userName,
                m.languageCode,
                m.originalMessage,
                m.translatedMessage
              )
          );

          const translatedMessages = await translateChatMessages(chatMessages);
          addMessages(translatedMessages);
          break;
      }
    } else {
      console.warn(`Unknown message subsystem: ${msg.subsystem}`);
    }
  };

  const fullBatchTranslation = async () => {
    const currentLang = getCurrentLanguage();
    const allMessages = getAllMessages();
    const allStrokes = getAllStrokes();

    const newMessages = await translateChatMessages(
      allMessages.filter((msg) => msg.languageCode !== currentLang)
    );

    setAllMessages([
      ...newMessages,
      ...allMessages.filter((msg) => msg.languageCode === currentLang),
    ]);

    const newStrokes = await TranslateTextStrokes(
      allStrokes.filter(
        (stroke) =>
          stroke.type === "text" &&
          (stroke as TextStroke).srcLang !== currentLang &&
          !(stroke as TextStroke).translations[currentLang]
      ) as TextStroke[]
    );

    setAllStrokes([
      ...newStrokes,
      ...allStrokes.filter(
        (stroke) =>
          stroke.type !== "text" ||
          (stroke as TextStroke).srcLang === currentLang ||
          (stroke as TextStroke).translations[currentLang]
      ),
    ]);
  };

  const translateChatMessages = async (messages: ChatMessage[]) => {
    const currentLang = getCurrentLanguage();

    const promises = messages.map(async (message) => {
      if (message.languageCode !== currentLang) {
        const response = await fetch("http://localhost:8000/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message.originalMessage,
            target_language: currentLang,
            source_language: message.languageCode,
          }),
        });

        const data = await response.json();
        return new ChatMessage(
          message.userName,
          message.languageCode,
          message.originalMessage,
          data.translated_text
        );
      }

      return message;
    });

    return Promise.all(promises);
  };

  const TranslateTextStrokes = async (newStrokes: TextStroke[]) => {
    const promises = newStrokes.map(async (stroke) => {
      if (stroke.type === "text") {
        const textStroke = stroke as TextStroke;
        const currentLang = getCurrentLanguage();

        if (
          textStroke.srcLang !== currentLang &&
          !textStroke.translations[currentLang]
        ) {
          return await requestTranslation(textStroke, currentLang);
        }
      }

      return stroke;
    });

    return Promise.all(promises);
  };

  const requestTranslation = async (
    textStroke: TextStroke,
    targetLang: string
  ) => {
    const response = await fetch("http://localhost:8000/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: textStroke.srcText,
        target_language: targetLang,
        source_language: textStroke.srcLang,
      }),
    });

    const data = await response.json();
    return new TextStroke(
      textStroke.id,
      textStroke.color,
      textStroke.size,
      textStroke.position,
      textStroke.srcText,
      textStroke.srcLang,
      { ...textStroke.translations, [targetLang]: data.translated_text }
    );
  };

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
    sendChatMessage,
    connectWebSocket,
    fullBatchTranslation,
    disconnect: () => {
      const socket = getWebSocket();
      socket?.close();
      setWebSocket(null);
    },
  };
};
