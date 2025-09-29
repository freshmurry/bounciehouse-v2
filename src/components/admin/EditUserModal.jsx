import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Camera, Mail } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

export default function EditUserModal({ isOpen, onClose, user, onSave }) {
    const [formData, setFormData] = useState({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        role: 'user',
        full_name: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                role: user.role || 'user',
                full_name: user.full_name || ''
            });
            setImagePreview(user.profile_image || null);
            setImageFile(null);
            setIsCreating(false);
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                role: 'user',
                full_name: ''
            });
            setImagePreview(null);
            setImageFile(null);
            setIsCreating(true);
        }
    }, [user]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRoleChange = (value) => {
        setFormData({ ...formData, role: value });
    };

    const handleSave = async () => {
        if (isCreating) {
            // Handle user invitation
            if (!formData.email.trim()) {
                alert('Email is required to send an invitation.');
                return;
            }

            setIsSaving(true);
            try {
                const invitationMessage = `
Hello${formData.first_name ? ' ' + formData.first_name : ''},

You have been invited to join BouncieHouse! 

BouncieHouse is a platform where you can rent bounce houses for parties and events, or list your own bounce house to earn money.

To get started:
1. Click here to sign up: ${window.location.origin}
2. Complete your profile
3. Start browsing or listing bounce houses

Welcome to the BouncieHouse community!

Best regards,
The BouncieHouse Team
                `;

                await SendEmail({
                    to: formData.email,
                    subject: 'Welcome to BouncieHouse - You\'re Invited!',
                    body: invitationMessage,
                    from_name: 'BouncieHouse Admin'
                });

                alert(`Invitation sent successfully to ${formData.email}!`);
                onSave();
            } catch (error) {
                console.error('Failed to send invitation:', error);
                alert('Failed to send invitation. Please try again.');
            } finally {
                setIsSaving(false);
            }
        } else {
            // Handle user update
            if (!user) return;

            setIsSaving(true);
            try {
                const payload = { ...formData };
                delete payload.email; // Email cannot be changed

                // Upload image if provided
                if (imageFile) {
                    const { file_url } = await UploadFile({ file: imageFile });
                    payload.profile_image = file_url;
                } else if (imagePreview === null && user.profile_image) {
                    payload.profile_image = null;
                }

                // Update full_name if first/last names are provided
                if (formData.first_name.trim() || formData.last_name.trim()) {
                    payload.full_name = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
                }

                await User.update(user.id, payload);
                alert('User updated successfully!');
                onSave();
            } catch (error) {
                console.error('Failed to save user:', error);
                alert(`Could not update user: ${error.message || 'Unknown error'}`);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const tempUserForAvatar = {
        ...user,
        ...formData,
        profile_image: imagePreview
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">
                        {isCreating ? 'Invite New User' : `Edit User: ${user?.first_name || user?.full_name || user?.email}`}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isCreating ? (
                    /* Invitation Form */
                    <div className="space-y-6">
                        <div className="flex items-center justify-center p-8 bg-blue-50 rounded-lg">
                            <div className="text-center">
                                <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Send User Invitation</h4>
                                <p className="text-sm text-gray-600">
                                    New users must sign up through the platform for security. 
                                    An invitation email will be sent with signup instructions.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email"
                                    value={formData.email} 
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name (optional)</Label>
                                    <Input 
                                        id="first_name" 
                                        name="first_name" 
                                        value={formData.first_name} 
                                        onChange={handleChange} 
                                        placeholder="First name" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name (optional)</Label>
                                    <Input 
                                        id="last_name" 
                                        name="last_name" 
                                        value={formData.last_name} 
                                        onChange={handleChange} 
                                        placeholder="Last name" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Edit User Form */
                    <div className="space-y-6">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <UserAvatar user={tempUserForAvatar} size="xl" />
                                <Button 
                                    size="icon" 
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 border-2 border-white bg-gray-100 hover:bg-gray-200"
                                >
                                    <Camera className="w-5 h-5 text-gray-700" />
                                </Button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageSelect}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click to change profile image</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email"
                                    value={formData.email} 
                                    disabled
                                    className="bg-gray-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input 
                                        id="first_name" 
                                        name="first_name" 
                                        value={formData.first_name} 
                                        onChange={handleChange} 
                                        placeholder="First name" 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input 
                                        id="last_name" 
                                        name="last_name" 
                                        value={formData.last_name} 
                                        onChange={handleChange} 
                                        placeholder="Last name" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select value={formData.role} onValueChange={handleRoleChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (isCreating ? 'Sending Invitation...' : 'Saving...') : (isCreating ? 'Send Invitation' : 'Save Changes')}
                    </Button>
                </div>
            </div>
        </div>
    );
}