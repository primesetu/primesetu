import jwt
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

secret = os.environ.get("SUPABASE_JWT_SECRET") or os.environ.get("JWT_SECRET")
token = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not secret or not token:
    print("Missing secret or token")
    exit(1)

try:
    payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False, "verify_exp": False})
    print("Verification SUCCESSFUL!")
    print(f"Payload: {payload}")
except Exception as e:
    print(f"Verification FAILED: {e}")
