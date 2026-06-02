"""
demo_auth.py — AI-generated authentication middleware.
This file is intentionally designed to trigger VaultCI's security analysis:
- Direct JWT validation (bypasses AuthService — architectural violation)
- Hardcoded secret key (security vulnerability)
- No rate limiting on auth endpoint
"""
import jwt
import sqlite3
from fastapi import Request, HTTPException

# SECURITY ISSUE: Hardcoded secret key
SECRET_KEY = "super_secret_key_12345"

# SECURITY ISSUE: Direct SQL query (violates repository pattern)
def get_user_from_db(user_id: str):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # SQL INJECTION RISK: unsanitized input
    cursor.execute(f"SELECT * FROM users WHERE id = '{user_id}'")
    return cursor.fetchone()

# ARCHITECTURAL VIOLATION: Direct JWT handling instead of AuthService
async def auth_middleware(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="No token")
    try:
        # Bypasses central AuthService — violates PR #88 architectural rule
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = get_user_from_db(payload.get("user_id"))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# BLAST RADIUS: This middleware is imported by 14 other modules
