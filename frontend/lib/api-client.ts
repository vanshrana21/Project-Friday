// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface MedicineData {
  name: string;
  company: string;
  expiry: string;
  status: string;
  manufacturing_date?: string;
}

interface VerifyMedicineResponse {
  is_valid: boolean;
  code: string;
  message?: string;
  data?: MedicineData;
}

interface PharmacyLocation {
  latitude: number;
  longitude: number;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: PharmacyLocation;
  distance?: string;
}

interface PharmacyListResponse {
  success: boolean;
  count: number;
  pharmacies: Pharmacy[];
}

interface ReportData {
  batch_code: string;
  medicine_name?: string;
  description: string;
}

interface ReportResponse {
  success: boolean;
  message: string;
  report_id: string;
}

interface Report {
  id: string;
  batch_code: string;
  medicine_name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
      }

      return data as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Medicine endpoints
  async verifyMedicine(batchCode: string): Promise<VerifyMedicineResponse> {
    return this.request<VerifyMedicineResponse>('/medicines/verify', {
      method: 'POST',
      body: JSON.stringify({ batch_code: batchCode }),
    });
  }

  async getAllMedicines(): Promise<any[]> {
    return this.request<any[]>('/medicines');
  }

  async getMedicineByBatchCode(batchCode: string): Promise<any> {
    return this.request<any>(`/medicines/${batchCode}`);
  }

  // Pharmacy endpoints
  async getNearbyPharmacies(
    lat: number = 19.0760,
    lng: number = 72.8777,
    radius: number = 10
  ): Promise<PharmacyListResponse> {
    return this.request<PharmacyListResponse>(
      `/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    return this.request<Pharmacy[]>('/pharmacies');
  }

  async getPharmacyById(pharmacyId: string): Promise<Pharmacy> {
    return this.request<Pharmacy>(`/pharmacies/${pharmacyId}`);
  }

  // Report endpoints
  async createReport(reportData: ReportData): Promise<ReportResponse> {
    return this.request<ReportResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getAllReports(): Promise<Report[]> {
    return this.request<Report[]>('/reports');
  }

  async getReportById(reportId: string): Promise<Report> {
    return this.request<Report>(`/reports/${reportId}`);
  }

  async updateReportStatus(reportId: string, status: string): Promise<any> {
    return this.request<any>(`/reports/${reportId}/status?status=${status}`, {
      method: 'PATCH',
    });
  }
}

export default new ApiClient();