import base64
secret = "G4dYL7QgqQOtu1xYR2ge+X0uAqjHgKqqYazx6yP0VShSYiQNh2YyH+YduxYG0AxRVQEErLn/X/wiEltMsfyixQ=="
try:
    decoded = base64.b64decode(secret)
    print(f"Decoded length: {len(decoded)} bytes")
except Exception as e:
    print(f"Not valid Base64: {e}")
