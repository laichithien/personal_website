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

    # Admin Authentication
    admin_username: str = "admin"
    default_admin_password: str = "admin123"  # Only used for initial setup when no admin exists

    # JWT Settings
    jwt_secret_key: str = "change-me-in-production-use-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    # File Upload
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10
    allowed_file_types: str = ".pdf,.txt,.md,.json,.csv"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]

    @property
    def allowed_file_extensions(self) -> list[str]:
        """Parse comma-separated file extensions."""
        return [ext.strip() for ext in self.allowed_file_types.split(",")]


settings = Settings()
