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
  Lock,
  CreditCard,
  Shield
} from 'lucide-react';
import { Course, Enrollment, Payment } from '@/types';
import api from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';
import PaymentModal from '@/components/PaymentModal';
import ReviewSystem from '@/components/ReviewSystem';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [hasPayment, setHasPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;

    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      if (user) {
        try {
          const [enrollmentRes, paymentRes] = await Promise.all([
            api.get(`/student/${user._id}/enrollment/${id}`).catch(() => ({ data: null })), // Handle 404 gracefully
            api.get(`/student/${user._id}/payment/${id}`).catch(() => ({ data: null })) // Handle 403 gracefully
          ]);
          setEnrollment(enrollmentRes.data);
          setHasPayment(!!paymentRes.data);
        } catch (error) {
          // If enrollment/payment check fails, that's okay - user might not be enrolled yet
          // Silently handle - these are expected errors for non-enrolled users
        }
      }
    } catch (error) {
     showError('Error loading course data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user || !course) {
      navigate('/login');
      return;
    }

    // For paid courses, show payment modal
    if (course.pricing > 0 && !hasPayment) {
      setShowPaymentModal(true);
      return;
    }

    // For free courses or already paid courses, enroll directly
    try {
      const res = await api.post(`/student/${user._id}/enrollment/${course._id}`);
      setEnrollment(res.data);
      showSuccess('Successfully enrolled in course!');
    } catch (error: any) {
      // If already enrolled, refresh enrollment data instead of showing error
      if (error.response?.status === 400 && error.response?.data?.msg?.includes('Already enrolled')) {
        try {
          const enrollmentRes = await api.get(`/student/${user._id}/enrollment/${course._id}`).catch(() => ({ data: null }));
          if (enrollmentRes.data) {
            setEnrollment(enrollmentRes.data);
          }
        } catch (e) {
          // Ignore errors when refreshing enrollment
        }
      } else {
        const errorMessage = error.response?.data?.msg || 'Error enrolling in course.';
        showError(errorMessage);
      }
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!user || !course) return;

    try {
      await api.post(`/student/${user._id}/payment/${course._id}`, {
        status: 'completed',
        transaction_id: paymentData.transaction_id || paymentData.id,
      });

      const res = await api.post(`/student/${user._id}/enrollment/${course._id}`);
      
      setEnrollment(res.data);
      setHasPayment(true);
      showSuccess('Payment successful! You are now enrolled in the course.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || 'Error processing payment.';
      showError(errorMessage);
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

  const formatPrice = (pricing: number) => {
    return pricing === 0 ? 'Free' : `$${pricing.toFixed(2)}`;
  };

  const getInstructorName = (course: Course): string => {
    // Check if instructorName is directly available
    if (course.instructorName) {
      return course.instructorName;
    }
    // Check if instructorId is a populated object with name
    const instructorId = course.instructorId;
    if (instructorId && typeof instructorId === 'object') {
      const instructorObj = instructorId as { name?: string };
      if (instructorObj?.name) {
        return instructorObj.name;
      }
    }
    // Fallback if instructorId is just a string ID
    return 'Unknown Instructor';
  };

  const isEnrolled = !!enrollment;
  const canAccessContent = course?.pricing === 0 || hasPayment;

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
                <span>{course.enrollmentCount} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{course.duration} hours</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Created by <span className="font-medium text-gray-900 dark:text-white">
                  {getInstructorName(course)}
                </span>
              </p>
            </div>
          </div>

          {/* Preview Video - Always show for marketing */}
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

            {/* Payment Required Message */}
            {course.pricing > 0 && !hasPayment && (
              <Alert className="mt-4">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Purchase this course to access all content and start learning.</span>
                    <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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
              {isEnrolled && canAccessContent ? (
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
              ) : course.pricing > 0 && !hasPayment ? (
                <div className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Course
                  </Button>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment with Stripe</span>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleEnrollment}
                >
                  Enroll for Free
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
                  {course.pricing > 0 && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={course}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CourseDetail;