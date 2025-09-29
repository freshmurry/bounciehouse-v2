import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatCard({ icon: Icon, title, value, isLoading }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}