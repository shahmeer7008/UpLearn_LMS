import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  BarChart3,
  LayoutDashboard,
  Book,
  FileText
} from 'lucide-react';
import { Course, Enrollment, Payment } from '@/types';
import axios from 'axios';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInstructorData();
  }, [user]);

  const loadInstructorData = async () => {
    if (!user) return;

    try {
      const [coursesRes, enrollmentsRes, paymentsRes] = await Promise.all([
        axios.get(`/api/instructor/courses/${user._id}`),
        axios.get(`/api/instructor/enrollments/${user._id}`),
        axios.get(`/api/instructor/payments/${user._id}`)
      ]);

      setInstructorCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
      setPayments(paymentsRes.data);

    } catch (error) {
      console.error('Error loading instructor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getTotalStudents = () => {
    return enrollments.length;
  };

  const getActiveStudents = () => {
    return enrollments.filter(e => e.completionStatus === 'in-progress').length;
  };

  const getCompletionRate = () => {
    if (enrollments.length === 0) return 0;
    const completed = enrollments.filter(e => e.completionStatus === 'completed').length;
    return Math.round((completed / enrollments.length) * 100);
  };

  const getCourseStats = (courseId: string) => {
    const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
    const coursePayments = payments.filter(p => p.course_id === courseId);
    
    return {
      students: courseEnrollments.length,
      revenue: coursePayments.reduce((sum, p) => sum + p.amount, 0),
      avgProgress: courseEnrollments.length > 0
        ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length)
        : 0
    };
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
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your courses and track your teaching success
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {instructorCourses.filter(c => c.status === 'approved').length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalStudents()}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveStudents()} active learners
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
              {payments.length} transactions
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
              Student success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Courses</h2>
            <Link to="/instructor/courses/create">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Course</span>
              </Button>
            </Link>
          </div>

          {instructorCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No courses created yet
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start sharing your knowledge by creating your first course
                </p>
                <Link to="/instructor/courses/create">
                  <Button>Create Your First Course</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {instructorCourses.slice(0, 5).map((course) => {
                const stats = getCourseStats(course._id);
                return (
                  <Card key={course._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <Badge className={`text-xs ${getStatusColor(course.status)}`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{stats.students} students</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${stats.revenue.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              <span>{stats.avgProgress}% avg progress</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex space-x-2">
                          <Link to={`/courses/${course._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/instructor/courses/${course._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {instructorCourses.length > 5 && (
                <div className="text-center">
                  <Link to="/instructor/courses">
                    <Button variant="outline">View All Courses</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/instructor/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/instructor/students">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Button>
                </Link>
                <Link to="/instructor/earnings">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Earnings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {enrollments.slice(0, 3).map((enrollment) => {
                    const course = instructorCourses.find(c => c._id === enrollment.course_id);
                    return (
                      <div key={enrollment._id} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-muted-foreground">
                          New enrollment in {course?.title || 'Unknown Course'}
                        </span>
                      </div>
                    );
                  })}
                  {enrollments.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;