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

    if TRANSLATE_API_URL and TRANSLATE_API_KEY:
        payload = {
            "q": req.text,
            "target": req.target_language,
            "format": "text"
        }
        headers = {"Authorization": f"Bearer {TRANSLATE_API_KEY}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(
                TRANSLATE_API_URL,
                params={"key": TRANSLATE_API_KEY},
                json=payload,
                headers=headers,
                timeout=10,
            )
            data = response.json()
            translated = (
                data.get("data", {})
                .get("translations", [{}])[0]
                .get("translatedText")
            )
            if translated:
                return {"translated_text": translated}
            else:
                # Handle case where translation is not found in the response
                translated = f"{req.text} [translated to {req.target_language}]"
                return TranslateResponse(translated_text=translated)



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
