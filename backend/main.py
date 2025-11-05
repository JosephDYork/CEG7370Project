import uvicorn
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
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
    active_connections.add(websocket)

    try:
        await websocket.send_json(
            {
                "type": "initial_state",
                "board_state": board_state.model_dump(),
                "chat_state": chat_state.model_dump(),
            }
        )

        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "board_update":
                board_data = data.get("board_state")
                if board_data:
                    incoming_state = BoardState(
                        version=board_data.get("version", board_state.version),
                        strokes=board_data.get("strokes", [])
                    )
                    board_state = merge_board_states(incoming_state, board_state)

                    print(f"Updated! Total strokes in memory: {len(board_state.strokes)}")
                    await broadcast_to_all(
                        {
                            "type": "board_update",
                            "board_state": board_state.model_dump(),
                        },
                        exclude_websocket=websocket,
                    )

            elif message_type == "chat_update":
                chat_data = data.get("chat_state")
                if chat_data:
                    chat_state.roomId = chat_data.get("roomId", chat_state.roomId)
                    chat_state.messages = chat_data.get("messages", chat_state.messages)
                    print(f"Total messages in memory: {len(chat_state.messages)}")

                    await broadcast_to_all(
                        {"type": "chat_update", "chat_state": chat_state.model_dump()},
                        exclude_websocket=websocket,
                    )

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.discard(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
