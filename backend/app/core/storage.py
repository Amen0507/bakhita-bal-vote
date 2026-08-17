import cloudinary
import cloudinary.uploader
from app.core.config import settings

if settings.cloudinary_url:
    cloudinary.config(secure=True)

def upload_photo(file_bytes: bytes, folder: str = "bal_vote") -> str | None:
    """
    Uploads a photo to Cloudinary and returns the secure URL.
    Requires cloudinary_url to be configured.
    """
    if not settings.cloudinary_url:
        print("Warning: CLOUDINARY_URL not set, skipping upload")
        return None
        
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="image"
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading to cloudinary: {e}")
        return None
