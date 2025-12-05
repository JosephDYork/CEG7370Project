from typing import List, Union

from pydantic import BaseModel


class FreeStroke(BaseModel):
    type: str
    id: str
    color: str
    size: float
    points: List[List[float]]
    strokeOrder: int


class TextStroke(BaseModel):
    type: str
    id: str
    color: str
    size: float
    position: List[float]
    srcText: str
    srcLang: str
    translations: dict
    strokeOrder: int


class LineStroke(BaseModel):
    type: str
    id: str
    color: str
    size: float
    startPoint: List[float]
    endPoint: List[float]
    strokeOrder: int


class ShapeStroke(BaseModel):
    type: str
    id: str
    shapeType: str
    color: str
    size: float
    fillColor: str
    origin: List[float]
    termination: List[float]
    strokeOrder: int


class BoardState(BaseModel):
    version: float = 1.0
    strokes: List[Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]] = []

    def addStroke(self, stroke: Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]):
        addedStrokes = []
        print("adding " + stroke.id)
        if stroke.id not in [s.id for s in self.strokes]:
            self.strokes.append(stroke)
            addedStrokes.append(stroke)

        return addedStrokes

    def removeStroke(self, stroke: Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]):
        removedStrokes = []
        print("removing " + stroke.id)
        if stroke.id in [s.id for s in self.strokes]:
            self.strokes.remove(stroke)
            removedStrokes.append(stroke)

        return removedStrokes

    def updateStroke(self, stroke: Union[FreeStroke, TextStroke, LineStroke, ShapeStroke]):
        updatedStrokes = []
        print("updating " + stroke.id)
        for srcStroke in self.strokes:
            if srcStroke.id == stroke.id:
                self.strokes.remove(srcStroke)
                self.strokes.append(stroke)
                updatedStrokes.append(stroke)

        return updatedStrokes