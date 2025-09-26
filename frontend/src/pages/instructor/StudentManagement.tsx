import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Filter
} from 'lucide-react';
import { Course, Enrollment, User } from '@/types';
import { getCourses, getFromStorage, initializeMockData } from '@/data/mockData';

interface StudentEnrollmentData {
  enrollment: Enrollment;
  course: Course;
  studentName: string;
  studentEmail: string;
}

const StudentManagement: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentEnrollmentData[]>([]);
  const [filteredData, setFilteredData] = useState<StudentEnrollmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMockData();
    loadStudentData();
  }, [user]);

  useEffect(() => {
    filterStudentData();
  }, [studentData, searchTerm, courseFilter, statusFilter]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      const allCourses = await getCourses();
      const myCourses = allCourses.filter(course => course.instructorId === user.id);
      setInstructorCourses(myCourses);

      const allEnrollments = getFromStorage('enrollments') || [];
      const allUsers = getFromStorage('users') || [];

      // Get enrollments for instructor's courses
      const myEnrollments = allEnrollments.filter((enrollment: Enrollment) => 
        myCourses.some(course => course.id === enrollment.courseId)
      );

      // Create combined data with student info
      const combinedData: StudentEnrollmentData[] = myEnrollments.map((enrollment: Enrollment) => {
        const course = myCourses.find(c => c.id === enrollment.courseId)!;
        
        // Mock student data since we don't have a full user system
        const mockStudent = {
          name: `Student ${enrollment.userId}`,
          email: `student${enrollment.userId}@example.com`
        };

        return {
          enrollment,
          course,
          studentName: mockStudent.name,
          studentEmail: mockStudent.email
        };
      });

      setStudentData(combinedData);

    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudentData = () => {
    let filtered = [...studentData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(data =>
        data.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(data => data.course.id === courseFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(data => data.enrollment.completionStatus === statusFilter);
    }

    // Sort by enrollment date (newest first)
    filtered.sort((a, b) => 
      new Date(b.enrollment.enrollmentDate).getTime() - new Date(a.enrollment.enrollmentDate).getTime()
    );

    setFilteredData(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalStudents = () => {
    return new Set(studentData.map(data => data.enrollment.userId)).size;
  };

  const getActiveStudents = () => {
    return studentData.filter(data => data.enrollment.completionStatus === 'in-progress').length;
  };

  const getCompletionRate = () => {
    if (studentData.length === 0) return 0;
    const completed = studentData.filter(data => data.enrollment.completionStatus === 'completed').length;
    return Math.round((completed / studentData.length) * 100);
  };

  const getAverageProgress = () => {
    if (studentData.length === 0) return 0;
    const totalProgress = studentData.reduce((sum, data) => sum + data.enrollment.progress, 0);
    return Math.round(totalProgress / studentData.length);
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
          Student Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your students' progress and engagement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalStudents()}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveStudents()}</div>
            <p className="text-xs text-muted-foreground">
              Currently learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Course completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageProgress()}%</div>
            <p className="text-xs text-muted-foreground">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {instructorCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredData.length} enrollment{filteredData.length !== 1 ? 's' : ''} found
          </p>
          {(searchTerm || courseFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCourseFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Student List */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {studentData.length === 0 ? 'No students enrolled yet' : 'No students match your search'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {studentData.length === 0 
              ? 'Students will appear here once they enroll in your courses'
              : 'Try adjusting your search criteria'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map((data, index) => (
            <Card key={`${data.enrollment.id}-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{data.studentName}</h3>
                      {getStatusBadge(data.enrollment.completionStatus)}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {data.studentEmail}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Course: {data.course.title}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {data.enrollment.progress}% complete
                        </span>
                      </div>
                      <Progress value={data.enrollment.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Enrolled {formatDate(data.enrollment.enrollmentDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Last active {formatDate(data.enrollment.lastAccessedDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{data.enrollment.completedModules.length} modules completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <Badge variant="outline" className="mb-2">
                      {data.course.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentManagement;