import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function ReservationAction() {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Processing your request...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const processAction = async () => {
            const params = new URLSearchParams(location.search);
            const action = params.get('action');
            const reservationId = params.get('id');

            if (!action || !reservationId) {
                setStatus('error');
                setMessage('Invalid action. Missing required parameters.');
                return;
            }

            try {
                let response;
                if (action === 'approve') {
                    response = await fetch(`/functions/approveReservation?id=${reservationId}`, { method: 'POST' });
                } else if (action === 'reject') {
                    response = await fetch(`/functions/rejectReservation?id=${reservationId}`, { method: 'POST' });
                } else {
                    throw new Error('Invalid action specified.');
                }

                if (response.ok) {
                    setStatus('success');
                    setMessage(`Reservation successfully ${action}d!`);
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to ${action} reservation.`);
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.message);
            }
        };

        processAction();
    }, [location]);

    const renderIcon = () => {
        switch (status) {
            case 'processing':
                return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
            case 'success':
                return <CheckCircle className="w-16 h-16 text-green-500" />;
            case 'error':
                return <XCircle className="w-16 h-16 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="mx-auto mb-6 flex items-center justify-center">
                    {renderIcon()}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {status === 'processing' ? 'Processing...' : status === 'success' ? 'Success!' : 'Error'}
                </h1>
                <p className="text-gray-600 mb-8">{message}</p>
                <Button 
                    onClick={() => navigate(createPageUrl('Dashboard') + '?tab=reservations')}
                    className="w-full"
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}