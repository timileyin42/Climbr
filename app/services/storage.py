from typing import Optional, Dict, Any, BinaryIO
import os
import logging
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Storage configuration
# AWS S3 configuration
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# Google Cloud Storage configuration
GCS_ENABLED = os.getenv("GCS_ENABLED", "false").lower() == "true"
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
GCS_PROJECT_ID = os.getenv("GCS_PROJECT_ID")

# Determine which storage provider to use
STORAGE_PROVIDER = "gcs" if GCS_ENABLED else "s3"

class StorageService:
    """
    Service for handling file storage operations using either AWS S3 or Google Cloud Storage.
    """
    
    @staticmethod
    def get_s3_client():
        """
        Get an S3 client instance.
        
        Returns:
            boto3.client: S3 client instance
        """
        if not AWS_ACCESS_KEY or not AWS_SECRET_KEY or not AWS_BUCKET_NAME:
            logger.error("AWS credentials or bucket name not set. S3 storage is disabled.")
            return None
            
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
                region_name=AWS_REGION
            )
            return s3_client
        except Exception as e:
            logger.error(f"Error creating S3 client: {str(e)}")
            return None
            
    @staticmethod
    def get_gcs_client():
        """
        Get a Google Cloud Storage client instance.
        
        Returns:
            storage.Client: GCS client instance or None if not configured
        """
        if not GCS_ENABLED or not GCS_BUCKET_NAME or not GCS_PROJECT_ID:
            logger.error("GCS not enabled or bucket name/project ID not set. GCS storage is disabled.")
            return None
            
        try:
            # Import here to avoid dependency if not using GCS
            from google.cloud import storage
            
            # GCS client uses Application Default Credentials
            # Make sure to set GOOGLE_APPLICATION_CREDENTIALS env var or run in GCP
            gcs_client = storage.Client(project=GCS_PROJECT_ID)
            return gcs_client
        except ImportError:
            logger.error("Google Cloud Storage library not installed. Run 'pip install google-cloud-storage'")
            return None
        except Exception as e:
            logger.error(f"Error creating GCS client: {str(e)}")
            return None
    
    @staticmethod
    async def upload_file(file: UploadFile, folder: str, filename: Optional[str] = None) -> Optional[str]:
        """
        Upload a file to either S3 or GCS bucket based on configuration.
        
        Args:
            file: File to upload
            folder: Folder path in the bucket
            filename: Optional custom filename, if not provided, uses the original filename
            
        Returns:
            URL of the uploaded file if successful, None otherwise
        """
        if not filename:
            filename = file.filename
            
        # Ensure folder path ends with a slash
        if not folder.endswith('/'):
            folder += '/'
            
        # Create the full object key (path)
        object_key = f"{folder}{filename}"
        
        # Read file content
        file_content = await file.read()
        
        try:
            # Use the appropriate storage provider
            if STORAGE_PROVIDER == "gcs":
                return await StorageService._upload_to_gcs(object_key, file_content, file.content_type)
            else:
                return await StorageService._upload_to_s3(object_key, file_content, file.content_type)
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            return None
        finally:
            # Reset file cursor for potential future reads
            await file.seek(0)
    
    @staticmethod
    async def _upload_to_s3(object_key: str, file_content: bytes, content_type: str) -> Optional[str]:
        """
        Upload a file to AWS S3.
        
        Args:
            object_key: The full path/key in the bucket
            file_content: The file content as bytes
            content_type: The MIME type of the file
            
        Returns:
            URL of the uploaded file if successful, None otherwise
        """
        s3_client = StorageService.get_s3_client()
        if not s3_client:
            return None
            
        try:
            # Upload to S3
            s3_client.put_object(
                Bucket=AWS_BUCKET_NAME,
                Key=object_key,
                Body=file_content,
                ContentType=content_type
            )
            
            # Generate URL
            url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_key}"
            logger.info(f"File uploaded successfully to S3: {url}")
            return url
            
        except Exception as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            return None
    
    @staticmethod
    async def _upload_to_gcs(object_key: str, file_content: bytes, content_type: str) -> Optional[str]:
        """
        Upload a file to Google Cloud Storage.
        
        Args:
            object_key: The full path/key in the bucket
            file_content: The file content as bytes
            content_type: The MIME type of the file
            
        Returns:
            URL of the uploaded file if successful, None otherwise
        """
        gcs_client = StorageService.get_gcs_client()
        if not gcs_client:
            return None
            
        try:
            # Get bucket and blob
            bucket = gcs_client.bucket(GCS_BUCKET_NAME)
            blob = bucket.blob(object_key)
            
            # Upload to GCS
            blob.upload_from_string(
                file_content,
                content_type=content_type
            )
            
            # Make the blob publicly readable
            blob.make_public()
            
            # Generate URL
            url = blob.public_url
            logger.info(f"File uploaded successfully to GCS: {url}")
            return url
            
        except Exception as e:
            logger.error(f"Error uploading file to GCS: {str(e)}")
            return None
    
    @staticmethod
    async def delete_file(file_url: str) -> bool:
        """
        Delete a file from either S3 or GCS bucket based on configuration.
        
        Args:
            file_url: URL of the file to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Determine which storage provider to use based on URL format
            if GCS_ENABLED and GCS_BUCKET_NAME and GCS_BUCKET_NAME in file_url:
                return await StorageService._delete_from_gcs(file_url)
            else:
                return await StorageService._delete_from_s3(file_url)
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    @staticmethod
    async def _delete_from_s3(file_url: str) -> bool:
        """
        Delete a file from AWS S3 bucket.
        
        Args:
            file_url: URL of the file to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        s3_client = StorageService.get_s3_client()
        if not s3_client:
            return False
            
        try:
            # Extract object key from URL
            # URL format: https://{bucket}.s3.{region}.amazonaws.com/{object_key}
            parts = file_url.split(f"{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/")
            if len(parts) != 2:
                logger.error(f"Invalid S3 URL format: {file_url}")
                return False
                
            object_key = parts[1]
            
            # Delete from S3
            s3_client.delete_object(
                Bucket=AWS_BUCKET_NAME,
                Key=object_key
            )
            
            logger.info(f"File deleted successfully from S3: {object_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file from S3: {str(e)}")
            return False
    
    @staticmethod
    async def _delete_from_gcs(file_url: str) -> bool:
        """
        Delete a file from Google Cloud Storage bucket.
        
        Args:
            file_url: URL of the file to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        gcs_client = StorageService.get_gcs_client()
        if not gcs_client:
            return False
            
        try:
            # Extract object key from URL
            # URL format: https://storage.googleapis.com/{bucket}/{object_key}
            # or https://storage.cloud.google.com/{bucket}/{object_key}
            if "storage.googleapis.com" in file_url:
                parts = file_url.split(f"storage.googleapis.com/{GCS_BUCKET_NAME}/")
            else:
                parts = file_url.split(f"storage.cloud.google.com/{GCS_BUCKET_NAME}/")
                
            if len(parts) != 2:
                logger.error(f"Invalid GCS URL format: {file_url}")
                return False
                
            object_key = parts[1]
            
            # Delete from GCS
            bucket = gcs_client.bucket(GCS_BUCKET_NAME)
            blob = bucket.blob(object_key)
            blob.delete()
            
            logger.info(f"File deleted successfully from GCS: {object_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file from GCS: {str(e)}")
            return False
    
    @staticmethod
    async def generate_presigned_url(object_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for accessing a private object in either S3 or GCS.
        
        Args:
            object_key: Object key (path) in the bucket
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL if successful, None otherwise
        """
        if STORAGE_PROVIDER == "gcs":
            return await StorageService._generate_gcs_signed_url(object_key, expiration)
        else:
            return await StorageService._generate_s3_presigned_url(object_key, expiration)
    
    @staticmethod
    async def _generate_s3_presigned_url(object_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for accessing a private S3 object.
        
        Args:
            object_key: Object key (path) in the S3 bucket
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL if successful, None otherwise
        """
        s3_client = StorageService.get_s3_client()
        if not s3_client:
            return None
            
        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': AWS_BUCKET_NAME,
                    'Key': object_key
                },
                ExpiresIn=expiration
            )
            
            logger.info(f"Generated S3 presigned URL for {object_key}")
            return url
            
        except ClientError as e:
            logger.error(f"Error generating S3 presigned URL: {str(e)}")
            return None
    
    @staticmethod
    async def _generate_gcs_signed_url(object_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a signed URL for accessing a private GCS object.
        
        Args:
            object_key: Object key (path) in the GCS bucket
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Signed URL if successful, None otherwise
        """
        gcs_client = StorageService.get_gcs_client()
        if not gcs_client:
            return None
            
        try:
            # Get bucket and blob
            bucket = gcs_client.bucket(GCS_BUCKET_NAME)
            blob = bucket.blob(object_key)
            
            # Generate signed URL with expiration
            from datetime import timedelta
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=expiration),
                method="GET"
            )
            
            logger.info(f"Generated GCS signed URL for {object_key}")
            return url
            
        except Exception as e:
            logger.error(f"Error generating GCS signed URL: {str(e)}")
            return None