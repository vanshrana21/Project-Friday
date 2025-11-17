# backend/app/routes/pharmacies.py
from fastapi import APIRouter, HTTPException, Query, status
from typing import List
import logging

from app.models import Pharmacy, PharmacyListResponse
from app.database import db
from app.utils.distance import get_pharmacies_within_radius


logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/nearby", response_model=PharmacyListResponse)
async def get_nearby_pharmacies(
    lat: float = Query(19.0760, description="User's latitude"),
    lng: float = Query(72.8777, description="User's longitude"),
    radius: float = Query(10.0, ge=0.1, le=100, description="Search radius in kilometers")
):
    """
    Find pharmacies within specified radius of user's location
    
    - **lat**: Latitude of user's location (default: Mumbai coordinates)
    - **lng**: Longitude of user's location
    - **radius**: Search radius in kilometers (default: 10km, max: 100km)
    """
    try:
        logger.info(f"Searching pharmacies near ({lat}, {lng}) within {radius}km")
        
        # Get all pharmacies
        all_pharmacies = db.get_all_pharmacies()
        
        # Filter by distance
        nearby = get_pharmacies_within_radius(all_pharmacies, lat, lng, radius)
        
        logger.info(f"Found {len(nearby)} pharmacies within {radius}km")
        
        return PharmacyListResponse(
            success=True,
            count=len(nearby),
            pharmacies=nearby
        )
        
    except Exception as e:
        logger.error(f"Error searching pharmacies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching pharmacies: {str(e)}"
        )

@router.get("/", response_model=List[Pharmacy])
async def get_all_pharmacies():
    """
    Get all pharmacies in the database
    """
    try:
        pharmacies = db.get_all_pharmacies()
        logger.info(f"Retrieved {len(pharmacies)} pharmacies")
        return pharmacies
    except Exception as e:
        logger.error(f"Error fetching pharmacies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pharmacies: {str(e)}"
        )

@router.get("/{pharmacy_id}", response_model=Pharmacy)
async def get_pharmacy_by_id(pharmacy_id: str):
    """
    Get specific pharmacy by ID
    
    - **pharmacy_id**: The pharmacy ID to lookup
    """
    try:
        pharmacy = db.find_pharmacy_by_id(pharmacy_id)
        
        if not pharmacy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pharmacy with ID '{pharmacy_id}' not found"
            )
        
        return pharmacy
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pharmacy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pharmacy: {str(e)}"
        )