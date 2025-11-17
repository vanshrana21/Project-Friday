# backend/app/models.py
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime

# Medicine Models
class Medicine(BaseModel):
    id: str
    batch_code: str
    name: str
    company: str
    expiry_date: str
    is_authentic: bool
    manufacturing_date: str

class MedicineVerifyRequest(BaseModel):
    batch_code: str = Field(..., min_length=1, description="Batch/QR code to verify")

class MedicineVerifyResponse(BaseModel):
    is_valid: bool
    code: str
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

# Pharmacy Models
class PharmacyLocation(BaseModel):
    latitude: float
    longitude: float

class Pharmacy(BaseModel):
    id: str
    name: str
    address: str
    phone: str
    location: PharmacyLocation
    distance: Optional[str] = None

class PharmacyListResponse(BaseModel):
    success: bool
    count: int
    pharmacies: List[Pharmacy]

# Report Models
class Report(BaseModel):
    id: str
    batch_code: str
    medicine_name: str
    description: str
    status: str = "pending"
    created_at: str
    updated_at: str

class ReportCreateRequest(BaseModel):
    batch_code: str = Field(..., min_length=1, description="Batch/QR code being reported")
    medicine_name: Optional[str] = None
    description: str = Field(..., min_length=10, description="Description of the issue")

    @validator('description')
    def validate_description(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Description must be at least 10 characters long')
        return v.strip()

class ReportCreateResponse(BaseModel):
    success: bool
    message: str
    report_id: str