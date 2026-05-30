import hashlib
import hmac

from fastapi import HTTPException, Request

from app.config import settings


async def verify_signature(request: Request) -> bytes:
    """Validate GitHub HMAC-SHA256 webhook signature. Raises 401 on failure."""
    signature = request.headers.get("X-Hub-Signature-256", "")
    if not signature.startswith("sha256="):
        raise HTTPException(status_code=401, detail="Missing signature")

    body = await request.body()
    expected = "sha256=" + hmac.new(
        settings.github_webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return body
