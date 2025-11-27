import pytest
from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def test_register_new_user():
    """Test user registration endpoint"""
    # Test successful registration
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 200
    assert "user_id" in response.json()
    assert "message" in response.json()
    
    # Test duplicate email registration
    response = client.post("/auth/register", json=test_user)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered."

def test_login():
    """Test user login endpoint"""
    # First register a test user
    test_user = {
        "username": "logintest",
        "email": "login@test.com",
        "password": "testpass123"
    }
    client.post("/auth/register", json=test_user)
    
    # Test successful login
    form_data = {
        "username": "login@test.com",  # FastAPI OAuth2 uses username field for email
        "password": "testpass123"
    }
    response = client.post("/auth/login", data=form_data)
    assert response.status_code == 200
    json_response = response.json()
    assert "access_token" in json_response
    assert "token_type" in json_response
    assert json_response["token_type"] == "bearer"
    
    # Test incorrect password
    wrong_password = {
        "username": "login@test.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", data=wrong_password)
    assert response.status_code == 401
    
    # Test non-existent user
    non_existent = {
        "username": "nonexistent@test.com",
        "password": "testpass123"
    }
    response = client.post("/auth/login", data=non_existent)
    assert response.status_code == 401

def test_invalid_registration_data():
    """Test registration with invalid data"""
    # Test missing fields
    invalid_user = {
        "username": "testuser",
        "email": "test@example.com"
        # missing password
    }
    response = client.post("/auth/register", json=invalid_user)
    assert response.status_code == 422  # Validation error
    
    # Test invalid email format
    invalid_email = {
        "username": "testuser",
        "email": "invalid-email",
        "password": "testpass123"
    }
    response = client.post("/auth/register", json=invalid_email)
    assert response.status_code == 422  # Validation error
