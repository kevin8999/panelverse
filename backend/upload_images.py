import os
from typing import List
from fastapi import UploadFile
from config import UPLOAD_DIR


def save_files(files: List[UploadFile]) -> list[str]:
    """Save uploaded image files to configured UPLOAD_DIR and return file paths."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    saved_paths: list[str] = []

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        saved_paths.append(file_path)

    return saved_paths
