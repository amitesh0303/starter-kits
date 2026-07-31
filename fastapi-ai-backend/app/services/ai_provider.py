"""AI provider with fake adapter for testing."""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import is_fake_mode


class AIProvider(ABC):
    """Abstract AI provider interface."""

    @abstractmethod
    async def complete(self, prompt: str, max_tokens: int, model: str) -> dict:
        """Generate a completion."""
        ...


class FakeAIProvider(AIProvider):
    """Fake AI provider for testing - returns deterministic responses."""

    async def complete(self, prompt: str, max_tokens: int, model: str) -> dict:
        return {
            "text": f"Fake response to: {prompt[:50]}",
            "model": model,
            "usage": {"prompt_tokens": len(prompt.split()), "completion_tokens": 10, "total_tokens": len(prompt.split()) + 10},
        }


class OpenAIProvider(AIProvider):
    """Real OpenAI-compatible provider."""

    def __init__(self, api_key: str, base_url: str) -> None:
        self.api_key = api_key
        self.base_url = base_url

    async def complete(self, prompt: str, max_tokens: int, model: str) -> dict:
        import openai

        client = openai.AsyncOpenAI(api_key=self.api_key, base_url=self.base_url)
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
        )
        choice = response.choices[0]
        usage = response.usage
        return {
            "text": choice.message.content or "",
            "model": response.model,
            "usage": {
                "prompt_tokens": usage.prompt_tokens if usage else 0,
                "completion_tokens": usage.completion_tokens if usage else 0,
                "total_tokens": usage.total_tokens if usage else 0,
            },
        }


def get_ai_provider() -> AIProvider:
    """Get AI provider - fake for testing, real for production."""
    if is_fake_mode():
        return FakeAIProvider()
    from app.core.config import get_settings
    settings = get_settings()
    return OpenAIProvider(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
