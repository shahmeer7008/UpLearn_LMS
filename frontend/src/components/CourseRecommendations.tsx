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
import axios from 'axios';
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

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get(`/api/student/enrollments/${user._id}`)
      ]);
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
          .sort((a, b) => b.rating - a.rating)
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

      // 2. Trending/Popular courses
      const trendingCourses = availableCourses
        .sort((a, b) => 0)
        .slice(0, 4);

      recommendationSections.push({
        title: 'Trending Now',
        description: 'Most popular courses this month',
        icon: <TrendingUp className="h-5 w-5" />,
        courses: trendingCourses,
        reason: 'Popular among learners like you'
      });

      // 3. Highly rated courses
      const topRatedCourses = availableCourses
        .filter(course => course.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

      recommendationSections.push({
        title: 'Top Rated',
        description: 'Highest rated courses by students',
        icon: <Star className="h-5 w-5" />,
        courses: topRatedCourses,
        reason: 'Loved by students worldwide'
      });

      // 4. Free courses
      const freeCourses = availableCourses
        .filter(course => course.pricing === 0)
        .sort((a, b) => b.rating - a.rating)
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
        .filter(course => course.duration <= 5)
        .sort((a, b) => b.rating - a.rating)
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
    } catch (error) {
      console.error('Error loading recommendations:', error);
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

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recommendations available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enroll in some courses to get personalized recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
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