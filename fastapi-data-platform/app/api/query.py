"""Analytics query endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import verify_service_token
from app.services.analytics_engine import get_analytics_engine

router = APIRouter()


class QueryRequest(BaseModel):
    sql: str
    limit: int = 100


class QueryResponse(BaseModel):
    columns: list[str]
    rows: list[list]
    row_count: int


@router.post("/execute", response_model=QueryResponse)
async def execute_query(
    request: QueryRequest,
    service_name: str = Depends(verify_service_token),
) -> QueryResponse:
    """Execute an analytics query using DuckDB."""
    engine = get_analytics_engine()
    result = engine.execute(sql=request.sql, limit=request.limit)
    return QueryResponse(**result)
