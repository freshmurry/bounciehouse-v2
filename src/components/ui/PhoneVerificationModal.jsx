import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Phone, Loader2 } from 'lucide-react';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function PhoneVerificationModal({ isOpen, onClose, onVerified, user, title, subtitle }) {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPhone(user?.phone || '');
            setCode('');
            setGeneratedCode('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSendCode = async () => {
        if (!phone.trim()) {
            setError('Please enter a valid phone number.');
            return;
        }
        setIsLoading(true);
        setError('');

        const newCode = generateVerificationCode();
        setGeneratedCode(newCode);

        try {
            await SendEmail({
                to: user.email,
                subject: 'Your BouncieHouse Verification Code',
                body: `Hi ${user.first_name || 'there'},\n\nYour verification code is: ${newCode}\n\nThanks,\nThe BouncieHouse Team`,
            });
            setStep(2);
        } catch {
            setError('Failed to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (code !== generatedCode) {
            setError('Invalid verification code. Please try again.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            await User.updateMyUserData({ 
                phone: phone, 
                phone_verified: true,
                phone_verified_at: new Date().toISOString()
            });
            onVerified();
        } catch {
            setError('Failed to update your profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9+()-\s]/g, '');
        setPhone(value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
                </div>
                
                {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone-number">Phone Number</Label>
                            <Input
                                id="phone-number"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="(123) 456-7890"
                            />
                        </div>
                        <Button onClick={handleSendCode} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                        </Button>
                    </div>
                )}
                
                {step === 2 && (
                     <div className="space-y-4">
                        <p className="text-sm text-center text-gray-600">
                            We've sent a 6-digit verification code to your email: <strong>{user.email}</strong>
                        </p>
                        <div>
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <Input
                                id="verification-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                            />
                        </div>
                        <Button onClick={handleVerifyCode} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify and Continue'}
                        </Button>
                        <Button variant="link" size="sm" onClick={() => setStep(1)} className="w-full" disabled={isLoading}>
                            Change phone number
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}