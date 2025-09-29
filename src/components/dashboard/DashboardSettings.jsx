import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Shield, Eye, Mail, Phone, Globe } from 'lucide-react';

export default function DashboardSettings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        bookingReminders: true,
        profilePublic: true,
        showPhone: false,
        showEmail: false,
        twoFactorAuth: false
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        try {
            await User.updateMyUserData({ settings });
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Failed to update settings. Please try again.');
        }
    };

    const SettingItem = ({ icon: Icon, title, description, children }) => (
        <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
                <h4 className="font-medium text-gray-900">{title}</h4>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
                {children && <div className="mt-3">{children}</div>}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="mt-1 text-gray-600">Manage your account preferences and privacy settings</p>
            </div>

            <div className="space-y-8">
                {/* Notifications */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Notifications
                    </h3>
                    <div className="space-y-4">
                        <SettingItem
                            icon={Mail}
                            title="Email Notifications"
                            description="Receive booking updates and important announcements via email"
                        >
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                                />
                                <Label>Enable email notifications</Label>
                            </div>
                        </SettingItem>

                        <SettingItem
                            icon={Phone}
                            title="SMS Notifications"
                            description="Get text messages for urgent booking updates"
                        >
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={settings.smsNotifications}
                                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                                />
                                <Label>Enable SMS notifications</Label>
                            </div>
                        </SettingItem>

                        <SettingItem
                            icon={Bell}
                            title="Marketing Communications"
                            description="Receive promotional offers and platform updates"
                        >
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={settings.marketingEmails}
                                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                                />
                                <Label>Allow marketing emails</Label>
                            </div>
                        </SettingItem>
                    </div>
                </div>

                {/* Privacy */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Privacy
                    </h3>
                    <div className="space-y-4">
                        <SettingItem
                            icon={Globe}
                            title="Profile Visibility"
                            description="Control who can see your profile information"
                        >
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={settings.profilePublic}
                                    onCheckedChange={(checked) => handleSettingChange('profilePublic', checked)}
                                />
                                <Label>Make profile public</Label>
                            </div>
                        </SettingItem>

                        <SettingItem
                            icon={Phone}
                            title="Contact Information"
                            description="Choose what contact details to show to guests"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={settings.showPhone}
                                        onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                                    />
                                    <Label>Show phone number</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={settings.showEmail}
                                        onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                                    />
                                    <Label>Show email address</Label>
                                </div>
                            </div>
                        </SettingItem>
                    </div>
                </div>

                {/* Security */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Security
                    </h3>
                    <div className="space-y-4">
                        <SettingItem
                            icon={Shield}
                            title="Two-Factor Authentication"
                            description="Add an extra layer of security to your account"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={settings.twoFactorAuth}
                                        onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                                    />
                                    <Label>Enable 2FA</Label>
                                </div>
                                {!settings.twoFactorAuth && (
                                    <Button variant="outline" size="sm">
                                        Set up
                                    </Button>
                                )}
                            </div>
                        </SettingItem>
                    </div>
                </div>

                {/* Account Management */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
                    <div className="space-y-4">
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                            <p className="text-sm text-red-700 mb-4">
                                These actions cannot be undone. Please be careful.
                            </p>
                            <div className="space-x-4">
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                    Deactivate Account
                                </Button>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button onClick={saveSettings} className="bg-airbnb-red hover:bg-airbnb-red-dark">
                        Save All Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}