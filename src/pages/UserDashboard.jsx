import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
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
import DashboardProfile from '../components/dashboard/DashboardProfile';
import DashboardListings from '../components/dashboard/DashboardListings';
import DashboardRevenue from '../components/dashboard/DashboardRevenue';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import DashboardPayout from '../components/dashboard/DashboardPayout';
import DashboardSettings from '../components/dashboard/DashboardSettings';

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

export default function UserDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setIsLoading(false);
            } catch {
                    navigate(createPageUrl("Home"));
                }
        };
        checkUser();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-airbnb-red"></div>
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

    const navItems = [
        { id: 'profile', label: 'Profile', icon: UserIcon },
        { id: 'listings', label: 'Manage Listings', icon: Home },
        { id: 'revenue', label: 'Revenue', icon: BarChart },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'payout', label: 'Payout', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <DashboardProfile user={user} setUser={setUser} />;
            case 'listings':
                return <DashboardListings user={user} />;
            case 'revenue':
                return <DashboardRevenue user={user} />;
            case 'calendar':
                return <DashboardCalendar user={user} />;
            case 'payout':
                return <DashboardPayout user={user} />;
            case 'settings':
                return <DashboardSettings user={user} setUser={setUser} />;
            default:
                return <DashboardProfile user={user} setUser={setUser} />;
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
                                            ? 'border-airbnb-red text-airbnb-red'
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