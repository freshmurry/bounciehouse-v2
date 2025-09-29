import React, { useState, useEffect } from "react";
import { Reservation } from "@/api/entities";
import { Listing } from "@/api/entities";
import { User } from "@/api/entities";
import { Calendar, DollarSign, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  // listings and user are loaded but not used directly in this component UI
  // listings and user are loaded for data fetching; keep state but avoid unused bindings
  // listings and user are only needed for data fetching inside loadUserAndReservations
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    loadUserAndReservations();
  }, []);

  const loadUserAndReservations = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();

      // Get user's listings
      const userListings = await Listing.filter({ host_id: currentUser.id });

      // Get all reservations for user's listings
      const allReservations = [];
      for (const listing of userListings) {
        const listingReservations = await Reservation.filter({ listing_id: listing.id });
        // Add listing details to each reservation for easier display
        const reservationsWithListing = listingReservations.map(res => ({
          ...res,
          listing: listing
        }));
        allReservations.push(...reservationsWithListing);
      }

      // Sort by creation date (most recent first)
      allReservations.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  setReservations(allReservations);

    } catch (error) {
      console.error("Error loading reservations:", error);
    }
    setIsLoading(false);
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await Reservation.update(reservationId, { status: newStatus });
      // Reload reservations to reflect changes
      loadUserAndReservations();
      
      // If confirming, you might want to charge the customer here
      if (newStatus === 'confirmed') {
        // In a real app, this would trigger payment processing
        console.log('Payment should be processed for reservation:', reservationId);
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Failed to update reservation status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReservations = reservations.filter(res => 
    filter === 'all' || res.status === filter
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Reservations</h1>
        <p className="mt-2 text-gray-600">Manage bookings for your bounce houses</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'All', count: reservations.length },
              { key: 'pending', label: 'Pending', count: reservations.filter(r => r.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmed', count: reservations.filter(r => r.status === 'confirmed').length },
              { key: 'completed', label: 'Completed', count: reservations.filter(r => r.status === 'completed').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-airbnb-red text-airbnb-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You don't have any reservations yet." 
              : `No ${filter} reservations found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={reservation.listing.images?.[0] || '/api/placeholder/80/80'}
                        alt={reservation.listing.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reservation.listing.title}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {reservation.listing.location.city}, {reservation.listing.location.state}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Guest</p>
                        <p className="text-sm text-gray-600">Guest ID: {reservation.guest_id.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Event Date</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(reservation.start_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Amount</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${reservation.total_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {reservation.special_requests && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Special Requests</p>
                        <p className="text-sm text-gray-600 mt-1">{reservation.special_requests}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                    
                    {reservation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    )}

                    {reservation.status === 'confirmed' && new Date(reservation.start_date) < new Date() && (
                      <Button
                        size="sm"
                        onClick={() => updateReservationStatus(reservation.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                  <span>Booking made: {new Date(reservation.created_date).toLocaleDateString()}</span>
                  <span>Your earnings: ${reservation.host_payout?.toFixed(2) || (reservation.total_amount * 0.9).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}