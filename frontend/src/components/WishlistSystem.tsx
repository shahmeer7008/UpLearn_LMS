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
import { getCourseById, getFromStorage, saveToStorage } from '@/data/mockData';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';

interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
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
      setIsInWishlist(wishlistItems.some(item => item.courseId === courseId));
    }
  }, [courseId, wishlistItems]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      const savedWishlist = getFromStorage('wishlist') || [];
      const userWishlist = savedWishlist.filter((item: WishlistItem) => item.userId === user.id);
      setWishlistItems(userWishlist);

      // Load course details for wishlist items
      const courses: Course[] = [];
      for (const item of userWishlist) {
        const course = await getCourseById(item.courseId);
        if (course) {
          courses.push(course);
        }
      }
      setWishlistCourses(courses);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !courseId) {
      showError('Please log in to add courses to your wishlist');
      return;
    }

    setIsLoading(true);

    try {
      const savedWishlist = getFromStorage('wishlist') || [];
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = savedWishlist.filter(
          (item: WishlistItem) => !(item.userId === user.id && item.courseId === courseId)
        );
        saveToStorage('wishlist', updatedWishlist);
        setIsInWishlist(false);
        showSuccess('Removed from wishlist');
      } else {
        // Add to wishlist
        const newWishlistItem: WishlistItem = {
          id: `w${Date.now()}`,
          userId: user.id,
          courseId,
          addedDate: new Date().toISOString()
        };
        savedWishlist.push(newWishlistItem);
        saveToStorage('wishlist', savedWishlist);
        setIsInWishlist(true);
        showSuccess('Added to wishlist');
      }

      loadWishlist();
    } catch (error) {
      showError('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (courseIdToRemove: string) => {
    if (!user) return;

    try {
      const savedWishlist = getFromStorage('wishlist') || [];
      const updatedWishlist = savedWishlist.filter(
        (item: WishlistItem) => !(item.userId === user.id && item.courseId === courseIdToRemove)
      );
      saveToStorage('wishlist', updatedWishlist);
      showSuccess('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      showError('Failed to remove from wishlist');
    }
  };

  const shareWishlist = () => {
    const wishlistUrl = `${window.location.origin}/wishlist/${user?.id}`;
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
        <span>{isInWishlist ? 'Saved' : 'Save'}</span>
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

      {wishlistCourses.length === 0 ? (
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
              const wishlistItem = wishlistItems.find(item => item.courseId === course.id);
              
              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        {course.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(course.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                        <span>{course.ratingAverage}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount.toLocaleString()} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.modules.length} modules</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {course.pricing === 0 ? 'Free' : `$${course.pricing.toFixed(2)}`}
                      </div>
                      {wishlistItem && (
                        <span className="text-xs text-gray-500">
                          Added {formatDate(wishlistItem.addedDate)}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link to={`/courses/${course.id}`} className="flex-1">
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