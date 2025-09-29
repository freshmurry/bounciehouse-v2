
import React, { useState, useEffect } from "react";
import { Listing } from "@/api/entities";
import { User } from "@/api/entities";
import { Wishlist } from "@/api/entities";
import { Search, Map, Filter, Grid, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import MapView from "../components/listings/MapView";
import ListingCard from "../components/listings/ListingCard";
import FilterPanel from "../components/listings/FilterPanel";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...listings];
      
      // Search query filter
      if (searchQuery) {
        filtered = filtered.filter(listing =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Price range filter
      if (activeFilters.priceRange) {
        filtered = filtered.filter(listing => {
          const price = listing.pricing_model === 'daily' ? listing.price_per_day : listing.price_per_hour;
          return price >= activeFilters.priceRange[0] && price <= activeFilters.priceRange[1];
        });
      }

      // Capacity filter
      if (activeFilters.capacity) {
        filtered = filtered.filter(listing => 
          listing.capacity >= parseInt(activeFilters.capacity)
        );
      }

      // Amenities filter
      if (activeFilters.amenities && activeFilters.amenities.length > 0) {
        filtered = filtered.filter(listing => 
          activeFilters.amenities.some(amenity => 
            listing.amenities?.includes(amenity)
          )
        );
      }

      // Location filter
      if (activeFilters.location) {
        filtered = filtered.filter(listing =>
          listing.location?.city?.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
          listing.location?.state?.toLowerCase().includes(activeFilters.location.toLowerCase())
        );
      }

      setFilteredListings(filtered);
    };

    applyFilters();
  }, [listings, searchQuery, activeFilters]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me().catch(() => null);
      setCurrentUser(user);

      const [data, userWishlist] = await Promise.all([
        Listing.list("-created_date", 50),
        user ? Wishlist.filter({ user_id: user.id }) : Promise.resolve([])
      ]);
      
      setListings(data.filter(listing => listing.is_active));
      setWishlistItems(userWishlist);

    } catch (error) {
      console.error("Error loading initial data:", error);
    }
    setIsLoading(false);
  };

  const handleToggleWishlist = async (listingId, isCurrentlyWishlisted) => {
    if (!currentUser) {
        await User.loginWithRedirect(window.location.href);
        return;
    }

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
  };

  const handleApplyFilters = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== 'any' && value !== '';
  }).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search and Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side: Back button and Search */}
            <div className="flex items-center gap-4 flex-1">
              <Button 
                variant="ghost" 
                onClick={() => navigate(createPageUrl("Home"))}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Bounce Houses"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-airbnb-red focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            {/* Right side: Filters and View toggles */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <button 
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow relative"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center border border-gray-300 rounded-full p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full ${viewMode === "grid" ? 'bg-gray-100' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded-full ${viewMode === "map" ? 'bg-gray-100' : ''}`}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {filteredListings.length} bounce houses
          </h1>
          <p className="text-gray-600">Rent unique bounce houses from local hosts</p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoading ? (
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-64 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))
            ) : (
              filteredListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  isWishlisted={wishlistItems.some(item => item.listing_id === listing.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))
            )}
          </div>
        ) : (
          <div className="h-[700px] rounded-xl overflow-hidden border border-gray-200">
            <MapView listings={filteredListings} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredListings.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No exact matches</h3>
            <p className="text-gray-600 mb-6">
              Try changing or removing some of your filters or adjusting your search area.
            </p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setActiveFilters({});
              }}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Remove all filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
}
