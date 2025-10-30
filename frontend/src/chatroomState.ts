
export interface ChatPanelProps {
  state: ChatRoomState | null;
}

export class ChatMessageData {
  userName: string;
  languageCode: string;
  originalMessage: string;
  translatedMessage: string;

  constructor(
    userName: string,
    languageCode: string,
    originalMessage: string,
    translatedMessage: string
  ) {
    this.userName = userName;
    this.languageCode = languageCode;
    this.originalMessage = originalMessage;
    this.translatedMessage = translatedMessage;
  }
}

export class ChatRoomState {
  roomId: string;
  messages: Array<ChatMessageData>;

  constructor(roomId: string, messages: Array<ChatMessageData>) {
    this.roomId = roomId;
    this.messages = messages;
  }
}