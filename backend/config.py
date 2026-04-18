from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    anthropic_api_key: str = ""
    polygon_api_key: str = ""
    snaptrade_client_id: str = ""
    snaptrade_consumer_key: str = ""
    snaptrade_personal_user_id: str = ""
    secret_key: str = "dev-secret-change-in-production"
    database_url: str = "sqlite:///./hedgeiq.db"
    chromadb_path: str = "./data/chroma_cache"
    environment: str = "development"
    admin_email: str = ""
    admin_password: str = ""


settings = Settings()
