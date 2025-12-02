"""Regenerate sample comics and their image files.

This script deletes existing sample comics (by title) and re-runs the
generation scripts so files are created on disk (useful when volume mounts
changed and files were lost).
"""
import asyncio
from pathlib import Path
import sys

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME


async def regen():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    # Titles to remove (from generate_sample_comics.SAMPLE_COMICS and add_more_comics.MORE_COMICS)
    titles_to_delete = [
        "The Midnight Chronicles",
        "Café Dreams",
        "Space Wanderers",
        "The Last Garden",
        "Digital Ghosts",
        "Bakery of Wonders",
        "Shadow Academy",
        "Ocean's Echo",
        "The Timekeeper's Apprentice",
        "Neon Nights",
        # extras
        "Pixel Hearts",
        "The Food Critic's Curse",
        "Echoes of War",
        "Mind Palace",
        "Dragon Rider Academy",
    ]

    res = await db.comics.delete_many({"title": {"$in": titles_to_delete}})
    print(f"Deleted {res.deleted_count} sample comic documents from DB")

    # Re-run generators
    print("Regenerating sample comics (this may take a minute)...")
    import scripts.generate_sample_comics as gen
    import scripts.add_more_comics as more

    await gen.upload_sample_comics()
    await more.add_more_comics()

    client.close()


if __name__ == '__main__':
    asyncio.run(regen())
