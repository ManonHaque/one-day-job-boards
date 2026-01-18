from fastapi import status
from fastapi.testclient import TestClient
from typing import Dict, Any

def test_chat_endpoint_basic(client: TestClient) -> None:
    """Test chat endpoint with basic message"""
    chat_data: Dict[str, Any] = {
        "messages": [
            {"role": "user", "content": "Hello, I need help"}
        ]
    }
    response = client.post("/chat", json=chat_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "reply" in data
    assert isinstance(data["reply"], str)
    assert len(data["reply"]) > 0

def test_chat_with_context(client: TestClient) -> None:
    """Test chat with conversation context"""
    chat_data: Dict[str, Any] = {
        "messages": [
            {"role": "user", "content": "How do I apply for a job?"},
            {"role": "assistant", "content": "You can browse jobs and click apply."},
            {"role": "user", "content": "Where can I track my applications?"}
        ]
    }
    response = client.post("/chat", json=chat_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0

def test_chat_fallback_apply(client: TestClient) -> None:
    """Test chat fallback for apply-related questions"""
    chat_data: Dict[str, Any] = {
        "messages": [
            {"role": "user", "content": "How to apply for jobs?"}
        ]
    }
    response = client.post("/chat", json=chat_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "apply" in data["reply"].lower() or "dashboard" in data["reply"].lower()

def test_chat_fallback_browse(client: TestClient) -> None:
    """Test chat fallback for browse jobs questions"""
    chat_data: Dict[str, Any] = {
        "messages": [
            {"role": "user", "content": "Where can I find jobs?"}
        ]
    }
    response = client.post("/chat", json=chat_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "browse" in data["reply"].lower() or "jobs" in data["reply"].lower()

def test_chat_invalid_messages(client: TestClient) -> None:
    """Test chat with invalid message format"""
    chat_data: Dict[str, Any] = {
        "messages": []
    }
    response = client.post("/chat", json=chat_data)
    # Should still respond with 200 and fallback
    assert response.status_code == status.HTTP_200_OK
