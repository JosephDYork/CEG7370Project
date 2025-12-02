from typing import List

from pydantic import BaseModel


class ChatMessage(BaseModel):
    userName: str
    languageCode: str
    originalMessage: str
    translatedMessage: str


class ChatState(BaseModel):
    roomId: str = ""
    messages: List[ChatMessage] = []

    def add_message(self, message: ChatMessage):
        self.messages.append(message)

        return [message]