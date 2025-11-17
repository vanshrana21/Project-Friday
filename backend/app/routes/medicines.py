# backend/app/routes/medicines.py
from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
import logging

from app.models import (
    Medicine,
    MedicineVerifyRequest,
    MedicineVerifyResponse
)
from app.database import db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/verify", response_model=MedicineVerifyResponse)
async def verify_medicine(request: MedicineVerifyRequest):
    """
    Verify medicine authenticity by batch code
    
    - **batch_code**: The batch/QR code to verify
    """
    try:
        batch_code = request.batch_code.strip()
        logger.info(f"Verifying medicine with batch code: {batch_code}")
        
        medicine = db.find_medicine_by_batch_code(batch_code)
        
        if not medicine:
            logger.warning(f"Medicine not found: {batch_code}")
            return MedicineVerifyResponse(
                is_valid=False,
                code=batch_code,
                message="Medicine not found in database"
            )
        
        # Format expiry date
        try:
            expiry_date = datetime.fromisoformat(medicine['expiry_date'])
            expiry_formatted = expiry_date.strftime("%b %Y")
        except:
            expiry_formatted = medicine['expiry_date']
        
        logger.info(f"Medicine verified successfully: {batch_code}")
        return MedicineVerifyResponse(
            is_valid=True,
            code=batch_code,
            data={
                "name": medicine['name'],
                "company": medicine['company'],
                "expiry": expiry_formatted,
                "status": "Authentic" if medicine['is_authentic'] else "Suspicious",
                "manufacturing_date": medicine['manufacturing_date']
            }
        )
        
    except Exception as e:
        logger.error(f"Error verifying medicine: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying medicine: {str(e)}"
        )

@router.get("/", response_model=List[Medicine])
async def get_all_medicines():
    """
    Get all medicines in the database
    """
    try:
        medicines = db.get_all_medicines()
        logger.info(f"Retrieved {len(medicines)} medicines")
        return medicines
    except Exception as e:
        logger.error(f"Error fetching medicines: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching medicines: {str(e)}"
        )

@router.get("/{batch_code}", response_model=Medicine)
async def get_medicine_by_batch_code(batch_code: str):
    """
    Get specific medicine by batch code
    
    - **batch_code**: The batch/QR code to lookup
    """
    try:
        medicine = db.find_medicine_by_batch_code(batch_code)
        
        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medicine with batch code '{batch_code}' not found"
            )
        
        return medicine
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching medicine: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching medicine: {str(e)}"
        )