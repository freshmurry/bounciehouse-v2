import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Reservation } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { CreditCard, Calendar, Clock, Users, Shield, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/api/functions';

export default function PaymentPage() {
    const [reservation, setReservation] = useState(null);
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservationDetails = async () => {
            const params = new URLSearchParams(location.search);
            const reservationId = params.get('reservation_id');

            if (!reservationId) {
                setError("No reservation ID provided.");
                setIsLoading(false);
                return;
            }

            try {
                const resData = await Reservation.get(reservationId);
                if (resData.status !== 'awaiting_payment') {
                    setError(`This reservation is not awaiting payment. Its status is: ${resData.status}.`);
                    navigate(createPageUrl('Dashboard?tab=reservations'));
                    return;
                }
                setReservation(resData);
                
                const listingData = await Listing.get(resData.listing_id);
                setListing(listingData);

            } catch (err) {
                console.error("Error fetching payment details:", err);
                setError("Could not load booking details. It may have expired or been cancelled.");
            }
            setIsLoading(false);
        };

        fetchReservationDetails();
    }, [location.search, navigate]);

    const handlePayment = async () => {
        if (!reservation) return;
        
        setIsProcessing(true);
        setError(null);
        
        try {
            const { data } = await createCheckoutSession({
                reservation_id: reservation.id,
                success_url: `${window.location.origin}${createPageUrl(`PaymentSuccess`)}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: window.location.href,
            });

            if (data && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                throw new Error("Could not create a payment session.");
            }
        } catch (err) {
            console.error("Payment initiation failed:", err);
            setError("Could not initiate payment. The host's payment account may not be fully set up. Please try again later or contact support.");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-airbnb-red" />
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
                    <p className="text-gray-700">{error}</p>
                    <Button onClick={() => navigate(createPageUrl('Home'))} className="mt-6">Go to Homepage</Button>
                </div>
            </div>
        );
    }

    if (!reservation || !listing) {
        return <div className="text-center p-8">Booking details not found.</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left side: Listing details */}
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-6">Confirm and Pay</h1>
                    <div className="flex items-center space-x-4 mb-6">
                        <img src={listing.images?.[0]} alt={listing.title} className="w-24 h-24 object-cover rounded-lg"/>
                        <div>
                            <p className="text-gray-500">You're booking:</p>
                            <h2 className="text-2xl font-semibold">{listing.title}</h2>
                            <p className="text-sm text-gray-600">{listing.location.city}, {listing.location.state}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 text-gray-700 border-t border-b py-6">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500"/> Event Date</span>
                            <span className="font-medium">{new Date(reservation.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500"/> Event Time</span>
                            <span className="font-medium">{new Date(reservation.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center"><Users className="w-4 h-4 mr-2 text-gray-500"/> Capacity</span>
                            <span className="font-medium">Up to {listing.capacity} kids</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-2">Price details</h3>
                        <div className="flex justify-between text-gray-800">
                            <span>Total rental fee</span>
                            <span>${reservation.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                            <span>Total (USD)</span>
                            <span>${reservation.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Payment form */}
                <div className="bg-gray-50 p-8 flex flex-col justify-center">
                    <h3 className="text-xl font-semibold mb-6">Pay with Card</h3>
                    
                    <Button 
                        onClick={handlePayment} 
                        disabled={isProcessing}
                        size="lg"
                        className="w-full bg-airbnb-red hover:bg-airbnb-red-dark text-lg py-6"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-6 h-6 animate-spin mr-2"/>
                        ) : (
                            <CreditCard className="w-6 h-6 mr-2"/>
                        )}
                        {isProcessing ? 'Processing...' : 'Proceed to Secure Payment'}
                    </Button>
                    
                    <div className="text-center mt-4 text-sm text-gray-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-1 text-green-600"/>
                        <span>Payments are secure and encrypted by Stripe.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}