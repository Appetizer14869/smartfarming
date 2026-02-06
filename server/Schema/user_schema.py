from pymongo.collection import Collection

def ensure_user_indexes(users: Collection) -> None:
    # Unique indexes on username and email
    users.create_index("email", unique=True)
    users.create_index("username", unique=True)
