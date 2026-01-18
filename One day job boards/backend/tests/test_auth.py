from fastapi import status
from fastapi.testclient import TestClient
from typing import Dict, Any

def test_signup_success(client: TestClient, test_user_data: Dict[str, Any]) -> None:
    """Test successful user signup"""
    response = client.post("/auth/signup", json=test_user_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == test_user_data["username"]
    assert data["email"] == test_user_data["email"]
    assert data["role"] == test_user_data["role"]
    assert "id" in data

def test_signup_duplicate_username(client: TestClient, test_user_data: Dict[str, Any]) -> None:
    """Test signup with duplicate username fails"""
    # First signup
    client.post("/auth/signup", json=test_user_data)
    
    # Try duplicate
    response = client.post("/auth/signup", json=test_user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"].lower()

def test_signup_invalid_email(client: TestClient, test_user_data: Dict[str, Any]) -> None:
    """Test signup with invalid email format"""
    test_user_data["email"] = "invalid-email"
    response = client.post("/auth/signup", json=test_user_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_login_success(client: TestClient, test_user_data: Dict[str, Any]) -> None:
    """Test successful login"""
    # Signup first
    client.post("/auth/signup", json=test_user_data)
    
    # Login
    response = client.post(
        "/auth/login",
        data={
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client: TestClient, test_user_data: Dict[str, Any]) -> None:
    """Test login with wrong password"""
    # Signup first
    client.post("/auth/signup", json=test_user_data)
    
    # Try login with wrong password
    response = client.post(
        "/auth/login",
        data={
            "username": test_user_data["username"],
            "password": "wrongpassword"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_nonexistent_user(client: TestClient) -> None:
    """Test login with non-existent user"""
    response = client.post(
        "/auth/login",
        data={
            "username": "nonexistent",
            "password": "password"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user(client: TestClient, authenticated_doer: Dict[str, Any]) -> None:
    """Test getting current user info"""
    headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    response = client.get("/auth/user", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == authenticated_doer["user"]["username"]
    assert data["role"] == authenticated_doer["user"]["role"]

def test_get_current_user_unauthorized(client: TestClient) -> None:
    """Test getting current user without token"""
    response = client.get("/auth/user")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
