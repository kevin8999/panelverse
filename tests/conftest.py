import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv
from dotenv import load_dotenv
from main import app

# Load environment variables
load_dotenv()

@pytest.fixture(autouse=True)
async def setup_test_db():
    # Setup: create test database
    app.mongodb_client = AsyncIOMotorClient(getenv("MONGO_TEST_URL", "mongodb://localhost:27017"))
    app.mongodb = app.mongodb_client.test_comicsdb
    
    yield
    
    # Teardown: drop test database
    await app.mongodb_client.drop_database("test_comicsdb")
    app.mongodb_client.close()

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()
