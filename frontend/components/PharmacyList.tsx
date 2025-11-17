// components/PharmacyList.js
'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Navigation, RefreshCw } from 'lucide-react';
import apiClient from '../lib/api-client';

export default function PharmacyList({ onLoad, showToast }) {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    lat: 19.0760,
    lng: 72.8777
  });

  const loadPharmacies = async () => {
    setLoading(true);
    
    try {
      const result = await apiClient.getNearbyPharmacies(
        userLocation.lat,
        userLocation.lng,
        10
      );
      
      setPharmacies(result.pharmacies || []);
      onLoad(result.count || 0);
      showToast(`✅ Loaded ${result.count || 0} pharmacies`, 'success');
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      showToast('❌ Failed to load pharmacies', 'error');
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Use default location (Mumbai)
        }
      );
    }
    
    loadPharmacies();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nearby Pharmacies</h2>
        </div>
        <button
          onClick={loadPharmacies}
          disabled={loading}
          className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Refresh pharmacies"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-12 h-12 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] text-gray-500 dark:text-gray-400">
          <p>No pharmacies found nearby</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-l-4 border-cyan-500 rounded-xl p-4 hover:translate-x-1 transition-transform cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {pharmacy.name}
                  </h3>
                </div>
                {pharmacy.distance && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 text-xs font-semibold rounded-full">
                    <Navigation className="w-3 h-3" />
                    {pharmacy.distance}
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5 text-sm">
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{pharmacy.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${pharmacy.phone}`} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    {pharmacy.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={loadPharmacies}
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-600 dark:border-cyan-400 rounded-lg font-semibold hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Loading...' : 'Refresh List'}
      </button>
    </div>
  );
}