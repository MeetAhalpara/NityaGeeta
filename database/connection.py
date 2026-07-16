import os
import redis
import psycopg2
import psycopg2.extras
import weaviate
from weaviate.auth import AuthApiKey
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    """Opens and returns a Neon PostgreSQL connection."""
    url = os.getenv("DATABASE_URL")
    if not url:
        raise EnvironmentError("DATABASE_URL is not set in .env")
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)


def test_postgres_connection():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT version();")
        v = cur.fetchone()
        conn.close()
        print("[POSTGRES] PASS -", str(v["version"])[:60])
        return True
    except Exception as e:
        print("[POSTGRES] FAIL:", e)
        return False


_redis_client = None


def get_redis_client():
    """Returns a shared Redis client (singleton)."""
    global _redis_client
    if _redis_client is None:
        url = os.getenv("REDIS_URL", "redis://localhost:1870")
        _redis_client = redis.Redis.from_url(
            url, decode_responses=True, socket_connect_timeout=5
        )
    return _redis_client


def test_redis_connection():
    try:
        r = get_redis_client()
        r.ping()
        print("[REDIS] PASS")
        return True
    except Exception as e:
        print("[REDIS] FAIL:", e)
        return False


_weaviate_client = None


def get_weaviate_client():
    """Returns a shared Weaviate cloud client (singleton)."""
    global _weaviate_client
    if _weaviate_client is None:
        url = os.getenv("WEAVIATE_URL")
        key = os.getenv("WEAVIATE_API_KEY")
        if not url or not key:
            raise EnvironmentError("WEAVIATE_URL or WEAVIATE_API_KEY not set in .env")
        _weaviate_client = weaviate.connect_to_weaviate_cloud(
            cluster_url=url,
            auth_credentials=AuthApiKey(key)
        )
    return _weaviate_client


def close_weaviate_client():
    global _weaviate_client
    if _weaviate_client:
        _weaviate_client.close()
        _weaviate_client = None


def test_weaviate_connection():
    try:
        c = get_weaviate_client()
        ready = c.is_ready()
        close_weaviate_client()
        print("[WEAVIATE] PASS - Ready:", ready)
        return True
    except Exception as e:
        print("[WEAVIATE] FAIL:", e)
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("    NITYAGEETA - Database Connection Diagnostics")
    print("=" * 60)
    pg = test_postgres_connection()
    rd = test_redis_connection()
    wv = test_weaviate_connection()
    print()
    print("=" * 60)
    print(f"  PostgreSQL : {'PASS' if pg else 'FAIL'}")
    print(f"  Redis      : {'PASS' if rd else 'FAIL'}")
    print(f"  Weaviate   : {'PASS' if wv else 'FAIL'}")
    print("=" * 60)
