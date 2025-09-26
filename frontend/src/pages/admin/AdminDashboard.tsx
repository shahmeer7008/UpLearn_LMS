import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  UserCheck,
  Clock,
  Award,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Course, Enrollment, Payment, User } from '@/types';
import { getCourses, getFromStorage, saveToStorage, initializeMockData } from '@/data/mockData';
import { showSuccess, showError } from '@/utils/toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMockData();
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const courses = await getCourses();
      setAllCourses(courses);
      setPendingCourses(courses.filter(c => c.status === 'pending'));

      const allEnrollments = getFromStorage('enrollments') || [];
      setEnrollments(allEnrollments);

      const allPayments = getFromStorage('payments') || [];
      setPayments(allPayments);

      // Mock users data
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Sarah Student',
          email: 'student@example.com',
          role: 'student',
          status: 'active',
          createdDate: '2024-01-15T10:00:00Z',
          lastModifiedDate: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Mike Instructor',
          email: 'instructor@example.com',
          role: 'instructor',
          status: 'active',
          createdDate: '2024-01-10T09:00:00Z',
          lastModifiedDate: '2024-01-10T09:00:00Z'
        },
        {
          id: '3',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createdDate: '2024-01-01T08:00:00Z',
          lastModifiedDate: '2024-01-01T08:00:00Z'
        }
      ];
      setUsers(mockUsers);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseApproval = async (courseId: string, approved: boolean) => {
    try {
      const courses = getFromStorage('courses') || [];
      const updatedCourses = courses.map((course: Course) => 
        course.id === courseId 
          ? { ...course, status: approved ? 'approved' : 'archived' }
          : course
      );
      
      saveToStorage('courses', updatedCourses);
      
      // Update local state
      setAllCourses(updatedCourses);
      setPendingCourses(updatedCourses.filter(c => c.status === 'pending'));
      
      showSuccess(`Course ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      showError('Failed to update course status');
    }
  };

  const getTotalRevenue = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getActiveUsers = () => {
    return users.filter(u => u.status === 'active').length;
  };

  const getCompletionRate = () => {
    if (enrollments.length === 0) return 0;
    const completed = enrollments.filter(e => e.completionStatus === 'completed').length;
    return Math.round((completed / enrollments.length) * 100);
  };

  const getMonthlyGrowth = () => {
    // Mock calculation for monthly growth
    return 12.5;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your learning platform and monitor key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveUsers()} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCourses.length} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +{getMonthlyGrowth()}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Course completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Course Approvals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pending Course Approvals</h2>
            <Link to="/admin/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>

          {pendingCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  No courses pending approval at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingCourses.slice(0, 5).map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(course.status)}`}>
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>By {course.instructorName}</span>
                          <span>•</span>
                          <span>{course.category}</span>
                          <span>•</span>
                          <span>{course.modules.length} modules</span>
                          <span>•</span>
                          <span>{course.pricing === 0 ? 'Free' : `$${course.pricing}`}</span>
                        </div>
                      </div>
                      <div className="ml-6 flex space-x-2">
                        <Link to={`/courses/${course.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          onClick={() => handleCourseApproval(course.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCourseApproval(course.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Stats */}
        <div>
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Platform Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link to="/admin/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Courses
                  </Button>
                </Link>
                <Link to="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                  <span className="font-medium">{users.filter(u => u.role === 'student').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Instructors</span>
                  <span className="font-medium">{users.filter(u => u.role === 'instructor').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Published Courses</span>
                  <span className="font-medium">{allCourses.filter(c => c.status === 'approved').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</span>
                  <span className="font-medium">{enrollments.length}</span>
                </div>
              </CardContent>
            </Card>

            {pendingCourses.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        {pendingCourses.length} course{pendingCourses.length > 1 ? 's' : ''} awaiting approval
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Review and approve new course submissions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;