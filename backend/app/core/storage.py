from io import BytesIO

import cloudinary
import cloudinary.uploader
from PIL import Image
from pillow_heif import register_heif_opener

from app.core.config import settings

if settings.cloudinary_url:
    cloudinary.config(secure=True)

register_heif_opener()


def _convert_image_to_webp(file_bytes: bytes) -> bytes:
    with Image.open(BytesIO(file_bytes)) as image:
        converted = BytesIO()
        image_mode = "RGBA" if image.mode in {"RGBA", "LA"} else "RGB"
        image.convert(image_mode).save(converted, format="WEBP", quality=85, method=6)
        return converted.getvalue()


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
            _convert_image_to_webp(file_bytes),
            folder=folder,
            resource_type="image"
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading to cloudinary: {e}")
        return None
