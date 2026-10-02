import os
from backend.app.storage.base import StorageProvider

class S3StorageProvider(StorageProvider):
    def __init__(self, bucket_name: str = os.getenv("S3_BUCKET", "courtlens-vault")):
        self.bucket = bucket_name
        # Lazy import of boto3
        import boto3
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )

    async def save_file(self, filename: str, content: bytes) -> str:
        key = f"evidence/{filename}"
        self.s3_client.put_object(Bucket=self.bucket, Key=key, Body=content)
        return f"s3://{self.bucket}/{key}"

    async def get_file(self, storage_path: str) -> bytes:
        key = storage_path.replace(f"s3://{self.bucket}/", "")
        response = self.s3_client.get_object(Bucket=self.bucket, Key=key)
        return response["Body"].read()

    async def delete_file(self, storage_path: str) -> bool:
        key = storage_path.replace(f"s3://{self.bucket}/", "")
        self.s3_client.delete_object(Bucket=self.bucket, Key=key)
        return True
