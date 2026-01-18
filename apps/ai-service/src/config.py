from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5442/ai_agent_db"

    # OpenRouter AI (uses OpenAI-compatible API)
    openrouter_api_key: str = ""
    openai_api_key: str = ""  # Set to OpenRouter key for Pydantic-AI
    openai_base_url: str = "https://openrouter.ai/api/v1"

    # Default model (OpenRouter format)
    default_model_provider: str = "openai"  # Pydantic-AI uses openai provider for OpenRouter
    default_model_name: str = "xiaomi/mimo-v2-flash:free"

    # Application
    debug: bool = False
    cors_origins_str: str = "http://localhost:3000,http://localhost:3333"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]


settings = Settings()
