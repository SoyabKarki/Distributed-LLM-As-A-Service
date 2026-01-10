from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")


class ChatRequest(BaseModel):
    prompt: str
    model: str = "qwen2.5:0.5b"


class ChatResponse(BaseModel):
    response: str
    model: str 


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": request.model,
                    "prompt": request.prompt,
                    "stream": False,
                },
            )
            response.raise_for_status()
            data = response.json()

            return ChatResponse(
                response=data["response"],
                model=request.model,
            )

        except httpx.ConnectError:
            raise HTTPException(status_code=500, detail="Could not connect to Ollama")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))