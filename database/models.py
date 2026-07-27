"""
database/models.py

SQLAlchemy ORM table definitions for NityaGeeta.
Google OAuth Only — no password_hash column, no email verification.
Session duration: 18 days.
Memory strategy: Full message storage (no summaries).
"""

from sqlalchemy import (
    Column, String, Text, Boolean, Integer,
    DateTime, ForeignKey, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
import uuid

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Table 1: Users
# Core identity table. Only Google OAuth is used, so no password_hash.
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    display_name    = Column(String(255), nullable=True)
    avatar_url      = Column(Text, nullable=True)
    # Language preference for AI responses: 'en', 'hi', 'sa'
    preferred_lang  = Column(String(10), nullable=False, default="en")
    bio             = Column(Text, nullable=True)
    password_hash   = Column(String(255), nullable=True)
    is_active       = Column(Boolean, nullable=False, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    oauth_accounts  = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    sessions        = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    conversations   = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    bookmarks       = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"


# ---------------------------------------------------------------------------
# Table 2: OAuth Accounts
# Links a user to their Google identity.
# Kept separate so the same user could later add other providers.
# ---------------------------------------------------------------------------
class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id         = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider        = Column(String(50), nullable=False, default="google")
    # Google's unique subject ID — never changes even if user changes email
    provider_uid    = Column(String(255), nullable=False, unique=True, index=True)
    access_token    = Column(Text, nullable=True)
    refresh_token   = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user            = relationship("User", back_populates="oauth_accounts")

    def __repr__(self):
        return f"<OAuthAccount provider={self.provider} uid={self.provider_uid}>"


# ---------------------------------------------------------------------------
# Table 3: Sessions
# Active login tokens. Expire after 18 days.
# ---------------------------------------------------------------------------
class Session(Base):
    __tablename__ = "sessions"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id         = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Hashed token stored — never store raw tokens in the database
    token_hash      = Column(String(255), unique=True, nullable=False, index=True)
    expires_at      = Column(DateTime(timezone=True), nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user            = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session user_id={self.user_id} expires={self.expires_at}>"


# ---------------------------------------------------------------------------
# Table 4: Conversations
# Each distinct chat session a user starts.
# No summary column — all messages stored in full.
# ---------------------------------------------------------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id         = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Auto-generated title from the user's first message (first 80 chars)
    title           = Column(String(255), nullable=True)
    # Total message count — used to decide when to push old messages to Weaviate
    message_count   = Column(Integer, nullable=False, default=0)
    last_active_at  = Column(DateTime(timezone=True), server_default=func.now())
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user            = relationship("User", back_populates="conversations")
    messages        = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    bookmarks       = relationship("Bookmark", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation id={self.id} title={self.title}>"


# ---------------------------------------------------------------------------
# Table 5: Messages
# Every single message (user or AI) in every conversation.
# Full content stored — nothing compressed or summarized.
# ---------------------------------------------------------------------------
class Message(Base):
    __tablename__ = "messages"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    conversation_id = Column(UUID(as_uuid=False), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id         = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # 'user' or 'assistant'
    role            = Column(String(20), nullable=False)
    content         = Column(Text, nullable=False)
    # Token count from OpenRouter response — useful for cost tracking
    tokens_used     = Column(Integer, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    conversation    = relationship("Conversation", back_populates="messages")
    bookmarks       = relationship("Bookmark", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message id={self.id} role={self.role}>"


# ---------------------------------------------------------------------------
# Table 6: Bookmarks
# User can bookmark any AI response or verse for later review.
# ---------------------------------------------------------------------------
class Bookmark(Base):
    __tablename__ = "bookmarks"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id         = Column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id = Column(UUID(as_uuid=False), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    message_id      = Column(UUID(as_uuid=False), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    # Optional personal note the user can attach to the bookmark
    note            = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user            = relationship("User", back_populates="bookmarks")
    conversation    = relationship("Conversation", back_populates="bookmarks")
    message         = relationship("Message", back_populates="bookmarks")

    def __repr__(self):
        return f"<Bookmark id={self.id} message_id={self.message_id}>"
