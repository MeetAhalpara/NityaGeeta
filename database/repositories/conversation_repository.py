"""
database/repositories/conversation_repository.py

Handles all database operations for conversations and messages.

Memory strategy: Full message storage — nothing is compressed or summarized.
Redis caches the last 20 messages for instant retrieval.
Weaviate stores vector embeddings for semantic long-term recall.
"""

from database.connection import get_db_connection


# ---------------------------------------------------------------------------
# Conversation Operations
# ---------------------------------------------------------------------------

def create_conversation(user_id: str, title: str = None) -> dict:
    """
    Create a new conversation session for a user.
    The title is auto-generated from the first message if not provided.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO conversations (user_id, title)
            VALUES (%s, %s)
            RETURNING *
            """,
            (user_id, title)
        )
        conversation = cursor.fetchone()
        conn.commit()
        return conversation
    finally:
        conn.close()


def get_conversation_by_id(conversation_id: str) -> dict | None:
    """Fetch a single conversation by its UUID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM conversations WHERE id = %s",
            (conversation_id,)
        )
        return cursor.fetchone()
    finally:
        conn.close()


def get_user_conversations(user_id: str, limit: int = 50, offset: int = 0) -> list:
    """
    Fetch all conversations for a user, sorted by most recently active.
    Returns paginated results.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, title, message_count, last_active_at, created_at
            FROM conversations
            WHERE user_id = %s
            ORDER BY last_active_at DESC
            LIMIT %s OFFSET %s
            """,
            (user_id, limit, offset)
        )
        return cursor.fetchall()
    finally:
        conn.close()


def update_conversation_title(conversation_id: str, title: str) -> dict | None:
    """Update the auto-generated title of a conversation."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE conversations SET title = %s WHERE id = %s RETURNING *
            """,
            (title, conversation_id)
        )
        updated = cursor.fetchone()
        conn.commit()
        return updated
    finally:
        conn.close()


def delete_conversation(conversation_id: str, user_id: str) -> bool:
    """
    Permanently delete a conversation and all its messages.
    Requires user_id to prevent users deleting other users' data.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM conversations WHERE id = %s AND user_id = %s",
            (conversation_id, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Message Operations
# ---------------------------------------------------------------------------

def save_message(conversation_id: str, user_id: str,
                 role: str, content: str, tokens_used: int = None) -> dict:
    """
    Save a new message to the database and update the conversation stats.
    role must be either 'user' or 'assistant'.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Insert the message
        cursor.execute(
            """
            INSERT INTO messages (conversation_id, user_id, role, content, tokens_used)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (conversation_id, user_id, role, content, tokens_used)
        )
        message = cursor.fetchone()

        # Update conversation's message count and last_active timestamp
        cursor.execute(
            """
            UPDATE conversations
            SET message_count = message_count + 1,
                last_active_at = NOW()
            WHERE id = %s
            """,
            (conversation_id,)
        )

        conn.commit()
        return message
    finally:
        conn.close()


def get_conversation_messages(conversation_id: str,
                               limit: int = None, offset: int = 0) -> list:
    """
    Fetch messages for a conversation, ordered chronologically (oldest first).
    Used to display the full chat history in the UI.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        if limit:
            cursor.execute(
                """
                SELECT id, role, content, tokens_used, created_at
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC
                LIMIT %s OFFSET %s
                """,
                (conversation_id, limit, offset)
            )
        else:
            cursor.execute(
                """
                SELECT id, role, content, tokens_used, created_at
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC
                OFFSET %s
                """,
                (conversation_id, offset)
            )

        return cursor.fetchall()
    finally:
        conn.close()


def get_recent_messages(conversation_id: str, count: int = 20) -> list:
    """
    Fetch the N most recent messages in a conversation (newest-first order).
    Used as a fallback when Redis cache is cold/empty.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, role, content, created_at
            FROM messages
            WHERE conversation_id = %s
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (conversation_id, count)
        )
        # Reverse to return oldest-first (correct conversation order)
        rows = cursor.fetchall()
        return list(reversed(rows))
    finally:
        conn.close()


def get_message_by_id(message_id: str) -> dict | None:
    """Fetch a single message by its UUID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM messages WHERE id = %s",
            (message_id,)
        )
        return cursor.fetchone()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Bookmark Operations
# ---------------------------------------------------------------------------

def create_bookmark(user_id: str, conversation_id: str,
                    message_id: str, note: str = None) -> dict:
    """Save a message as a bookmark for a user."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO bookmarks (user_id, conversation_id, message_id, note)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, conversation_id, message_id, note)
        )
        bookmark = cursor.fetchone()
        conn.commit()
        return bookmark
    finally:
        conn.close()


def get_user_bookmarks(user_id: str) -> list:
    """Fetch all bookmarks for a user with message content included."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT
                b.id AS bookmark_id,
                b.note,
                b.created_at AS bookmarked_at,
                m.content AS message_content,
                m.role AS message_role,
                c.title AS conversation_title,
                c.id AS conversation_id
            FROM bookmarks b
            JOIN messages m ON m.id = b.message_id
            JOIN conversations c ON c.id = b.conversation_id
            WHERE b.user_id = %s
            ORDER BY b.created_at DESC
            """,
            (user_id,)
        )
        return cursor.fetchall()
    finally:
        conn.close()


def delete_bookmark(bookmark_id: str, user_id: str) -> bool:
    """Delete a bookmark. Requires user_id for ownership check."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM bookmarks WHERE id = %s AND user_id = %s",
            (bookmark_id, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
