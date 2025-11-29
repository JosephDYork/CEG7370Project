import base64
from io import BytesIO
from typing import List
from PIL import Image
from pydantic import BaseModel
import boto3
import os
from datetime import datetime

def decode_b64img(base64_string: str) -> Image.Image:
    image_data = base64.b64decode(base64_string)
    return Image.open(BytesIO(image_data))

class OCRRequest(BaseModel):
    image: str
    x: float
    y: float
    width: float
    height: float


class TextBlock(BaseModel):
    text: str
    left: float
    top: float
    width: float
    height: float
    confidence: float


class OCRResponse(BaseModel):
    textBlocks: List[TextBlock]


class OCRService:
    def __init__(self):
        self.session: boto3.Session = None
        self.s3_client: boto3.s3.S3Client = None
        self.textract_client: boto3.textract.TextractClient = None
        self.bucket_name = os.environ.get("AWS_S3_BUCKET", "polyboard-ocr-images")
        self.profile_name = os.environ.get("AWS_PROFILE", "default")

        try:
            self.session = boto3.Session(profile_name=self.profile_name)
            self.s3_client = self.session.client("s3")
            self.textract_client = self.session.client("textract")
        except Exception as e:
            print(f"Failed to create or initialize AWS session: {e}")

    @staticmethod
    async def extract_text(self, filename: str, image: Image.Image):
        response = self.textract_client.detect_document_text(
            Document={"S3Object": {"Bucket": self.bucket_name, "Name": filename}}
        )

        text_blocks = []
        for block in response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                geometry = block.get("Geometry", {}).get("BoundingBox", {})
                text_blocks.append(
                    {
                        "text": block.get("Text", ""),
                        "width": geometry.get("Width", 0) * image.width,
                        "height": geometry.get("Height", 0) * image.height,
                        "left": geometry.get("Left", 0) * image.width,
                        "top": geometry.get("Top", 0) * image.height,
                        "confidence": block.get("Confidence", 0),
                    }
                )

        print(f"Textract detected {len(text_blocks)} text blocks")
        return text_blocks

    async def upload_image_to_s3(self, image: Image.Image):
        if not self.s3_client or not self.bucket_name:
            raise Exception("S3 client not configured")

        if not self.textract_client:
            raise Exception("Textract client not configured")

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            filename = f"{timestamp}.jpg"

            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=100)
            buffer.seek(0)

            self.s3_client.upload_fileobj(
                buffer,
                self.bucket_name,
                filename,
                ExtraArgs={"ContentType": "image/jpeg"},
            )

            url = f"https://{self.bucket_name}.s3.amazonaws.com/{filename}"
            print(f"Image uploaded to S3: {url}")
            return filename

        except Exception as e:
            print(f"Unexpected error: {e}")
            raise e
