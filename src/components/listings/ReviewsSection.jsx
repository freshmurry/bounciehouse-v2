import React, { useState } from 'react';
import { Star, Sparkles, MapPin, MessageSquare, CheckCircle, Tag } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';

const RatingBar = ({ label, score, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 min-h-[40px]">
        <div className="flex items-center space-x-3 flex-shrink-0 w-32">
            <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center space-x-3 flex-1 ml-4">
            <div className="flex-1 bg-gray-200 rounded-full h-1 max-w-[120px]">
                <div 
                    className="bg-gray-800 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${score * 20}%` }}
                ></div>
            </div>
            <span className="text-sm font-semibold text-gray-900 w-8 text-right flex-shrink-0">
                {score.toFixed(1)}
            </span>
        </div>
    </div>
);

const OverallRatingBar = ({ stars, count, total }) => (
    <div className="flex items-center space-x-3 py-2">
        <span className="text-sm text-gray-600 w-4 text-center flex-shrink-0">{stars}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-1 max-w-[200px]">
            <div 
                className="bg-gray-800 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
            ></div>
        </div>
        <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
            {count}
        </span>
    </div>
);

const ReviewCard = ({ review, reviewer }) => {
    const [showFull, setShowFull] = useState(false);
    if (!review) return null;

    const isLong = review.comment && review.comment.length > 150;
    const reviewerName = reviewer ? `${reviewer.first_name || ''} ${reviewer.last_name || ''}`.trim() || reviewer.full_name || 'Anonymous' : 'Anonymous';
    const reviewerLocation = reviewer ? `${reviewer.city || 'Unknown'}, ${reviewer.state || 'Location'}` : 'Unknown Location';
    const reviewDate = new Date(review.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="py-6 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <UserAvatar user={reviewer} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{reviewerName}</p>
                            <p className="text-sm text-gray-500">{reviewerLocation}</p>
                        </div>
                        <p className="text-sm text-gray-500 ml-4 flex-shrink-0">{reviewDate}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.round(review.rating) ? 'fill-black text-black' : 'fill-gray-300 text-gray-300'}`} 
                            />
                        ))}
                    </div>
                    
                    <div className="text-gray-700 leading-relaxed">
                        <p>
                            {isLong && !showFull ? `${review.comment.substring(0, 150)}...` : review.comment}
                        </p>
                        {isLong && (
                            <button 
                                onClick={() => setShowFull(!showFull)}
                                className="mt-2 font-semibold underline text-gray-900 hover:text-gray-700 transition-colors"
                            >
                                {showFull ? "Show less" : "Show more"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ReviewsSection({ reviews, reviewers = {}, avgRating }) {
    const [showAll, setShowAll] = useState(false);
    const reviewsToShow = showAll ? reviews : reviews.slice(0, 6);

    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Reviews</h2>
                <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
            </div>
        );
    }

    const avgCleanliness = (reviews.reduce((acc, r) => acc + (r.cleanliness || 0), 0) / totalReviews);
    const avgAccuracy = (reviews.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalReviews);
    const avgCheckIn = (reviews.reduce((acc, r) => acc + (r.check_in || 0), 0) / totalReviews);
    const avgCommunication = (reviews.reduce((acc, r) => acc + (r.communication || 0), 0) / totalReviews);
    const avgLocation = (reviews.reduce((acc, r) => acc + (r.location || 0), 0) / totalReviews);
    const avgValue = (reviews.reduce((acc, r) => acc + (r.value || 0), 0) / totalReviews);
    
    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
        const rating = Math.round(review.rating);
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating - 1]++;
        }
    });
    
    return (
        <div className="py-8">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-8">
                <Star className="w-6 h-6 fill-black text-black" />
                <h2 className="text-2xl font-semibold text-gray-900">
                    {avgRating} · {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </h2>
            </div>

            {/* Rating Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8 mb-12">
                {/* Left Column - Overall Rating Distribution */}
                <div className="space-y-1">
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Overall rating</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <OverallRatingBar
                                key={stars}
                                stars={stars}
                                count={ratingCounts[stars - 1]}
                                total={totalReviews}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column - Category Ratings */}
                <div className="space-y-1">
                    <RatingBar label="Cleanliness" score={avgCleanliness} icon={Sparkles} />
                    <RatingBar label="Accuracy" score={avgAccuracy} icon={CheckCircle} />
                    <RatingBar label="Check-in" score={avgCheckIn} icon={Tag} />
                    <RatingBar label="Communication" score={avgCommunication} icon={MessageSquare} />
                    <RatingBar label="Location" score={avgLocation} icon={MapPin} />
                    <RatingBar label="Value" score={avgValue} icon={Star} />
                </div>
            </div>

            {/* Individual Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                {reviewsToShow.map((review) => (
                    <ReviewCard key={review.id} review={review} reviewer={reviewers[review.reviewer_id]} />
                ))}
            </div>

            {reviews.length > 6 && !showAll && (
                <div className="mt-8">
                    <Button variant="outline" onClick={() => setShowAll(true)}>
                        Show all {reviews.length} reviews
                    </Button>
                </div>
            )}
        </div>
    );
}