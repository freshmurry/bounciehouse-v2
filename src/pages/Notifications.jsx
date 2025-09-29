import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // user object is used to fetch notifications; keep setter but don't expose the read value
    const [, setUser] = useState(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        try {
            const userData = await User.me();
            setUser(userData);
            
            const userNotifications = await Notification.filter(
                { user_id: userData.id },
                '-created_date',
                100
            );
            
            setNotifications(userNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
            navigate(createPageUrl('Home'));
        }
        setIsLoading(false);
    }, [navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read if not already read
            if (!notification.is_read) {
                await Notification.update(notification.id, { is_read: true });
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notification.id ? { ...n, is_read: true } : n
                    )
                );
            }

            // Navigate to action URL
            if (notification.action_url) {
                navigate(notification.action_url);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.is_read);
            for (const notification of unreadNotifications) {
                await Notification.update(notification.id, { is_read: true });
            }
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message':
                return '💬';
            case 'reservation_request':
                return '📅';
            case 'reservation_confirmed':
                return '✅';
            case 'reservation_cancelled':
                return '❌';
            case 'payment_received':
                return '💰';
            case 'review_received':
                return '⭐';
            default:
                return '🔔';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
        } else if (diffInHours < 168) { // Less than a week
            return date.toLocaleDateString('en-US', { 
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl("Dashboard"))}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                    
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="mt-1 text-gray-600">
                                {unreadCount > 0 
                                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                    : 'All caught up!'
                                }
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button variant="outline" onClick={markAllAsRead}>
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {notifications.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                            <p className="text-gray-600">When you receive messages or booking updates, they'll appear here.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left p-6 bg-white rounded-lg border transition-all hover:shadow-md ${
                                    notification.is_read
                                        ? 'border-gray-200'
                                        : 'border-blue-200 bg-blue-50'
                                }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`text-lg font-semibold ${
                                                notification.is_read ? 'text-gray-900' : 'text-blue-900'
                                            }`}>
                                                {notification.title}
                                            </h3>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(notification.created_date)}
                                                </span>
                                                {!notification.is_read && (
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-base ${
                                            notification.is_read ? 'text-gray-700' : 'text-blue-800'
                                        }`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}