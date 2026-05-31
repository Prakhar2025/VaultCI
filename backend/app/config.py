from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://vaultci:vaultci_secret@localhost:5433/vaultci"

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_api_key: str = ""  # Required for Qdrant Cloud

    # GitHub
    github_webhook_secret: str = "dev_secret"
    github_token: str = ""

    # Groq
    groq_api_key: str = ""

    # App
    debug: bool = True


settings = Settings()
