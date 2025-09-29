
import React, { useState, useEffect, useCallback } from 'react';
import { Reservation } from '@/api/entities';
import { Listing } from '@/api/entities';
import { User } from '@/api/entities';
import { Calendar, Clock, MapPin, User as UserIcon, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createNotification } from '@/api/functions';
import { sendTemplatedEmail } from '@/api/functions'; // New import

export default function DashboardReservations({ user, isOwner }) {
    const [reservations, setReservations] = useState([]);
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [processingReservation, setProcessingReservation] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

    const loadReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            let reservationData = [];
            
            if (isOwner) {
                // Host: Get reservations for their listings
                reservationData = await Reservation.filter({ host_id: user.id }, '-created_date', 100);
            } else {
                // Guest: Get their own reservations
                reservationData = await Reservation.filter({ guest_id: user.id }, '-created_date', 100);
            }

            console.log('Loaded reservations:', reservationData); // Debug log

            setReservations(reservationData);

            // Load related listings and users
            const listingIds = [...new Set(reservationData.map(r => r.listing_id))];
            const userIds = [...new Set([
                ...reservationData.map(r => r.guest_id),
                ...reservationData.map(r => r.host_id)
            ])];

            // Load listings
            if (listingIds.length > 0) {
                const listingPromises = listingIds.map(id => 
                    Listing.get(id).catch((error) => {
                        console.error(`Failed to load listing ${id}:`, error);
                        return { id, title: 'Unknown Listing' };
                    })
                );
                const listingResults = await Promise.all(listingPromises);
                const listingMap = {};
                listingResults.forEach(listing => {
                    listingMap[listing.id] = listing;
                });
                setListings(listingMap);
            }

            // Load users
            if (userIds.length > 0) {
                const userPromises = userIds.map(id => 
                    User.get(id).catch((error) => {
                        console.error(`Failed to load user ${id}:`, error);
                        return { id, first_name: 'Unknown', last_name: 'User', email: '' };
                    })
                );
                const userResults = await Promise.all(userPromises);
                const userMap = {};
                userResults.forEach(userData => {
                    userMap[userData.id] = userData;
                });
                setUsers(userMap);
            }
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
        setIsLoading(false);
    }, [user, isOwner]);

    useEffect(() => {
        if (user) {
            loadReservations();
            // Set up real-time polling every 30 seconds
            const interval = setInterval(loadReservations, 30000);
            return () => clearInterval(interval);
        }
    }, [loadReservations, user]);

    const handleReservationAction = async (reservation, action) => {
        setProcessingReservation(reservation.id);
        try {
            if (action === 'approve') {
                const response = await fetch(`/functions/approveReservation?id=${reservation.id}`, { 
                    method: 'POST' 
                });
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to approve reservation');
                }
            } else { // action === 'reject'
                const response = await fetch(`/functions/rejectReservation?id=${reservation.id}`, { 
                    method: 'POST' 
                });
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to reject reservation');
                }
            }

            // Reload reservations to show updated status
            await loadReservations();
            
        } catch (error) {
            console.error('Error processing reservation:', error);
            alert(`Failed to ${action} reservation: ${error.message}`);
        }
        setProcessingReservation(null);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
            awaiting_payment: { label: 'Awaiting Payment', className: 'bg-blue-100 text-blue-800' },
            confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
            cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
            completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
            expired: { label: 'Expired', className: 'bg-gray-100 text-gray-800' }
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const filterReservationsByTab = (tab) => {
        console.log(`Filtering reservations for tab: ${tab}`, reservations); // Debug log
        
        switch (tab) {
            case 'pending':
                return reservations.filter(r => r.status === 'pending');
            case 'approved':
                return reservations.filter(r => ['awaiting_payment', 'confirmed'].includes(r.status));
            case 'rejected':
                return reservations.filter(r => ['cancelled', 'expired'].includes(r.status));
            default:
                return reservations;
        }
    };

    const ReservationCard = ({ reservation }) => {
        const listing = listings[reservation.listing_id] || { title: 'Unknown Listing' };
        const otherUser = isOwner ? users[reservation.guest_id] : users[reservation.host_id];
        const otherUserName = otherUser ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || otherUser.email : 'Unknown User';

        return (
            <Card key={reservation.id} className="mb-4">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="text-lg">{listing.title}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <div className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    <span>{isOwner ? 'Guest' : 'Host'}: {otherUserName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(reservation.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(reservation.start_date).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit', 
                                        hour12: true 
                                    })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(reservation.status)}
                            <p className="text-lg font-semibold mt-2">
                                ${(reservation.total_amount || 0).toFixed(2)}
                            </p>
                            {isOwner && (
                                <p className="text-sm text-green-600">
                                    Your payout: ${(reservation.host_payout || 0).toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {otherUser && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{otherUser.email}</span>
                            </div>
                            {otherUser.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{otherUser.phone}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {reservation.special_requests && (
                        <div className="mb-4">
                            <h4 className="font-medium text-sm text-gray-700 mb-1">Special Requests:</h4>
                            <p className="text-sm text-gray-600">{reservation.special_requests}</p>
                        </div>
                    )}

                    {isOwner && reservation.status === 'pending' && (
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleReservationAction(reservation, 'approve')}
                                disabled={processingReservation === reservation.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {processingReservation === reservation.id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                                onClick={() => handleReservationAction(reservation, 'reject')}
                                disabled={processingReservation === reservation.id}
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                {processingReservation === reservation.id ? 'Processing...' : 'Decline'}
                            </Button>
                        </div>
                    )}

                    {!isOwner && reservation.status === 'awaiting_payment' && (
                        <Button
                            onClick={() => window.open(`/Payment?reservation=${reservation.id}`, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Complete Payment
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    const pendingCount = reservations.filter(r => r.status === 'pending').length;
    const approvedCount = reservations.filter(r => ['awaiting_payment', 'confirmed'].includes(r.status)).length;
    const rejectedCount = reservations.filter(r => ['cancelled', 'expired'].includes(r.status)).length;

    console.log('Reservation counts:', { pendingCount, approvedCount, rejectedCount }); // Debug log

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    {isOwner ? 'Reservation Requests' : 'My Reservations'}
                </h1>
                <Button onClick={loadReservations} variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        Pending
                        {pendingCount > 0 && (
                            <Badge className="bg-yellow-500 text-white">{pendingCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center gap-2">
                        Approved
                        {approvedCount > 0 && (
                            <Badge className="bg-green-500 text-white">{approvedCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                        Declined
                        {rejectedCount > 0 && (
                            <Badge className="bg-red-500 text-white">{rejectedCount}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {filterReservationsByTab('pending').length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reservations</h3>
                            <p className="text-gray-600">
                                {isOwner ? 'New booking requests will appear here.' : 'Your pending requests will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {filterReservationsByTab('pending').map(reservation => (
                                <ReservationCard key={reservation.id} reservation={reservation} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="approved" className="mt-6">
                    {filterReservationsByTab('approved').length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No approved reservations</h3>
                            <p className="text-gray-600">Approved reservations will appear here.</p>
                        </div>
                    ) : (
                        <div>
                            {filterReservationsByTab('approved').map(reservation => (
                                <ReservationCard key={reservation.id} reservation={reservation} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    {filterReservationsByTab('rejected').length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No declined reservations</h3>
                            <p className="text-gray-600">Declined reservations will appear here.</p>
                        </div>
                    ) : (
                        <div>
                            {filterReservationsByTab('rejected').map(reservation => (
                                <ReservationCard key={reservation.id} reservation={reservation} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
