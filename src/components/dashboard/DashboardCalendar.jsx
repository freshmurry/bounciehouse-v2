
import React, { useState, useEffect } from 'react';
import { SpecialPricing } from '@/api/entities';
import { Reservation } from '@/api/entities';
import { User } from '@/api/entities';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, DollarSign, X } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DashboardCalendar({ user, userListings = [], isOwner }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedListing, setSelectedListing] = useState('');
    const [specialPricing, setSpecialPricing] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [guests, setGuests] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ price: '', available: true, endDate: '' });

    useEffect(() => {
        if (Array.isArray(userListings) && userListings.length > 0 && !selectedListing) {
            setSelectedListing(userListings[0].id);
        }
    }, [userListings, selectedListing]);

    useEffect(() => {
        if (selectedListing && isOwner) {
            loadCalendarData();
        } else if (!isOwner && user) {
            loadGuestReservations();
        }
    }, [selectedListing, currentDate, isOwner, user]);

    const loadCalendarData = async () => {
        if (!selectedListing) return;
        
        try {
            const [pricing, bookings] = await Promise.all([
                SpecialPricing.filter({ listing_id: selectedListing }),
                Reservation.filter({ listing_id: selectedListing })
            ]);
            
            const bookingData = Array.isArray(bookings) ? bookings : [];
            setSpecialPricing(Array.isArray(pricing) ? pricing : []);
            setReservations(bookingData);

            if (bookingData.length > 0) {
                const guestIds = [...new Set(bookingData.map(b => b.guest_id).filter(id => id))];
                const guestDataMap = {};
                
                for (const guestId of guestIds) {
                    try {
                        const guestResults = await User.filter({ id: guestId });
                        if (guestResults && guestResults.length > 0) {
                            guestDataMap[guestId] = guestResults[0];
                        }
                    } catch (error) {
                        console.error(`Error loading guest ${guestId}:`, error);
                    }
                }
                
                setGuests(guestDataMap);
            } else {
                setGuests({});
            }

        } catch (error) {
            console.error('Error loading calendar data:', error);
            setSpecialPricing([]);
            setReservations([]);
            setGuests({});
        }
    };

    const loadGuestReservations = async () => {
        if (!user?.id) return;
        
        try {
            const guestReservations = await Reservation.filter({ guest_id: user.id });
            setReservations(Array.isArray(guestReservations) ? guestReservations : []);
        } catch (error) {
            console.error('Error loading guest reservations:', error);
            setReservations([]);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = Array(startingDayOfWeek).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const getDateData = (day) => {
        if (!day) return {};
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const pricing = specialPricing.find(p => p.date === dateStr);
        
        const validStatuses = ['pending', 'confirmed', 'completed'];
        const reservation = reservations.find(r => 
            r.start_date && 
            r.start_date.split('T')[0] === dateStr &&
            validStatuses.includes(r.status)
        );
        
        return { pricing, reservation, dateStr };
    };

    const handleDateClick = (day) => {
        if (!day || !isOwner || !selectedListing) return;
        
        const { pricing, dateStr } = getDateData(day);
        setSelectedDate(dateStr);
        setModalData({
            price: pricing?.price_per_day?.toString() || '',
            available: pricing ? pricing.is_available : true,
            endDate: ''
        });
        setShowModal(true);
    };

    const saveDateSettings = async () => {
        if (!selectedListing || !selectedDate) return;

        const startDate = new Date(selectedDate + 'T00:00:00Z');
        const endDate = modalData.endDate ? new Date(modalData.endDate + 'T00:00:00Z') : startDate;

        if (startDate > endDate) {
            alert('End date must be on or after the start date.');
            return;
        }

        const datesToUpdate = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            datesToUpdate.push(d.toISOString().split('T')[0]);
        }

        try {
            for (const dateStr of datesToUpdate) {
                const existingPricing = specialPricing.find(p => p.date === dateStr);
                
                const payload = {
                    listing_id: selectedListing,
                    date: dateStr,
                    price_per_day: modalData.price ? parseFloat(modalData.price) : null,
                    is_available: modalData.available
                };

                if (existingPricing) {
                    await SpecialPricing.update(existingPricing.id, payload);
                } else {
                    await SpecialPricing.create(payload);
                }
            }
            
            setShowModal(false);
            loadCalendarData();
        } catch (error) {
            console.error('Error saving date settings:', error);
            alert('Failed to save settings');
        }
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const days = getDaysInMonth(currentDate);
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    {isOwner ? 'Calendar & Pricing' : 'My Calendar'}
                </h2>
                <p className="mt-1 text-gray-600">
                    {isOwner ? 'Manage availability and set special pricing' : 'View your upcoming reservations'}
                </p>
            </div>

            {isOwner && Array.isArray(userListings) && userListings.length > 1 && (
                <div className="mb-6">
                    <Label htmlFor="listing-select">Select Listing</Label>
                    <Select value={selectedListing} onValueChange={setSelectedListing}>
                        <SelectTrigger className="w-72">
                            <SelectValue placeholder="Choose a listing" />
                        </SelectTrigger>
                        <SelectContent>
                            {userListings.map(listing => (
                                <SelectItem key={listing.id} value={listing.id}>
                                    {listing.title || 'Untitled Listing'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {isOwner && (!Array.isArray(userListings) || userListings.length === 0) && (
                <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-6">You need to create a listing first to manage your calendar.</p>
                    <Button
                        onClick={() => window.location.href = createPageUrl('CreateListing')}
                        className="bg-airbnb-red hover:bg-airbnb-red-dark"
                    >
                        Create Your First Listing
                    </Button>
                </div>
            )}

            {(!isOwner || (isOwner && Array.isArray(userListings) && userListings.length > 0)) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">{monthYear}</h3>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            const { pricing, reservation } = getDateData(day);
                            const hasSpecialPrice = pricing?.price_per_day != null;
                            const isUnavailable = pricing?.is_available === false;
                            const guest = reservation ? guests[reservation.guest_id] : null;

                            return (
                                <div
                                    key={index}
                                    className={`min-h-[100px] p-2 border border-gray-100 relative ${
                                        day && isOwner && selectedListing ? 'hover:bg-gray-50 cursor-pointer' : ''
                                    } ${isUnavailable ? 'bg-red-50 text-gray-400 line-through' : ''} ${reservation ? 'bg-green-50' : ''}`}
                                    onClick={() => handleDateClick(day)}
                                >
                                    {day && (
                                        <>
                                            <span className={`text-sm font-medium ${isUnavailable ? 'text-red-500' : 'text-gray-900'}`}>{day}</span>
                                            {guest && (
                                                <div className="absolute top-1 right-1">
                                                    <UserAvatar user={guest} size="xs" />
                                                </div>
                                            )}
                                            {hasSpecialPrice && !isUnavailable && (
                                                <div className="mt-1 text-xs bg-blue-100 text-blue-800 px-1 rounded-full w-fit mx-auto">
                                                    ${pricing.price_per_day}
                                                </div>
                                            )}
                                            {isUnavailable && (
                                                <div className="mt-1 text-xs bg-red-100 text-red-800 px-1 rounded-full w-fit mx-auto">
                                                    Unavailable
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Date Settings Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Date Settings</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <Label>Date: {selectedDate ? new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''}</Label>
                            </div>
                            <div>
                                <Label htmlFor="end-date">End Date (for range)</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={modalData.endDate}
                                    onChange={(e) => setModalData({...modalData, endDate: e.target.value})}
                                    min={selectedDate}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={modalData.available}
                                    onChange={(e) => setModalData({...modalData, available: e.target.checked})}
                                />
                                <Label htmlFor="available">Available for booking</Label>
                            </div>
                            
                            {modalData.available && (
                                <div>
                                    <Label htmlFor="special-price">Special Price ($)</Label>
                                    <div className="flex items-center mt-1">
                                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                                        <Input
                                            id="special-price"
                                            type="number"
                                            placeholder="Default"
                                            value={modalData.price}
                                            onChange={(e) => setModalData({...modalData, price: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={saveDateSettings} className="bg-airbnb-red hover:bg-airbnb-red-dark">Save Settings</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
