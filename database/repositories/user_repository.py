"""
database/repositories/user_repository.py

Handles all database operations related to users, Google OAuth accounts,
and session tokens for NityaGeeta.

Auth strategy: Google OAuth Only
Session duration: 18 days
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from database.connection import get_db_connection


# ---------------------------------------------------------------------------
# Session constants
# ---------------------------------------------------------------------------
SESSION_DURATION_DAYS = 18


def _hash_token(token: str) -> str:
    """SHA-256 hash a session token before storing it."""
    return hashlib.sha256(token.encode()).hexdigest()


# ---------------------------------------------------------------------------
# User Operations
# ---------------------------------------------------------------------------

def get_user_by_id(user_id: str) -> dict | None:
    """Fetch a user by their UUID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE id = %s AND is_active = TRUE",
            (user_id,)
        )
        return cursor.fetchone()
    finally:
        conn.close()


def get_user_by_email(email: str) -> dict | None:
    """Fetch a user by email address."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE email = %s AND is_active = TRUE",
            (email,)
        )
        return cursor.fetchone()
    finally:
        conn.close()


def create_user(email: str, display_name: str = None, avatar_url: str = None) -> dict:
    """
    Create a new user record (Google OAuth users only).
    Returns the created user row as a dict.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (email, display_name, avatar_url)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (email, display_name, avatar_url)
        )
        user = cursor.fetchone()
        conn.commit()
        return user
    finally:
        conn.close()


def update_user_profile(user_id: str, display_name: str = None,
                        bio: str = None, preferred_lang: str = None,
                        avatar_url: str = None) -> dict | None:
    """
    Update a user's editable profile fields.
    Only non-None values are updated.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        fields = []
        values = []

        if display_name is not None:
            fields.append("display_name = %s")
            values.append(display_name)
        if bio is not None:
            fields.append("bio = %s")
            values.append(bio)
        if preferred_lang is not None:
            fields.append("preferred_lang = %s")
            values.append(preferred_lang)
        if avatar_url is not None:
            fields.append("avatar_url = %s")
            values.append(avatar_url)

        if not fields:
            return get_user_by_id(user_id)

        values.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s RETURNING *"
        cursor.execute(query, values)
        user = cursor.fetchone()
        conn.commit()
        return user
    finally:
        conn.close()


def deactivate_user(user_id: str) -> bool:
    """Soft-delete a user by setting is_active = FALSE."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET is_active = FALSE WHERE id = %s",
            (user_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Google OAuth Account Operations
# ---------------------------------------------------------------------------

def get_oauth_account(provider_uid: str, provider: str = "google") -> dict | None:
    """Find an OAuth account record by Google's subject ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM oauth_accounts WHERE provider_uid = %s AND provider = %s",
            (provider_uid, provider)
        )
        return cursor.fetchone()
    finally:
        conn.close()


def create_oauth_account(user_id: str, provider_uid: str,
                         access_token: str = None, refresh_token: str = None,
                         provider: str = "google") -> dict:
    """Link a Google OAuth identity to a user account."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO oauth_accounts (user_id, provider, provider_uid, access_token, refresh_token)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, provider, provider_uid, access_token, refresh_token)
        )
        account = cursor.fetchone()
        conn.commit()
        return account
    finally:
        conn.close()


def upsert_google_user(google_sub: str, email: str, display_name: str = None,
                       avatar_url: str = None, access_token: str = None) -> dict:
    """
    Get-or-create pattern for Google OAuth login.
    If the Google account is new, creates the user and OAuth link.
    If the Google account already exists, returns the existing user.
    Returns the user dict.
    """
    # Check if OAuth account already exists
    oauth_account = get_oauth_account(provider_uid=google_sub)

    if oauth_account:
        # Existing user — return their profile
        return get_user_by_id(oauth_account["user_id"])

    # New Google login — check if email is already registered
    existing_user = get_user_by_email(email)

    if existing_user:
        # Email exists but no OAuth link — link their account
        user_id = existing_user["id"]
    else:
        # Completely new user — create the user record
        new_user = create_user(email=email, display_name=display_name, avatar_url=avatar_url)
        user_id = new_user["id"]

    # Create the OAuth link
    create_oauth_account(
        user_id=user_id,
        provider_uid=google_sub,
        access_token=access_token
    )

    return get_user_by_id(user_id)


# ---------------------------------------------------------------------------
# Session Operations
# ---------------------------------------------------------------------------

def create_session(user_id: str) -> str:
    """
    Generate a secure 18-day session token for a user.
    Stores the hashed token in PostgreSQL.
    Returns the raw token (sent to the client as a cookie/header).
    """
    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DURATION_DAYS)

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES (%s, %s, %s)
            """,
            (user_id, token_hash, expires_at)
        )
        conn.commit()
    finally:
        conn.close()

    return raw_token


def validate_session(raw_token: str) -> dict | None:
    """
    Validate a session token.
    Returns the user dict if session is valid and not expired, otherwise None.
    """
    token_hash = _hash_token(raw_token)
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT u.*
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = %s
              AND s.expires_at > NOW()
              AND u.is_active = TRUE
            """,
            (token_hash,)
        )
        return cursor.fetchone()
    finally:
        conn.close()


def delete_session(raw_token: str) -> bool:
    """Delete a session record (user logout)."""
    token_hash = _hash_token(raw_token)
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM sessions WHERE token_hash = %s",
            (token_hash,)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def delete_all_user_sessions(user_id: str) -> int:
    """Delete all active sessions for a user (force logout all devices)."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM sessions WHERE user_id = %s",
            (user_id,)
        )
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()


def purge_expired_sessions() -> int:
    """
    Maintenance: Remove all expired session records from the database.
    Run this periodically (e.g., daily cron job).
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE expires_at <= NOW()")
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()
