import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import ProtectedRoute from './ProtectedRoute';
import { 
  Star, 
  Users, 
  Clock, 
  PlayCircle,
  BookOpen,
  Award,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Course, Enrollment } from '@/types';
import WishlistSystem from './WishlistSystem';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
  showInstructor?: boolean;
  showActions?: boolean;
  onEnroll?: (courseId: string) => void;
  onWishlist?: (courseId: string) => void;
  onShare?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrollment,
  variant = 'default',
  showProgress = false,
  showInstructor = true,
  showActions = true,
  onEnroll,
  onWishlist,
  onShare
}) => {
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getPriceColor = (price: number) => {
    return price === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';
  };

  const getStatusBadge = () => {
    if (!enrollment) return null;
    
    switch (enrollment.completionStatus) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      default:
        return null;
    }
  };

  const getTotalDuration = () => {
    return course.modules.reduce((total, module) => total + (module.duration || 30), 0);
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs">{course.ratingAverage}</span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{course.enrollmentCount} students</span>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className={`font-bold text-sm ${getPriceColor(course.pricing)}`}>
                    {formatPrice(course.pricing)}
                  </div>
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg relative overflow-hidden">
          {course.previewVideoUrl ? (
            <iframe
              src={course.previewVideoUrl}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <PlayCircle className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">{course.category}</Badge>
          </div>
          {showActions && (
            <div className="absolute top-2 left-2 flex space-x-1">
              <WishlistSystem courseId={course.id} />
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onShare?.(course.id)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-3 mt-2">
                {course.description}
              </CardDescription>
            </div>
            <div className="ml-4">
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showInstructor && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {course.instructorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {course.instructorName}
              </span>
            </div>
          )}

          {showProgress && enrollment && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{course.ratingAverage}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{Math.round(getTotalDuration() / 60)}h</span>
              </div>
            </div>
            <div className={`font-bold text-lg ${getPriceColor(course.pricing)}`}>
              {formatPrice(course.pricing)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to={`/courses/${course.id}`} className="flex-1 mr-2">
              <Button className="w-full">
                {enrollment ? 'Continue Learning' : 'View Course'}
              </Button>
            </Link>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onWishlist?.(course.id)}>
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare?.(course.id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Course
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2">
            {course.category}
          </Badge>
          <div className={`font-bold text-lg ${getPriceColor(course.pricing)}`}>
            {formatPrice(course.pricing)}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showInstructor && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>By {course.instructorName}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{course.ratingAverage}</span>
              </div>
            </div>
          )}

          {showProgress && enrollment && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>
          )}

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

          <div className="flex space-x-2">
            <Link to={`/courses/${course.id}`} className="flex-1">
              <Button className="w-full">
                {enrollment ? 'Continue Learning' : 'View Course'}
              </Button>
            </Link>
            {showActions && (
              <WishlistSystem courseId={course.id} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;