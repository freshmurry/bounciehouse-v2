
import React, { useState, useEffect } from 'react';
import { Listing } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Edit, Eye, Pause, Play, Trash2 } from 'lucide-react';

export default function DashboardListings({ user, userListings = [], isOwner }) {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (Array.isArray(userListings)) {
            setListings(userListings);
        }
        setIsLoading(false);
    }, [userListings]);

    const loadListings = async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            const userListings = await Listing.filter({ host_id: user.id });
            setListings(Array.isArray(userListings) ? userListings : []);
        } catch (error) {
            console.error('Error loading listings:', error);
            setListings([]);
        }
        setIsLoading(false);
    };

    const toggleListingStatus = async (listing) => {
        if (!listing?.id) return;
        
        try {
            await Listing.update(listing.id, { is_active: !listing.is_active });
            loadListings();
        } catch (error) {
            console.error('Error updating listing:', error);
            alert('Failed to update listing status');
        }
    };

    const deleteListing = async (listing) => {
        if (!listing?.id) return;
        
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await Listing.delete(listing.id);
                loadListings();
            } catch (error) {
                console.error('Error deleting listing:', error);
                alert('Failed to delete listing');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isOwner ? 'Manage Listings' : 'Create Your First Listing'}
                    </h2>
                    <p className="mt-1 text-gray-600">
                        {isOwner 
                            ? 'Create and manage your bounce house listings'
                            : 'Start earning by listing your bounce house'
                        }
                    </p>
                </div>
                <Button
                    onClick={() => navigate(createPageUrl('CreateListing'))}
                    className="bg-airbnb-red hover:bg-airbnb-red-dark"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                </Button>
            </div>

            {!Array.isArray(listings) || listings.length === 0 ? (
                <div className="text-center py-12">
                    <div className="max-w-sm mx-auto">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first bounce house listing</p>
                        <Button
                            onClick={() => navigate(createPageUrl('CreateListing'))}
                            className="bg-airbnb-red hover:bg-airbnb-red-dark"
                        >
                            Create Your First Listing
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {listings.map((listing) => (
                        <div key={listing.id || Math.random()} className="border border-gray-200 rounded-xl p-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src={Array.isArray(listing.images) && listing.images.length > 0 
                                            ? listing.images[0] 
                                            : '/api/placeholder/120/120'
                                        }
                                        alt={listing.title || 'Listing'}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {listing.title || 'Untitled Listing'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {listing.location?.city || 'Unknown'}, {listing.location?.state || 'Unknown'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                ${listing.pricing_model === 'daily' 
                                                    ? (listing.price_per_day || 0)
                                                    : (listing.price_per_hour || 0)
                                                }
                                                /{listing.pricing_model === 'daily' ? 'day' : 'hour'}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                listing.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {listing.is_active ? 'Active' : 'Paused'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(createPageUrl(`Listing?id=${listing.id}`))}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(createPageUrl(`EditListing?id=${listing.id}`))}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleListingStatus(listing)}
                                        >
                                            {listing.is_active ? (
                                                <>
                                                    <Pause className="w-4 h-4 mr-1" />
                                                    Pause
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-1" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteListing(listing)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
