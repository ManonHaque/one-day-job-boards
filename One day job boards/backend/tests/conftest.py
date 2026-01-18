import pytest
from typing import Any, Dict, Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.main import app
from app.database import Base, get_db
import os

# Test database URL
SQLALCHEMY_DATABASE_URL: str = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://testuser:testpass@localhost:5432/testdb"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database() -> Generator[None, None, None]:
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Get database session for tests"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Get test client with database session override"""
    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_data() -> Dict[str, Any]:
    """Sample user data for tests"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "role": "doer",
        "department": "Engineering"
    }

@pytest.fixture
def test_poster_data() -> Dict[str, Any]:
    """Sample poster data for tests"""
    return {
        "username": "testposter",
        "email": "poster@example.com",
        "password": "posterpass123",
        "role": "poster",
        "department": "Sales"
    }

@pytest.fixture
def test_admin_data() -> Dict[str, Any]:
    """Sample admin data for tests"""
    return {
        "username": "testadmin",
        "email": "admin@example.com",
        "password": "adminpass123",
        "role": "admin",
        "department": None
    }

@pytest.fixture
def authenticated_doer(client: TestClient, test_user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create and authenticate a doer user"""
    # Signup
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
    token: str = response.json()["access_token"]
    return {"token": token, "user": test_user_data}

@pytest.fixture
def authenticated_poster(client: TestClient, test_poster_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create and authenticate a poster user"""
    # Signup
    client.post("/auth/signup", json=test_poster_data)
    
    # Login
    response = client.post(
        "/auth/login",
        data={
            "username": test_poster_data["username"],
            "password": test_poster_data["password"]
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token: str = response.json()["access_token"]
    return {"token": token, "user": test_poster_data}

@pytest.fixture
def authenticated_admin(client: TestClient, test_admin_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create and authenticate an admin user"""
    # Signup
    client.post("/auth/signup", json=test_admin_data)
    
    # Login
    response = client.post(
        "/auth/login",
        data={
            "username": test_admin_data["username"],
            "password": test_admin_data["password"]
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token: str = response.json()["access_token"]
    return {"token": token, "user": test_admin_data}

@pytest.fixture
def sample_job_data() -> Dict[str, Any]:
    """Sample job data for tests"""
    return {
        "title": "Test Job",
        "description": "This is a test job description",
        "reward": 100.0,
        "reward_type": "credits",
        "department": "Engineering",
        "estimated_time": "2 hours",
        "skills_required": ["Python", "FastAPI"],
        "status": "open",
        "is_featured": False,
        "image_url": "https://example.com/job.jpg"
    }
