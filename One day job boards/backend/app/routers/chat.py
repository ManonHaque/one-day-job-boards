import os
from typing import List, Literal, cast, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam
import httpx

# Request/response schemas
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

router = APIRouter()

# Initialize OpenAI client lazily
_openai_client: OpenAI | None = None

def get_client() -> OpenAI:
    global _openai_client
    if _openai_client:
        return _openai_client
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured on the server")
    _openai_client = OpenAI(api_key=api_key)
    return _openai_client

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    # First, try OpenAI
    try:
        client = get_client()
        messages_param: List[ChatCompletionMessageParam] = cast(
            List[ChatCompletionMessageParam],
            [{"role": msg.role, "content": msg.content} for msg in request.messages][-20:]
        )
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages_param,
            temperature=0.6,
            max_tokens=256,
        )
        reply = completion.choices[0].message.content if completion.choices else None
        if reply:
            return ChatResponse(reply=reply)
    except Exception:
        # Continue to fallbacks on provider error (e.g., 429 insufficient quota)
        pass

    # Fallback 1: Hugging Face Inference API if configured
    hf_key = os.getenv("HUGGINGFACE_API_KEY")
    if hf_key:
        try:
            # Build a simple prompt from messages
            prompt_parts: List[str] = []
            system = next((m.content for m in request.messages if m.role == "system"), "You are a helpful assistant for One-Day Job Board.")
            prompt_parts.append(system)
            for m in request.messages[-10:]:
                role = "User" if m.role == "user" else "Assistant"
                prompt_parts.append(f"{role}: {m.content}")
            prompt_parts.append("Assistant:")
            prompt = "\n".join(prompt_parts)

            model_id = os.getenv("HF_MODEL_ID", "meta-llama/Llama-3.1-8B-Instruct")
            headers: Dict[str, str] = {"Authorization": f"Bearer {hf_key}", "Content-Type": "application/json"}
            payload: Dict[str, Any] = {"inputs": prompt, "parameters": {"max_new_tokens": 256, "temperature": 0.6}}
            with httpx.Client(timeout=30.0) as client_http:
                resp = client_http.post(f"https://api-inference.huggingface.co/models/{model_id}", headers=headers, json=payload)
            if resp.status_code == 200:
                raw: Any = resp.json()
                # Responses can be a list with generated_text or a dict
                reply_text: Optional[str] = None
                if isinstance(raw, list) and raw:
                    first_dict: Dict[str, Any] = cast(Dict[str, Any], raw[0])
                    gt = first_dict.get("generated_text")
                    st = first_dict.get("summary_text")
                    if isinstance(gt, str):
                        reply_text = gt
                    elif isinstance(st, str):
                        reply_text = st
                elif isinstance(raw, dict):
                    raw_dict: Dict[str, Any] = cast(Dict[str, Any], raw)
                    gt = raw_dict.get("generated_text")
                    st = raw_dict.get("summary_text")
                    if isinstance(gt, str):
                        reply_text = gt
                    elif isinstance(st, str):
                        reply_text = st
                if isinstance(reply_text, str) and reply_text:
                    # Extract only the assistant portion if the model echoes prompt
                    reply_value: str = (
                        reply_text.split("Assistant:")[-1].strip()
                        if "Assistant:" in reply_text
                        else reply_text.strip()
                    )
                    return ChatResponse(reply=reply_value)
        except Exception:
            # Ignore and continue to local fallback
            pass

    # Fallback 2: Local canned replies to ensure the chat always responds
    user_last = next((m.content for m in reversed(request.messages) if m.role == "user"), "")
    lower = user_last.lower()
    if any(k in lower for k in ["apply", "application", "how to apply"]):
        reply = "To apply: open a job, click Apply, and submit your work when accepted. You can track status in your Doer Dashboard."
    elif any(k in lower for k in ["jobs", "browse", "find work"]):
        reply = "Browse jobs from the Jobs page. Use filters like department and status to narrow results."
    elif any(k in lower for k in ["account", "login", "signup"]):
        reply = "Log in from the Login page. New users can Sign Up with role Doer or Poster and optional department."
    elif any(k in lower for k in ["contact", "support", "help"]):
        reply = "For support, use this chat or email the site admin. Admins can manage users and jobs in the Admin Dashboard."
    else:
        reply = "I’m here to help with browsing jobs, applying, and navigating dashboards. Ask me about applying, finding jobs, or managing your account."
    return ChatResponse(reply=reply)
