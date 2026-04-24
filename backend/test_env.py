from backend.app.core.config import settings
import os

print(f"CWD: {os.getcwd()}")
print(f"JWT_SECRET from settings: {settings.jwt_secret[:10]}...")
print(f"DATABASE_URL from settings: {settings.database_url[:20]}...")
