import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

export default function RecentReservationsTable({ reservations, isLoading }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reservations</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-sm font-medium text-gray-500">Listing</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Guest</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Total</th>
              <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}>
                <td className="py-3"><Skeleton className="h-4 w-full" /></td>
                <td className="py-3"><Skeleton className="h-4 w-full" /></td>
                <td className="py-3"><Skeleton className="h-4 w-full" /></td>
                <td className="py-3"><Skeleton className="h-4 w-full" /></td>
                <td className="py-3"><Skeleton className="h-4 w-full" /></td>
              </tr>
            )) : reservations.map(r => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-3 text-sm">{r.listing_id.slice(-6)}</td>
                <td className="py-3 text-sm">{r.guest_id.slice(-6)}</td>
                <td className="py-3 text-sm">
                  {format(new Date(r.start_date), 'MMM d')} - {format(new Date(r.end_date), 'MMM d')}
                </td>
                <td className="py-3 text-sm font-medium">${r.total_amount.toFixed(2)}</td>
                <td className="py-3">
                  <Badge className={statusColors[r.status]}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}