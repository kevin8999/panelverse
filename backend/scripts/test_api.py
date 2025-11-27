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
    data = {
        "title": "Superhero Adventures", 
        "description": "A thrilling comic about superheroes.",
        "tags": "superhero, action, adventure"
    }

    r = requests.post(f"{API}/upload", headers=headers, files=files, data=data, timeout=10)
    print("Upload:", r.status_code)
    try:
        result = r.json()
        print(f"Title: {result.get('message')}")
        print(f"Tags: {result.get('tags')}")
    except Exception:
        print(r.text)
    return r

def list_comics(token):
    headers = {"Authorization": f"Bearer {token}"}

    # Test 1: List all comics
    r = requests.get(f"{API}/comics", headers=headers)
    print("\n=== List All Comics ===")
    print("Status:", r.status_code)
    try:
        data = r.json()
        print(f"Found {data['total']} comics")
        print(f"Has more: {data['has_more']}")
    except Exception:
        print(r.text)
    
    # Test 2: Search by title
    r = requests.get(f"{API}/comics?search=First", headers=headers)
    print("\n=== Search 'First' ===")
    print("Status:", r.status_code)
    try:
        print(f"Found {r.json()['total']} results")
    except Exception:
        print(r.text)
    
    # Test 3: Pagination
    r = requests.get(f"{API}/comics?limit=2&skip=0", headers=headers)
    print("\n=== Pagination (limit=2) ===")
    print("Status:", r.status_code)
    try:
        data = r.json()
        print(f"Showing {len(data['comics'])} of {data['total']} comics")
    except Exception:
        print(r.text)
    
    # Test 4: Sort by title
    r = requests.get(f"{API}/comics?sort_by=title&order=asc", headers=headers)
    print("\n=== Sort by Title (ascending) ===")
    print("Status:", r.status_code)
    try:
        comics = r.json()['comics']
        print("Titles:", [c['title'] for c in comics])
    except Exception:
        print(r.text)

    # Test 5: Filter by tags (NEW)
    r = requests.get(f"{API}/comics?tags=action,superhero", headers=headers)
    print("\n=== Filter by Tags (action, superhero) ===")
    print("Status:", r.status_code)
    try:
        data = r.json()
        print(f"Found {data['total']} comics with those tags")
        for comic in data['comics']:
            print(f"  - {comic['title']}: {comic.get('tags', [])}")
    except Exception:
        print(r.text)
    
    # Test 6: Get all unique tags (NEW endpoint - see below)
    r = requests.get(f"{API}/comics/tags", headers=headers)
    print("\n=== All Available Tags ===")
    print("Status:", r.status_code)
    try:
        print(f"Tags: {r.json()['tags']}")
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