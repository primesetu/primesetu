import os
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if key:
    try:
        # Decode without verification
        payload = jwt.get_unverified_claims(key)
        print("Claims:", payload)
        header = jwt.get_unverified_header(key)
        print("Header:", header)
    except Exception as e:
        print("Error decoding:", e)
else:
    print("No service role key found")
