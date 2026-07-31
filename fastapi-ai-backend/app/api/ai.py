"""AI inference endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import get_current_user_id
from app.services.ai_provider import get_ai_provider

router = APIRouter()


class CompletionRequest(BaseModel):
    prompt: str
    max_tokens: int = 256
    model: str = "gpt-4"


class CompletionResponse(BaseModel):
    text: str
    model: str
    usage: dict


@router.post("/completions", response_model=CompletionResponse)
async def create_completion(
    request: CompletionRequest,
    user_id: str = Depends(get_current_user_id),
) -> CompletionResponse:
    """Create an AI completion."""
    provider = get_ai_provider()
    result = await provider.complete(
        prompt=request.prompt,
        max_tokens=request.max_tokens,
        model=request.model,
    )
    return CompletionResponse(**result)
