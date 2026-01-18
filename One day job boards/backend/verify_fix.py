from app.schemas import UserCreate
from pydantic import ValidationError

try:
    print("Testing invalid role...")
    UserCreate(
        username="testuser",
        email="test@example.com",
        role="invalid_role",
        password="password"
    )
    print("FAILED: Invalid role was accepted!")
except ValidationError as e:
    print("SUCCESS: Invalid role was rejected with ValidationError.")
    # print(e)

try:
    print("\nTesting valid role...")
    UserCreate(
        username="testuser",
        email="test@example.com",
        role="poster",
        password="password"
    )
    print("SUCCESS: Valid role was accepted.")
except ValidationError as e:
    print("FAILED: Valid role was rejected!")
    print(e)
