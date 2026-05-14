
from jose import jwt
import datetime
import base64

# From root .env
JWT_SECRET_B64 = "G4dYL7QgqQOtu1xYR2ge+X0uAqjHgKqqYazx6yP0VShSYiQNh2YyH+YduxYG0AxRVQEErLn/X/wiEltMsfyixQ=="
SECRET = base64.b64decode(JWT_SECRET_B64)

payload = {
    "role": "anon",
    "iss": "supabase",
    "ref": "obuynyhvvjrtgmaeiroy",
    "iat": int(datetime.datetime.now().timestamp()),
    "exp": int((datetime.datetime.now() + datetime.timedelta(days=3650)).timestamp())
}

token = jwt.encode(payload, SECRET, algorithm="HS256")
print(token)
