
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Reservation } from '@/api/entities';
import { Listing } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { DollarSign, Users, Home, Calendar, BarChart, AlertTriangle, CreditCard, MessageSquare, Settings } from 'lucide-react';
import StatCard from '../components/admin/StatCard';
import RevenueChart from '../components/admin/RevenueChart';
import RecentReservationsTable from '../components/admin/RecentReservationsTable';
import SystemTestPanel from '../components/admin/SystemTestPanel';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ revenue: 0, newUsers: 0, newListings: 0, totalReservations: 0 });
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser.role !== 'admin') {
                    navigate(createPageUrl("Home"));
                } else {
                    loadData();
                }
            } catch (error) {
                console.error("Admin check failed:", error);
                navigate(createPageUrl("Home"));
            }
        };
        checkAdmin();
    }, [navigate]);

    const loadData = async () => {
        setIsLoading(true);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        try {
            const recentReservations = await Reservation.filter({ created_date: { $gte: sevenDaysAgo } });
            const weeklyRevenue = recentReservations.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
            
            const newUsers = await User.filter({ created_date: { $gte: sevenDaysAgo } });
            const newListings = await Listing.filter({ created_date: { $gte: sevenDaysAgo } });
            const allReservations = await Reservation.list();

            setStats({
                revenue: weeklyRevenue,
                newUsers: newUsers.length,
                newListings: newListings.length,
                totalReservations: allReservations.length
            });
            // Display only the 5 most recent reservations for the table
            setReservations(allReservations.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            // Optionally set error state to display to user
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="text-center py-20">
                <AlertTriangle size={64} className="mx-auto mb-4 text-orange-500"/>
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-gray-600">You must be an administrator to view this page.</p>
            </div>
        );
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'listings', label: 'Listings', icon: Home },
        { id: 'reservations', label: 'Reservations', icon: Calendar },
        { id: 'payments', label: 'Payment Audit', icon: CreditCard },
        { id: 'support', label: 'Support Tickets', icon: MessageSquare },
        { id: 'testing', label: 'System Testing', icon: Settings },
    ];
    
    const renderOverview = () => (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={DollarSign} title="Weekly Revenue" value={`$${stats.revenue.toFixed(2)}`} isLoading={isLoading} />
                <StatCard icon={Users} title="New Signups (7d)" value={stats.newUsers} isLoading={isLoading} />
                <StatCard icon={Home} title="New Listings (7d)" value={stats.newListings} isLoading={isLoading} />
                <StatCard icon={Calendar} title="Total Reservations" value={stats.totalReservations} isLoading={isLoading} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RevenueChart />
                <RecentReservationsTable reservations={reservations} isLoading={isLoading} />
            </div>
        </div>
    );

    const renderUsers = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <p className="text-gray-600">Manage user accounts and permissions</p>
            {/* Users table would go here */}
        </div>
    );

    const renderListings = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Listings Management</h2>
            <p className="text-gray-600">Review and manage bounce house listings</p>
            {/* Listings table would go here */}
        </div>
    );

    const renderReservations = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Reservations</h2>
            <p className="text-gray-600">View all platform reservations</p>
            {/* Reservations table would go here */}
        </div>
    );

    const renderRevenue = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Revenue Analytics</h2>
            <p className="text-gray-600">Detailed revenue breakdown and analytics</p>
            {/* Revenue analytics would go here */}
        </div>
    );

    const renderPayments = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Payment Audit</h2>
            <p className="text-gray-600">Review and reconcile platform payments</p>
            {/* Payment audit content would go here */}
        </div>
    );

    const renderSupport = () => (
        <div>
            <h2 className="text-2xl font-bold mb-4">Support Tickets</h2>
            <p className="text-gray-600">Manage customer support inquiries and tickets</p>
            {/* Support ticket management would go here */}
        </div>
    );

    const renderTesting = () => (
        <SystemTestPanel />
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'users':
                return renderUsers();
            case 'listings':
                return renderListings();
            case 'reservations':
                return renderReservations();
            case 'revenue':
                return renderRevenue();
            case 'payments':
                return renderPayments();
            case 'support':
                return renderSupport();
            case 'testing':
                return renderTesting();
            default:
                return renderOverview(); // Fallback to overview
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">Manage your BouncieHouse platform</p>
                </div>

                {/* Secondary Navigation */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
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
                <div className="bg-white shadow rounded-lg p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
