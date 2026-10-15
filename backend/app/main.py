from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from ollama import AsyncClient, ResponseError

app = FastAPI(title="ZeeLM API", version="1.0.0")
MODEL = "qwen3:1.7b"
client = AsyncClient()
SYSTEM = ("You are ZeeLM, a helpful local AI assistant for product, engineering, and research. "
          "Respond directly, clearly and accurately. Build on the user's prior messages. "
          "Ask only for information that is actually missing. Use readable Markdown. "
          "Do not claim to have accessed files, tools, or the internet when you have not.")

class HistoryEntry(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=12000)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=12000)
    history: list[HistoryEntry] = Field(default_factory=list, max_length=30)

@app.get("/")
def home():
    return {"name": "ZeeLM", "version": "1.0.0", "status": "running", "model": MODEL}

@app.get("/health")
def health():
    return {"status": "ok", "service": "zeelm"}

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="Empty message")
    history = [{"role": m.role, "content": m.content} for m in request.history[-12:]
               if m.role in ("assistant", "user") and m.content.strip()]
    try:
        response = await client.chat(model=MODEL, messages=[{"role":"system","content":SYSTEM}, *history,
            {"role":"user","content":request.message.strip()}], think=False,
            keep_alive="5m", options={"num_predict":384,"num_ctx":2048,"temperature":0.4})
        return {"reply": response.message.content or "", "model": MODEL}
    except (ResponseError, ConnectionError, OSError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
