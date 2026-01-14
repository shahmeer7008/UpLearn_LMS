import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Award,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  Clock
} from 'lucide-react';
import { Course, Enrollment, Payment, User } from '@/types';
import api from '@/services/api';

interface PlatformStats {
 totalUsers: number;
 totalCourses: number;
 totalEnrollments: number;
 totalRevenue: number;
 completionRate: number;
 activeUsers: number;
 pendingCourses: number;
 topCategories: { category: string; count: number }[];
 recentActivity: any[];
 userGrowth: number;
 courseGrowth: number;
 revenueGrowth: number;
 enrollmentGrowth: number;
 studentCount: number;
 instructorCount: number;
 adminCount: number;
 studentPercentage: number;
 instructorPercentage: number;
 adminPercentage: number;
}

const PlatformAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      const stats = response.data;

      setPlatformStats(stats);
    } catch (error: any) {
      console.error('Error loading platform stats:', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading || !platformStats) {
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
          Platform Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive insights into your learning platform performance
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{platformStats.userGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{platformStats.courseGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${platformStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{platformStats.revenueGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{platformStats.enrollmentGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Platform average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.pendingCourses}</div>
            <p className="text-xs text-muted-foreground">
              Courses awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Categories */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
              <CardDescription>
                Most popular course categories on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformStats.topCategories && platformStats.topCategories.length > 0 ? (
                  platformStats.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.count} course{category.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(category.count / Math.max(...platformStats.topCategories.map(c => c.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No categories found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>
                Breakdown of users by role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                   {platformStats.studentCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                 <Badge variant="outline" className="mt-1">{platformStats.studentPercentage}%</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                   {platformStats.instructorCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instructors</p>
                 <Badge variant="outline" className="mt-1">{platformStats.instructorPercentage}%</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                   {platformStats.adminCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
                 <Badge variant="outline" className="mt-1">{platformStats.adminPercentage}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformStats.recentActivity && platformStats.recentActivity.length > 0 ? (
                  platformStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'enrollment' ? 'bg-green-500' :
                          activity.type === 'course' ? 'bg-blue-500' :
                          activity.type === 'completion' ? 'bg-purple-500' :
                          activity.type === 'payment' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review Courses
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/admin">
                  <Activity className="h-4 w-4 mr-2" />
                  Platform Overview
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;