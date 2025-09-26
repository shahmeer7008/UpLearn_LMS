import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  DollarSign,
  BarChart3,
  Calendar,
  BookOpen
} from 'lucide-react';
import { Course, Enrollment, Payment } from '@/types';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/toast';

const ManageCourses: React.FC = () => {
  const { user } = useAuth();
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInstructorCourses();
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [instructorCourses, searchTerm, statusFilter]);

  const loadInstructorCourses = async () => {
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
      console.error('Error loading instructor courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...instructorCourses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    setFilteredCourses(filtered);
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

  const handleDeleteCourse = async (courseId: string) => {
    const course = instructorCourses.find(c => c._id === courseId);
    if (!course) return;

    const enrolledStudents = enrollments.filter(e => e.course_id === courseId).length;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"? ${
        enrolledStudents > 0 
          ? `This will affect ${enrolledStudents} enrolled student${enrolledStudents > 1 ? 's' : ''}.`
          : ''
      }`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/api/courses/${courseId}`);
      setInstructorCourses(prev => prev.filter(c => c._id !== courseId));
      showSuccess('Course deleted successfully');
    } catch (error) {
      showError('Failed to delete course');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create, edit, and manage your course content
            </p>
          </div>
          <Link to="/instructor/courses/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Course</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="approved">Published</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {instructorCourses.length === 0 ? 'No courses created yet' : 'No courses match your search'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {instructorCourses.length === 0 
              ? 'Start sharing your knowledge by creating your first course'
              : 'Try adjusting your search criteria'
            }
          </p>
          {instructorCourses.length === 0 && (
            <Link to="/instructor/courses/create">
              <Button>Create Your First Course</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCourses.map((course) => {
            const stats = getCourseStats(course._id);
            
            return (
              <Card key={course._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <Badge className={`text-xs ${getStatusColor(course.status)}`}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{stats.students} students</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">${stats.revenue.toFixed(2)} earned</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{stats.avgProgress}% avg progress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Created {formatDate(course.createdDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{course.modules.length} modules</span>
                        <span>•</span>
                        <span>
                          {course.pricing === 0 ? 'Free' : `$${course.pricing.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link to={`/courses/${course._id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link to={`/instructor/courses/${course._id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCourse(course._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;