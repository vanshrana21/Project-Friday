# backend/app/database.py
import json
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
import uuid

class Database:
    def __init__(self):
        # Set up data directory
        self.base_dir = Path(__file__).parent.parent
        self.data_dir = self.base_dir / "data"
        self.data_dir.mkdir(exist_ok=True)
        
        # Define data files
        self.medicines_file = self.data_dir / "medicines.json"
        self.pharmacies_file = self.data_dir / "pharmacies.json"
        self.reports_file = self.data_dir / "reports.json"
        
        # Initialize files if they don't exist
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialize JSON files with empty arrays if they don't exist"""
        if not self.medicines_file.exists():
            self._write_json(self.medicines_file, [])
        if not self.pharmacies_file.exists():
            self._write_json(self.pharmacies_file, [])
        if not self.reports_file.exists():
            self._write_json(self.reports_file, [])
    
    def _read_json(self, filepath: Path) -> List[Dict[str, Any]]:
        """Read JSON file and return data"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def _write_json(self, filepath: Path, data: List[Dict[str, Any]]):
        """Write data to JSON file"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Medicine operations
    def get_all_medicines(self) -> List[Dict[str, Any]]:
        """Get all medicines"""
        return self._read_json(self.medicines_file)
    
    def find_medicine_by_batch_code(self, batch_code: str) -> Optional[Dict[str, Any]]:
        """Find medicine by batch code"""
        medicines = self.get_all_medicines()
        for medicine in medicines:
            if medicine['batch_code'].upper() == batch_code.upper():
                return medicine
        return None
    
    # Pharmacy operations
    def get_all_pharmacies(self) -> List[Dict[str, Any]]:
        """Get all pharmacies"""
        return self._read_json(self.pharmacies_file)
    
    def find_pharmacy_by_id(self, pharmacy_id: str) -> Optional[Dict[str, Any]]:
        """Find pharmacy by ID"""
        pharmacies = self.get_all_pharmacies()
        for pharmacy in pharmacies:
            if pharmacy['id'] == pharmacy_id:
                return pharmacy
        return None
    
    # Report operations
    def get_all_reports(self) -> List[Dict[str, Any]]:
        """Get all reports"""
        return self._read_json(self.reports_file)
    
    def find_report_by_id(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Find report by ID"""
        reports = self.get_all_reports()
        for report in reports:
            if report['id'] == report_id:
                return report
        return None
    
    def add_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new report"""
        reports = self.get_all_reports()
        
        new_report = {
            "id": str(uuid.uuid4()),
            "batch_code": report_data['batch_code'],
            "medicine_name": report_data.get('medicine_name', 'Not specified'),
            "description": report_data['description'],
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        reports.append(new_report)
        self._write_json(self.reports_file, reports)
        
        return new_report
    
    def update_report_status(self, report_id: str, status: str) -> Optional[Dict[str, Any]]:
        """Update report status"""
        reports = self.get_all_reports()
        
        for i, report in enumerate(reports):
            if report['id'] == report_id:
                reports[i]['status'] = status
                reports[i]['updated_at'] = datetime.now().isoformat()
                self._write_json(self.reports_file, reports)
                return reports[i]
        
        return None

# Create global database instance
db = Database()