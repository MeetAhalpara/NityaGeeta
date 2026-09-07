import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from passlib.hash import bcrypt

from api.services.dataset_cache import search_dataset, get_page
from database.connection import get_db_connection

# Setup logging
logger = logging.getLogger("nityageeta.main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="NityaGeeta API",
    description="Grounded AI spiritual companion API for Srimad Bhagavad Gita",
    version="1.0.0"
)

# CORS configuration
# Allow all origins during development for flexibility with Next.js ports.
# For production, this should be restricted to the actual domain of the frontend.
development_origins = [
    "http://localhost:1870",  # Custom dev port
    "http://127.0.0.1:1870",
    "http://localhost:3000",  # Default Next.js port
    "*"                       # Allow any origin in development
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=development_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for validation with strict bounds (Memory Exhaustion & DoS defense)
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
    password: Optional[str] = Field(None, max_length=128, description="Optional manual login password")

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254, description="Login email address")
    password: str = Field(..., min_length=1, max_length=128, description="Clear text password")

class GoogleSetupRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254, description="Email address to update")
    first_name: str = Field(..., min_length=1, max_length=100, description="First Name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last Name")
    password: str = Field(..., min_length=6, max_length=128, description="Mandatory login password")
    age: Optional[str] = Field(None, max_length=3, description="Age")
    preferred_language: Optional[str] = Field(None, max_length=10, description="Preferred display language")


@app.get("/health")
def health_check():
    """Simple API health check endpoint."""
    return {"status": "healthy", "service": "NityaGeeta API"}

from api.services.rag_engine import execute_rag_query, execute_rag_pipeline_async

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """Conversational endpoint executing 4-dataset RAG -> 5-model parallel fan-out -> Judge evaluation."""
    try:
        logger.info(f"Received chat request: {request.question}")
        response = await execute_rag_pipeline_async(request.question)
        return response
    except Exception as e:
        logger.error(f"Error executing chat pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/search")
async def search_endpoint(request: SearchRequest):
    """Search endpoint to find matching scripture pages."""
    try:
        logger.info(f"Received search request: {request.query}")
        results = search_dataset(request.query, limit=request.limit)
        return {"results": results}
    except Exception as e:
        logger.error(f"Error executing search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse
from api.config import BASE_DIR

PDF_MAP = {
    "p1_gita_press": BASE_DIR / "data" / "raw" / "gita_editions" / "Srimad Bhagavad Gita Press Gorakhpur.pdf",
    "p2_winthrop_sargeant": BASE_DIR / "data" / "raw" / "gita_editions" / "The Bhagavad Gita Winthrop Sargeant (Word-for-Word English).pdf",
    "p3_sadhak_sanjeevani_eng": BASE_DIR / "data" / "raw" / "gita_editions" / "Gita-Sadhak-Sanjevani-English.pdf",
    "p4_shankaracharya": BASE_DIR / "data" / "raw" / "gita_editions" / "Bhagavad Gita with the Commentary of Adi Shankaracharya.pdf",
    "alt_boss_ocr": BASE_DIR / "data" / "raw" / "veducation_books" / "Basics of Sanatan Sanskriti.pdf"
}

@app.get("/api/v1/pdf/{source_id}")
async def get_pdf_file(source_id: str):
    """Serves original canonical PDF file for browser viewing at specific page numbers."""
    pdf_path = PDF_MAP.get(source_id)
    if not pdf_path or not pdf_path.exists():
        pdf_path = PDF_MAP["p1_gita_press"]
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Requested PDF file not found on server.")
    return FileResponse(path=pdf_path, media_type="application/pdf", filename=pdf_path.name)

@app.get("/api/v1/pages/{page_id}")
async def page_endpoint(page_id: int):
    """Retrieves original Sanskrit and English translation for a specific page with PDF viewer & translation tools."""
    page = get_page(page_id)
    if not page:
        raise HTTPException(status_code=404, detail=f"Page number {page_id} not found in dataset.")
    
    return {
        "page": page_id,
        "source": "Srimad Bhagavad Gita Press Gorakhpur (Priority 1)",
        "disclaimer": "Original text is in Sanskrit & Hindi Devanagari script.",
        "translation_resources": [
            {"name": "PolyTranslator (Sanskrit to English)", "url": "https://www.polytranslator.com/sanskrit-to-english/"},
            {"name": "MachineTranslation (Sanskrit to English)", "url": "https://www.machinetranslation.com/translation/sanskrit-english"}
        ],
        "pdf_viewer_url": f"http://localhost:8000/api/v1/pdf/p1_gita_press#page={page_id}",
        "original": page.get("original", ""),
        "english": page.get("english", "")
    }



# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.post("/api/v1/auth/lookup")
async def lookup_email_endpoint(request: LookupRequest):
    """Checks if email already exists in users database."""
    email_norm = request.email.strip().lower()
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, email, display_name, avatar_url FROM users WHERE email = %s;", (email_norm,))
        user = cur.fetchone()
        cur.close()
        
        if user:
            return {
                "exists": True,
                "message": "Account found.",
                "user": {
                    "id": str(user["id"]),
                    "email": user["email"],
                    "display_name": user["display_name"],
                    "avatar_url": user["avatar_url"]
                }
            }
        return {"exists": False, "message": "User not found."}
    except Exception as e:
        logger.error(f"Database lookup error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error.")
    finally:
        if conn:
            conn.close()

@app.post("/api/v1/auth/register")
async def register_endpoint(request: RegisterRequest):
    """Creates a new user record in the database."""
    email_norm = request.email.strip().lower()
    password_hash = None
    if request.password:
        password_hash = bcrypt.hash(request.password)
        
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check duplicate
        cur.execute("SELECT id FROM users WHERE email = %s;", (email_norm,))
        if cur.fetchone():
            cur.close()
            raise HTTPException(status_code=400, detail="Account already exists with this email address.")
            
        # Insert user
        cur.execute(
            """
            INSERT INTO users (email, display_name, avatar_url, password_hash)
            VALUES (%s, %s, %s, %s)
            RETURNING id, email, display_name, avatar_url;
            """,
            (email_norm, request.full_name, request.avatar_url, password_hash)
        )
        new_user = cur.fetchone()
        conn.commit()
        cur.close()
        
        return {
            "exists": True,
            "message": "Account registered successfully.",
            "user": {
                "id": str(new_user["id"]),
                "email": new_user["email"],
                "display_name": new_user["display_name"],
                "avatar_url": new_user["avatar_url"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database registration error: {e}")
        raise HTTPException(status_code=500, detail="Database write error during signup.")
    finally:
        if conn:
            conn.close()

@app.post("/api/v1/auth/login")
async def login_endpoint(request: LoginRequest):
    """Authenticates credentials against database."""
    email_norm = request.email.strip().lower()
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, email, display_name, password_hash FROM users WHERE email = %s;", (email_norm,))
        user = cur.fetchone()
        cur.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="No account registered with this email address.")
            
        hashed = user["password_hash"]
        if not hashed:
            raise HTTPException(status_code=401, detail="This account uses Google login. Please continue with Google.")
            
        if not bcrypt.verify(request.password, hashed):
            raise HTTPException(status_code=401, detail="Invalid password. Please check your credentials.")
            
        return {
            "id": str(user["id"]),
            "email": user["email"],
            "name": user["display_name"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=500, detail="Internal authentication server error.")
    finally:
        if conn:
            conn.close()

@app.post("/api/v1/auth/google-setup")
async def google_setup_endpoint(request: GoogleSetupRequest):
    """Completes details for Google login accounts and sets up manual passwords."""
    email_norm = request.email.strip().lower()
    password_hash = bcrypt.hash(request.password)
    display_name = f"{request.first_name.strip()} {request.last_name.strip()}"
    
    # Clean and parse age integer
    age_val = None
    if request.age:
        try:
            age_val = int(request.age)
        except ValueError:
            pass

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s;", (email_norm,))
        user = cur.fetchone()
        
        if not user:
            # Create user if missing
            cur.execute(
                """
                INSERT INTO users (email, display_name, password_hash, age, preferred_lang)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (email_norm, display_name, password_hash, age_val, request.preferred_language or "en")
            )
        else:
            # Update user profile
            cur.execute(
                """
                UPDATE users
                SET display_name = %s, password_hash = %s, age = %s, preferred_lang = %s
                WHERE email = %s;
                """,
                (display_name, password_hash, age_val, request.preferred_language or "en", email_norm)
            )
            
        conn.commit()
        cur.close()
        return {"success": True, "message": "Profile setup completed successfully."}
    except Exception as e:
        logger.error(f"Google setup DB update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save profile settings to database.")
    finally:
        if conn:
            conn.close()


# =============================================================================
# SESSION ENDPOINTS — Perplexity-style conversation persistence
# =============================================================================

import json as _json
import uuid as _uuid
from typing import Any as _Any

def is_valid_uuid(val: str) -> bool:
    """Validates if string conforms to standard UUID format."""
    try:
        _uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError, TypeError):
        return False

class SessionSaveRequest(BaseModel):
    session_id: str = Field(..., min_length=10, max_length=64, description="UUID of the conversation session")
    user_email: str = Field(..., min_length=3, max_length=254, description="User email for DB lookup")
    title: str = Field(..., max_length=120, description="Session title from first message")
    messages: list = Field(..., max_length=200, description="Full message array")


class SessionListRequest(BaseModel):
    user_email: str = Field(..., min_length=3, max_length=254, description="User email to fetch sessions for")


@app.post("/api/v1/sessions/save")
async def save_session_endpoint(request: SessionSaveRequest):
    """
    Upserts a conversation session + all messages to PostgreSQL.
    Called fire-and-forget from the frontend on each message.
    """
    if not is_valid_uuid(request.session_id):
        return {"success": False, "reason": "Invalid session_id UUID format"}

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Resolve user_id from email
        cur.execute("SELECT id FROM users WHERE email = %s;", (request.user_email.strip().lower(),))
        user_row = cur.fetchone()
        if not user_row:
            return {"success": False, "reason": "User not found"}
        user_id = str(user_row["id"])

        # Upsert conversation (INSERT … ON CONFLICT DO UPDATE)
        cur.execute(
            """
            INSERT INTO conversations (id, user_id, title, last_active_at)
            VALUES (%s::uuid, %s::uuid, %s, NOW())
            ON CONFLICT (id) DO UPDATE
              SET title = EXCLUDED.title,
                  last_active_at = NOW();
            """,
            (request.session_id, user_id, request.title[:120])
        )

        # Delete existing messages for this conversation and re-insert all
        # (simple replace strategy — messages array is the source of truth)
        cur.execute(
            "DELETE FROM messages WHERE conversation_id = %s::uuid;",
            (request.session_id,)
        )

        msg_count = 0
        for msg in request.messages[:150]:
            role = "user" if msg.get("sender") == "user" else "assistant"
            content = str(msg.get("text", ""))[:8000]
            if not content:
                continue
            cur.execute(
                """
                INSERT INTO messages (conversation_id, user_id, role, content)
                VALUES (%s::uuid, %s::uuid, %s, %s);
                """,
                (request.session_id, user_id, role, content)
            )
            msg_count += 1

        # Update message count
        cur.execute(
            "UPDATE conversations SET message_count = %s WHERE id = %s::uuid;",
            (msg_count, request.session_id)
        )

        conn.commit()
        cur.close()
        return {"success": True, "session_id": request.session_id, "messages_saved": msg_count}

    except Exception as e:
        logger.error(f"Session save error: {e}")
        return {"success": False, "reason": "Failed to save session due to an internal server error."}
    finally:
        if conn:
            conn.close()


@app.post("/api/v1/sessions/list")
async def list_sessions_endpoint(request: SessionListRequest):
    """
    Returns all conversation sessions for a user, sorted newest first.
    Used by the /app/library page.
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE email = %s;", (request.user_email.strip().lower(),))
        user_row = cur.fetchone()
        if not user_row:
            return {"sessions": []}
        user_id = str(user_row["id"])

        cur.execute(
            """
            SELECT id, title, message_count, last_active_at, created_at
            FROM conversations
            WHERE user_id = %s::uuid
            ORDER BY last_active_at DESC
            LIMIT 100;
            """,
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()

        sessions = [
            {
                "id": str(r["id"]),
                "title": r["title"] or "Untitled Session",
                "message_count": r["message_count"],
                "last_active_at": r["last_active_at"].isoformat() if r["last_active_at"] else None,
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
            }
            for r in rows
        ]
        return {"sessions": sessions}

    except Exception as e:
        logger.error(f"Session list error: {e}")
        return {"sessions": []}
    finally:
        if conn:
            conn.close()


@app.get("/api/v1/sessions/{session_id}/messages")
async def get_session_messages_endpoint(session_id: str):
    """
    Returns all messages for a given session UUID.
    Used to restore a conversation from DB when localStorage is cold.
    """
    if not is_valid_uuid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID format. Must be a valid UUID.")

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, role, content, created_at
            FROM messages
            WHERE conversation_id = %s::uuid
            ORDER BY created_at ASC;
            """,
            (session_id,)
        )
        rows = cur.fetchall()
        cur.close()

        messages = [
            {
                "id": str(r["id"]),
                "sender": "user" if r["role"] == "user" else "bot",
                "text": r["content"],
            }
            for r in rows
        ]
        return {"messages": messages}

    except Exception as e:
        logger.error(f"Session messages fetch error: {e}")
        return {"messages": []}
    finally:
        if conn:
            conn.close()


@app.delete("/api/v1/sessions/{session_id}")
async def delete_session_endpoint(session_id: str, user_email: str):
    """Deletes a conversation and all its messages."""
    if not is_valid_uuid(session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID format. Must be a valid UUID.")

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s;", (user_email.strip().lower(),))
        user_row = cur.fetchone()
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        cur.execute(
            "DELETE FROM conversations WHERE id = %s::uuid AND user_id = %s::uuid;",
            (session_id, str(user_row["id"]))
        )
        conn.commit()
        cur.close()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session delete error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred while deleting session.")
    finally:
        if conn:
            conn.close()
