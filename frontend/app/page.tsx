// components/Scanner.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, StopCircle, Keyboard } from 'lucide-react';

export default function Scanner({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Ready to scan');
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const html5QrCodeRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current && isInitializedRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(console.warn);
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      }
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setScanStatus('Camera stopped');
        isInitializedRef.current = false;
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (isScanning) return;

    try {
      setScanStatus('Loading camera...');
      setIsScanning(true);

      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');

      // Initialize Html5Qrcode instance
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
        isInitializedRef.current = true;
      }

      setScanStatus('Requesting camera access...');

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error('No camera found');
      }

      // Try to find back camera
      const backCam = cameras.find(c => 
        c.label.toLowerCase().includes('back') || 
        c.label.toLowerCase().includes('rear') ||
        c.label.toLowerCase().includes('environment')
      );

      const selectedCamera = backCam || cameras[0];

      // Start scanning
      await html5QrCodeRef.current.start(
        selectedCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          stopScanner();
          setScanStatus(`Scanned: ${decodedText.substring(0, 25)}...`);
          onScanComplete(decodedText);
        },
        () => {} // Ignore scan errors
      );

      setScanStatus('Camera active - Point at QR code');
    } catch (err) {
      console.error('Camera error:', err);
      setScanStatus(`Error: ${err.message}`);
      setIsScanning(false);
      isInitializedRef.current = false;
      html5QrCodeRef.current = null;
    }
  };

  const handleManualCheck = () => {
    if (!manualCode.trim()) return;
    onScanComplete(manualCode);
    setManualCode('');
    setShowManual(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
          <Camera className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Scan Medicine</h2>
      </div>

      {/* QR Reader Box */}
      <div 
        id="qr-reader" 
        className={`w-full min-h-[250px] bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 mb-4 flex items-center justify-center ${isScanning ? 'scanning-glow' : ''}`}
      >
        {!isScanning && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Start Scan" to begin</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={startScanner}
          disabled={isScanning}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          <Camera className="w-5 h-5" />
          Start Scan
        </button>
        <button
          onClick={stopScanner}
          disabled={!isScanning}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          <StopCircle className="w-5 h-5" />
          Stop Scan
        </button>
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all"
        >
          <Keyboard className="w-5 h-5" />
          Manual Entry
        </button>
      </div>

      {/* Manual Entry */}
      {showManual && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 animate-slide-down">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Enter Batch Code or QR Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualCheck()}
              placeholder="e.g., MED123456"
              className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
            />
            <button
              onClick={handleManualCheck}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Check
            </button>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mt-4 ${
        isScanning 
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 animate-pulse-custom' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-yellow-500' : 'bg-gray-400'}`} />
        {scanStatus}
      </div>
    </div>
  );
}