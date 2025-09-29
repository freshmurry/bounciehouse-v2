import React, { useState } from 'react';
import { User } from '@/api/entities';
import { UploadFile, SendSMS } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Camera, Phone, Check } from 'lucide-react';

export default function DashboardProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [phoneVerification, setPhoneVerification] = useState({ code: '', sent: false, verified: user.phone_verified || false });
    const [formData, setFormData] = useState({
        full_name: user.full_name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        profile_image: user.profile_image || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setFormData(prev => ({ ...prev, profile_image: file_url }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        }
        setIsUploading(false);
    };

    const sendVerificationCode = async () => {
        if (!formData.phone) {
            alert('Please enter a phone number first.');
            return;
        }
        
        try {
            // In a real app, this would send an SMS
            setPhoneVerification(prev => ({ ...prev, sent: true }));
            alert('Verification code sent to your phone!');
        } catch (error) {
            console.error('Error sending verification code:', error);
            alert('Failed to send verification code. Please try again.');
        }
    };

    const verifyPhone = async () => {
        if (phoneVerification.code === '123456') { // Mock verification
            setPhoneVerification(prev => ({ ...prev, verified: true }));
            alert('Phone number verified successfully!');
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    const handleSave = async () => {
        try {
            await User.updateMyUserData({
                ...formData,
                phone_verified: phoneVerification.verified
            });
            
            const updatedUser = await User.me();
            setUser(updatedUser);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user.full_name || '',
            bio: user.bio || '',
            phone: user.phone || '',
            profile_image: user.profile_image || ''
        });
        setIsEditing(false);
        setPhoneVerification({ code: '', sent: false, verified: user.phone_verified || false });
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                    <p className="mt-1 text-gray-600">Manage your personal information and preferences</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="bg-airbnb-red hover:bg-airbnb-red-dark">
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Image */}
                <div className="lg:col-span-1">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <Avatar className="w-32 h-32 mx-auto">
                                <AvatarImage src={formData.profile_image} />
                                <AvatarFallback className="text-4xl">
                                    {formData.full_name ? formData.full_name[0].toUpperCase() : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 p-2 bg-airbnb-red text-white rounded-full cursor-pointer hover:bg-airbnb-red-dark">
                                    {isUploading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Camera className="w-5 h-5" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            {isEditing ? 'Click the camera icon to update your photo' : 'Profile Photo'}
                        </p>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            rows={4}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="space-y-3">
                            <div className="flex space-x-3">
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="+1 (555) 123-4567"
                                    className="flex-1"
                                />
                                {isEditing && !phoneVerification.verified && (
                                    <Button
                                        type="button"
                                        onClick={sendVerificationCode}
                                        disabled={!formData.phone}
                                        variant="outline"
                                        className="flex items-center space-x-2"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>{phoneVerification.sent ? 'Resend' : 'Verify'}</span>
                                    </Button>
                                )}
                                {phoneVerification.verified && (
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <Check className="w-4 h-4" />
                                        <span className="text-sm">Verified</span>
                                    </div>
                                )}
                            </div>

                            {phoneVerification.sent && !phoneVerification.verified && (
                                <div className="flex space-x-3">
                                    <Input
                                        placeholder="Enter verification code"
                                        value={phoneVerification.code}
                                        onChange={(e) => setPhoneVerification(prev => ({ ...prev, code: e.target.value }))}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={verifyPhone}
                                        disabled={!phoneVerification.code}
                                    >
                                        Verify
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-airbnb-red hover:bg-airbnb-red-dark"
                            >
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}