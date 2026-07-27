"""
Script to delete a user from the NityaGeeta database.

Usage:
    python delete_user.py --email moresdip@gmail.com
    python delete_user.py --email moresdip@gmail.com --hard  # Permanently delete
"""

import sys
import argparse
from database.connection import get_db_connection
from database.repositories.user_repository import get_user_by_email, deactivate_user


def hard_delete_user(user_id: str) -> bool:
    """
    Permanently delete a user and all related data.
    This CASCADE deletes: conversations, messages, bookmarks, sessions, oauth_accounts.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Delete the user (CASCADE will handle related tables)
        cursor.execute(
            "DELETE FROM users WHERE id = %s",
            (user_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Delete a user from NityaGeeta database")
    parser.add_argument("--email", required=True, help="Email of the user to delete")
    parser.add_argument("--hard", action="store_true", help="Permanently delete (default: soft delete)")
    parser.add_argument("--force", action="store_true", help="Skip confirmation prompt")
    
    args = parser.parse_args()
    
    # Find the user
    user = get_user_by_email(args.email)
    
    if not user:
        print(f"❌ User with email '{args.email}' not found or already inactive.")
        sys.exit(1)
    
    print(f"\n📋 User found:")
    print(f"   ID: {user['id']}")
    print(f"   Email: {user['email']}")
    print(f"   Name: {user.get('display_name', 'N/A')}")
    print(f"   Created: {user.get('created_at', 'N/A')}")
    print(f"   Active: {user.get('is_active', 'N/A')}")
    
    if not args.force:
        if args.hard:
            print("\n⚠️  WARNING: Hard delete will permanently remove:")
            print("   • User account")
            print("   • All conversations and messages")
            print("   • All bookmarks")
            print("   • All sessions")
            print("   • OAuth account links")
            print("\nThis action cannot be undone!")
        
        confirm = input(f"\nProceed with {'hard' if args.hard else 'soft'} delete? (yes/no): ")
        if confirm.lower() != 'yes':
            print("❌ Operation cancelled.")
            sys.exit(0)
    
    # Perform deletion
    if args.hard:
        success = hard_delete_user(user['id'])
        action = "permanently deleted"
    else:
        success = deactivate_user(user['id'])
        action = "deactivated"
    
    if success:
        print(f"\n✅ User '{args.email}' has been {action} successfully.")
    else:
        print(f"\n❌ Failed to delete user '{args.email}'.")
        sys.exit(1)


if __name__ == "__main__":
    main()
