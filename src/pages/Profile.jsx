
import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { UploadFile, SendEmail } from "@/api/integrations"; // Added SendEmail import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Mail, CheckCircle, AlertCircle, X, ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// --- Helper Functions ---
const getInitials = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) return "?";
  const names = name.trim().split(' ').filter(Boolean);
  if (names.length === 0) return "?";
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0].substring(0, 2).toUpperCase();
};

const generateBgColor = (id) => {
  if (!id) return '#cccccc';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const Toast = ({ message, type, onDismiss }) => {
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white z-50 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
            <Icon className="w-5 h-5 mr-3" />
            <span>{message}</span>
            <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  
  // Form State
  const [formState, setFormState] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    profile_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Phone Verification State
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false); // New state for sending code

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      let firstName = currentUser.first_name || '';
      let lastName = currentUser.last_name || '';

      if (!firstName && currentUser.full_name) {
          const nameParts = currentUser.full_name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
      }

      setFormState({
        first_name: firstName,
        last_name: lastName,
        bio: currentUser.bio || '',
        phone: currentUser.phone || '',
        profile_image: currentUser.profile_image || null,
      });
      setImagePreview(currentUser.profile_image || null);
    } catch (error) {
      console.error("Failed to load user", error);
      setToast({ message: 'Failed to load profile.', type: 'error' });
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormState({ ...formState, profile_image_file: file });
      };
      reader.readAsDataURL(file);
    } else {
      setToast({ message: 'Please select a PNG or JPG file.', type: 'error' });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormState({ ...formState, profile_image: null, profile_image_file: null });
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!formState.first_name.trim() || !formState.last_name.trim()) {
        setToast({ message: "First and last name cannot be empty.", type: "error" });
        return;
    }
      
    setIsSaving(true);
    let updatedData = {
        first_name: formState.first_name.trim(),
        last_name: formState.last_name.trim(),
        bio: formState.bio.trim(),
        phone: formState.phone.trim(),
    };

    try {
      // Handle image upload
      if (formState.profile_image_file) {
        const { file_url } = await UploadFile({ file: formState.profile_image_file });
        updatedData.profile_image = file_url;
      } else if (formState.profile_image === null && user.profile_image) {
        updatedData.profile_image = null;
      }

      // Update user data
      await User.updateMyUserData(updatedData);
      
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Dispatch event to update navbar immediately
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: updatedUser 
      }));
      
      setToast({ message: "Profile updated successfully!", type: "success" });
      await loadUser();
    } catch (error) {
      console.error("Failed to update profile", error);
      setToast({ message: "An error occurred while updating your profile. Please try again.", type: "error" });
    }
    setIsSaving(false);
  };

  const handleSendVerification = async () => {
      if (!formState.phone.trim()) {
        setToast({ message: "Please enter a phone number first.", type: "error" });
        return;
      }
      
      setIsSendingCode(true); // Start sending state
      const code = generateVerificationCode();
      setGeneratedCode(code);
      
      try {
        await SendEmail({
            to: user.email, // Send to user's email
            subject: 'Your BouncieHouse Verification Code',
            body: `Hi ${user.first_name || 'there'},\n\nYour verification code to confirm your phone number on BouncieHouse is: ${code}\n\nThis code will expire in 10 minutes.\n\nThanks,\nThe BouncieHouse Team`
        });
        
        setPhoneVerificationSent(true);
        setToast({ message: `A verification code has been sent to your email (${user.email}).`, type: 'success' });
      } catch (error) {
        console.error("Failed to send verification email", error);
        setToast({ message: "Failed to send verification code. Please try again.", type: 'error' });
      } finally {
        setIsSendingCode(false); // End sending state
      }
  };

  const handleVerifyPhone = async () => {
      if (verificationCode === generatedCode) {
          try {
              setIsSaving(true);
              await User.updateMyUserData({ 
                phone: formState.phone,
                phone_verified: true,
                phone_verified_at: new Date().toISOString()
              });
              setToast({ message: "Phone number verified successfully!", type: 'success' });
              setPhoneVerificationSent(false);
              setVerificationCode('');
              setIsUpdatingPhone(false);
              await loadUser();
          } catch(error) {
              console.error("Error verifying phone:", error);
              setToast({ message: "Failed to verify phone number. Please try again.", type: 'error' });
          } finally {
              setIsSaving(false);
          }
      } else {
          setToast({ message: "Invalid verification code. Please try again.", type: 'error' });
      }
  };

  const handleUpdatePhone = () => {
    setIsUpdatingPhone(true);
    setFormState({...formState, phone: ''});
    setPhoneVerificationSent(false);
    setVerificationCode('');
  };

  if (isLoading && !user) {
    return <ProfileSkeleton />;
  }

  const displayName = `${formState.first_name} ${formState.last_name}`.trim();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(createPageUrl("Dashboard"))}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & Settings</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative mb-4">
              <Avatar className="w-40 h-40 border-4 border-white shadow-lg text-6xl">
                <AvatarImage src={imagePreview} />
                <AvatarFallback style={{backgroundColor: generateBgColor(user?.id)}}>
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="profile-image-upload" className="absolute -bottom-2 -right-2 p-3 bg-white border rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera className="w-5 h-5 text-gray-700" />
                <input id="profile-image-upload" ref={fileInputRef} type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageSelect} />
              </label>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveImage} className="text-red-600 hover:text-red-700">Remove Photo</Button>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="font-semibold">First Name <span className="text-red-500">*</span></Label>
                  <Input id="first_name" name="first_name" value={formState.first_name} onChange={handleInputChange} placeholder="Your First Name" />
                </div>
                 <div>
                  <Label htmlFor="last_name" className="font-semibold">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="last_name" name="last_name" value={formState.last_name} onChange={handleInputChange} placeholder="Your Last Name" />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-700">{user?.email}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="bio" className="font-semibold">Bio</Label>
                <Textarea id="bio" name="bio" value={formState.bio} onChange={handleInputChange} className="h-28" placeholder="Tell us a little about yourself..." maxLength="500" />
                <p className="text-xs text-gray-500 text-right mt-1">{formState.bio?.length || 0}/500</p>
              </div>
            </div>

            {/* Phone Verification Section */}
            <div className="space-y-4 pt-8 border-t">
              <h3 className="text-lg font-semibold">Phone Number</h3>
              
              {user?.phone_verified && !isUpdatingPhone ? (
                // VIEW 1: User's phone is already verified
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <p className="font-medium text-gray-800 flex-grow">{formState.phone}</p>
                  <div className="flex items-center gap-2 text-green-600 whitespace-nowrap">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Verified</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUpdatePhone}
                    className="whitespace-nowrap"
                  >
                    Update Phone
                  </Button>
                </div>
              ) : (
                // VIEW 2: User needs to verify or is updating their phone
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formState.phone} 
                      onChange={handleInputChange} 
                      placeholder="Your phone number" 
                      disabled={isSendingCode || phoneVerificationSent}
                    />
                    <Button 
                      onClick={handleSendVerification} 
                      disabled={!formState.phone || isSendingCode || phoneVerificationSent}
                      className="whitespace-nowrap"
                    >
                      {isSendingCode ? 'Sending...' : (phoneVerificationSent ? 'Code Sent' : 'Send Verification Code')}
                    </Button>
                  </div>
                  
                  {phoneVerificationSent && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Input 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="flex-grow"
                        maxLength={6}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleVerifyPhone} disabled={isSaving || !verificationCode}>
                          {isSaving ? 'Verifying...' : 'Verify Phone'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setPhoneVerificationSent(false);
                            setVerificationCode('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
        
            <div className="mt-8 flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    size="lg" 
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-10 w-1/3 bg-gray-200 rounded mb-8"></div>
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center md:items-start">
                  <Skeleton className="w-40 h-40 rounded-full" />
                  <Skeleton className="h-8 w-24 mt-4 rounded" />
              </div>
              <div className="md:col-span-2 space-y-8">
                  <div className="space-y-6">
                      <Skeleton className="h-10 w-full rounded" />
                      <Skeleton className="h-10 w-full rounded" />
                      <Skeleton className="h-28 w-full rounded" />
                  </div>
                  <div className="space-y-6 pt-8 border-t">
                      <Skeleton className="h-10 w-full rounded" />
                  </div>
              </div>
          </div>
        </div>
    </div>
);
