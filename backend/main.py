import os
from typing import Set

import httpx
import uvicorn
from board_store import BoardState
from chat_store import ChatState
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from messages import PolyboardMessage
from ocr_service import decode_b64img, OCRService, OCRRequest, OCRResponse, TextBlock
from dotenv import load_dotenv


app = FastAPI(debug=True)
load_dotenv()

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

room_board_states: dict[str, BoardState] = {}
room_chat_states: dict[str, ChatState] = {}
room_connections: dict[str, Set[WebSocket]] = {}
ocr_service = OCRService()


def get_or_create_board_state(room_id: str) -> BoardState:
    if room_id not in room_board_states:
        room_board_states[room_id] = BoardState()
    return room_board_states[room_id]


def get_or_create_chat_state(room_id: str) -> ChatState:
    if room_id not in room_chat_states:
        room_chat_states[room_id] = ChatState()
    return room_chat_states[room_id]


async def broadcast_to_room(
    room_id: str,
    message_type: str,
    subsystem: str,
    payload: dict,
    exclude_websocket: WebSocket = None,
):
    if room_id not in room_connections:
        return

    disconnected = set()
    outgoing = PolyboardMessage(
        **{
            "user_id": "server",
            "room_id": room_id,
            "type": message_type,
            "subsystem": subsystem,
            "payload": payload,
        }
    )

    for connection in list(room_connections[room_id]):
        if connection == exclude_websocket:
            continue

        try:
            await connection.send_json(outgoing.model_dump())
        except Exception as e:
            print(f"Error sending to client: {e}")
            disconnected.add(connection)

    for conn in disconnected:
        room_connections[room_id].discard(conn)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    current_room_id = None

    try:
        while True:
            data = await websocket.receive_json()
            message = PolyboardMessage(**data)
            print(f"Received message: {message.model_dump()}")

            if current_room_id != message.room_id:
                if current_room_id in room_connections:
                    room_connections[current_room_id].discard(websocket)

                current_room_id = message.room_id
                if current_room_id not in room_connections:
                    room_connections[current_room_id] = set()
                room_connections[current_room_id].add(websocket)

            board_state = get_or_create_board_state(message.room_id)
            chat_state = get_or_create_chat_state(message.room_id)

            if message.subsystem == "initialization":
                match message.type:
                    case "RequestFullState":
                        print("Sending full state to new client...")
                        await websocket.send_json(PolyboardMessage(
                            **{
                                "user_id": "server",
                                "room_id": current_room_id,
                                "type": "FullState",
                                "subsystem": "whiteboard",
                                "payload": board_state.strokes,
                            }
                        ).model_dump())
                        await websocket.send_json(PolyboardMessage(
                            **{
                                "user_id": "server",
                                "room_id": current_room_id,
                                "type": "FullState",
                                "subsystem": "chat",
                                "payload": chat_state.messages,
                            }
                        ).model_dump())

            if (message.subsystem == "chat"):
                match message.type:
                    case "NewMessage":
                        for chat in message.payload:
                            update_payload = chat_state.add_message(chat)
                            await broadcast_to_room(
                                message.room_id,
                                message.type,
                                message.subsystem,
                                update_payload,
                                websocket,
                            )
                            continue

            if (message.subsystem == "whiteboard"):
                match message.type:
                    case "AddStrokes":
                        for stroke in message.payload:
                            update_payload = board_state.addStroke(stroke)
                            await broadcast_to_room(
                                message.room_id,
                                message.type,
                                message.subsystem,
                                update_payload,
                                websocket,
                            )
                            continue
                    case "RemoveStrokes":
                        for stroke in message.payload:
                            update_payload = board_state.removeStroke(stroke)
                            await broadcast_to_room(
                                message.room_id,
                                message.type,
                                message.subsystem,
                                update_payload,
                                websocket,
                            )
                            continue
                    case "UpdateStrokes":
                        for stroke in message.payload:
                            update_payload = board_state.updateStroke(stroke)
                            await broadcast_to_room(
                                message.room_id,
                                message.type,
                                message.subsystem,
                                update_payload,
                                websocket,
                            )
                            continue

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if current_room_id in room_connections:
            room_connections[current_room_id].discard(websocket)


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


@app.post("/ocr", response_model=OCRResponse)
async def process_ocr(req: OCRRequest):
    try:
        image = decode_b64img(req.image)

        # Textract only works on stuff in S3 so we gotta upload the image first
        fileName = await ocr_service.upload_image_to_s3(image) 
        text_blocks = await ocr_service.extract_text(fileName, image)

        response_blocks = [
            TextBlock(
                text=block["text"],
                left=block["left"],
                top=block["top"],
                width=block["width"],
                height=block["height"],
                confidence=block["confidence"],
            )
            for block in text_blocks
        ]

        return OCRResponse(textBlocks=response_blocks)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
