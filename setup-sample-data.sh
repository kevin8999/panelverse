#!/bin/bash
# Setup script to populate the database with sample comics
# Run this after starting Docker containers for the first time

echo "🎨 Setting up sample data for Panel-Verse..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if containers are running
if ! docker compose ps | grep -q "backend.*running"; then
    echo "⚠️  Backend container is not running. Starting containers..."
    docker compose up -d
    echo "⏳ Waiting for containers to start..."
    sleep 5
fi

echo "📚 Generating 10 sample comics..."
docker compose exec backend python scripts/generate_sample_comics.py

echo ""
echo "📚 Adding 5 more diverse comics..."
docker compose exec backend python scripts/add_more_comics.py

echo ""
echo "✅ Sample data setup complete!"
echo ""
echo "🌐 You can now browse comics at: http://localhost:5173/browse"
echo ""
echo "👤 Sample artist account:"
echo "   Email: artist@panelverse.com"
echo "   Password: Artist123!"
