import React, { useState, useEffect } from 'react';
import { Listing } from '@/api/entities';
import { User } from '@/api/entities';
import { Wishlist } from '@/api/entities';
import ListingCard from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

export default function FeaturedListings() {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const user = await User.me().catch(() => null);
            setCurrentUser(user);

            // Load featured listings with error handling
            let data = [];
            try {
                data = await Listing.filter({ is_active: true }, '-created_date', 8);
                if (!Array.isArray(data)) {
                    console.warn('Listings data is not an array:', data);
                    data = [];
                }
            } catch (listingError) {
                console.error("Error loading listings:", listingError);
                data = [];
            }

            // Load wishlist with error handling
            let userWishlist = [];
            if (user) {
                try {
                    userWishlist = await Wishlist.filter({ user_id: user.id });
                    if (!Array.isArray(userWishlist)) {
                        console.warn('Wishlist data is not an array:', userWishlist);
                        userWishlist = [];
                    }
                } catch (wishlistError) {
                    console.error("Error loading wishlist:", wishlistError);
                    userWishlist = [];
                }
            }
            
            setListings(data);
            setWishlistItems(userWishlist);

        } catch (error) {
            console.error("Error loading featured listings data:", error);
            setListings([]);
            setWishlistItems([]);
        }
        setIsLoading(false);
    };

    const handleToggleWishlist = async (listingId, isCurrentlyWishlisted) => {
        if (!currentUser) {
            await User.loginWithRedirect(window.location.href);
            return;
        }

        try {
            if (isCurrentlyWishlisted) {
                const wishlistItem = wishlistItems.find(item => item.listing_id === listingId);
                if (wishlistItem) {
                    await Wishlist.delete(wishlistItem.id);
                    setWishlistItems(prev => prev.filter(item => item.id !== wishlistItem.id));
                }
            } else {
                const newItem = await Wishlist.create({ user_id: currentUser.id, listing_id: listingId });
                setWishlistItems(prev => [...prev, newItem]);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    if (isLoading) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Bounce Houses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array(4).fill(0).map((_, index) => (
                            <div key={index} className="space-y-3">
                                <Skeleton className="h-64 w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!Array.isArray(listings) || listings.length === 0) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Bounce Houses</h2>
                    <div className="text-center py-12">
                        <p className="text-gray-600">No featured listings available at the moment.</p>
                        <Button 
                            onClick={() => navigate(createPageUrl('Listings'))} 
                            className="mt-4 bg-airbnb-red hover:bg-airbnb-red-dark"
                        >
                            Browse All Listings
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Bounce Houses</h2>
                    <Button variant="ghost" onClick={() => navigate(createPageUrl('Listings'))} className="text-airbnb-red hover:text-airbnb-red-dark">
                        View all <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {listings.map((listing) => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            isWishlisted={Array.isArray(wishlistItems) && wishlistItems.some(item => item.listing_id === listing.id)}
                            onToggleWishlist={handleToggleWishlist}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}