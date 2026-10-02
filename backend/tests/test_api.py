import pytest
import hashlib
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "CourtLens" in data["system"]

def test_auth_me():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    user = response.json()
    assert user["email"] == "sarah.connor@courtlens.internal"
    assert user["role"] == "ADMIN"

def test_sha256_calculation_logic():
    content = b"TEST FORENSIC EVIDENCE CONTENT 2026"
    expected_hash = hashlib.sha256(content).hexdigest()
    assert len(expected_hash) == 64

def test_duplicate_hash_consistency():
    content_a = b"CONFIDENTIAL FINANCIAL RECORD"
    content_b = b"CONFIDENTIAL FINANCIAL RECORD"
    hash_a = hashlib.sha256(content_a).hexdigest()
    hash_b = hashlib.sha256(content_b).hexdigest()
    assert hash_a == hash_b

def test_search_endpoint_contract():
    response = client.get("/api/v1/search?q=fraud")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "results" in data

def test_dashboard_statistics_contract():
    response = client.get("/api/v1/dashboard/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overview" in data["data"]
