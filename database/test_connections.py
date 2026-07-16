import sys
sys.path.insert(0, ".")
from database.connection import (
    test_postgres_connection,
    test_redis_connection,
    test_weaviate_connection
)

print("=" * 60)
print("    NITYAGEETA - Database Connection Diagnostics")
print("=" * 60)

pg = test_postgres_connection()
rd = test_redis_connection()
wv = test_weaviate_connection()

print()
print("=" * 60)
pg_label = "PASS" if pg else "FAIL"
rd_label = "PASS" if rd else "FAIL"
wv_label = "PASS" if wv else "FAIL"
print("  PostgreSQL :", pg_label)
print("  Redis      :", rd_label)
print("  Weaviate   :", wv_label)
print("=" * 60)
