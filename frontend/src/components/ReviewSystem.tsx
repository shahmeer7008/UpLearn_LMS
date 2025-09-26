import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Review } from '@/types';

interface ReviewSystemProps {
  course_id: string;
  userEnrollment?: any;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ course_id, userEnrollment }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [course_id]);

  const loadReviews = () => {
    // Mock reviews data - in real app, this would come from API
    const mockReviews: Review[] = [
      {
        _id: '1',
        user_id: '1',
        userName: 'Sarah Student',
        course_id: course_id,
        rating: 5,
        comment: 'Excellent course! The instructor explains everything clearly and the hands-on projects really helped me understand the concepts.',
        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 12,
        reported: false
      },
      {
        _id: '2',
        user_id: '4',
        userName: 'John Learner',
        course_id: course_id,
        rating: 4,
        comment: 'Great content and well-structured. Could use more advanced examples, but overall very satisfied.',
        createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 8,
        reported: false
      },
      {
        _id: '3',
        user_id: '5',
        userName: 'Emily Chen',
        course_id: course_id,
        rating: 5,
        comment: 'This course exceeded my expectations. The practical exercises and real-world examples made learning enjoyable.',
        createdDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 15,
        reported: false
      }
    ];

    setReviews(mockReviews);
    
    // Check if current user has already reviewed
    const existingReview = mockReviews.find(r => r.user_id === user?._id);
    setUserReview(existingReview || null);
  };

  const handleSubmitReview = async () => {
    if (!user || !newRating || !newComment.trim()) {
      showError('Please provide both rating and comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const review: Review = {
        _id: Date.now().toString(),
        user_id: user._id,
        userName: user.name,
        userAvatar: user.profileImage,
        course_id,
        rating: newRating,
        comment: newComment.trim(),
        createdDate: new Date().toISOString(),
        helpful: 0,
        reported: false
      };

      if (userReview) {
        // Update existing review
        setReviews(prev => prev.map(r => r._id === userReview._id ? review : r));
        showSuccess('Review updated successfully!');
      } else {
        // Add new review
        setReviews(prev => [review, ...prev]);
        showSuccess('Review submitted successfully!');
      }

      setUserReview(review);
      setNewRating(0);
      setNewComment('');
      setShowReviewDialog(false);

    } catch (error) {
      showError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
    showSuccess('Thank you for your feedback!');
  };

  const handleReportReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId
        ? { ...review, reported: true }
        : review
    ));
    showSuccess('Review reported. Thank you for helping maintain quality.');
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const canReview = user && userEnrollment && userEnrollment.progress > 50; // Can review after 50% completion

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Student Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {getAverageRating().toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(getAverageRating()))}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(getRatingDistribution())
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ 
                          width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {canReview && (
            <div className="mt-6 pt-6 border-t">
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    {userReview ? 'Update Your Review' : 'Write a Review'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {userReview ? 'Update Your Review' : 'Write a Review'}
                    </DialogTitle>
                    <DialogDescription>
                      Share your experience with this course to help other students.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating *</label>
                      {renderStars(newRating, true, setNewRating)}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Comment *</label>
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts about this course..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || !newRating || !newComment.trim()}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!canReview && user && userEnrollment && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Complete at least 50% of the course to write a review
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No reviews yet. Be the first to share your experience!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.userAvatar} alt={review.userName} />
                    <AvatarFallback>
                      {review.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{review.userName}</h4>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(review.createdDate)}
                          </span>
                        </div>
                      </div>
                      
                      {review.user_id === user?._id && (
                        <Badge variant="outline">Your Review</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulClick(review._id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      
                      {review.user_id !== user?._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReportReview(review._id)}
                          className="text-gray-600 hover:text-red-600"
                          disabled={review.reported}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          {review.reported ? 'Reported' : 'Report'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;