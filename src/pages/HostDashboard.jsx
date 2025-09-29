import React from 'react';
import { DollarSign, Calendar, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Placeholder Data
const stats = [
  { title: "Total Revenue", value: "$4,820", icon: DollarSign },
  { title: "Upcoming Bookings", value: "8", icon: Calendar },
  { title: "Active Listings", value: "3", icon: Home },
  { title: "Total Customers", value: "42", icon: Users },
];

const recentBookings = [
    { id: '1', customer: 'Alice Johnson', listing: 'Mega Rainbow Castle', date: 'Aug 15, 2024', total: '$275' },
    { id: '2', customer: 'Bob Williams', listing: 'The Big Kahuna Slide', date: 'Aug 18, 2024', total: '$350' },
];

const listings = [
    { id: 'abc', title: 'Mega Rainbow Castle', status: 'Active', bookings: 12 },
    { id: 'def', title: 'The Big Kahuna Slide', status: 'Active', bookings: 25 },
    { id: 'ghi', title: 'Backyard Obstacle Course', status: 'Paused', bookings: 5 },
];


export default function HostDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <Button onClick={() => navigate(createPageUrl('CreateListing'))} className="bg-airbnb-red text-white hover:bg-airbnb-red-dark">
          Create New Listing
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-md flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Customer</th>
                            <th className="py-2">Listing</th>
                            <th className="py-2">Date</th>
                            <th className="py-2">Payout</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentBookings.map(booking => (
                            <tr key={booking.id} className="border-b">
                                <td className="py-4">{booking.customer}</td>
                                <td className="py-4">{booking.listing}</td>
                                <td className="py-4">{booking.date}</td>
                                <td className="py-4 font-medium">{booking.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* My Listings */}
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">My Listings</h2>
            <div className="space-y-4">
                {listings.map(listing => (
                    <div key={listing.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{listing.title}</p>
                            <p className="text-sm text-gray-500">{listing.bookings} bookings</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${listing.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{listing.status}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}