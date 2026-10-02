from abc import ABC, abstractmethod
from typing import BinaryIO

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, filename: str, content: bytes) -> str:
        """Store bytes and return storage locator path."""
        pass

    @abstractmethod
    async def get_file(self, storage_path: str) -> bytes:
        """Read bytes from storage locator."""
        pass

    @abstractmethod
    async def delete_file(self, storage_path: str) -> bool:
        """Remove file from storage."""
        pass
