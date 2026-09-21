import os

import boto3
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

if not S3_BUCKET_NAME:
    raise RuntimeError("S3_BUCKET_NAME is not configured")


s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    config=Config(
        signature_version="s3v4",
        s3={
            "addressing_style": "virtual",
        },
    ),
)


def upload_file_to_s3(
    file_path: str,
    object_key: str,
    content_type: str = "application/octet-stream",
):
    s3_client.upload_file(
        file_path,
        S3_BUCKET_NAME,
        object_key,
        ExtraArgs={
            "ContentType": content_type,
        },
    )

    return object_key


def generate_presigned_url(
    object_key: str,
    expires_in: int = 900,
):
    return s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": S3_BUCKET_NAME,
            "Key": object_key,
        },
        ExpiresIn=expires_in,
    )


def delete_file_from_s3(object_key: str):
    s3_client.delete_object(
        Bucket=S3_BUCKET_NAME,
        Key=object_key,
    )

def download_file_from_s3(
    object_key: str,
    local_path: str,
):
    s3_client.download_file(
        S3_BUCKET_NAME,
        object_key,
        local_path,
    )

    return local_path