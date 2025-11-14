from motor.motor_asyncio import AsyncIOMotorClient

client = None
db = None

def db_init():
    global client, db
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["panelverse"]
