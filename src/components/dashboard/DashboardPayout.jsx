
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { CreditCard, Download, DollarSign, Clock, ExternalLink, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createStripeConnectAccount } from '@/api/functions';
import { getStripeAccountStatus } from '@/api/functions';
import { getPayoutData } from '@/api/functions';

export default function DashboardPayout({ user }) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [stripeStatus, setStripeStatus] = useState(null);
    const [payoutData, setPayoutData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingTimeout, setPollingTimeout] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const FETCH_COOLDOWN = 10000; // Increased to 10 seconds

    const loadStripeData = useCallback(async (forceRefresh = false) => {
        if (!user || isLoading) return; // Don't fetch if already loading

        // Rate limiting: don't fetch too frequently unless forced
        const now = Date.now();
        if (!forceRefresh && (now - lastFetchTime) < FETCH_COOLDOWN) {
            console.log('Skipping API call due to cooldown');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const { data: status } = await getStripeAccountStatus();

            // Only show success message if it wasn't already enabled (using the state's current value)
            if (status.payouts_enabled && !stripeStatus?.payouts_enabled) {
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 6000);
            }

            setStripeStatus(status);

            if (status.payouts_enabled) {
                try {
                    // Assuming getPayoutData returns an object like { data: ..., status: ... }
                    const { data: payouts, status: payoutStatus } = await getPayoutData();

                    if (payoutStatus === 429 || payouts.error?.includes('Rate limit')) {
                        setError('Service is busy. Please wait a moment and try again.');
                        setPayoutData({ available_balance: 0, pending_balance: 0, payouts: [] }); // Set default for display
                    } else if (payoutStatus === 404 || payouts.error?.includes('not found')) {
                        setError('Your Stripe account connection needs to be refreshed. Please try connecting again.');
                         // Mark as not connected so user can re-initiate
                        setStripeStatus(prev => ({...prev, payouts_enabled: false, needs_setup: true}));
                        setPayoutData(null); // Clear old data
                    } else if (payouts.error) {
                        setError(payouts.error);
                        setPayoutData({ available_balance: 0, pending_balance: 0, payouts: [] }); // Set default for display
                    } else {
                        setPayoutData(payouts);
                        setError(null);
                    }
                } catch (payoutError) {
                    console.error('Error loading payout data:', payoutError);
                    const status = payoutError.response?.status;
                    if (status === 429) {
                        setError('Service is busy. Please wait a moment and try again.');
                    } else if (status === 404) {
                         setError('Your Stripe account appears disconnected. Please reconnect.');
                         setStripeStatus(prev => ({...prev, payouts_enabled: false, needs_setup: true}));
                    } else {
                        setError('Failed to load payout information.');
                    }
                    setPayoutData(null); // Clear old data
                }
            } else {
                // If payouts are not enabled, clear payout data to avoid showing old data
                setPayoutData(null);
            }
            setLastFetchTime(now);
        } catch (error) {
            console.error('Error loading Stripe data:', error);
            setError('Failed to load payment information. Please try again.');
            setStripeStatus({ connected: false, charges_enabled: false, payouts_enabled: false, needs_setup: true });
            setPayoutData(null);
        }
        setIsLoading(false);
    }, [user, isLoading, lastFetchTime, stripeStatus?.payouts_enabled]);

    const startPollingForSetupCompletion = useCallback(() => {
        if (isPolling || pollingTimeout) return;

        setIsPolling(true);
        let pollCount = 0;
        const maxPolls = 6;

        const poll = async () => {
            pollCount++;
            try {
                const { data: status } = await getStripeAccountStatus();

                if (status.payouts_enabled) {
                    setStripeStatus(status);
                    setIsPolling(false);
                    if (pollingTimeout) clearTimeout(pollingTimeout); // Clear timeout on success
                    loadStripeData(true); // Force refresh on success
                    return;
                }

                if (pollCount >= maxPolls) {
                    setIsPolling(false);
                    if (pollingTimeout) clearTimeout(pollingTimeout); // Clear timeout when max polls reached
                    setError("Stripe is still verifying your information. Please check back in a few minutes or refresh.");
                } else {
                    const nextPoll = setTimeout(poll, 15000);
                    setPollingTimeout(nextPoll);
                }
            } catch (error) {
                console.error('Error polling Stripe status:', error);
                setIsPolling(false);
                if (pollingTimeout) clearTimeout(pollingTimeout); // Clear timeout on error
                setError("Could not verify Stripe status. Please refresh the page.");
            }
        };

        setPollingTimeout(setTimeout(poll, 5000));
    }, [isPolling, pollingTimeout, loadStripeData]);

    useEffect(() => {
        loadStripeData();

        const urlParams = new URLSearchParams(window.location.search);
        // Only start polling if setup is complete and polling is not already active
        if (urlParams.get('setup') === 'complete' && !isPolling) {
            startPollingForSetupCompletion();
            // Clean up URL parameters to avoid re-triggering polling on refresh
            window.history.replaceState({}, document.title, window.location.pathname + '?tab=payouts');
        }

        const handleWindowFocus = () => {
            // Only refetch on focus if the document has focus, polling is not active,
            // and it has been more than 30 seconds since the last fetch.
            if (document.hasFocus() && !isPolling && (Date.now() - lastFetchTime > 30000)) {
                loadStripeData(false); // Do not force refresh, respect general rate limiting
            }
        };

        window.addEventListener('focus', handleWindowFocus);
        return () => {
            window.removeEventListener('focus', handleWindowFocus);
            // Clear any active polling timeout on component unmount or re-render
            if (pollingTimeout) {
                clearTimeout(pollingTimeout);
            }
        };
    }, [user, isPolling, lastFetchTime, loadStripeData, startPollingForSetupCompletion, pollingTimeout]);

    const handleConnectStripe = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            // FIX: Construct a clean return URL to the payouts tab
            const returnUrl = new URL(window.location.origin + window.location.pathname);
            returnUrl.searchParams.set('tab', 'payouts');
            returnUrl.searchParams.set('setup', 'complete');

            const refreshUrl = new URL(window.location.origin + window.location.pathname);
            refreshUrl.searchParams.set('tab', 'payouts');

            const { data } = await createStripeConnectAccount({
                return_url: returnUrl.href,
                refresh_url: refreshUrl.href
            });

            if (data.onboarding_url) {
                window.location.href = data.onboarding_url;
            } else {
                throw new Error('No onboarding URL received from Stripe.');
            }
        } catch (error) {
            console.error('Error connecting to Stripe:', error);
            setError('Unable to initiate setup with Stripe. Please try again or contact support.');
        } finally {
            setIsConnecting(false);
        }
    };

    const isStripeFullyEnabled = stripeStatus?.payouts_enabled && stripeStatus?.charges_enabled;
    const hasRequirements = stripeStatus?.requirements?.currently_due?.length > 0 || stripeStatus?.requirements?.past_due?.length > 0;

    if (isLoading && !stripeStatus) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-40 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>
                <p className="mt-1 text-gray-600">Manage your earnings and payment settings with Stripe.</p>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                            <h4 className="font-semibold text-green-800">Payouts Enabled!</h4>
                            <p className="text-sm text-green-700">Your Stripe account is fully configured. You can now receive payments from bookings.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Polling Message */}
            {isPolling && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
                        <div>
                            <h4 className="font-semibold text-blue-800">Checking Setup Status</h4>
                            <p className="text-sm text-blue-700">We're verifying your Stripe account setup. This may take a moment...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                        <div>
                            <h4 className="font-semibold text-red-800">Error</h4>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadStripeData(true)}
                            className="ml-auto"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Requirements Warning */}
            {stripeStatus && hasRequirements && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-yellow-800">Action Required</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                Stripe requires additional information to enable payouts:
                            </p>
                            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                                {stripeStatus.requirements.currently_due?.map(req => (
                                    <li key={req}>
                                        {req === 'individual.id_number' ? 'Social Security Number (SSN) or Tax ID' : req.replace(/_/g, ' ')}
                                    </li>
                                ))}
                                {stripeStatus.requirements.past_due?.map(req => (
                                    <li key={req} className="text-red-700 font-medium">
                                        {req === 'individual.id_number' ? 'Social Security Number (SSN) or Tax ID (Past Due)' : req.replace(/_/g, ' ') + ' (Past Due)'}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                onClick={handleConnectStripe}
                                disabled={isConnecting || isPolling}
                                size="sm"
                                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Complete Required Information
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {!isStripeFullyEnabled ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                            <CreditCard className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {!stripeStatus?.connected ? 'Set Up Payouts' : 'Complete Your Account Setup'}
                        </h3>
                        <p className="text-gray-600 mb-8">
                            {!stripeStatus?.connected
                                ? 'To receive money from bookings, you need to connect a Stripe account. This allows us to securely transfer your earnings to your bank.'
                                : hasRequirements
                                ? `Stripe needs additional information (${stripeStatus.requirements.currently_due?.length || 0} items) to enable payouts. Click below to provide the required details.`
                                : "You're almost there! Complete your account setup to start receiving payouts."
                            }
                        </p>

                        <div className="space-y-4">
                            <Button
                                onClick={handleConnectStripe}
                                disabled={isConnecting || isPolling}
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                {isConnecting
                                    ? 'Redirecting to Stripe...'
                                    : isPolling
                                    ? 'Verifying...'
                                    : hasRequirements
                                    ? 'Complete Missing Information'
                                    : 'Complete Setup on Stripe'
                                }
                            </Button>
                        </div>

                        <div className="mt-8 text-xs text-gray-500 space-y-2">
                            <p>✓ Setup opens in a new tab for security</p>
                            <p>✓ Fast, secure payouts to your bank account</p>
                            <p>✓ Industry-standard security and compliance</p>
                            {hasRequirements && (
                                <p className="text-yellow-600 font-medium">Complete the required information to enable payouts</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Available Balance */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold opacity-90">Available Balance</h3>
                                    <p className="text-3xl font-bold mt-2">
                                        ${payoutData?.available_balance?.toFixed(2) || '0.00'}
                                    </p>
                                    <p className="text-sm opacity-90 mt-2">Ready for payout</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Pending Balance */}
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold opacity-90">Pending Balance</h3>
                                    <p className="text-3xl font-bold mt-2">
                                        ${payoutData?.pending_balance?.toFixed(2) || '0.00'}
                                    </p>
                                    <p className="text-sm opacity-90 mt-2">Processing payments</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Payout History */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Recent Payouts</h3>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Report
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {payoutData?.payouts?.length > 0 ? (
                                    payoutData.payouts.map(payout => (
                                        <div key={payout.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                                            <div>
                                                <p className="font-medium">${payout.amount.toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(payout.created * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                payout.status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : payout.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No payouts yet</p>
                                        <p className="text-sm">Once you receive bookings, payouts will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Settings */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-6">Payment Settings</h3>

                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-700 mr-3" />
                                    <div>
                                        <p className="font-semibold text-green-800">Stripe Account Connected</p>
                                        <p className="text-sm text-green-700">
                                            {isStripeFullyEnabled ? 'Fully enabled' : 'Setup in progress'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Account Setup:</span>
                                    <span className={stripeStatus?.details_submitted ? 'text-green-600' : 'text-orange-600'}>
                                        {stripeStatus?.details_submitted ? 'Complete' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Charges:</span>
                                    <span className={stripeStatus?.charges_enabled ? 'text-green-600' : 'text-red-600'}>
                                        {stripeStatus?.charges_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payouts:</span>
                                    <span className={stripeStatus?.payouts_enabled ? 'text-green-600' : 'text-red-600'}>
                                        {stripeStatus?.payouts_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                {hasRequirements && (
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                        <p className="font-medium text-yellow-800">Pending Requirements:</p>
                                        <p className="text-yellow-700">{stripeStatus.requirements.currently_due?.length || 0} items needed</p>
                                    </div>
                                )}
                            </div>

                            {!isStripeFullyEnabled && (
                                <div className="mt-6 pt-4 border-t">
                                    <Button
                                        onClick={handleConnectStripe}
                                        disabled={isConnecting}
                                        size="sm"
                                        className="w-full"
                                    >
                                        {hasRequirements ? 'Complete Requirements' : 'Finish Setup'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
