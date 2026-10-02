import os
import re
from pathlib import Path
from backend.app.storage.base import StorageProvider
from backend.app.core.config import settings

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_filename(self, filename: str) -> str:
        # Strip path traversal and dangerous characters
        safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', os.path.basename(filename))
        return safe_name

    async def save_file(self, filename: str, content: bytes) -> str:
        safe_name = self._sanitize_filename(filename)
        target_path = (self.base_dir / safe_name).resolve()
        
        # Verify path traversal escape attempt
        if not str(target_path).startswith(str(self.base_dir)):
            raise ValueError("Path traversal attempt detected in filename.")

        with open(target_path, "wb") as f:
            f.write(content)

        return str(target_path.relative_to(self.base_dir.parent))

    async def get_file(self, storage_path: str) -> bytes:
        resolved_path = (self.base_dir.parent / storage_path).resolve()
        if not resolved_path.exists():
            raise FileNotFoundError(f"Storage object not found: {storage_path}")
        with open(resolved_path, "rb") as f:
            return f.read()

    async def delete_file(self, storage_path: str) -> bool:
        resolved_path = (self.base_dir.parent / storage_path).resolve()
        if resolved_path.exists():
            resolved_path.unlink()
            return True
        return False
