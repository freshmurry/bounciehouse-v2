import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Review } from '@/api/entities';
import { Star, MapPin, Calendar } from 'lucide-react';
import UserAvatar from '../components/ui/UserAvatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get('id');
    if (userId) {
      loadUserProfile(userId);
    }
  }, [location]);

  const loadUserProfile = async (userId) => {
    setIsLoading(true);
    try {
      const [userData, userListings, userReviews] = await Promise.all([
        User.list().then(users => users.find(u => u.id === userId)),
        Listing.filter({ host_id: userId }),
        Review.filter({ reviewee_id: userId, review_type: 'guest_to_host' })
      ]);

      setUser(userData);
      setListings(userListings || []);
      setReviews(userReviews || []);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="flex items-center space-x-6 mb-8">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* User Header */}
      <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <UserAvatar user={user} size="2xl" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                <span>{calculateAverageRating()} ({reviews.length} reviews)</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Joined {new Date(user.created_date).getFullYear()}</span>
              </div>
            </div>
            {user.bio && (
              <p className="mt-4 text-gray-700">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* User's Listings */}
      {listings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{user.first_name}'s Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.slice(0, 6).map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <img
                  src={listing.images?.[0] || '/api/placeholder/300/200'}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.location?.city}, {listing.location?.state}
                  </div>
                  <p className="font-semibold">${listing.price_per_day}/day</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          <div className="space-y-6">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <UserAvatar user={{ id: review.reviewer_id }} size="md" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}