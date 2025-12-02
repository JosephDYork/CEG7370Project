from typing import Union, List

from pydantic import BaseModel

from board_store import FreeStroke, TextStroke, LineStroke, ShapeStroke
from chat_store import ChatMessage


class PolyboardMessage(BaseModel):
    user_id: str
    room_id: str
    type: str
    subsystem: str
    payload: Union[List[Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]],
                   List[ChatMessage]]