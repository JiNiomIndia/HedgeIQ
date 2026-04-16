from pydantic_settings import BaseSettings


class Settings(BaseSettings):
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

    class Config:
        env_file = ".env"


settings = Settings()
