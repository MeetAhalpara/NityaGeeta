import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

host = os.getenv("DATABRICKS_HOST")
token = os.getenv("DATABRICKS_TOKEN")

print("=" * 60)
print("     NITYAGEETA -> DATABRICKS CONNECTION AUDIT")
print("=" * 60)
print(f"Databricks Host : {host if host else '[MISSING]'}")
print(f"Token Configured: {'YES (dapi...)' if token and len(token) > 5 else '[MISSING]'}")

if not host or not token:
    print("\n[!] Please provide DATABRICKS_HOST and DATABRICKS_TOKEN in your .env file.")
    exit(1)

try:
    from databricks.sdk import WorkspaceClient

    print("\nAttempting handshake with Databricks Cloud...")
    w = WorkspaceClient(host=host, token=token)
    current_user = w.current_user.me()
    print(f"\n[SUCCESS] Connected to Databricks Workspace!")
    print(f"User Name  : {current_user.user_name}")
    print(f"Active     : {current_user.active}")
    print(f"User ID    : {current_user.id}")

    # List clusters if available
    try:
        clusters = list(w.clusters.list())
        print(f"Clusters   : {len(clusters)} compute clusters detected")
        for c in clusters:
            print(f"  - {c.cluster_name} ({c.state})")
    except Exception as ce:
        print(f"Compute check: {ce}")

    print("=" * 60)
    print("Databricks is successfully connected to NityaGeeta!")
    print("=" * 60)

except Exception as e:
    print(f"\n[ERROR] Connection failed: {e}")
    exit(1)
