"""
Generate sample comics with realistic-looking covers and pages.
Creates diverse comic content to populate the database for demo purposes.
"""
import asyncio
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME

# Sample comic data
SAMPLE_COMICS = [
    {
        "title": "The Midnight Chronicles",
        "description": "A mysterious hero emerges in a city shrouded in darkness. Follow their journey as they uncover ancient secrets.",
        "tags": ["action", "mystery", "supernatural"],
        "colors": ["#1a1a2e", "#16213e", "#0f3460"],
        "pages": 12
    },
    {
        "title": "Café Dreams",
        "description": "Heartwarming tales from a cozy neighborhood café where dreams are brewed alongside coffee.",
        "tags": ["slice-of-life", "romance", "comedy"],
        "colors": ["#f4a261", "#e76f51", "#264653"],
        "pages": 8
    },
    {
        "title": "Space Wanderers",
        "description": "An intergalactic crew explores unknown galaxies, facing cosmic threats and making unlikely friendships.",
        "tags": ["sci-fi", "adventure", "action"],
        "colors": ["#2b2d42", "#8d99ae", "#edf2f4"],
        "pages": 15
    },
    {
        "title": "The Last Garden",
        "description": "In a world of concrete and steel, one person discovers the last remaining garden and fights to protect it.",
        "tags": ["drama", "environmental", "fantasy"],
        "colors": ["#2d6a4f", "#40916c", "#74c69d"],
        "pages": 10
    },
    {
        "title": "Digital Ghosts",
        "description": "When AI becomes sentient, a hacker must navigate the thin line between humanity and technology.",
        "tags": ["cyberpunk", "thriller", "sci-fi"],
        "colors": ["#ff006e", "#8338ec", "#3a86ff"],
        "pages": 14
    },
    {
        "title": "Bakery of Wonders",
        "description": "Magical pastries with unexpected powers cause hilarious chaos in a quiet town.",
        "tags": ["comedy", "fantasy", "slice-of-life"],
        "colors": ["#ffd60a", "#ffc300", "#ffb703"],
        "pages": 9
    },
    {
        "title": "Shadow Academy",
        "description": "Students with supernatural abilities train to become heroes, but dark forces threaten their school.",
        "tags": ["action", "supernatural", "school"],
        "colors": ["#6a040f", "#9d0208", "#d00000"],
        "pages": 16
    },
    {
        "title": "Ocean's Echo",
        "description": "A marine biologist discovers an underwater civilization and must bridge two worlds.",
        "tags": ["adventure", "fantasy", "drama"],
        "colors": ["#0077b6", "#0096c7", "#00b4d8"],
        "pages": 11
    },
    {
        "title": "The Timekeeper's Apprentice",
        "description": "A young watchmaker learns they can manipulate time and must stop a temporal catastrophe.",
        "tags": ["fantasy", "adventure", "steampunk"],
        "colors": ["#8b4513", "#a0522d", "#cd853f"],
        "pages": 13
    },
    {
        "title": "Neon Nights",
        "description": "In a city that never sleeps, a detective solves crimes that blend technology and magic.",
        "tags": ["mystery", "noir", "urban-fantasy"],
        "colors": ["#f72585", "#7209b7", "#3a0ca3"],
        "pages": 10
    }
]

def create_comic_page(width, height, colors, page_num, total_pages, title):
    """Create a single comic page with panels"""
    img = Image.new('RGB', (width, height), color=colors[0])
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default if not available
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
        text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    if page_num == 0:  # Cover page
        # Create gradient background
        for i in range(height):
            progress = i / height
            # Interpolate between first and last color
            r1, g1, b1 = tuple(int(colors[0].lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
            r2, g2, b2 = tuple(int(colors[-1].lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
            r = int(r1 + (r2 - r1) * progress)
            g = int(g1 + (g2 - g1) * progress)
            b = int(b1 + (b2 - b1) * progress)
            draw.rectangle([0, i, width, i+1], fill=(r, g, b))
        
        # Add decorative elements
        for _ in range(30):
            x = random.randint(0, width)
            y = random.randint(0, height)
            size = random.randint(2, 8)
            brightness = random.randint(150, 255)
            draw.ellipse([x, y, x+size, y+size], fill=(brightness, brightness, brightness))
        
        # Title box with border
        title_box_height = 180
        title_box_y = (height - title_box_height) // 2
        border_width = 6
        
        # Outer border (colored)
        r, g, b = tuple(int(colors[1].lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
        draw.rectangle([40, title_box_y - 10, width-40, title_box_y + title_box_height + 10], 
                      fill=(r, g, b), outline='white', width=border_width)
        
        # Inner box (dark)
        draw.rectangle([50, title_box_y, width-50, title_box_y + title_box_height], 
                      fill=(15, 15, 25))
        
        # Title text with better line wrapping
        words = title.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=title_font)
            if bbox[2] - bbox[0] > width - 120:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
            else:
                current_line.append(word)
        if current_line:
            lines.append(' '.join(current_line))
        
        # Draw title lines centered
        line_height = 55
        total_text_height = len(lines) * line_height
        start_y = title_box_y + (title_box_height - total_text_height) // 2 + 10
        
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=title_font)
            text_width = bbox[2] - bbox[0]
            text_x = (width - text_width) // 2
            # Text shadow
            draw.text((text_x + 3, start_y + i * line_height + 3), line, fill=(0, 0, 0), font=title_font)
            # Main text with gradient effect
            draw.text((text_x, start_y + i * line_height), line, fill='white', font=title_font)
        
        # Author name at bottom
        author_text = "by Panel-Verse Artist"
        bbox = draw.textbbox((0, 0), author_text, font=text_font)
        author_width = bbox[2] - bbox[0]
        draw.text((width - author_width - 60, height - 50), author_text, fill=(200, 200, 200), font=text_font)
        
    else:  # Interior page
        # Create 2-4 panels
        num_panels = random.randint(2, 4)
        panel_margin = 20
        
        if num_panels == 2:
            # Two horizontal panels
            panel_height = (height - 3 * panel_margin) // 2
            for i in range(2):
                y = panel_margin + i * (panel_height + panel_margin)
                draw.rectangle([panel_margin, y, width - panel_margin, y + panel_height],
                             fill=colors[i % len(colors)], outline='white', width=3)
                # Add some "content" rectangles
                for _ in range(random.randint(1, 3)):
                    x = random.randint(panel_margin + 20, width - panel_margin - 100)
                    y_pos = random.randint(y + 20, y + panel_height - 80)
                    draw.rectangle([x, y_pos, x + 80, y_pos + 60], 
                                 fill=(255, 255, 255, 50), outline='white')
        
        elif num_panels == 3:
            # One large panel on top, two smaller below
            large_panel_height = (height - 3 * panel_margin) * 2 // 3
            small_panel_height = (height - 3 * panel_margin) // 3
            small_panel_width = (width - 3 * panel_margin) // 2
            
            # Top panel
            draw.rectangle([panel_margin, panel_margin, 
                          width - panel_margin, panel_margin + large_panel_height],
                         fill=colors[0], outline='white', width=3)
            
            # Bottom panels
            y = panel_margin * 2 + large_panel_height
            draw.rectangle([panel_margin, y, 
                          panel_margin + small_panel_width, y + small_panel_height],
                         fill=colors[1 % len(colors)], outline='white', width=3)
            draw.rectangle([panel_margin * 2 + small_panel_width, y,
                          width - panel_margin, y + small_panel_height],
                         fill=colors[2 % len(colors)], outline='white', width=3)
        
        else:  # 4 panels - grid layout
            panel_height = (height - 3 * panel_margin) // 2
            panel_width = (width - 3 * panel_margin) // 2
            
            for row in range(2):
                for col in range(2):
                    x = panel_margin + col * (panel_width + panel_margin)
                    y = panel_margin + row * (panel_height + panel_margin)
                    color_idx = (row * 2 + col) % len(colors)
                    draw.rectangle([x, y, x + panel_width, y + panel_height],
                                 fill=colors[color_idx], outline='white', width=3)
        
        # Page number
        page_text = f"Page {page_num}/{total_pages}"
        draw.text((width - 120, height - 30), page_text, fill='white', font=small_font)
    
    return img

async def upload_sample_comics():
    """Generate and upload sample comics to the database"""
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Get or create a sample user (artist)
    sample_user = await db.users.find_one({"email": "artist@panelverse.com"})
    
    if not sample_user:
        print("Creating sample artist user...")
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        counter = await db.counters.find_one_and_update(
            {"_id": "user_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )
        
        sample_user = {
            "id": counter["seq"],
            "name": "Sample Artist",
            "email": "artist@panelverse.com",
            "password": pwd_context.hash("Artist123!"),
            "role": "artist"
        }
        await db.users.insert_one(sample_user)
        print("✅ Created sample artist user")
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(parent_dir) / "media" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🎨 Generating {len(SAMPLE_COMICS)} sample comics...")
    
    for idx, comic_data in enumerate(SAMPLE_COMICS):
        print(f"\n[{idx + 1}/{len(SAMPLE_COMICS)}] Creating: {comic_data['title']}")
        
        # Check if comic already exists
        existing = await db.comics.find_one({"title": comic_data['title']})
        if existing:
            print(f"  ⏭️  Already exists, skipping...")
            continue
        
        files = []
        
        # Generate pages
        for page_num in range(comic_data['pages'] + 1):  # +1 for cover
            filename = f"sample_{idx}_{page_num}.jpg"
            filepath = upload_dir / filename
            
            # Create the image
            img = create_comic_page(
                800, 1200,  # width, height
                comic_data['colors'],
                page_num,
                comic_data['pages'],
                comic_data['title']
            )
            
            img.save(filepath, 'JPEG', quality=85)
            
            files.append({
                "filename": filename,
                "original_filename": f"{comic_data['title'].replace(' ', '_')}_page_{page_num}.jpg",
                "url": f"/media/uploads/{filename}"
            })
            
            if page_num == 0:
                print(f"  📖 Created cover")
            else:
                print(f"  📄 Created page {page_num}/{comic_data['pages']}", end='\r')
        
        print()  # New line after pages
        
        # Insert into database
        from datetime import datetime, timezone
        
        comic_document = {
            "title": comic_data['title'],
            "description": comic_data['description'],
            "tags": comic_data['tags'],
            "author_id": sample_user["id"],
            "files": files,
            "file_count": len(files),
            "cover_url": files[0]["url"],
            "uploaded_by": sample_user["email"],
            "upload_date": datetime.now(timezone.utc),
            "published": True,
            "likes": [],
            "saves": []
        }
        
        await db.comics.insert_one(comic_document)
        print(f"  ✅ Uploaded to database ({len(files)} pages)")
    
    client.close()
    print(f"\n🎉 Done! Generated {len(SAMPLE_COMICS)} sample comics")
    print(f"\n📧 Sample artist credentials:")
    print(f"   Email: artist@panelverse.com")
    print(f"   Password: Artist123!")

if __name__ == "__main__":
    asyncio.run(upload_sample_comics())
