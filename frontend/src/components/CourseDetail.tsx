import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Users, 
  Clock, 
  PlayCircle, 
  FileText, 
  HelpCircle,
  Award,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Course, Enrollment } from '@/types';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/toast';
import ReviewSystem from '@/components/ReviewSystem';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;

    try {
      const courseResponse = await axios.get(`/api/courses/${id}`);
      setCourse(courseResponse.data);

      if (user) {
        const enrollmentResponse = await axios.get(`/api/student/enrollments`);
        const userEnrollment = enrollmentResponse.data.find((e: Enrollment) => e.course_id === id);
        setEnrollment(userEnrollment || null);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user || !course) {
      navigate('/login');
      return;
    }

    setIsEnrolling(true);

    try {
      const response = await axios.post(`/api/courses/${course._id}/enroll`);
      setEnrollment(response.data);
      showSuccess('Successfully enrolled in course!');
    } catch (error) {
      showError('Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const isEnrolled = !!enrollment;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-2">
              {course.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {course.description}
            </p>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{course.rating}</span>
                <span className="text-gray-600 dark:text-gray-400">rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-gray-400" />
                <span>0 students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{course.duration} hours</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Created by <span className="font-medium text-gray-900 dark:text-white">
                  {(course.instructorId as any).name}
                </span>
              </p>
            </div>
          </div>

          {/* Preview Video */}
          {course.coverImage && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Course Preview</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={course.coverImage}
                  title="Course Preview"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Course Content */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            <Card>
              <CardContent className="p-0">
                {/* Modules will be fetched separately */}
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <ReviewSystem course_id={course._id} userEnrollment={enrollment} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatPrice(course.pricing)}
                </div>
                {course.pricing > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    One-time payment
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You are enrolled in this course!
                    </AlertDescription>
                  </Alert>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/courses/${course._id}/learn`)}
                  >
                    Continue Learning
                  </Button>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Progress: {enrollment?.progress || 0}%
                    </p>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleEnrollment}
                  disabled={isEnrolling}
                >
                  {isEnrolling ? 'Processing...' : 'Enroll Now'}
                </Button>
              )}

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">This course includes:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4 text-gray-400" />
                    <span>{course.duration} hours of video</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                    <span>Quizzes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;