# Panelverse

Panelverse is a website where artists can share comics with others online for free with no ads!

## Quick Start for Team Members

**First time cloning the repo?** See [TEAM_SETUP.md](TEAM_SETUP.md) for detailed setup instructions.

**TL;DR:**
```bash
docker compose up -d
./setup-sample-data.sh
```

Then visit http://localhost:5173

---

## Running the App

To run the web app, ensure that Docker is installed on your system.

Then, follow the steps below.

1. Change into the project directory.

    ```shell
    cd panelverse/
    ```

2. Launch Docker by opening the application on your device.

3. Create the Docker image.

    ```shell
    docker compose build
    ```

4. Launch the Docker image.

    ```shell
    docker compose up -d
    ```

5. **Populate the database with sample comics** (first time only).

    **Mac/Linux:**
    ```shell
    chmod +x setup-sample-data.sh
    ./setup-sample-data.sh
    ```
    
    **Windows:**
    ```shell
    setup-sample-data.bat
    ```
    
    **Or manually:**
    ```shell
    docker compose exec backend python scripts/generate_sample_comics.py
    docker compose exec backend python scripts/add_more_comics.py
    ```
    
    This generates:
    - 15 diverse sample comics with realistic covers
    - 185+ comic pages with varied panel layouts
    - Sample artist account for testing

6. Access the application at `http://localhost:5173`

### Sample Accounts

After running the setup script, you can login with:

**Artist Account:**
- Email: `artist@panelverse.com`
- Password: `Artist123!`

**Admin Account:**
Create using: `docker compose exec backend python scripts/create_admin.py`

---

## Features

- 🎨 **Upload Comics** - Artists can upload multi-page comics with covers
- 👍 **Engagement System** - Like and save your favorite comics
- 🔍 **Browse & Search** - Find comics by title, description, or tags
- 👤 **Role-Based Access** - Reader, Artist, and Admin roles with different permissions
- 🔒 **Secure Authentication** - Password requirements and JWT-based auth
- 📊 **User Profiles** - Different layouts for readers, artists, and admins

---

## Contributing

To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Admin Setup

For creating admin users securely, see [ADMIN_SETUP.md](ADMIN_SETUP.md).

**Quick start:**
```bash
docker compose exec backend python scripts/create_admin.py
```

Follow the interactive prompts to create an admin account with secure password validation.

---

## Optional: Performance Optimization

For better search and query performance, you can set up MongoDB indexes:

```bash
docker compose exec backend python scripts/mongodb_index_setup.py
```

This creates indexes for:
- Text search on comic titles and descriptions
- Faster queries by author and publication date
- Tag-based filtering

---

## Project Structure

```
panel-verse/
├── backend/              # FastAPI backend
│   ├── routers/         # API endpoints (auth, comics, user, admin)
│   ├── models/          # Data models
│   ├── scripts/         # Utility scripts (sample data, admin creation)
│   └── media/           # Uploaded comic images (gitignored)
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Page components (Home, Browse, Profile, etc.)
├── docker-compose.yaml  # Docker orchestration
├── setup-sample-data.sh # Quick setup script (Mac/Linux)
├── setup-sample-data.bat # Quick setup script (Windows)
└── TEAM_SETUP.md        # Detailed team onboarding guide
```

