#!/usr/bin/env python3
"""
Fix Supabase database schema issues
"""
import os
from database import engine
from sqlalchemy import text
import traceback

def fix_database_schema():
    """Fix database schema issues"""
    try:
        with engine.connect() as conn:
            print('🔧 Fixing database schema...')
            
            # Start transaction
            trans = conn.begin()
            
            try:
                # Check current documents table structure
                print('📋 Checking documents table structure...')
                result = conn.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'documents' 
                    ORDER BY ordinal_position;
                """))
                doc_columns = [(row[0], row[1]) for row in result.fetchall()]
                print(f'Documents columns: {doc_columns}')
                
                # Drop foreign key constraints if they exist
                print('🔗 Removing old foreign key constraints...')
                conn.execute(text("""
                    ALTER TABLE documents 
                    DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
                """))
                
                # Update user_id column to be string type if it's not already
                print('🔄 Updating user_id column type...')
                conn.execute(text("""
                    ALTER TABLE documents 
                    ALTER COLUMN user_id TYPE VARCHAR(36);
                """))
                
                # Create a clean users table if needed
                print('👥 Ensuring clean users table...')
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS app_users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        email VARCHAR(255) UNIQUE NOT NULL,
                        username VARCHAR(100) UNIQUE NOT NULL,
                        full_name VARCHAR(255) NOT NULL,
                        hashed_password VARCHAR(255) NOT NULL,
                        is_active BOOLEAN DEFAULT true,
                        is_verified BOOLEAN DEFAULT false,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE,
                        last_login TIMESTAMP WITH TIME ZONE
                    );
                """))
                
                # Migrate existing users to app_users table
                print('📋 Checking for existing users...')
                result = conn.execute(text("""
                    SELECT id, email, username, full_name, hashed_password, is_active, is_verified, created_at, updated_at, last_login
                    FROM users 
                    WHERE username IS NOT NULL AND hashed_password IS NOT NULL
                    LIMIT 10;
                """))
                existing_users = result.fetchall()
                
                if existing_users:
                    print(f'🔄 Found {len(existing_users)} users to migrate...')
                    for user in existing_users:
                        # Insert into app_users if doesn't exist
                        conn.execute(text("""
                            INSERT INTO app_users (id, email, username, full_name, hashed_password, is_active, is_verified, created_at, updated_at, last_login)
                            VALUES (:id, :email, :username, :full_name, :hashed_password, :is_active, :is_verified, :created_at, :updated_at, :last_login)
                            ON CONFLICT (email) DO NOTHING;
                        """), {
                            'id': user[0],
                            'email': user[1],
                            'username': user[2],
                            'full_name': user[3],
                            'hashed_password': user[4],
                            'is_active': user[5],
                            'is_verified': user[6],
                            'created_at': user[7],
                            'updated_at': user[8],
                            'last_login': user[9]
                        })
                
                # Update documents to reference app_users
                print('📄 Updating documents to reference correct users...')
                conn.execute(text("""
                    UPDATE documents 
                    SET user_id = app_users.id::text
                    FROM app_users 
                    WHERE documents.user_id = app_users.id::text
                    OR documents.user_id IS NULL;
                """))
                
                trans.commit()
                print('✅ Schema fixes completed successfully!')
                
            except Exception as e:
                trans.rollback()
                raise e
                
    except Exception as e:
        print(f'❌ Schema fix error: {e}')
        traceback.print_exc()

def test_auth_after_fix():
    """Test authentication after schema fix"""
    try:
        from models import User
        from database import SessionLocal
        from auth import get_password_hash
        
        db = SessionLocal()
        
        # Try to create a test user in app_users table
        print('🧪 Testing user creation after fix...')
        
        # Check if test user exists
        existing = db.execute(text("SELECT * FROM app_users WHERE email = 'test@fix.com'")).fetchone()
        if existing:
            print('👤 Test user already exists')
            db.close()
            return
            
        # Create test user directly in app_users
        with db.begin():
            db.execute(text("""
                INSERT INTO app_users (email, username, full_name, hashed_password, is_active, is_verified)
                VALUES (:email, :username, :full_name, :hashed_password, :is_active, :is_verified)
            """), {
                'email': 'test@fix.com',
                'username': 'testfix',
                'full_name': 'Test Fix User',
                'hashed_password': get_password_hash('testpass123'),
                'is_active': True,
                'is_verified': False
            })
        
        print('✅ Test user created successfully!')
        db.close()
        
    except Exception as e:
        print(f'❌ Auth test error: {e}')
        traceback.print_exc()
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    print("🚀 Fixing Supabase Database Schema Issues\n")
    fix_database_schema()
    print("\n" + "="*50 + "\n")
    test_auth_after_fix()
    print("\n🏁 Database fix completed!")