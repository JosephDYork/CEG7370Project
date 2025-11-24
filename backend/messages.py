from typing import Union, List

from pydantic import BaseModel

from board_store import BoardState, FreeStroke, TextStroke, LineStroke, ShapeStroke
from chat_store import ChatState

class PolyboardBoardStateMessage(BaseModel):
    action: str # AddStrokes, RemoveStrokes, UpdateStrokes, FullUpdate
    board_state: BoardState


class PolyboardChatStateMessage(BaseModel):
    action: str
    chat_state: ChatState


class PolyboardCursorStateMessage(BaseModel):
    action: str
    cursors_state: str # Placeholder for future cursor state implementation


class PolyboardMessage(BaseModel):
    user_id: str
    room_id: str
    type: str
    subsystem: str
    payload: List[Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]]