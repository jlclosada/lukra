from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5434/lukra"

    # JWT
    SECRET_KEY: str = "dev-secret-change-in-production-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_NAME: str = "Lukra API"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE: int = 5 * 1024 * 1024  # 5MB

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
