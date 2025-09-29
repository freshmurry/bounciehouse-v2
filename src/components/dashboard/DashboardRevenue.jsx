import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardRevenue() {
    const [revenueData, setRevenueData] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        completedBookings: 0,
        chartData: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRevenueData();
    }, []);

    const loadRevenueData = async () => {
        setIsLoading(true);
        try {
            // Mock data - in a real app, this would come from actual reservations
            const mockData = {
                totalEarnings: 12450.00,
                monthlyEarnings: 2340.00,
                pendingPayouts: 540.00,
                completedBookings: 28,
                chartData: [
                    { month: 'Jan', revenue: 1200, bookings: 4 },
                    { month: 'Feb', revenue: 1800, bookings: 6 },
                    { month: 'Mar', revenue: 2100, bookings: 7 },
                    { month: 'Apr', revenue: 1600, bookings: 5 },
                    { month: 'May', revenue: 2340, bookings: 8 },
                    { month: 'Jun', revenue: 2800, bookings: 9 },
                ]
            };
            setRevenueData(mockData);
        } catch (error) {
            console.error('Error loading revenue data:', error);
        }
        setIsLoading(false);
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 bg-${color}-100 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Revenue</h2>
                <p className="mt-1 text-gray-600">Track your earnings and financial performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={DollarSign}
                    title="Total Earnings"
                    value={`$${revenueData.totalEarnings.toLocaleString()}`}
                    subtitle="All time"
                    color="green"
                />
                <StatCard
                    icon={TrendingUp}
                    title="This Month"
                    value={`$${revenueData.monthlyEarnings.toLocaleString()}`}
                    subtitle="+15% from last month"
                    color="blue"
                />
                <StatCard
                    icon={CreditCard}
                    title="Pending Payouts"
                    value={`$${revenueData.pendingPayouts.toLocaleString()}`}
                    subtitle="Next payout: Dec 15"
                    color="orange"
                />
                <StatCard
                    icon={Calendar}
                    title="Completed Bookings"
                    value={revenueData.completedBookings}
                    subtitle="This year"
                    color="purple"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold mb-6">Revenue Over Time</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [`$${value}`, name === 'revenue' ? 'Revenue' : 'Bookings']} />
                            <Line type="monotone" dataKey="revenue" stroke="#FF385C" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-6">Monthly Bookings</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}