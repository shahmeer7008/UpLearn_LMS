import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  BookOpen, 
  Star, 
  Users, 
  Clock,
  Trash2,
  ShoppingCart,
  Share2,
  Eye
} from 'lucide-react';
import { Course } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import api from '@/services/api'; // Use your centralized API instance

interface WishlistItem {
  _id: string;
  user_id: string;
  course_id: string;
  addedDate: string;
}

interface WishlistSystemProps {
  courseId?: string;
  showButton?: boolean;
}

const WishlistSystem: React.FC<WishlistSystemProps> = ({ courseId, showButton = true }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  useEffect(() => {
    if (courseId && wishlistItems.length > 0) {
      setIsInWishlist(wishlistItems.some(item => item.course_id === courseId));
    }
  }, [courseId, wishlistItems]);

  const loadWishlist = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      
      // Use the centralized API instance which already has auth headers
      const res = await api.get(`/wishlist/${user._id}`);
      setWishlistItems(res.data);

      // Load course details for each wishlist item
      const courses: Course[] = [];
      const coursePromises = res.data.map(async (item: WishlistItem) => {
        try {
          const courseRes = await api.get(`/courses/${item.course_id}`);
          return courseRes.data;
        } catch (error) {
          console.error(`Failed to load course ${item.course_id}:`, error);
          return null;
        }
      });

      const courseResults = await Promise.allSettled(coursePromises);
      courseResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          courses.push(result.value);
        }
      });

      setWishlistCourses(courses);
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please log in again.');
      } else if (error.response?.status === 404) {
        // User might not have a wishlist yet, that's okay
        setWishlistItems([]);
        setWishlistCourses([]);
      } else {
        showError(error.response?.data?.message || 'Failed to load wishlist');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user?._id || !courseId) {
      showError('Please log in to add courses to your wishlist');
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await api.delete(`/wishlist/${user._id}/${courseId}`);
        setIsInWishlist(false);
        showSuccess('Removed from wishlist');
      } else {
        // Add to wishlist
        await api.post('/wishlist', { 
          userId: user._id, 
          courseId: courseId 
        });
        setIsInWishlist(true);
        showSuccess('Added to wishlist');
      }

      // Reload wishlist to get updated data
      loadWishlist();
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please log in again.');
      } else {
        showError(error.response?.data?.message || 'Failed to update wishlist');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (courseIdToRemove: string) => {
    if (!user?._id) return;

    try {
      await api.delete(`/wishlist/${user._id}/${courseIdToRemove}`);
      showSuccess('Removed from wishlist');
      
      // Update local state immediately for better UX
      setWishlistItems(prev => prev.filter(item => item.course_id !== courseIdToRemove));
      setWishlistCourses(prev => prev.filter(course => course._id !== courseIdToRemove));
      
      // If this is the current course, update the button state
      if (courseIdToRemove === courseId) {
        setIsInWishlist(false);
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      if (error.response?.status === 401) {
        showError('Session expired. Please log in again.');
      } else {
        showError(error.response?.data?.message || 'Failed to remove from wishlist');
      }
    }
  };

  const shareWishlist = () => {
    const wishlistUrl = `${window.location.origin}/wishlist/${user?._id}`;
    navigator.clipboard.writeText(wishlistUrl);
    showSuccess('Wishlist link copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If user is not logged in, don't render anything
  if (!user) {
    return showButton && courseId ? (
      <Button
        variant="outline"
        size="sm"
        onClick={() => showError('Please log in to save courses')}
        className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      >
        <Heart className="h-4 w-4" />
        <span>Save</span>
      </Button>
    ) : null;
  }

  // Wishlist button component
  if (showButton && courseId) {
    return (
      <Button
        variant={isInWishlist ? "default" : "outline"}
        size="sm"
        onClick={toggleWishlist}
        disabled={isLoading}
        className={`flex items-center space-x-2 ${
          isInWishlist 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
        }`}
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        <span>{isLoading ? '...' : (isInWishlist ? 'Saved' : 'Save')}</span>
      </Button>
    );
  }

  // Full wishlist display component
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Courses you've saved for later
          </p>
        </div>
        {wishlistCourses.length > 0 && (
          <Button variant="outline" onClick={shareWishlist}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Wishlist
          </Button>
        )}
      </div>

      {isLoading && wishlistCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your wishlist...</p>
        </div>
      ) : wishlistCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Save courses you're interested in to easily find them later
            </p>
            <Link to="/courses">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {wishlistCourses.length} course{wishlistCourses.length !== 1 ? 's' : ''} saved
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistCourses.map((course) => {
              const wishlistItem = wishlistItems.find(item => item.course_id === course._id);
              
              return (
                <Card key={course._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        {course.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(course._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>By {course.instructorName}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{course.ratingAverage || '4.5'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount?.toLocaleString() || '0'} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.modules?.length || 0} modules</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {course.pricing === 0 ? 'Free' : `$${course.pricing?.toFixed(2) || '0.00'}`}
                      </div>
                      {wishlistItem && (
                        <span className="text-xs text-gray-500">
                          Added {formatDate(wishlistItem.addedDate)}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link to={`/courses/${course._id}`} className="flex-1">
                        <Button className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Course
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistSystem;