from pydantic import BaseModel
from typing import List


class ChatMessage(BaseModel):
    userName: str
    languageCode: str
    originalMessage: str
    translatedMessage: str


class ChatState(BaseModel):
    roomId: str = ""
    messages: List[ChatMessage] = []
