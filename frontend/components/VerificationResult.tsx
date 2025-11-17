// components/VerificationResult.tsx
'use client';

import { CheckCircle2, AlertTriangle, FileText, Loader2 } from 'lucide-react';

interface MedicineData {
  name: string;
  company: string;
  expiry: string;
  status: string;
  manufacturing_date?: string;
}

interface VerificationResult {
  isValid: boolean;
  code: string;
  data?: MedicineData | null;
  loading?: boolean;
}

interface VerificationResultProps {
  result: VerificationResult | null;
}

export default function VerificationResult({ result }: VerificationResultProps) {
  if (!result) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verification Result</h2>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 dark:text-gray-400 italic text-center">
            Scan or enter a code to verify medicine authenticity
          </p>
        </div>
      </div>
    );
  }

  if (result.loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verification Result</h2>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Verifying medicine code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Verification Result</h2>
      </div>

      {result.isValid && result.data ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 rounded-xl p-6 animate-slide-down">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                ✅ Medicine Verified
              </h3>
              <p className="text-green-700 dark:text-green-400 text-sm">
                This medicine has been authenticated successfully
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-800">
              <span className="font-semibold text-green-900 dark:text-green-300">Batch Code:</span>
              <span className="text-green-800 dark:text-green-400 font-mono">{result.code}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-800">
              <span className="font-semibold text-green-900 dark:text-green-300">Status:</span>
              <span className="text-green-800 dark:text-green-400">{result.data.status}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-800">
              <span className="font-semibold text-green-900 dark:text-green-300">Name:</span>
              <span className="text-green-800 dark:text-green-400">{result.data.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-800">
              <span className="font-semibold text-green-900 dark:text-green-300">Company:</span>
              <span className="text-green-800 dark:text-green-400">{result.data.company}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-green-900 dark:text-green-300">Expiry:</span>
              <span className="text-green-800 dark:text-green-400">{result.data.expiry}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-500 rounded-xl p-6 animate-slide-down">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
                ⚠️ Medicine Not Verified
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm">
                This code was not found in our database
              </p>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-red-900 dark:text-red-300">Code:</span>
              <span className="text-red-800 dark:text-red-400 font-mono">{result.code}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-red-900 dark:text-red-300">Status:</span>
              <span className="text-red-800 dark:text-red-400">Not found in database</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              <strong>⚠️ Warning:</strong> This medicine may be counterfeit. Please report it if you suspect any issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}