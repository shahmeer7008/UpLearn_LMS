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
import axios from 'axios';
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
      const courseRes = await axios.get(`/api/courses/${id}`);
      setCourse(courseRes.data);

      if (user) {
        const [enrollmentRes, paymentRes] = await Promise.all([
          axios.get(`/api/student/enrollment/${user._id}/${id}`),
          axios.get(`/api/student/payment/${user._id}/${id}`)
        ]);
        setEnrollment(enrollmentRes.data);
        setHasPayment(!!paymentRes.data);
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

    // For paid courses, show payment modal
    if (course.pricing > 0 && !hasPayment) {
      setShowPaymentModal(true);
      return;
    }

    // For free courses or already paid courses, enroll directly
    try {
      const res = await axios.post('/api/enrollments', {
        user_id: user._id,
        course_id: course._id,
      });
      setEnrollment(res.data);

      showSuccess('Successfully enrolled in course!');
    } catch (error) {
      showError('Failed to enroll in course');
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!user || !course) return;

    try {
      await axios.post('/api/payments', {
        user_id: user._id,
        course_id: course._id,
        amount: course.pricing,
        status: 'completed',
        transaction_id: paymentData.transaction_id,
      });

      const res = await axios.post('/api/enrollments', {
        user_id: user._id,
        course_id: course._id,
      });
      
      setEnrollment(res.data);
      setHasPayment(true);
    } catch (error) {
      showError('Failed to process enrollment after payment');
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