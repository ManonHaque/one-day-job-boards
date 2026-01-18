#!/usr/bin/env python3
"""
Script to set a user as admin
Run: python promote_to_admin.py <username>
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in environment variables")
    sys.exit(1)

# Import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))
from app import models

def promote_user_to_admin(username: str) -> bool:
    """Promote a user to admin role"""
    
    # Create database engine
    engine = create_engine(DATABASE_URL)  # type: ignore
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Find user by username
        user = db.query(models.User).filter(models.User.username == username).first()
        
        if user is None:
            print(f"❌ User '{username}' not found!")
            return False
        
        # Update role to admin
        setattr(user, 'role', 'admin')
        db.commit()
        
        print(f"✅ User '{username}' promoted to admin successfully!")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def list_all_users() -> None:
    """List all users with their roles"""
    
    engine = create_engine(DATABASE_URL)  # type: ignore
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        users = db.query(models.User).all()
        
        if len(users) == 0:
            print("No users found!")
            return
        
        print("\n" + "="*60)
        print("All Users in the System:")
        print("="*60)
        for user in users:
            user_role = str(getattr(user, 'role', 'unknown'))
            role_emoji = "👑" if user_role == "admin" else "📝" if user_role == "poster" else "🔧"
            username = str(getattr(user, 'username', 'N/A'))
            email = str(getattr(user, 'email', 'N/A'))
            print(f"{role_emoji} {username:20} | {email:30} | Role: {user_role}")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"❌ Error listing users: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python promote_to_admin.py <username>  - Promote user to admin")
        print("  python promote_to_admin.py --list      - List all users")
        print("\nExample:")
        print("  python promote_to_admin.py john_doe")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "--list":
        list_all_users()
    else:
        promote_user_to_admin(command)
