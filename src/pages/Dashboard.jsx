
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    User as UserIcon, 
    Home, 
    Calendar, 
    CreditCard, 
    Settings,
    BarChart
} from 'lucide-react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardListings from '../components/dashboard/DashboardListings';
import DashboardReservations from '../components/dashboard/DashboardReservations';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import DashboardPayout from '../components/dashboard/DashboardPayout';
import DashboardSettings from '../components/dashboard/DashboardSettings';
import DashboardFavorites from '../components/dashboard/DashboardFavorites';

const getDisplayName = (user) => {
  if (!user) return "Guest";
  if (user.first_name) {
    return user.first_name;
  }
  if (user.full_name) {
    return user.full_name.split(' ')[0];
  }
  return "User";
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [userListings, setUserListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                // Load user's listings with error handling
                try {
                    const listings = await Listing.filter({ host_id: currentUser.id });
                    setUserListings(Array.isArray(listings) ? listings : []);
                } catch (listingError) {
                    console.error('Error loading listings:', listingError);
                    setUserListings([]);
                }
                
                setIsLoading(false);

                // Handle URL parameters for direct actions (like from email links)
                const urlParams = new URLSearchParams(window.location.search);
                const tab = urlParams.get('tab');
                const action = urlParams.get('action');
                const reservationId = urlParams.get('id');

                if (tab) {
                    setActiveTab(tab);
                }

                // Handle reservation actions from email links
                if (action && reservationId && (action === 'approve' || action === 'reject')) {
                    // Set the tab to reservations and let the reservation component handle the action
                    setActiveTab('reservations');
                    
                    // Store the action in sessionStorage so the reservation component can pick it up
                    sessionStorage.setItem('pendingReservationAction', JSON.stringify({
                        action,
                        reservationId
                    }));
                }
                
            } catch (error) {
                console.error('Error loading user:', error);
                navigate(createPageUrl("Home"));
            }
        };
        checkUser();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-gray-600">Please log in to view your dashboard.</p>
            </div>
        );
    }

    const isOwner = Array.isArray(userListings) && userListings.length > 0;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'listings', label: isOwner ? 'Listings' : 'Manage Listings', icon: Home },
        { id: 'reservations', label: isOwner ? 'Reservations' : 'My Reservations', icon: UserIcon },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        ...(isOwner ? [
            { id: 'payouts', label: 'Payouts', icon: CreditCard },
        ] : []),
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    
    // The previous block that manipulated navItems for non-owners is no longer needed
    // as the 'listings' label logic is now directly in the navItems array definition.

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview user={user} userListings={userListings || []} isOwner={isOwner} />;
            case 'listings':
                return <DashboardListings user={user} userListings={userListings || []} isOwner={isOwner} />;
            case 'reservations':
                return <DashboardReservations user={user} isOwner={isOwner} />;
            case 'favorites': // This case is preserved even if 'Favorites' is not in navItems anymore
                return <DashboardFavorites user={user} />;
            case 'calendar':
                return <DashboardCalendar user={user} userListings={userListings || []} isOwner={isOwner} />;
            case 'payouts':
                return isOwner ? <DashboardPayout user={user} /> : (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Payouts are only available for hosts with active listings.</p>
                    </div>
                );
            case 'settings':
                return <DashboardSettings user={user} setUser={setUser} />;
            default:
                return <DashboardOverview user={user} userListings={userListings || []} isOwner={isOwner} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome back, {getDisplayName(user)}</p>
                </div>

                {/* Secondary Navigation */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6 overflow-x-auto">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                        activeTab === item.id
                                            ? 'border-red-500 text-red-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-2" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white shadow rounded-lg">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
