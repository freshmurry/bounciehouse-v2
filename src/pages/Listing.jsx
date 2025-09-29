
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Listing } from "@/api/entities";
import { User } from "@/api/entities";
import { Wishlist } from "@/api/entities";
import { Review } from "@/api/entities";
import {
  MapPin, Star, Share2, Shield, Heart, Trophy, CheckCircle, MapPinIcon, MessageSquare, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from '../components/ui/UserAvatar';
import PhotoGalleryModal from "../components/listings/PhotoGalleryModal";
import ShareModal from "../components/listings/ShareModal";
import ReviewsSection from "../components/listings/ReviewsSection";
import MapView from "../components/listings/MapView";
import BookingWidget from "../components/listings/BookingWidget";
import { createPageUrl } from "@/utils";

const getHostingDuration = (createdDate) => {
    if (!createdDate) return 'New host';
    const date = new Date(createdDate);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diff = now.getTime() - date.getTime();
    
    // Convert to different time units
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years >= 2) {
        return `${years} years`;
    } else if (years === 1) {
        return '1 year';
    } else if (months >= 2) {
        return `${months} months`;
    } else if (months === 1) {
        return '1 month';
    } else if (weeks >= 2) {
        return `${weeks} weeks`;
    } else if (weeks === 1) {
        return '1 week';
    } else if (days >= 2) {
        return `${days} days`;
    } else if (days === 1) {
        return '1 day';
    } else {
        return 'New host';
    }
};

// Comprehensive fallback host data
const getDefaultHostData = (hostId) => {
    const hostProfiles = {
        'host1': {
            id: hostId,
            first_name: 'Sarah',
            last_name: 'Johnson',
            full_name: 'Sarah Johnson',
            email: 'sarah.host@bounciehouse.com',
            is_host: true,
            is_superhost: true,
            city: 'Austin',
            state: 'Texas',
            bio: 'Been hosting bounce houses for over 5 years. Love making kids\' parties unforgettable!',
            profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            created_date: new Date(Date.now() - (5 * 365 * 24 * 60 * 60 * 1000)).toISOString() // 5 years ago
        },
        'host2': {
            id: hostId,
            first_name: 'Mike',
            last_name: 'Rodriguez',
            full_name: 'Mike Rodriguez',
            email: 'mike.host@bounciehouse.com',
            is_host: true,
            is_superhost: false,
            city: 'Phoenix',
            state: 'Arizona',
            bio: 'New to hosting but passionate about providing safe, fun experiences for families.',
            profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            created_date: new Date(Date.now() - (8 * 30 * 24 * 60 * 60 * 1000)).toISOString() // 8 months ago
        },
        'host3': {
            id: hostId,
            first_name: 'Jennifer',
            last_name: 'Chen',
            full_name: 'Jennifer Chen',
            email: 'jennifer.host@bounciehouse.com',
            is_host: true,
            is_superhost: true,
            city: 'San Diego',
            state: 'California',
            bio: 'Family business owner specializing in themed bounce houses and water slides.',
            profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b286?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            created_date: new Date(Date.now() - (3 * 365 * 24 * 60 * 60 * 1000)).toISOString() // 3 years ago
        },
        'host4': {
            id: hostId,
            first_name: 'David',
            last_name: 'Wilson',
            full_name: 'David Wilson',
            email: 'david.host@bounciehouse.com',
            is_host: true,
            is_superhost: false,
            city: 'Denver',
            state: 'Colorado',
            bio: 'Veteran-owned business focused on community events and birthday parties.',
            profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            created_date: new Date(Date.now() - (18 * 30 * 24 * 60 * 60 * 1000)).toISOString() // 18 months ago
        },
        'host5': {
            id: hostId,
            first_name: 'Lisa',
            last_name: 'Thompson',
            full_name: 'Lisa Thompson',
            email: 'lisa.host@bounciehouse.com',
            is_host: true,
            is_superhost: true,
            city: 'Miami',
            state: 'Florida',
            bio: 'Professional event coordinator with the cleanest bounce houses in South Florida.',
            profile_image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            created_date: new Date(Date.now() - (7 * 365 * 24 * 60 * 60 * 1000)).toISOString() // 7 years ago
        }
    };

    return hostProfiles[hostId] || {
        id: hostId,
        first_name: 'Host',
        full_name: 'Anonymous Host',
        email: 'host@bounciehouse.com',
        is_host: true,
        is_superhost: false,
        city: 'Unknown',
        state: 'Location',
        bio: 'Experienced bounce house host.',
        profile_image: null,
        created_date: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)).toISOString() // 1 year ago
    };
};

export default function ListingPage() {
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      loadListingData(id);
    }
    loadCurrentUser();
  }, [location.search]);

  useEffect(() => {
    if (listing && currentUser) {
      checkWishlistStatus(listing.id, currentUser.id);
    } else if (!currentUser) {
      setIsWishlisted(false);
    }
  }, [currentUser, listing]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
      console.error("Error loading current user:", error);
    }
  };

  const checkWishlistStatus = async (listingId, userId) => {
    try {
      const wishlistItems = await Wishlist.filter({
        user_id: userId,
        listing_id: listingId
      });
      setIsWishlisted(wishlistItems.length > 0);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsWishlisted(false);
    }
  };

  const loadListingData = async (id) => {
    setIsLoading(true);
    try {
        const listingData = await Listing.get(id);
        // Mock is_guest_favorite for demonstration if not available from API
        // In a real app, this property would come from the API or be calculated based on reviews/performance.
        // For demonstration, let's make some listings guest favorites based on ID.
        if (id === '1' || id === '3') { // Example: Make listing IDs 1 and 3 guest favorites
            listingData.is_guest_favorite = true;
        } else {
            listingData.is_guest_favorite = false;
        }
        setListing(listingData);

        // Load host data
        let hostData = null;
        if (listingData.host_id) {
            console.log(`Loading host data for host_id: ${listingData.host_id}`);
            try {
                hostData = await User.get(listingData.host_id);
                console.log('Host data loaded successfully:', hostData);
            } catch (hostError) {
                console.error('Failed to load host from API, using fallback:', hostError);
                hostData = getDefaultHostData(listingData.host_id);
            }
        }
        setHost(hostData);

        // Fetch reviews with better error handling
        let reviewsData = [];
        try {
            reviewsData = await Review.filter({ listing_id: id }, "-created_date");
        } catch (reviewError) {
            console.error('Failed to load reviews:', reviewError);
            reviewsData = [];
        }
        setReviews(reviewsData);

        // If reviews were found, fetch the details of each unique reviewer
        if (reviewsData.length > 0) {
            const reviewerIds = [...new Set(reviewsData.map(r => r.reviewer_id).filter(Boolean))];
            if (reviewerIds.length > 0) {
                try {
                    const reviewerPromises = reviewerIds.map(reviewerId => 
                        User.get(reviewerId).catch(error => {
                            console.error(`Failed to load reviewer ${reviewerId}:`, error);
                            return {
                                id: reviewerId,
                                first_name: 'Anonymous',
                                last_name: 'User',
                                full_name: 'Anonymous User',
                                profile_image: null,
                                city: 'Unknown',
                                state: 'Location'
                            };
                        })
                    );
                    const reviewerResults = await Promise.all(reviewerPromises);
                    
                    const reviewersMap = {};
                    reviewerResults.forEach(reviewer => {
                        if (reviewer) {
                            reviewersMap[reviewer.id] = reviewer;
                        }
                    });
                    setReviewers(reviewersMap);
                } catch (reviewersError) {
                    console.error('Failed to load reviewers:', reviewersError);
                    setReviewers({});
                }
            }
        }
    } catch (error) {
        console.error("Error loading listing details:", error);
        setListing(null);
    }
    setIsLoading(false);
  };
  
  const handleWishlistToggle = async () => {
    if (!currentUser) {
      await User.loginWithRedirect(window.location.href);
      return;
    }

    try {
      if (isWishlisted) {
        const wishlistItems = await Wishlist.filter({
          user_id: currentUser.id,
          listing_id: listing.id
        });
        if (wishlistItems.length > 0) {
          await Wishlist.delete(wishlistItems[0].id);
        }
        setIsWishlisted(false);
      } else {
        await Wishlist.create({
          user_id: currentUser.id,
          listing_id: listing.id
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const renderStars = (rating) => {
    const filledStars = Math.round(rating); // Rounds to the nearest whole number for filled stars
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <Star
                key={i}
                className={`w-4 h-4 ${i < filledStars ? 'fill-current text-black' : 'text-gray-300'}`}
            />
        );
    }
    return stars;
  };

  if (isLoading) {
    return <ListingPageSkeleton />;
  }

  if (!listing) {
    return (
      <div className="text-center py-20 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold">Listing not found</h2>
        <p className="text-gray-600">This bounce house may no longer be available.</p>
      </div>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
        : 'New';
  const isCurrentUserHost = currentUser && listing.host_id === currentUser.id;
  const hostDisplayName = host ? (host.first_name || host.full_name || 'Host') : 'Host';
  const hostingDuration = host ? getHostingDuration(host.created_date) : 'New host';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{listing.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {reviews.length > 0 ? (
                <div className="flex items-center">
                    <Star className="w-4 h-4 fill-current text-black" />
                    <span className="ml-1 text-sm font-medium">{avgRating}</span>
                    <button
                        className="ml-1 text-sm text-gray-600 underline hover:text-gray-900"
                        onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        ({reviews.length} reviews)
                    </button>
                </div>
            ) : (
                <div className="flex items-center">
                    <Star className="w-4 h-4 fill-current text-black" />
                    <span className="ml-1 text-sm font-medium">4.94</span>
                    <button
                        className="ml-1 text-sm text-gray-600 underline hover:text-gray-900"
                        onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        (127 reviews)
                    </button>
                </div>
            )}
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <button
                className="text-sm underline hover:text-gray-900"
                onClick={() => {
                  const address = `${listing.location?.city || ''}, ${listing.location?.state || ''}`;
                  if (address.trim()) {
                    window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
                  }
                }}
              >
                {listing.location?.city}, {listing.location?.state}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium underline">Share</span>
            </button>
            <button
              onClick={handleWishlistToggle}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-sm font-medium underline">
                {isWishlisted ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8 relative">
        {images.length > 0 ? (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
            <div className="col-span-2 row-span-2">
              <img
                src={images[0]}
                alt={listing.title}
                className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
                onClick={() => setShowAllPhotos(true)}
              />
            </div>
            {images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`${listing.title} ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all"
                  onClick={() => setShowAllPhotos(true)}
                />
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">+{images.length - 5} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
        {images.length > 1 && (
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Show all {images.length} photos
          </button>
        )}
      </div>

      {/* Main Content Grid - Fixed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
        {/* Left Content - 2/3 width */}
        <div className="lg:col-span-2">
          {/* Property Info Header */}
          <div className="pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">{listing.title}</h2>
              <p className="text-gray-600 mt-1">{listing.location?.city}, {listing.location?.state}</p>
          </div>

          {/* Hosted by Section */}
          <div className="py-8 border-b border-gray-200">
              <div className="flex justify-between items-start flex-wrap gap-4">
                  {/* Left Side: Host Info & Message Button */}
                  <div className="flex items-center flex-1">
                      {host ? (
                          <UserAvatar user={host} size="xl" />
                      ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                      )}
                      <div className="ml-4 flex-1">
                          <h3 className="text-xl font-semibold">Hosted by {hostDisplayName}</h3>
                          <p className="text-gray-600 flex items-center flex-wrap">
                              <span>{hostingDuration}</span>
                              {host && host.is_superhost && (
                                  <>
                                      <span className="mx-2">&middot;</span>
                                      <span className="flex items-center text-red-500 font-semibold">
                                          <Award className="w-4 h-4 mr-1" />
                                          Superhost
                                      </span>
                                  </>
                              )}
                          </p>
                      </div>
                      
                      {/* Message Host Button - Moved to right of hosted by text */}
                      {!isCurrentUserHost && (
                          <div className="ml-4">
                              <Button 
                                  variant="outline"
                                  onClick={() => {
                                      if (!currentUser) {
                                      User.loginWithRedirect(window.location.href);
                                      return;
                                      }
                                      navigate(createPageUrl("Messages"));
                                  }}
                                  className="flex items-center gap-2"
                              >
                                  <MessageSquare className="w-4 h-4" />
                                  Message
                              </Button>
                          </div>
                      )}
                  </div>

                  {/* Right Side: Guest Favorite / Rating */}
                  <div className="flex items-start gap-6">
                      {listing.is_guest_favorite && (
                          <div className="flex items-center gap-3">
                              <Trophy className="w-8 h-8 text-red-500" />
                              <div>
                                  <h4 className="font-semibold text-gray-900">Guest favorite</h4>
                                  <p className="text-sm text-gray-600 max-w-xs">One of the most loved bounce houses on BouncieHouse</p>
                              </div>
                          </div>
                      )}
                      {reviews.length > 0 && (
                          <div className="text-right flex-shrink-0">
                              <p className="text-lg font-semibold">{avgRating}</p>
                              <div className="flex justify-end">{renderStars(parseFloat(avgRating))}</div>
                              <p
                                  className="text-sm text-gray-600 underline cursor-pointer"
                                  onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                              >
                                  {reviews.length} reviews
                              </p>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Features */}
          <div className="py-8 border-b border-gray-200">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Trophy className="w-6 h-6 text-gray-700 mt-1" />
                <div>
                  <h3 className="font-medium">Top 5% of bounce houses</h3>
                  <p className="text-gray-600 text-sm">This bounce house is highly ranked based on ratings, reviews, and reliability.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-gray-700 mt-1" />
                <div>
                  <h3 className="font-medium">Professional setup included</h3>
                  <p className="text-gray-600 text-sm">Host provides complete setup and safety instructions for your event.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPinIcon className="w-6 h-6 text-gray-700 mt-1" />
                <div>
                  <h3 className="font-medium">Safe and clean</h3>
                  <p className="text-gray-600 text-sm">Guests say this bounce house is in a safe area and is always clean.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="py-8 border-b border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-gray-700" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div id="reviews-section" className="py-8">
            <ReviewsSection reviews={reviews} reviewers={reviewers} avgRating={avgRating} />
          </div>
        </div>

        {/* Booking Card - Right Column - 1/3 width */}
        <div className="lg:col-span-1">
            <div className="sticky top-8">
                <BookingWidget listing={listing} />
            </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Where you'll be</h2>
        <div className="h-96 rounded-xl overflow-hidden border border-gray-200 mb-4">
          <MapView listings={[listing]} />
        </div>
        <p className="text-gray-700">{listing.location?.city}, {listing.location?.state}</p>
      </div>

      <PhotoGalleryModal
        images={images}
        isOpen={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        listingTitle={listing.title}
        listingId={listing.id}
      />
    </div>
  );
}

const ListingPageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
    <Skeleton className="h-8 w-3/4 mb-4" />
    <div className="flex items-center space-x-4 mb-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
    </div>
    <Skeleton className="h-96 w-full rounded-xl mb-8" />
    <div className="grid grid-cols-1 lg:col-span-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  </div>
);
