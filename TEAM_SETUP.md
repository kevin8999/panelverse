# Team Setup Guide

## 🚀 First Time Setup

When you clone this repository for the first time, follow these steps:

### 1. Start Docker Containers

```bash
docker compose up -d
```

This starts:
- **Backend** (FastAPI) on port 8000
- **Frontend** (Vite + React) on port 5173  
- **MongoDB** on port 27017

### 2. Populate Sample Data

**Option A: Use the setup script (Recommended)**
```bash
chmod +x setup-sample-data.sh
./setup-sample-data.sh
```

**Option B: Manual setup**
```bash
docker compose exec backend python scripts/generate_sample_comics.py
docker compose exec backend python scripts/add_more_comics.py
```

This creates:
- ✅ 15 sample comics with realistic covers and pages
- ✅ A sample artist account you can use for testing
- ✅ Proper engagement data (likes/saves arrays)

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 👤 Test Accounts

### Sample Artist Account
- **Email:** artist@panelverse.com
- **Password:** Artist123!
- Can upload comics, view analytics

### Create Your Own Admin
```bash
docker compose exec backend python scripts/create_admin.py
```

---

## ⚠️ Important Notes

### Database Data is NOT in Git
- Comics and users are stored in a **Docker volume** (`mongo_data`)
- This volume is **local to your machine**
- Git does **not track** this data
- Each team member needs to run the setup scripts

### Media Files are NOT in Git
- Uploaded comic images are stored in `media/` and `uploads/`
- These directories are in `.gitignore`
- Sample comics will be generated locally when you run setup scripts

### Why This Design?
- ✅ Keeps the Git repo small
- ✅ No binary files (images) in version control
- ✅ Each developer has clean, reproducible test data
- ✅ No merge conflicts on database files

---

## 🔄 Daily Development

### Starting the app
```bash
docker compose up -d
```

### Viewing logs
```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend logs
```

### Stopping the app
```bash
docker compose down
```

### Resetting the database
```bash
# Delete all comics and users
docker compose exec backend python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def reset():
    client = AsyncIOMotorClient('mongodb://mongo:27017/')
    db = client['comics-db']
    await db.comics.delete_many({})
    await db.users.delete_many({})
    print('✅ Database reset')
    client.close()

asyncio.run(reset())
"

# Then regenerate sample data
./setup-sample-data.sh
```

---

## 🐛 Troubleshooting

### "No comics found" on browse page
Run the sample data setup scripts:
```bash
./setup-sample-data.sh
```

### Port conflicts
If ports 5173, 8000, or 27017 are already in use:
```bash
# Stop other services using those ports, or
# Modify docker-compose.yaml to use different ports
```

### Docker volume issues
```bash
# Remove all Docker volumes and start fresh
docker compose down -v
docker compose up -d
./setup-sample-data.sh
```

### Backend not connecting to MongoDB
Check the backend logs:
```bash
docker compose logs backend
```

Ensure `MONGO_URI` and `DB_NAME` are set correctly in docker-compose.yaml.

---

## 📚 Additional Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute code
- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** - Admin user creation and security
- **[README.md](README.md)** - Main project documentation
