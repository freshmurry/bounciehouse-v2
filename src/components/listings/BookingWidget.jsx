
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Reservation } from '@/api/entities';
// UI components removed because they are unused in this widget
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { createNotification } from '@/api/functions';
import { sendTemplatedEmail } from '@/api/functions';
import { Calendar } from 'lucide-react';

export default function BookingWidget({ listing }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [hostUser, setHostUser] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '', // Changed to string for input type="date"
    time: '09:00',
    duration: listing.pricing_model === 'daily' ? 1 : 4,
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        console.log('User loaded successfully:', user.id);
      } catch (error) {
        console.error('Error loading current user:', error);
        setCurrentUser(null);
        
        if (error.response?.status === 403 || error.message?.includes('403')) {
          console.log('User authentication may have expired');
        }
      }
    };

    const loadHostUser = async () => {
      if (!listing.host_id) return;
      
      try {
        const host = await User.get(listing.host_id);
        setHostUser(host);
        console.log('Host user loaded:', host.email);
      } catch (error) {
        console.error('Error loading host user:', error);
        setHostUser(null);
      }
    };

    loadUser();
    loadHostUser();
  }, [listing.host_id]);

  const calculateTotals = () => {
    if (!bookingData.duration || bookingData.duration <= 0) {
      return { unitPrice: 0, subtotal: 0, serviceFee: 0, total: 0 };
    }

    const unitPrice = listing.pricing_model === "daily" 
      ? (listing.price_per_day || 0) 
      : (listing.price_per_hour || 0);
    
    const subtotal = unitPrice * bookingData.duration; // Price for the selected duration
    const serviceFee = subtotal * 0.1; // 10% service fee
    const total = subtotal + serviceFee;

    return {
      unitPrice, // Price per day/hour
      subtotal,  // Price for duration before service fee
      serviceFee,
      total,
    };
  };

  const calculatedTotals = calculateTotals();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      await User.loginWithRedirect(window.location.href);
      return;
    }

    if (!bookingData.date) {
      alert('Please select a date');
      return;
    }

    if (!bookingData.duration || bookingData.duration <= 0) {
      alert('Please select a valid duration');
      return;
    }

    // Validate pricing calculation
    if (calculatedTotals.total <= 0) {
      alert('Unable to calculate pricing. Please contact the host.');
      return;
    }

    const selectedDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert('Please select a future date');
      return;
    }

    setIsSubmitting(true);
    let reservationCreated = false;
    let reservation = null;

    try {
      const startDateTime = new Date(bookingData.date);
      startDateTime.setHours(parseInt(bookingData.time.split(':')[0]), parseInt(bookingData.time.split(':')[1]), 0, 0);
      
      const endDateTime = new Date(startDateTime);

      if (listing.pricing_model === 'daily') {
        endDateTime.setDate(endDateTime.getDate() + bookingData.duration);
      } else {
        endDateTime.setHours(endDateTime.getHours() + bookingData.duration);
      }
      
      // Create reservation first - this is the most critical part
      const reservationData = {
        listing_id: listing.id,
        guest_id: currentUser.id,
        host_id: listing.host_id,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        total_amount: calculatedTotals.total,
        service_fee: calculatedTotals.serviceFee,
        host_payout: calculatedTotals.total - calculatedTotals.serviceFee,
        non_refundable_amount: calculatedTotals.serviceFee,
        refundable_amount: calculatedTotals.total - calculatedTotals.serviceFee,
        special_requests: bookingData.specialRequests || '',
        status: 'pending' // Explicitly set status to pending
      };

      console.log('Creating reservation with data:', reservationData);

      reservation = await Reservation.create(reservationData);
      reservationCreated = true;

      console.log('Reservation created successfully:', reservation.id);

      // Now try to send notifications - but don't fail the whole process if this fails
      let notificationErrors = [];

      // Send email notification only if we have the host user loaded
      if (hostUser && hostUser.email) {
        try {
          const guestFullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email;
          const eventDateFormatted = new Date(startDateTime).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          });

          await sendTemplatedEmail({
            templateType: 'booking_request_host',
            recipientEmail: hostUser.email, // Use the actual host email
            recipientName: hostUser.first_name || hostUser.full_name || 'Host',
            templateData: {
              subject: `New Booking Request for ${listing.title}`,
              listingTitle: listing.title,
              guestName: guestFullName,
              eventDate: eventDateFormatted,
              eventTime: bookingData.time,
              duration: `${bookingData.duration} ${listing.pricing_model === 'daily' ? 'day(s)' : 'hour(s)'}`,
              totalAmount: calculatedTotals.total.toFixed(2),
              hostPayout: (calculatedTotals.total - calculatedTotals.serviceFee).toFixed(2),
              specialRequests: bookingData.specialRequests || 'None',
              approveUrl: `${window.location.origin}/Dashboard?tab=reservations&action=approve&id=${reservation.id}`,
              rejectUrl: `${window.location.origin}/Dashboard?tab=reservations&action=reject&id=${reservation.id}`,
              baseUrl: window.location.origin
            }
          });
          console.log('Templated email sent successfully to:', hostUser.email);
        } catch (emailError) {
          console.error('Failed to send templated email:', emailError);
          notificationErrors.push('Email notification failed');
        }
      } else {
        console.warn('Host user not loaded or has no email, skipping email notification');
        notificationErrors.push('Host email not available');
      }

      // Try to send in-app notification
      try {
        await createNotification({
          user_id: listing.host_id,
          type: 'reservation_request',
          title: 'New Booking Request',
          message: `${currentUser.first_name || 'A guest'} wants to book "${listing.title}" on ${new Date(startDateTime).toLocaleDateString()}`,
          related_id: reservation.id,
          action_url: '/Dashboard?tab=reservations',
          sender_id: currentUser.id
        });
        console.log('Host in-app notification created successfully');
      } catch (notificationError) {
        console.error('Failed to create in-app notification:', notificationError);
        notificationErrors.push('In-app notification failed');
      }

      // Show appropriate success message based on notification results
      if (notificationErrors.length === 0) {
        alert('Booking request sent successfully! The host will be notified and you\'ll receive an update once they respond.');
      } else {
        console.warn('Some notifications failed:', notificationErrors);
        if (notificationErrors.includes('Host email not available')) {
          alert('Booking request created successfully! The host will see your request in their dashboard.');
        } else {
          alert('Booking request created successfully! However, we had trouble sending some notifications. The host will still see your request in their dashboard.');
        }
      }

      // Force a small delay to ensure the reservation is fully saved
      setTimeout(() => {
        navigate(createPageUrl('Dashboard?tab=reservations'));
      }, 1000);

    } catch (error) {
      console.error('Error in booking process:', error);
      
      if (reservationCreated && reservation) {
        // Reservation was created but something else failed
        alert('Your booking request was created, but we encountered some issues with notifications. The host will see your request in their dashboard.');
        setTimeout(() => {
          navigate(createPageUrl('Dashboard?tab=reservations'));
        }, 1000);
      } else {
        // Reservation creation failed
        alert('Unable to process your reservation. Please try again later.');
      }
    }
    setIsSubmitting(false);
  };

  // Don't render the booking widget if pricing is not available (unitPrice is 0 or less)
  if (!calculatedTotals.unitPrice || calculatedTotals.unitPrice <= 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-8">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Not Available</h3>
          <p className="text-gray-600">Please contact the host for pricing information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-8">
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-semibold">${calculatedTotals.unitPrice}</span>
          <span className="text-gray-600">per {listing.pricing_model === 'daily' ? 'day' : 'hour'}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Prices include all fees</p>
      </div>

      <form onSubmit={handleBookingSubmit} className="space-y-4">
        {/* Date Input with Calendar */}
        <div>
          <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <div className="relative">
            <input
              id="booking-date"
              type="date"
              value={bookingData.date || ''}
              onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Time Input */}
        <div>
          <label htmlFor="booking-time" className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <select
            id="booking-time"
            value={bookingData.time}
            onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {Array.from({length: 14}, (_, i) => {
              const hour = i + 8; // Start from 8 AM
              const time24 = `${hour.toString().padStart(2, '0')}:00`;
              const hour12 = hour > 12 ? hour - 12 : hour;
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const time12Formatted = `${hour12}:00 ${ampm}`;
              return (
                <option key={time24} value={time24}>
                  {time12Formatted}
                </option>
              );
            })}
          </select>
        </div>

        {/* Duration Input */}
        <div>
          <label htmlFor="booking-duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration ({listing.pricing_model === 'daily' ? 'Days' : 'Hours'})
          </label>
          <select
            id="booking-duration"
            value={bookingData.duration}
            onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {listing.pricing_model === 'daily' ? 
              Array.from({length: 7}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} day{i + 1 > 1 ? 's' : ''}
                </option>
              )) :
              Array.from({length: 8}, (_, i) => ( // Up to 8 hours for hourly pricing
                <option key={i + 1} value={i + 1}>
                  {i + 1} hour{i + 1 > 1 ? 's' : ''}
                </option>
              ))
            }
          </select>
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="special-requests" className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
          <textarea
            id="special-requests"
            value={bookingData.specialRequests}
            onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
            placeholder="Any special setup requests or event details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-20 resize-none"
          />
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>${calculatedTotals.unitPrice.toFixed(2)} × {bookingData.duration} {listing.pricing_model === 'daily' ? 'day' : 'hour'}{bookingData.duration > 1 ? 's' : ''}</span>
            <span>${calculatedTotals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>${calculatedTotals.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span>${calculatedTotals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !bookingData.date || calculatedTotals.total <= 0}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Processing...' : 'Request to Book'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You won't be charged yet
        </p>
      </form>
    </div>
  );
}
