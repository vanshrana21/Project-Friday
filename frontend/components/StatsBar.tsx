// components/StatsBar.tsx
'use client';

import { Scan, CheckCircle2, Building2 } from 'lucide-react';

interface Stats {
  totalScans: number;
  verifiedMeds: number;
  nearbyPharmacies: number;
}

interface StatsBarProps {
  stats: Stats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    { 
      label: 'Total Scans', 
      value: stats.totalScans, 
      icon: Scan,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      label: 'Verified Meds', 
      value: stats.verifiedMeds, 
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      label: 'Pharmacies', 
      value: stats.nearbyPharmacies, 
      icon: Building2,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl -mt-8 mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
        {statItems.map((item, index) => (
          <div key={index} className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
            </div>
            <p className={`text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}