
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const loadUser = async () => {
        try {
            const userData = await User.me();
            setUser(userData);
        } catch {
            setUser(null);
        }
    };

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        
        try {
            console.log('Loading notifications for user:', user.id);
            const userNotifications = await Notification.filter(
                { user_id: user.id }, 
                '-created_date', 
                20
            );
            console.log('Loaded notifications:', userNotifications.length);
            
            const newUnreadCount = userNotifications.filter(n => !n.is_read).length;

            if (newUnreadCount > unreadCount) {
                // Optional: Play a sound on new notification
                // const audio = new Audio('/notification.mp3');
                // audio.play();
            }

            setNotifications(userNotifications);
            setUnreadCount(newUnreadCount);
            console.log('Unread notifications:', newUnreadCount);
        } catch {
            console.error('Error loading notifications:');
        }
    }, [user, unreadCount]);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            loadNotifications();
            // Set up polling for new notifications every 15 seconds
            const interval = setInterval(loadNotifications, 15000);
            return () => clearInterval(interval);
        }
    }, [user, loadNotifications]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark notification as read
            if (!notification.is_read) {
                await Notification.update(notification.id, { is_read: true });
                setUnreadCount(prev => Math.max(0, prev - 1));
                
                // Update local state
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notification.id ? { ...n, is_read: true } : n
                    )
                );
            }

            // Close dropdown
            setIsOpen(false);

            // Navigate to the appropriate page
            if (notification.action_url) {
                navigate(notification.action_url);
            }
        } catch {
            console.error('Error marking notification as read:');
        }
    };

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            const unreadNotifications = notifications.filter(n => !n.is_read);
            for (const notification of unreadNotifications) {
                await Notification.update(notification.id, { is_read: true });
            }
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {
            console.error('Error marking all notifications as read:');
        }
        setIsLoading(false);
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

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const notificationDate = new Date(dateString);
        const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs font-medium text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={isLoading}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Marking...' : 'Mark all read'}
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                                notification.is_read
                                                    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <span className="text-lg flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-sm font-medium ${
                                                            notification.is_read ? 'text-gray-900' : 'text-blue-900'
                                                        }`}>
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                            {formatTimeAgo(notification.created_date)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm mt-1 ${
                                                        notification.is_read ? 'text-gray-600' : 'text-blue-700'
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    {!notification.is_read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate(createPageUrl('Notifications'));
                                    }}
                                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
