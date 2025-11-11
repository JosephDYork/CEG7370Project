import uvicorn
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Annotated
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from board_store import BoardState
from chat_store import ChatState

app = FastAPI(debug=True)

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

board_state = BoardState()
chat_state = ChatState()
active_connections: Set[WebSocket] = set()

async def broadcast_to_all(message: dict, exclude_websocket: WebSocket = None):
    disconnected = set()
    for connection in active_connections:
        if connection != exclude_websocket:
            try:
                await connection.send_json(message)
            except:
                disconnected.add(connection)

    active_connections.difference_update(disconnected)

def merge_board_states(incoming_state, server_state):
    strokes_added = []
    print(f"Merging states: Incoming {len(incoming_state.strokes)} strokes, Server {len(server_state.strokes)} strokes")
    
    for stroke in incoming_state.strokes:
        if stroke not in  server_state.strokes:
            strokes_added.append(stroke)

    return BoardState(
        version=server_state.version,
        strokes=server_state.strokes + strokes_added
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global board_state, chat_state

    await websocket.accept()
    await websocket.send_text(f"Hello World!")
    await websocket.close()



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
