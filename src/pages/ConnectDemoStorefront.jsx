import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import { connectDemoListProducts, connectDemoCreateCheckout } from '@/api/functions';

const StorefrontCard = ({ children }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {children}
    </div>
);

const ProductCard = ({ product, onBuyClick, isBuying }) => {
    const price = product.default_price;
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-100 h-48 flex items-center justify-center text-gray-400">
                {/* In a real app, you would use product.images[0] */}
                Image Placeholder
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600 text-sm mt-1 flex-grow">{product.description || 'No description available.'}</p>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-xl font-bold">
                        ${(price.unit_amount / 100).toFixed(2)}
                    </p>
                    <Button onClick={() => onBuyClick(price.id)} disabled={isBuying}>
                        {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buy Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function ConnectDemoStorefront() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyingPriceId, setBuyingPriceId] = useState(null);
    const location = useLocation();
    
    const params = new URLSearchParams(location.search);
    // In a production app, you would use a more user-friendly identifier like a username
    // instead of the raw Stripe account ID in the URL.
    const accountId = params.get('account_id');

    useEffect(() => {
        if (!accountId) {
            setError('No account specified. Cannot display storefront.');
            setIsLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const { data } = await connectDemoListProducts({ accountId });
                setProducts(data.filter(p => p.active && p.default_price));
            } catch (err) {
                setError(`Failed to load products: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [accountId]);

    const handleBuy = async (priceId) => {
        setBuyingPriceId(priceId);
        try {
            const { data } = await connectDemoCreateCheckout({ priceId, accountId });
            window.location.href = data.url; // Redirect to Stripe Checkout
        } catch (err) {
            setError(`Could not initiate purchase: ${err.message}`);
            setBuyingPriceId(null);
        }
    };

    if (!accountId) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error</h1>
                <p className="mt-2 text-gray-700">No seller account was specified in the URL.</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome to the Storefront</h1>
                {/* This is a developer comment as requested */}
                <p className="mt-2 text-sm text-gray-500">
                    Displaying products for account: <code>{accountId}</code>.
                    <br />
                    (Note: In a real app, use a user-friendly URL slug instead of the account ID).
                </p>
            </header>

            {isLoading ? (
                <div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <p className="text-center text-red-600">{error}</p>
            ) : products.length === 0 ? (
                <StorefrontCard>
                    <div className="text-center py-12">
                        <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold">Store is empty</h2>
                        <p className="text-gray-600 mt-2">This seller hasn't added any products yet.</p>
                    </div>
                </StorefrontCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onBuyClick={handleBuy}
                            isBuying={buyingPriceId === product.default_price.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}