from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5:0.5b")
MAX_CONTEXT_MESSAGES = int(os.getenv("MAX_CONTEXT_MESSAGES", "20"))


class Message(BaseModel):
    role: str
    content: str 


class ChatRequest(BaseModel):
    messages: list[Message]
    model: str | None = None


class ChatResponse(BaseModel):
    message: Message
    model: str 


def trim_context(messages: list[Message], max_messages: int) -> list[Message]:
    """
    Trim the context to the last MAX_CONTEXT_MESSAGES messages.
    """
    if len(messages) <= max_messages:
        return messages

    return messages[-max_messages:]


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    model = request.model or MODEL_NAME

    trimmed_messages = trim_context(request.messages, MAX_CONTEXT_MESSAGES)
    
    ollama_messages = [{"role": msg.role, "content": msg.content} for msg in trimmed_messages]

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": model,
                    "messages": ollama_messages,
                    "stream": False,
                },
            )
            response.raise_for_status()
            data = response.json()

            return ChatResponse(
                message=Message(
                    role="assistant", 
                    content=data["message"]["content"]
                ),
                model=model,
            )

        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Could not connect to Ollama")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Ollama request timed out")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))