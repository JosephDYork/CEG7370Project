import os
from typing import Set

import httpx
import uvicorn
from board_store import BoardState
from chat_store import ChatState
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from messages import PolyboardMessage

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

async def broadcast_to_all(message_type: str, payload: dict, exclude_websocket: WebSocket = None):
    disconnected = set()
    print("Sending updates to connections...")
    outgoing = PolyboardMessage(**{
        "user_id": "server",
        "room_id": "room1",
        "type": message_type,
        "subsystem": "whiteboard",
        "payload": payload
    })

    for connection in list(active_connections):
        if connection == exclude_websocket:
            continue

        try:
            print(outgoing.model_dump())
            await connection.send_json(outgoing.model_dump())
        except Exception as e:
            print(f"Error sending to client: {e}")
            disconnected.add(connection)

    for conn in disconnected:
        active_connections.discard(conn)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global board_state, chat_state

    await websocket.accept()
    active_connections.add(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            message = PolyboardMessage(**data)

            if (message.subsystem == "whiteboard"):
                match message.type:
                    case "AddStrokes":
                        for stroke in message.payload:
                            update_payload = board_state.addStroke(stroke)
                            await broadcast_to_all(message.type, update_payload, websocket)
                            continue
                    case "RemoveStrokes":
                        for stroke in message.payload:
                            update_payload = board_state.removeStroke(stroke)
                            await broadcast_to_all(message.type, update_payload, websocket)
                            continue
                    case "UpdateStrokes":
                        for stroke in message.payload:
                            update_payload = board_state.updateStroke(stroke)
                            await broadcast_to_all(message.type, update_payload, websocket)
                            continue

            # TODO: Rebuild the chat subsystem handling to deal with new message format
            # elif message.message_type == "chat_update":
            #     chat_data = data.get("chat_state")
            #     if chat_data:
            #         chat_state.roomId = chat_data.get("roomId", chat_state.roomId)
            #         chat_state.messages = chat_data.get("messages", chat_state.messages)
            #         print(f"Total messages in memory: {len(chat_state.messages)}")

            #         await broadcast_to_all(
            #             {"type": "chat_update", "chat_state": chat_state.model_dump()},
            #             exclude_websocket=websocket,
            #         )

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.discard(websocket)


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: str = "auto"  # Optional, default to auto-detect


class TranslateResponse(BaseModel):
    translated_text: str


@app.post("/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    """
    Translate text to target language using LibreTranslate API if configured.
    If not configured, return a mock translation.
    """
    api_url = os.environ.get("TRANSLATE_API_URL")

    if not api_url:
        # Fallback mock translation (no external calls)
        translated = f"{req.text} [translated to {req.target_language}]"
        return TranslateResponse(translated_text=translated)

    # LibreTranslate expects POST to /translate with json: {q, source, target, format}
    payload = {
        "q": req.text,
        "source": getattr(req, "source_language", "auto"),
        "target": req.target_language,
        "format": "text"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(api_url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            # LibreTranslate returns: {translatedText: ...}
            translated_text = data.get("translatedText")
            if not translated_text:
                translated_text = f"{req.text} [translated to {req.target_language}]"
            return TranslateResponse(translated_text=translated_text)
        except Exception as e:
            # On any error, return mock translation so UI remains responsive
            translated = f"{req.text} [translated to {req.target_language}]"
            return TranslateResponse(translated_text=translated)



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
