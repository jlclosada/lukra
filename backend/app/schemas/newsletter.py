from pydantic import BaseModel, EmailStr


class NewsletterSubscribe(BaseModel):
    email: EmailStr


class NewsletterResponse(BaseModel):
    message: str
    email: str
