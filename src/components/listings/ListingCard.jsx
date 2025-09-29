import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Heart } from 'lucide-react';

export default function ListingCard({ listing, isWishlisted, onToggleWishlist }) {
  const mainImage = (listing.images && listing.images.length > 0) ? listing.images[0] : "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  
  const handleWishlistClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onToggleWishlist) {
        onToggleWishlist(listing.id, isWishlisted);
      }
  };

  const price = listing.pricing_model === 'daily' ? listing.price_per_day : listing.price_per_hour;
  const priceUnit = listing.pricing_model === 'daily' ? 'day' : 'hour';

  return (
    <div className="group">
      <Link to={createPageUrl(`Listing?id=${listing.id}`)} className="block cursor-pointer">
        <div className="relative">
          <img
            src={mainImage}
            alt={listing.title || 'Bounce house'}
            className="w-full h-64 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
          <button 
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white hover:scale-110 transition-all duration-200"
          >
            <Heart className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {listing.location?.city}, {listing.location?.state}
            </h3>
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-current text-gray-900" />
              <span className="ml-1 text-sm">4.8</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm line-clamp-1 mt-1">
            {listing.title}
          </p>
          
          <div className="mt-1">
            {price ? (
                <>
                    <span className="font-semibold">${price}</span>
                    <span className="text-gray-500"> / {priceUnit}</span>
                </>
            ) : (
                <span className="font-semibold">Price not set</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}