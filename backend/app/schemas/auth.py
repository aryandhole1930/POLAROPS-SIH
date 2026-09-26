from pydantic import BaseModel
from typing import Literal


Role = Literal[
    "programme_admin",
    "operations_director",
    "expedition_logistics",
    "supply_chain_manager",
    "principal_investigator",
    "station_leader",
    "expedition_member"
]

Station = Literal[
    "headquarters",
    "maitri",
    "bharati",
    "voyage"
]

PersonnelType = Literal[
    "scientist",
    "medical_officer",
    "engineer",
    "technician",
    "logistics",
    "support_staff",
    "crew",
    "observer",
    "administration"
]


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

    role: Role = "expedition_member"

    station: Station | None = None

    personnel_type: PersonnelType | None = None


class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str