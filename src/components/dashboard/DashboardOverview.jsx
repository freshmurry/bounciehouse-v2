import React, { useState, useEffect } from 'react';
import { Listing } from '@/api/entities';
import { Reservation } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Home, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function DashboardOverview({ user, userListings = [], isOwner }) {
    const [reservations, setReservations] = useState([]);
    const [stats, setStats] = useState({
        totalListings: 0,
        totalReservations: 0,
        totalRevenue: 0,
        pendingReservations: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadOverviewData();
    }, [user, userListings]);

    const loadOverviewData = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            let allReservations = [];
            
            if (isOwner && Array.isArray(userListings)) {
                // Load reservations for owner's listings
                for (const listing of userListings) {
                    try {
                        const listingReservations = await Reservation.filter({ listing_id: listing.id });
                        allReservations.push(...(Array.isArray(listingReservations) ? listingReservations : []));
                    } catch (error) {
                        console.error('Error loading reservations for listing:', error);
                    }
                }
            } else {
                // Load guest reservations
                try {
                    const guestReservations = await Reservation.filter({ guest_id: user.id });
                    allReservations = Array.isArray(guestReservations) ? guestReservations : [];
                } catch (error) {
                    console.error('Error loading guest reservations:', error);
                }
            }

            setReservations(allReservations);
            
            // Calculate stats
            const totalRevenue = allReservations.reduce((sum, res) => {
                const amount = isOwner ? (res.host_payout || res.total_amount * 0.9) : res.total_amount;
                return sum + (amount || 0);
            }, 0);

            setStats({
                totalListings: Array.isArray(userListings) ? userListings.length : 0,
                totalReservations: allReservations.length,
                totalRevenue,
                pendingReservations: allReservations.filter(r => r.status === 'pending').length
            });

        } catch (error) {
            console.error('Error loading overview data:', error);
        }
        setIsLoading(false);
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-lg mr-4`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.first_name || user?.full_name?.split(' ')[0] || 'User'}!
                    </h2>
                    <p className="mt-1 text-gray-600">
                        Here's what's happening with your {isOwner ? 'bounce house business' : 'bookings'}
                    </p>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => navigate(createPageUrl('CreateListing'))}
                        className="bg-airbnb-red hover:bg-airbnb-red-dark"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Listing
                    </Button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={Home} 
                    title={isOwner ? "Active Listings" : "Total Bookings"}
                    value={isOwner ? stats.totalListings : stats.totalReservations}
                    color="blue"
                />
                <StatCard 
                    icon={Calendar} 
                    title={isOwner ? "Total Bookings" : "Upcoming Events"}
                    value={isOwner ? stats.totalReservations : reservations.filter(r => new Date(r.start_date) > new Date()).length}
                    color="green"
                />
                <StatCard 
                    icon={DollarSign} 
                    title={isOwner ? "Total Earnings" : "Total Spent"}
                    value={`$${stats.totalRevenue.toFixed(2)}`}
                    color="yellow"
                />
                <StatCard 
                    icon={TrendingUp} 
                    title="Pending"
                    value={stats.pendingReservations}
                    subtitle={isOwner ? "Awaiting your approval" : "Awaiting confirmation"}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            {!isOwner && stats.totalListings === 0 && (
                <div className="bg-gradient-to-r from-airbnb-red to-pink-600 rounded-xl p-8 text-white mb-8">
                    <div className="max-w-2xl">
                        <h3 className="text-2xl font-bold mb-4">Start Earning with Your Bounce House</h3>
                        <p className="text-lg opacity-90 mb-6">
                            List your bounce house and start earning money by renting it out to families in your area.
                        </p>
                        <Button
                            onClick={() => navigate(createPageUrl('CreateListing'))}
                            variant="secondary"
                            size="lg"
                            className="bg-white text-airbnb-red hover:bg-gray-100"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            List Your Bounce House
                        </Button>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {reservations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>{isOwner ? "No bookings yet" : "No reservations yet"}</p>
                        <p className="text-sm">
                            {isOwner 
                                ? "Once customers start booking, they'll appear here"
                                : "Your booked bounce houses will appear here"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reservations.slice(-5).reverse().map((reservation) => (
                            <div key={reservation.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium">
                                        {isOwner ? 'New booking received' : 'Booking confirmed'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(reservation.start_date).toLocaleDateString()} • ${reservation.total_amount?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    reservation.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-800'
                                        : reservation.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {reservation.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}