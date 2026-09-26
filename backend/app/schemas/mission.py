from datetime import date
from pydantic import BaseModel, Field


class MissionCreate(BaseModel):
    mission_name: str = Field(..., min_length=3, max_length=200)
    start_date: date | None = None
    end_date: date | None = None
    destination: str = "Antarctica"
    objectives: list[str] = []


class MissionUpdate(BaseModel):
    mission_name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    destination: str | None = None
    objectives: list[str] | None = None