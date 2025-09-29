import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, ExternalLink, PlusCircle } from 'lucide-react';
import { connectDemoCreateAccount, connectDemoCreateAccountLink, connectDemoGetAccount } from '@/api/functions';
import { connectDemoCreateProduct } from '@/api/functions';

// A simple card component for consistent styling
const Card = ({ children }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {children}
    </div>
);

// Component to display the status of the connected account
const AccountStatus = ({ status, onOnboardClick, isLoading }) => {
    const StatusPill = ({ enabled, text }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {enabled ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <XCircle className="w-4 h-4 mr-1.5" />}
            {text}
        </span>
    );

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600">Can Accept Payments:</p>
                    <StatusPill enabled={status.charges_enabled} text={status.charges_enabled ? 'Enabled' : 'Disabled'} />
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-gray-600">Can Receive Payouts:</p>
                    <StatusPill enabled={status.payouts_enabled} text={status.payouts_enabled ? 'Enabled' : 'Disabled'} />
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-gray-600">Onboarding Details Submitted:</p>
                    <StatusPill enabled={status.details_submitted} text={status.details_submitted ? 'Complete' : 'Incomplete'} />
                </div>
            </div>
            {(!status.details_submitted || !status.payouts_enabled) && (
                <div className="mt-6 border-t pt-4">
                    <p className="text-sm text-gray-700 mb-3">
                        {!status.details_submitted 
                            ? 'Additional information is required to complete your account setup and enable payments.'
                            : 'Please provide your bank account information to enable payouts.'
                        }
                    </p>
                    <Button onClick={onOnboardClick} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                        {!status.details_submitted ? 'Complete Account Setup' : 'Add Bank Account'}
                    </Button>
                </div>
            )}
            {status.charges_enabled && status.details_submitted && status.payouts_enabled && (
                <div className="mt-6 border-t pt-4">
                    <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm font-medium">Account fully set up and ready to accept payments!</p>
                    </div>
                </div>
            )}
        </Card>
    );
};

// Component for the product creation form
const ProductCreator = ({ accountId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setFeedback('');
        try {
            await connectDemoCreateProduct({ name, description, price: parseFloat(price), accountId });
            setFeedback('Product created successfully!');
            setName('');
            setDescription('');
            setPrice('');
        } catch (error) {
            setFeedback(`Error: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create a New Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="product-desc">Description</Label>
                    <Input id="product-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="product-price">Price (USD)</Label>
                    <Input id="product-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isCreating}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Add Product
                </Button>
            </form>
            {feedback && <p className="mt-4 text-sm">{feedback}</p>}
        </Card>
    );
};


export default function ConnectDemoOnboarding() {
    const [user, setUser] = useState(null);
    const [accountStatus, setAccountStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch user and account status on page load
    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser.stripe_account_id) {
                    const { data: status } = await connectDemoGetAccount({ accountId: currentUser.stripe_account_id });
                    setAccountStatus(status);
                }
            } catch {
                    setError('You must be logged in to view this page.');
                } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, []);
    
    // Handler to create a new Stripe Connect account
    const handleCreateAccount = async () => {
        setIsLoading(true);
        try {
            const { data } = await connectDemoCreateAccount();
            // Refresh page data to show the new account status
            const newUserState = { ...user, stripe_account_id: data.accountId };
            setUser(newUserState);
            const { data: status } = await connectDemoGetAccount({ accountId: data.accountId });
            setAccountStatus(status);
        } catch (err) {
            setError(`Failed to create account: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler to start the onboarding process
    const handleOnboard = async () => {
        setIsLoading(true);
        try {
            const { data } = await connectDemoCreateAccountLink({ accountId: user.stripe_account_id });
            window.location.href = data.url; // Redirect user to Stripe for onboarding
        } catch (err) {
            setError(`Failed to start onboarding: ${err.message}`);
            setIsLoading(false);
        }
    };

    // Main render logic
    if (isLoading && !user) {
        return <div className="p-8 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>;
    }
    
    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    const accountReady = accountStatus && accountStatus.charges_enabled && accountStatus.details_submitted;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Stripe Connect Dashboard</h1>
                <p className="mt-2 text-gray-600">Onboard your account, manage products, and view your public storefront.</p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Demo Mode:</strong> This demo uses a specific Stripe Connect account for testing purposes.
                    </p>
                </div>
            </header>
            
            {!user?.stripe_account_id ? (
                <Card>
                    <h2 className="text-xl font-semibold mb-3">Connect to the demo Stripe account to start testing the marketplace functionality.</h2>
                    <p className="text-gray-600 mb-6">Create a Stripe account to start accepting payments and selling products.</p>
                    <Button onClick={handleCreateAccount} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Connect Demo Account
                    </Button>
                </Card>
            ) : (
                <div className="space-y-6">
                    {accountStatus && <AccountStatus status={accountStatus} onOnboardClick={handleOnboard} isLoading={isLoading} />}
                    
                    {accountReady && (
                        <>
                            <ProductCreator accountId={user.stripe_account_id} />
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Storefront</h3>
                                <p className="text-gray-600 mb-4">This is the public link where customers can view and buy your products.</p>
                                <Link to={createPageUrl(`ConnectDemoStorefront?account_id=${user.stripe_account_id}`)}>
                                    <Button variant="outline">View My Storefront</Button>
                                </Link>
                            </Card>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
