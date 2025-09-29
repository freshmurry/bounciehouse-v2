import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function PaymentSuccess() {
  const [sessionId, setSessionId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSessionId(params.get('session_id'));
  }, [location]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Thank you! Your booking is confirmed. You will receive an email confirmation shortly with all the details.
        </p>
        <div className="space-y-4">
          <Link to={createPageUrl('Dashboard?tab=reservations')}>
            <Button size="lg" className="w-full bg-airbnb-red hover:bg-airbnb-red-dark">
              View My Reservations
            </Button>
          </Link>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>
        {sessionId && (
          <p className="text-xs text-gray-400 mt-8">
            Ref: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}