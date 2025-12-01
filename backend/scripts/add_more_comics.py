"""
Add more diverse sample comics to the database
"""
import asyncio
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME
from datetime import datetime, timezone

# Additional diverse comics
MORE_COMICS = [
    {
        "title": "Pixel Hearts",
        "description": "Two gamers fall in love in a virtual reality MMORPG, but meeting in real life brings unexpected challenges.",
        "tags": ["romance", "comedy", "gaming"],
        "colors": ["#e63946", "#f1faee", "#a8dadc"],
        "pages": 8
    },
    {
        "title": "The Food Critic's Curse",
        "description": "A harsh food critic is cursed to taste only bland food until they learn to appreciate every dish.",
        "tags": ["comedy", "supernatural", "slice-of-life"],
        "colors": ["#ffba08", "#faa307", "#f48c06"],
        "pages": 7
    },
    {
        "title": "Echoes of War",
        "description": "A veteran warrior seeks redemption by protecting a village from the same forces they once served.",
        "tags": ["action", "drama", "historical"],
        "colors": ["#780000", "#c1121f", "#fdf0d5"],
        "pages": 12
    },
    {
        "title": "Mind Palace",
        "description": "A detective with a photographic memory solves impossible cases by exploring their mental constructs.",
        "tags": ["mystery", "psychological", "thriller"],
        "colors": ["#2b2d42", "#8d99ae", "#edf2f4"],
        "pages": 11
    },
    {
        "title": "Dragon Rider Academy",
        "description": "Young students learn to bond with dragons and protect their kingdom from dark magic.",
        "tags": ["fantasy", "action", "adventure"],
        "colors": ["#582f0e", "#7f4f24", "#936639"],
        "pages": 14
    }
]

def create_comic_page(width, height, colors, page_num, total_pages, title):
    """Create a single comic page with panels"""
    img = Image.new('RGB', (width, height), color=colors[0])
    draw = ImageDraw.Draw(img)
    
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
            # Main text
            draw.text((text_x, start_y + i * line_height), line, fill='white', font=title_font)
        
        # Author name at bottom
        author_text = "by Panel-Verse Artist"
        bbox = draw.textbbox((0, 0), author_text, font=text_font)
        author_width = bbox[2] - bbox[0]
        draw.text((width - author_width - 60, height - 50), author_text, fill=(200, 200, 200), font=text_font)
        
    else:  # Interior page - varied panel layouts
        panel_margin = 15
        
        # Random panel layout
        layout_type = random.choice(['horizontal', 'vertical', 'grid', 'mixed'])
        
        if layout_type == 'horizontal':
            num_panels = random.randint(2, 3)
            panel_height = (height - (num_panels + 1) * panel_margin) // num_panels
            
            for i in range(num_panels):
                y = panel_margin + i * (panel_height + panel_margin)
                color = colors[i % len(colors)]
                draw.rectangle([panel_margin, y, width - panel_margin, y + panel_height],
                             fill=color, outline='white', width=4)
                
                # Add dialogue boxes
                for _ in range(random.randint(1, 2)):
                    box_x = random.randint(panel_margin + 30, width - panel_margin - 150)
                    box_y = random.randint(y + 20, y + panel_height - 70)
                    draw.ellipse([box_x, box_y, box_x + 120, box_y + 50],
                               fill='white', outline='black', width=2)
        
        elif layout_type == 'grid':
            rows, cols = 2, 2
            panel_width = (width - (cols + 1) * panel_margin) // cols
            panel_height = (height - (rows + 1) * panel_margin) // rows
            
            for row in range(rows):
                for col in range(cols):
                    x = panel_margin + col * (panel_width + panel_margin)
                    y = panel_margin + row * (panel_height + panel_margin)
                    color_idx = (row * cols + col) % len(colors)
                    draw.rectangle([x, y, x + panel_width, y + panel_height],
                                 fill=colors[color_idx], outline='white', width=4)
        
        else:  # mixed
            # Large top panel
            large_height = (height - 3 * panel_margin) * 2 // 3
            draw.rectangle([panel_margin, panel_margin, 
                          width - panel_margin, panel_margin + large_height],
                         fill=colors[0], outline='white', width=4)
            
            # Two smaller bottom panels
            small_width = (width - 3 * panel_margin) // 2
            small_height = (height - 3 * panel_margin) // 3
            y = panel_margin * 2 + large_height
            
            draw.rectangle([panel_margin, y, panel_margin + small_width, y + small_height],
                         fill=colors[1 % len(colors)], outline='white', width=4)
            draw.rectangle([panel_margin * 2 + small_width, y, 
                          width - panel_margin, y + small_height],
                         fill=colors[2 % len(colors)], outline='white', width=4)
        
        # Page number in corner
        page_text = f"{page_num}/{total_pages}"
        bbox = draw.textbbox((0, 0), page_text, font=small_font)
        text_width = bbox[2] - bbox[0]
        draw.rectangle([width - text_width - 30, height - 40,
                       width - 10, height - 10],
                      fill='black', outline='white', width=2)
        draw.text((width - text_width - 20, height - 35), page_text, 
                 fill='white', font=small_font)
    
    return img

async def add_more_comics():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Get sample artist
    sample_user = await db.users.find_one({"email": "artist@panelverse.com"})
    if not sample_user:
        print("❌ Sample artist user not found. Run generate_sample_comics.py first.")
        client.close()
        return
    
    upload_dir = Path(parent_dir) / "media" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n🎨 Adding {len(MORE_COMICS)} more diverse comics...\n")
    
    for idx, comic_data in enumerate(MORE_COMICS):
        print(f"[{idx + 1}/{len(MORE_COMICS)}] Creating: {comic_data['title']}")
        
        # Check if exists
        existing = await db.comics.find_one({"title": comic_data['title']})
        if existing:
            print(f"  ⏭️  Already exists\n")
            continue
        
        files = []
        
        # Generate pages
        for page_num in range(comic_data['pages'] + 1):
            filename = f"sample_extra_{idx}_{page_num}.jpg"
            filepath = upload_dir / filename
            
            img = create_comic_page(
                800, 1200,
                comic_data['colors'],
                page_num,
                comic_data['pages'],
                comic_data['title']
            )
            
            img.save(filepath, 'JPEG', quality=85)
            files.append({
                "filename": filename,
                "original_filename": f"{comic_data['title'].replace(' ', '_')}_p{page_num}.jpg",
                "url": f"/media/uploads/{filename}"
            })
        
        # Insert to database
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
        print(f"  ✅ Created {len(files)} pages\n")
    
    # Show summary
    total = await db.comics.count_documents({})
    print(f"🎉 Done! Database now has {total} total comics")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_more_comics())
