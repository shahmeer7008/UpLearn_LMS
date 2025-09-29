import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Course, Enrollment } from '@/types';
import api from '@/services/api'; // Use your configured api instance instead of axios
import CourseCard from './CourseCard';

interface RecommendationSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  courses: Course[];
  reason: string;
}

const CourseRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const getUserId = () => {
    return user?._id||null;
  };

  const loadRecommendations = async () => {
    if (!user) return;

    const userId = getUserId();
    if (!userId) {
      console.error('No valid user ID found');
      setError('User session invalid. Please log in again.');
      setIsLoading(false);
      return;
    }

    console.log('Loading recommendations for user:', userId);
    setIsLoading(true);
    setError(null);

    try {
      // Fixed API calls with correct route structure
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get('/courses'), // Correct route
        api.get(`/student/${userId}/enrollments`) // Fixed: /student/userid/enrollments
      ]);

      console.log('Courses response:', coursesRes.data);
      console.log('Enrollments response:', enrollmentsRes.data);

      const allCourses = coursesRes.data;
      const userEnrollments = enrollmentsRes.data;
      const enrolledCourseIds = userEnrollments.map((e: Enrollment) => e.course_id);
      const availableCourses = allCourses.filter((course: Course) =>
        !enrolledCourseIds.includes(course._id) && course.status === 'approved'
      );

      const recommendationSections: RecommendationSection[] = [];

      // 1. Based on enrolled courses (similar categories)
      if (userEnrollments.length > 0) {
        const enrolledCourses = allCourses.filter((c: Course) => enrolledCourseIds.includes(c._id));
        const userCategories = [...new Set(enrolledCourses.map(c => c.category))];
        
        const similarCourses = availableCourses
          .filter(course => userCategories.includes(course.category))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);

        if (similarCourses.length > 0) {
          recommendationSections.push({
            title: 'More in Your Interests',
            description: 'Based on your enrolled courses',
            icon: <Target className="h-5 w-5" />,
            courses: similarCourses,
            reason: `Because you're learning ${userCategories.join(', ')}`
          });
        }
      }

      // 2. Trending/Popular courses (random selection for now)
      const shuffledCourses = [...availableCourses].sort(() => Math.random() - 0.5);
      const trendingCourses = shuffledCourses.slice(0, 4);

      if (trendingCourses.length > 0) {
        recommendationSections.push({
          title: 'Trending Now',
          description: 'Most popular courses this month',
          icon: <TrendingUp className="h-5 w-5" />,
          courses: trendingCourses,
          reason: 'Popular among learners like you'
        });
      }

      // 3. Highly rated courses
      const topRatedCourses = availableCourses
        .filter(course => (course.rating || 0) >= 4.0) // Handle undefined ratings
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

      if (topRatedCourses.length > 0) {
        recommendationSections.push({
          title: 'Top Rated',
          description: 'Highest rated courses by students',
          icon: <Star className="h-5 w-5" />,
          courses: topRatedCourses,
          reason: 'Loved by students worldwide'
        });
      }

      // 4. Free courses
      const freeCourses = availableCourses
        .filter(course => course.pricing === 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

      if (freeCourses.length > 0) {
        recommendationSections.push({
          title: 'Free to Learn',
          description: 'Start learning without any cost',
          icon: <Sparkles className="h-5 w-5" />,
          courses: freeCourses,
          reason: 'Perfect for exploring new topics'
        });
      }

      // 5. Quick wins (short courses)
      const quickCourses = availableCourses
        .filter(course => (course.duration || 0) <= 5)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

      if (quickCourses.length > 0) {
        recommendationSections.push({
          title: 'Quick Wins',
          description: 'Short courses you can complete quickly',
          icon: <Clock className="h-5 w-5" />,
          courses: quickCourses,
          reason: 'Perfect for busy schedules'
        });
      }

      setRecommendations(recommendationSections);
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Please ensure you are logged in as a student.');
      } else if (error.response?.status === 404) {
        setError('Student profile not found.');
      } else {
        setError('Failed to load recommendations. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <BookOpen className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Recommendations
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enroll in some courses to get personalized recommendations
          </p>
          <Button onClick={loadRecommendations}>
            Refresh Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        Debug: User ID: {getUserId()}, Sections: {recommendations.length}
      </div>

      {recommendations.map((section, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </div>
            <Button variant="outline" className="hidden md:flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <Badge variant="outline" className="text-sm">
              {section.reason}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {section.courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                variant="default"
                showInstructor={true}
                showActions={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseRecommendations;