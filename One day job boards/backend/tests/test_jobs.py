from fastapi import status
from fastapi.testclient import TestClient
from typing import Dict, Any

def test_create_job(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test creating a job as poster"""
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    response = client.post("/jobs/", json=sample_job_data, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == sample_job_data["title"]
    assert data["description"] == sample_job_data["description"]
    assert "id" in data
    assert "slug" in data

def test_create_job_unauthorized(client: TestClient, sample_job_data: Dict[str, Any]) -> None:
    """Test creating job without authentication"""
    response = client.post("/jobs/", json=sample_job_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_jobs(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test getting list of jobs"""
    # Create a job first
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    client.post("/jobs/", json=sample_job_data, headers=headers)
    
    # Get jobs
    response = client.get("/jobs/")
    assert response.status_code == status.HTTP_200_OK
    data: list[Any] = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_jobs_with_filter(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test getting jobs with department filter"""
    # Create a job
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    client.post("/jobs/", json=sample_job_data, headers=headers)
    
    # Get jobs with filter
    response = client.get("/jobs/?department=Engineering")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(job["department"] == "Engineering" for job in data)

def test_get_job_by_id(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test getting a specific job by ID"""
    # Create a job
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    create_response = client.post("/jobs/", json=sample_job_data, headers=headers)
    job_id = create_response.json()["id"]
    
    # Get job by ID
    response = client.get(f"/jobs/{job_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == job_id
    assert data["title"] == sample_job_data["title"]

def test_update_job(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test updating a job"""
    # Create a job
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    create_response = client.post("/jobs/", json=sample_job_data, headers=headers)
    job_id = create_response.json()["id"]
    
    # Update job
    updated_data = sample_job_data.copy()
    updated_data["title"] = "Updated Job Title"
    response = client.put(f"/jobs/{job_id}", json=updated_data, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Job Title"

def test_delete_job(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test deleting a job"""
    # Create a job
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    create_response = client.post("/jobs/", json=sample_job_data, headers=headers)
    job_id = create_response.json()["id"]
    
    # Delete job
    response = client.delete(f"/jobs/{job_id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    
    # Verify job is deleted
    get_response = client.get(f"/jobs/{job_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_get_my_jobs(client: TestClient, authenticated_poster: Dict[str, Any], sample_job_data: Dict[str, Any]) -> None:
    """Test getting jobs posted by current user"""
    # Create jobs
    headers = {"Authorization": f"Bearer {authenticated_poster['token']}"}
    client.post("/jobs/", json=sample_job_data, headers=headers)
    
    # Get my jobs
    response = client.get("/jobs/my-jobs", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data: list[Any] = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

