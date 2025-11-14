import os
from typing import List
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

def save_files(files: List[UploadFile]) -> list[str]:
    """Save uploaded image files to ./uploads and return file paths."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    saved_paths = []

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        saved_paths.append(file_path)

    return saved_paths
