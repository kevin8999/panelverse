@echo off
REM Setup script to populate the database with sample comics
REM Run this after starting Docker containers for the first time (Windows)

echo 🎨 Setting up sample data for Panel-Verse...
echo.

REM Check if containers are running
docker compose ps | findstr /C:"backend" | findstr /C:"running" >nul
if errorlevel 1 (
    echo ⚠️  Backend container is not running. Starting containers...
    docker compose up -d
    echo ⏳ Waiting for containers to start...
    timeout /t 5 /nobreak >nul
)

echo 📚 Generating 10 sample comics...
docker compose exec backend python scripts/generate_sample_comics.py

echo.
echo 📚 Adding 5 more diverse comics...
docker compose exec backend python scripts/add_more_comics.py

echo.
echo ✅ Sample data setup complete!
echo.
echo 🌐 You can now browse comics at: http://localhost:5173/browse
echo.
echo 👤 Sample artist account:
echo    Email: artist@panelverse.com
echo    Password: Artist123!
echo.
pause
