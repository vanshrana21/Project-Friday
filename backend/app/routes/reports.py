# backend/app/routes/reports.py
from fastapi import APIRouter, HTTPException, status, Query
from typing import List
import logging

from app.models import (
    Report,
    ReportCreateRequest,
    ReportCreateResponse
)
from app.database import db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ReportCreateResponse)
async def create_report(request: ReportCreateRequest):
    """
    Submit a suspicious medicine report
    
    - **batch_code**: The batch/QR code being reported
    - **medicine_name**: Name of the medicine (optional)
    - **description**: Detailed description of the issue (minimum 10 characters)
    """
    try:
        logger.info(f"Creating report for batch code: {request.batch_code}")
        
        report_data = {
            "batch_code": request.batch_code.strip(),
            "medicine_name": request.medicine_name or "Not specified",
            "description": request.description.strip()
        }
        
        # Add report to database
        new_report = db.add_report(report_data)
        
        logger.info(f"Report created successfully with ID: {new_report['id']}")
        
        return ReportCreateResponse(
            success=True,
            message="Report submitted successfully",
            report_id=new_report['id']
        )
        
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating report: {str(e)}"
        )

@router.get("/", response_model=List[Report])
async def get_all_reports():
    """
    Get all reports (admin endpoint)
    """
    try:
        reports = db.get_all_reports()
        logger.info(f"Retrieved {len(reports)} reports")
        return reports
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching reports: {str(e)}"
        )

@router.get("/{report_id}", response_model=Report)
async def get_report_by_id(report_id: str):
    """
    Get specific report by ID
    
    - **report_id**: The report ID to lookup
    """
    try:
        report = db.find_report_by_id(report_id)
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID '{report_id}' not found"
            )
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching report: {str(e)}"
        )

@router.patch("/{report_id}/status")
async def update_report_status(
    report_id: str,
    status: str = Query(..., regex="^(pending|investigating|resolved|rejected)$")
):
    """
    Update report status (admin endpoint)
    
    - **report_id**: The report ID to update
    - **status**: New status (pending, investigating, resolved, rejected)
    """
    try:
        updated_report = db.update_report_status(report_id, status)
        
        if not updated_report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID '{report_id}' not found"
            )
        
        logger.info(f"Updated report {report_id} status to: {status}")
        return {
            "success": True,
            "message": "Report status updated successfully",
            "report": updated_report
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating report status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating report status: {str(e)}"
        )