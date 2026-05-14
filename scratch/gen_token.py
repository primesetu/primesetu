import jwt
import os
import datetime
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')

secret = os.environ.get("SUPABASE_JWT_SECRET") or os.environ.get("JWT_SECRET")

if not secret:
    print("Missing secret")
    exit(1)

# Mimic Supabase JWT payload
payload = {
    "sub": "accc4bdd-823f-480c-a30b-9bc0c4ea2a19", # Our tester2 ID
    "email": "tester2@primesetu.io",
    "aud": "authenticated",
    "role": "authenticated",
    "iat": int(datetime.datetime.now().timestamp()),
    "exp": int((datetime.datetime.now() + datetime.timedelta(hours=1)).timestamp()),
    "user_metadata": {
        "store_id": "ad5bb4c5-e9f8-4e37-981b-3eaea1e4ea8b", # Our TPS02 store ID
        "role": "admin",
        "full_name": "Test Admin 2"
    }
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
