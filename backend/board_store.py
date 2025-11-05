from pydantic import BaseModel
from typing import List, Union, Tuple


class FreeStroke(BaseModel):
    id: str
    color: str
    size: float
    points: List[List[float]]


class TextStroke(BaseModel):
    id: str
    color: str
    fontSize: float
    position: Tuple[float, float]
    text: str


class LineStroke(BaseModel):
    id: str
    color: str
    size: float
    startPoint: Tuple[float, float]
    endPoint: Tuple[float, float]


class ShapeStroke(BaseModel):
    id: str
    type: str
    color: str
    lineSize: float
    origin: Tuple[float, float]
    termination: Tuple[float, float]


class BoardState(BaseModel):
    version: float = 1.0
    strokes: List[Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]] = []
