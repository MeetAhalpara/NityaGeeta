import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from passlib.hash import bcrypt

from api.services.rag_engine import execute_rag_query
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

# Pydantic Schemas for validation
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3, description="The query question from the user")

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="The search term")
    limit: Optional[int] = Field(5, ge=1, le=20, description="Max search results to return")

class LookupRequest(BaseModel):
    email: str = Field(..., description="Email to check in database")

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: Optional[str] = Field(None, description="Full display name")
    avatar_url: Optional[str] = Field(None, description="Avatar image URL")
    password: Optional[str] = Field(None, description="Optional manual login password")

class LoginRequest(BaseModel):
    email: str = Field(..., description="Login email address")
    password: str = Field(..., description="Clear text password")

class GoogleSetupRequest(BaseModel):
    email: str = Field(..., description="Email address to update")
    first_name: str = Field(..., description="First Name")
    last_name: str = Field(..., description="Last Name")
    password: str = Field(..., description="Mandatory login password")
    age: Optional[str] = Field(None, description="Age")
    preferred_language: Optional[str] = Field(None, description="Preferred display language")


@app.get("/health")
def health_check():
    """Simple API health check endpoint."""
    return {"status": "healthy", "service": "NityaGeeta API"}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """Conversational endpoint executing scripture-grounded RAG query."""
    try:
        logger.info(f"Received chat request: {request.question}")
        response = execute_rag_query(request.question)
        return response
    except Exception as e:
        logger.error(f"Error executing chat: {e}")
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

@app.get("/api/v1/pages/{page_id}")
async def page_endpoint(page_id: int):
    """Retrieves original Sanskrit and English translation for a specific page."""
    page = get_page(page_id)
    if not page:
        raise HTTPException(status_code=404, detail=f"Page number {page_id} not found in dataset.")
    return page


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
