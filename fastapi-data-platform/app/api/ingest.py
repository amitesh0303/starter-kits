"""Data ingestion endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import verify_service_token
from app.services.storage_provider import get_storage_provider

router = APIRouter()


class IngestRequest(BaseModel):
    source: str
    format: str = "csv"
    destination_key: str


class IngestResponse(BaseModel):
    job_id: str
    status: str
    destination_key: str


@router.post("/upload", response_model=IngestResponse)
async def ingest_data(
    request: IngestRequest,
    service_name: str = Depends(verify_service_token),
) -> IngestResponse:
    """Upload data to the platform for processing."""
    storage = get_storage_provider()
    job_id = storage.store(
        key=request.destination_key,
        data=f"placeholder data from {request.source}",
    )
    return IngestResponse(
        job_id=job_id,
        status="queued",
        destination_key=request.destination_key,
    )


@router.get("/status/{job_id}")
async def get_job_status(
    job_id: str,
    service_name: str = Depends(verify_service_token),
) -> dict:
    """Get ingestion job status."""
    return {"job_id": job_id, "status": "completed", "progress": 100}
