from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urlparse
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from PIL import Image, ImageOps, UnidentifiedImageError
from pillow_heif import register_heif_opener

from app.core.config import settings

register_heif_opener()


class PhotoUploadError(Exception):
    """Raised when a submitted image cannot be made available."""


def _configure_cloudinary() -> None:
    """Configure Cloudinary, including a URL loaded from the application's .env."""
    if not settings.cloudinary_url:
        return

    parsed = urlparse(settings.cloudinary_url)
    if parsed.scheme != "cloudinary" or not (parsed.hostname and parsed.username and parsed.password):
        raise PhotoUploadError("CLOUDINARY_URL is invalid")

    cloudinary.config(
        cloud_name=parsed.hostname,
        api_key=unquote(parsed.username),
        api_secret=unquote(parsed.password),
        secure=True,
    )


def _convert_image_to_webp(file_bytes: bytes) -> bytes:
    try:
        with Image.open(BytesIO(file_bytes)) as image:
            converted = BytesIO()
            image_mode = "RGBA" if image.mode in {"RGBA", "LA"} else "RGB"
            ImageOps.exif_transpose(image).convert(image_mode).save(
                converted, format="WEBP", quality=85, method=6
            )
            return converted.getvalue()
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise PhotoUploadError("The selected file is not a valid image") from error


def upload_photo(file_bytes: bytes, folder: str, public_base_url: str) -> str:
    """Convert a photo to WebP, store it, and return a browser-accessible URL."""
    if not file_bytes:
        raise PhotoUploadError("The photo is empty")
    if len(file_bytes) > settings.max_photo_size_bytes:
        raise PhotoUploadError("The photo exceeds the 10 MB limit")

    webp_bytes = _convert_image_to_webp(file_bytes)

    # Local fallback makes uploads testable without Cloudinary credentials.
    if not settings.cloudinary_url:
        target_directory = Path(settings.media_root) / Path(folder)
        target_directory.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid4()}.webp"
        (target_directory / filename).write_bytes(webp_bytes)
        return f"{public_base_url.rstrip('/')}/media/{folder}/{filename}"

    try:
        _configure_cloudinary()
        result = cloudinary.uploader.upload(
            webp_bytes,
            folder=folder,
            resource_type="image",
            format="webp",
        )
        url = result.get("secure_url")
        if not url:
            raise PhotoUploadError("Cloudinary did not return a photo URL")
        return url
    except PhotoUploadError:
        raise
    except Exception as error:
        raise PhotoUploadError("The photo could not be uploaded to Cloudinary") from error
