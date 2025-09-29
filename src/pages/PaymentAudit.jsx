import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentAudit from '../components/admin/PaymentAudit';

const ADMIN_EMAILS = ["gideon@base44.ai", "lawrencemurry@yahoo.com"];

export default function PaymentAuditPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userData = await User.me();
                if (!ADMIN_EMAILS.includes(userData.email)) {
                    navigate(createPageUrl("Home"));
                    return;
                }
                setUser(userData);
            } catch {
                    navigate(createPageUrl("Home"));
                }
            setIsLoading(false);
        };

        checkAccess();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(createPageUrl("Dashboard"))}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment System Audit</h1>
                    <p className="mt-2 text-gray-600">
                        Comprehensive testing and validation of payment and payout functionality
                    </p>
                </div>

                <PaymentAudit />
            </div>
        </div>
    );
}