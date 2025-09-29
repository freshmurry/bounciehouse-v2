import React, { useState, useEffect, useCallback } from 'react';
import { Wishlist } from '@/api/entities';
import { Listing } from '@/api/entities';
import ListingCard from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';

export default function DashboardFavorites({ user }) {
    const [favoriteListings, setFavoriteListings] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const loadFavorites = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userWishlist = await Wishlist.filter({ user_id: user.id });
            setWishlistItems(userWishlist);

            if (userWishlist.length > 0) {
                const listingIds = userWishlist.map(item => item.listing_id);
                const listingsPromises = listingIds.map(id => Listing.get(id));
                const listingsData = await Promise.all(listingsPromises);
                setFavoriteListings(listingsData.filter(Boolean));
            } else {
                setFavoriteListings([]);
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const handleToggleWishlist = async (listingId, isCurrentlyWishlisted) => {
        if (!user) {
            await User.loginWithRedirect(window.location.href);
            return;
        }
        
        if (isCurrentlyWishlisted) {
            const wishlistItem = wishlistItems.find(item => item.listing_id === listingId);
            if (wishlistItem) {
                await Wishlist.delete(wishlistItem.id);
                loadFavorites(); 
            }
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Favorites</h2>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="space-y-3">
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : favoriteListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favoriteListings.map(listing => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            isWishlisted={true}
                            onToggleWishlist={handleToggleWishlist}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-6">
                        As you browse, tap the heart on listings you like to save them here.
                    </p>
                    <Button 
                        onClick={() => navigate(createPageUrl("Listings"))}
                        className="bg-airbnb-red hover:bg-airbnb-red-dark"
                    >
                        Browse Listings
                    </Button>
                </div>
            )}
        </div>
    );
}