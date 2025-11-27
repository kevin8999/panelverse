import requests
import os
import time

''' Test script for the PanelVerse API.'''

BASE_URL = "http://127.0.0.1:8000"
API = f"{BASE_URL}/api"

TEST_USER = {
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "StrongP@ssw0rd!"
}

def signup():
    time.sleep(0.2)  # ensure server is ready
    r = requests.post(f"{API}/signup", json=TEST_USER, timeout=5)
    print("Signup:", r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
    return r

def login():
    r = requests.post(
        f"{API}/login",
        json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
        timeout=5,
    )
    print("Login:", r.status_code)
    try:
        data = r.json()
        print(data)
    except Exception:
        print(r.text)
        return None
    return data.get("access_token")

def upload_comic(token):
    # Prepare demo files
    os.makedirs("tmp_test", exist_ok=True)
    img_path = "tmp_test/demo.png"
    with open(img_path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")  # minimal PNG header for testing

    headers = {"Authorization": f"Bearer {token}"}
    files = [("files", ("demo.png", open(img_path, "rb"), "image/png"))]
    data = {"title": "My First Upload", "description": "Test upload"}

    r = requests.post(f"{API}/upload", headers=headers, files=files, data=data, timeout=10)
    print("Upload:", r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
    return r

def list_comics(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{API}/comics", headers=headers, timeout=5)
    print("List Comics:", r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)

if __name__ == "__main__":
    # Start sequence
    signup()  # Will 400 if email already exists; that’s fine
    token = login()
    if not token:
        print("No token returned. Check login.")
        exit(1)
    upload_comic(token)
    list_comics(token)