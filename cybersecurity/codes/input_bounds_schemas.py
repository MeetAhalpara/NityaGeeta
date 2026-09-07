"""
Reference Implementation: Bounded Pydantic Schemas & UUID Format Validator
Source: api/main.py
"""

import uuid
from typing import Optional
from pydantic import BaseModel, Field

def is_valid_uuid(val: str) -> bool:
    """Validates if string conforms to standard RFC4122 UUID format."""
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError, TypeError):
        return False

# Pydantic Schemas with strict character bounds (Memory Exhaustion & DoS defense)
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000, description="The query question from the user")

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=200, description="The search term")
    limit: Optional[int] = Field(5, ge=1, le=20, description="Max search results to return")

class LookupRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254, description="Email to check in database")

class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254, description="User email address")
    full_name: Optional[str] = Field(None, max_length=100, description="Full display name")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar image URL")
    password: Optional[str] = Field(None, max_length=128, description="Password capped to 128 chars to prevent bcrypt DoS")

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254, description="Login email address")
    password: str = Field(..., min_length=1, max_length=128, description="Password capped to 128 chars")

class SessionSaveRequest(BaseModel):
    session_id: str = Field(..., min_length=10, max_length=64, description="UUID of the conversation session")
    user_email: str = Field(..., min_length=3, max_length=254, description="User email for DB lookup")
    title: str = Field(..., max_length=120, description="Session title from first message")
    messages: list = Field(..., max_items=200, description="Full message array capped to 200 items")
