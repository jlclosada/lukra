import re

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    display_name: str | None = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) < 3 or len(v) > 30:
            raise ValueError("Username must be between 3 and 30 characters")
        if not re.match(r"^[a-z0-9_]+$", v):
            raise ValueError(
                "Username can only contain lowercase letters, numbers, and underscores"
            )
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
