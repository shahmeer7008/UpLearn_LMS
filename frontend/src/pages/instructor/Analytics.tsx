import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign,
  BookOpen,
  Award,
  Calendar,
  Target,
  Eye,
  Clock,
  Plus
} from 'lucide-react';
import { Course, Enrollment, Payment } from '@/types';
import axios from 'axios';

interface CourseAnalytics {
  course: Course;
  enrollments: Enrollment[];
  revenue: number;
  completionRate: number;
  avgProgress: number;
  activeStudents: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      const response = await axios.get('/api/instructor/analytics');
      const analytics: CourseAnalytics[] = response.data;
      setCourseAnalytics(analytics);
      setInstructorCourses(analytics.map(a => a.course));
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalStats = () => {
    const filteredAnalytics = selectedCourse === 'all' 
      ? courseAnalytics
      : courseAnalytics.filter(a => a.course._id === selectedCourse);

    return {
      totalStudents: filteredAnalytics.reduce((sum, a) => sum + a.enrollments.length, 0),
      totalRevenue: filteredAnalytics.reduce((sum, a) => sum + a.revenue, 0),
      avgCompletionRate: filteredAnalytics.length > 0 
        ? Math.round(filteredAnalytics.reduce((sum, a) => sum + a.completionRate, 0) / filteredAnalytics.length)
        : 0,
      activeStudents: filteredAnalytics.reduce((sum, a) => sum + a.activeStudents, 0)
    };
  };

  const getTopPerformingCourse = () => {
    if (courseAnalytics.length === 0) return null;
    return courseAnalytics.reduce((top, current) => 
      current.enrollments.length > top.enrollments.length ? current : top
    );
  };

  const getRecentEnrollments = () => {
    const allEnrollments = courseAnalytics.flatMap(a => 
      a.enrollments.map(e => ({ ...e, courseName: a.course.title }))
    );
    
    return allEnrollments
      .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
      .slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = getTotalStats();
  const topCourse = getTopPerformingCourse();
  const recentEnrollments = getRecentEnrollments();

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
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your course performance and student engagement
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {instructorCourses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {courseAnalytics.filter(a => a.revenue > 0).length} paid courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Count</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {instructorCourses.filter(c => c.status === 'approved').length} published
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Performance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each of your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseAnalytics.map((analytics) => (
                  <div key={analytics.course._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{analytics.course.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {analytics.course.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${analytics.revenue.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{analytics.enrollments.length} students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span>{analytics.completionRate}% completion</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span>{analytics.avgProgress}% avg progress</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{analytics.activeStudents} active</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {courseAnalytics.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No course data available yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Top Performing Course */}
          {topCourse && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{topCourse.course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {topCourse.course.category}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">{topCourse.enrollments.length}</div>
                      <div className="text-gray-500">Students</div>
                    </div>
                    <div>
                      <div className="font-medium">{topCourse.completionRate}%</div>
                      <div className="text-gray-500">Completion</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEnrollments.map((enrollment, index) => (
                  <div key={`${enrollment._id}-${index}`} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {enrollment.courseName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(enrollment.enrollmentDate)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentEnrollments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent enrollments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/instructor/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/instructor/students">
                  <Users className="h-4 w-4 mr-2" />
                  View All Students
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/instructor/earnings">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Earnings Report
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;