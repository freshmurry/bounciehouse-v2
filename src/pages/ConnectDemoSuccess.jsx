import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function ConnectDemoSuccess() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    return (
        <div className="max-w-2xl mx-auto p-8 text-center bg-gray-50 min-h-screen flex flex-col justify-center">
            <div className="bg-white p-10 rounded-lg shadow-md border border-gray-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
                <p className="mt-4 text-gray-600">
                    Thank you for your purchase. Your payment has been processed successfully.
                </p>
                {sessionId && (
                    <p className="mt-2 text-sm text-gray-500">
                        Transaction ID: <code>{sessionId}</code>
                    </p>
                )}
                <div className="mt-8">
                    <Link to={createPageUrl('ConnectDemoOnboarding')}>
                        <Button>Back to Seller Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}