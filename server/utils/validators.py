from email_validator import validate_email, EmailNotValidError

def is_non_empty_string(value, min_len=1, max_len=80):
    return isinstance(value, str) and min_len <= len(value.strip()) <= max_len

def validate_registration(payload: dict):
    errors = {}

    username = payload.get("username", "")
    email = payload.get("email", "")
    password = payload.get("password", "")

    if not is_non_empty_string(username, 3, 30):
        errors["username"] = "Username must be 3-30 characters."
    else:
        payload["username"] = username.strip()

    try:
        v = validate_email(email)
        payload["email"] = v.email.lower()
    except EmailNotValidError:
        errors["email"] = "Invalid email address."

    if not is_non_empty_string(password, 8, 128):
        errors["password"] = "Password must be 8-128 characters."

    return errors

def validate_login(payload: dict):
    errors = {}
    email = payload.get("email", "")
    password = payload.get("password", "")

    try:
        v = validate_email(email)
        payload["email"] = v.email.lower()
    except EmailNotValidError:
        errors["email"] = "Invalid email address."

    if not is_non_empty_string(password, 1, 128):
        errors["password"] = "Password is required."

    return errors
