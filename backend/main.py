import uvicorn
from pydantic import BaseModel
from typing import List, Annotated
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware
from fastapi import (
    Cookie,
    Depends,
    FastAPI,
    Query,
    WebSocket,
    WebSocketException,
    status,
)

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text(f"Hello World!")
    await websocket.close()


class TranslateRequest(BaseModel):
    text: str
    target_language: str


class TranslateResponse(BaseModel):
    translated_text: str


@app.post("/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    """Translate text to target language.

    Behavior:
    - If environment variable TRANSLATE_API_URL is set, the server will POST to that URL.
      Expected JSON: { "q": req.text, "target": req.target_language }
      If TRANSLATE_API_KEY is set, it will be passed as an Authorization Bearer token.
    - If no TRANSLATE_API_URL is configured, return a mock translation that appends a note.
    """
    api_url = os.environ.get("TRANSLATE_API_URL")
    api_key = os.environ.get("TRANSLATE_API_KEY")

    if not api_url:
        # Fallback mock translation (no external calls)
        translated = f"{req.text} [translated to {req.target_language}]"
        return TranslateResponse(translated_text=translated)

    # Call external translation provider
    payload = {"q": req.text, "target": req.target_language}
    headers = {}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(api_url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            # Try common response shapes
            translated_text = data.get("translatedText") or data.get("translated_text") or data.get("translation") or data.get("result") or data.get("data")

            # If data is nested (e.g., {data:{translations:[{translatedText:..}]}})
            if isinstance(translated_text, dict):
                # try nested keys
                t = translated_text.get("translations")
                if t and isinstance(t, list) and len(t) > 0:
                    translated_text = t[0].get("translatedText")

            if not translated_text:
                # last resort: use raw text from response if it's a string
                if isinstance(data, str):
                    translated_text = data
                else:
                    # Could not parse provider response; return mock
                    translated_text = f"{req.text} [translated to {req.target_language}]"

            return TranslateResponse(translated_text=translated_text)
        except Exception:
            # On any error, return mock translation so UI remains responsive
            translated = f"{req.text} [translated to {req.target_language}]"
            return TranslateResponse(translated_text=translated)



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
