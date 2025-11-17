// components/ReportForm.tsx
'use client';

import { useState } from 'react';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import apiClient from '../lib/api-client';

export default function ReportForm({ showToast }) {
  const [formData, setFormData] = useState({
    batchCode: '',
    medicineName: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batchCode.trim() || !formData.description.trim()) {
      setStatus({ type: 'error', message: '⚠️ Please fill in batch code and description' });
      return;
    }

    if (formData.description.trim().length < 10) {
      setStatus({ type: 'error', message: '⚠️ Description must be at least 10 characters long' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'loading', message: '⏳ Submitting report...' });

    try {
      const result = await apiClient.createReport({
        batch_code: formData.batchCode,
        medicine_name: formData.medicineName || undefined,
        description: formData.description
      });

      setStatus({ 
        type: 'success', 
        message: '✅ Report submitted successfully! Thank you for helping keep medicines safe.' 
      });
      setFormData({ batchCode: '', medicineName: '', description: '' });
      showToast('Report submitted successfully!', 'success');
      
      // Clear status after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setStatus({ 
        type: 'error', 
        message: '❌ Failed to submit report. Please try again.' 
      });
      showToast('Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Report Suspicious Medicine</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="batchCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Batch/QR Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="batchCode"
            name="batchCode"
            value={formData.batchCode}
            onChange={handleChange}
            placeholder="Enter batch code"
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="medicineName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Medicine Name <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            id="medicineName"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            placeholder="e.g., Paracetamol 500mg"
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Describe the Issue <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide details about why this medicine seems suspicious..."
            rows={4}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all resize-y"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Report
            </>
          )}
        </button>

        {status && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
            status.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700' 
              : status.type === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
          }`}>
            {status.message}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <p className="text-sm text-orange-800 dark:text-orange-300">
          <strong>📢 Note:</strong> All reports are reviewed by our team and forwarded to relevant authorities. Your contribution helps protect public health.
        </p>
      </div>
    </div>
  );
}