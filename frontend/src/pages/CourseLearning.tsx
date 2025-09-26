import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  PlayCircle, 
  FileText, 
  HelpCircle,
  CheckCircle,
  Lock,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Course, Enrollment, Module, Payment } from '@/types';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/toast';
import QuizPlayer from '@/components/QuizPlayer';
import PaymentModal from '@/components/PaymentModal';

const CourseLearning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [hasPayment, setHasPayment] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadCourseData();
    }
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id || !user) return;

    try {
      const [courseRes, enrollmentRes, paymentRes] = await Promise.all([
        axios.get(`/api/courses/${id}`),
        axios.get(`/api/student/enrollment/${user._id}/${id}`),
        axios.get(`/api/student/payment/${user._id}/${id}`)
      ]);

      if (!courseRes.data) {
        navigate('/courses');
        return;
      }
      setCourse(courseRes.data);

      if (!enrollmentRes.data) {
        navigate(`/courses/${id}`);
        return;
      }
      setEnrollment(enrollmentRes.data);

      setHasPayment(!!paymentRes.data);

      const lastCompletedIndex = courseRes.data.modules.findIndex(
        (module: Module) => !enrollmentRes.data.completedModules.includes(module._id)
      );
      setCurrentModuleIndex(lastCompletedIndex === -1 ? 0 : lastCompletedIndex);

    } catch (error) {
      console.error('Error loading course data:', error);
      navigate('/courses');
    } finally {
      setIsLoading(false);
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
        transaction_id: paymentData.id,
      });
      
      setHasPayment(true);
      showSuccess('Payment successful! You now have full access to the course.');
    } catch (error) {
      showError('Failed to process payment');
    }
  };

  const markModuleComplete = async (moduleId: string, quizScore?: number) => {
    if (!enrollment || !course || !user) return;

    try {
      const completedModules = [...enrollment.completedModules];
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
      }
      
      const progress = Math.round((completedModules.length / course.modules.length) * 100);
      const completionStatus = progress === 100 ? 'completed' : 'in-progress';

      const res = await axios.put(`/api/student/enrollment/${enrollment._id}`, {
        completedModules,
        progress,
        completionStatus,
      });

      setEnrollment(res.data);

      if (res.data.progress === 100) {
        await axios.post('/api/certificates', {
          user_id: user._id,
          course_id: course._id,
          certificate_url: `/certificates/cert-${course._id}-${user._id}.pdf`,
        });
        
        showSuccess('🎉 Congratulations! You completed the course and earned a certificate!');
      } else {
        const message = quizScore !== undefined
          ? `Module completed! Quiz score: ${quizScore}%`
          : 'Module completed!';
        showSuccess(message);
      }

      setShowQuiz(false);

    } catch (error) {
      showError('Failed to update progress');
    }
  };

  const navigateToModule = (index: number) => {
    if (index >= 0 && index < (course?.modules.length || 0)) {
      setCurrentModuleIndex(index);
      setShowQuiz(false);
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

  const isModuleCompleted = (moduleId: string) => {
    return enrollment?.completedModules.includes(moduleId) || false;
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (passed) {
      markModuleComplete(currentModule._id, score);
    } else {
      showError(`Quiz failed with ${score}%. You need 70% to pass. Try again!`);
    }
  };

  const renderModuleContent = (module: Module) => {
    // Check if user has access to this content
    if (!hasPayment && course?.pricing && course.pricing > 0) {
      return (
        <div className="text-center py-12">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Payment Required</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to complete your payment to access this content.
          </p>
          <Button onClick={() => setShowPaymentModal(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Complete Payment
          </Button>
        </div>
      );
    }

    if (module.type === 'quiz' && showQuiz) {
      return (
        <QuizPlayer
          quizId={module.contentUrl}
          title={module.title}
          onComplete={handleQuizComplete}
        />
      );
    }

    switch (module.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {module.contentUrl.includes('youtube.com') || module.contentUrl.includes('youtu.be') ? (
                <iframe
                  src={module.contentUrl}
                  title={module.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Video content</p>
                    <p className="text-sm text-gray-500">{module.contentUrl}</p>
                  </div>
                </div>
              )}
            </div>
            {module.duration && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration: {module.duration} minutes
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(module.contentUrl, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in New Tab</span>
                </Button>
              </div>
            )}
          </div>
        );
      
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">PDF Resource</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Download and view the PDF resource for this module
              </p>
              <div className="flex justify-center space-x-2">
                <Button className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(module.contentUrl, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Online</span>
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Quiz Assessment</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Test your knowledge with this interactive quiz. You need 70% to pass.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  • Multiple choice questions
                  • Immediate feedback on completion
                  • Retake available if needed
                </p>
              </div>
              <Button 
                onClick={() => setShowQuiz(true)}
                className="mt-4"
                size="lg"
              >
                Start Quiz
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Content not available</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course || !enrollment) {
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

  // Check if user needs to pay for this course
  if (course.pricing > 0 && !hasPayment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/my-courses')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>

          <div className="max-w-2xl mx-auto">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Payment Required</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      You are enrolled in this course but need to complete payment to access the content.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-2xl font-bold text-blue-600">${course.pricing.toFixed(2)}</p>
                    </div>
                    <Button onClick={() => setShowPaymentModal(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {course && (
            <PaymentModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              course={course}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/student/my-courses')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Module {currentModuleIndex + 1} of {course.modules.length}: {currentModule?.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Progress: {enrollment.progress}%
              </div>
              <Progress value={enrollment.progress} className="w-32" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getModuleIcon(currentModule.type)}
                    <CardTitle>{currentModule.title}</CardTitle>
                    {isModuleCompleted(currentModule._id) && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {currentModule.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderModuleContent(currentModule)}
                
                {!showQuiz && hasPayment && (
                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigateToModule(currentModuleIndex - 1)}
                      disabled={currentModuleIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex space-x-2">
                      {!isModuleCompleted(currentModule._id) && currentModule.type !== 'quiz' && (
                        <Button onClick={() => markModuleComplete(currentModule._id)}>
                          Mark Complete
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => navigateToModule(currentModuleIndex + 1)}
                        disabled={currentModuleIndex === course.modules.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Outline Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Course Outline</CardTitle>
                <CardDescription>
                  {enrollment.completedModules.length} of {course.modules.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {course.modules.map((module, index) => (
                    <div key={module._id}>
                      <button
                        onClick={() => navigateToModule(index)}
                        className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          index === currentModuleIndex 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                            : ''
                        }`}
                        disabled={!hasPayment}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {!hasPayment ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : isModuleCompleted(module._id) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : index === currentModuleIndex ? (
                              getModuleIcon(module.type)
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {module.title}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {module.type}
                              {module.duration && ` • ${module.duration}min`}
                            </p>
                          </div>
                        </div>
                      </button>
                      {index < course.modules.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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

export default CourseLearning;