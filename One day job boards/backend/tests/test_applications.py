from fastapi import status
from fastapi.testclient import TestClient
from typing import Dict, Any

def test_create_application(client: TestClient, authenticated_doer: Dict[str, Any], authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test doer creating an application"""
    # Poster creates a job
    poster_headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    job_response = client.post("/jobs/", json=sample_job_data, headers=poster_headers)
    job_id = job_response.json()["id"]
    
    # Doer applies
    doer_headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    application_data = {"job_id": job_id}
    response = client.post("/applications/", json=application_data, headers=doer_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["job_id"] == job_id
    assert data["status"] == "pending"

def test_create_duplicate_application(client: TestClient, authenticated_doer: Dict[str, Any], authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test that duplicate applications are prevented"""
    # Poster creates a job
    poster_headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    job_response = client.post("/jobs/", json=sample_job_data, headers=poster_headers)
    job_id = job_response.json()["id"]
    
    # Doer applies first time
    doer_headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    application_data = {"job_id": job_id}
    client.post("/applications/", json=application_data, headers=doer_headers)
    
    # Try applying again
    response = client.post("/applications/", json=application_data, headers=doer_headers)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already applied" in response.json()["detail"].lower()

def test_get_my_applications(client: TestClient, authenticated_doer: Dict[str, Any], authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test doer getting their applications"""
    # Poster creates a job
    poster_headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    job_response = client.post("/jobs/", json=sample_job_data, headers=poster_headers)
    job_id = job_response.json()["id"]
    
    # Doer applies
    doer_headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    application_data = {"job_id": job_id}
    client.post("/applications/", json=application_data, headers=doer_headers)
    
    # Get my applications
    response = client.get("/applications/my", headers=doer_headers)
    assert response.status_code == status.HTTP_200_OK
    data: list[Any] = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["job_id"] == job_id

def test_get_applications_for_job(client: TestClient, authenticated_doer: Dict[str, Any], authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test poster getting applications for their job"""
    # Poster creates a job
    poster_headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    job_response = client.post("/jobs/", json=sample_job_data, headers=poster_headers)
    job_id = job_response.json()["id"]
    
    # Doer applies
    doer_headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    application_data = {"job_id": job_id}
    client.post("/applications/", json=application_data, headers=doer_headers)
    
    # Poster gets applications
    response = client.get(f"/applications/job/{job_id}", headers=poster_headers)
    assert response.status_code == status.HTTP_200_OK
    data: list[Any] = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_update_application_status(client: TestClient, authenticated_doer: Dict[str, Any], authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test poster updating application status"""
    # Poster creates a job
    poster_headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    job_response = client.post("/jobs/", json=sample_job_data, headers=poster_headers)
    job_id = job_response.json()["id"]
    
    # Doer applies
    doer_headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    application_data = {"job_id": job_id}
    app_response = client.post("/applications/", json=application_data, headers=doer_headers)
    app_id = app_response.json()["id"]
    
    # Poster updates status
    update_data = {"status": "accepted"}
    response = client.put(f"/applications/{app_id}/status", json=update_data, headers=poster_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "accepted"

def test_get_doer_earnings(client: TestClient, authenticated_doer: Dict[str, Any], authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    poster_headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    job_response = client.post("/jobs/", json=sample_job_data, headers=poster_headers)
    job_id = job_response.json()["id"]
    
    # Doer applies
    doer_headers = {"Authorization": f"Bearer {authenticated_doer['token']}"}
    application_data = {"job_id": job_id}
    app_response = client.post("/applications/", json=application_data, headers=doer_headers)
    app_id = app_response.json()["id"]
    
    # Poster accepts and marks as completed
    client.put(f"/applications/{app_id}/status", json={"status": "completed"}, headers=poster_headers)
    
    # Get earnings
    response = client.get("/applications/earnings/my", headers=doer_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_credits" in data
    assert "total_cash" in data
    assert "total_completed_jobs" in data
    assert data["total_completed_jobs"] >= 1
