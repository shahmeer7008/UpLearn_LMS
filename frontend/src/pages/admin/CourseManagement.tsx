import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Users,
  DollarSign,
  Star,
  Calendar,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { Course, Enrollment, Payment } from '@/types';
import { getCourses, getFromStorage, saveToStorage, initializeMockData } from '@/data/mockData';
import { showSuccess, showError } from '@/utils/toast';

const CourseManagement: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    initializeMockData();
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter, categoryFilter]);

  const loadCourses = async () => {
    try {
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    setFilteredCourses(filtered);
  };

  const handleCourseAction = async (courseId: string, action: 'approve' | 'reject' | 'archive' | 'delete', note?: string) => {
    try {
      const courses = getFromStorage('courses') || [];
      let updatedCourses;

      if (action === 'delete') {
        updatedCourses = courses.filter((c: Course) => c.id !== courseId);
      } else {
        const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'archived' : action;
        updatedCourses = courses.map((course: Course) => 
          course.id === courseId 
            ? { 
                ...course, 
                status: newStatus,
                lastModifiedDate: new Date().toISOString(),
                reviewNote: note 
              }
            : course
        );
      }
      
      saveToStorage('courses', updatedCourses);
      setCourses(updatedCourses);
      
      const actionMessages = {
        approve: 'Course approved successfully',
        reject: 'Course rejected',
        archive: 'Course archived',
        delete: 'Course deleted successfully'
      };

      showSuccess(actionMessages[action]);
      setSelectedCourse(null);
      setReviewNote('');
    } catch (error) {
      showError(`Failed to ${action} course`);
    }
  };

  const getCourseStats = (courseId: string) => {
    const enrollments = getFromStorage('enrollments') || [];
    const payments = getFromStorage('payments') || [];
    
    const courseEnrollments = enrollments.filter((e: Enrollment) => e.courseId === courseId);
    const coursePayments = payments.filter((p: Payment) => p.courseId === courseId);
    
    return {
      enrollments: courseEnrollments.length,
      revenue: coursePayments.reduce((sum: number, p: Payment) => sum + p.amount, 0)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategories = () => {
    const categories = [...new Set(courses.map(course => course.category))];
    return categories;
  };

  const getCourseOverview = () => {
    return {
      total: courses.length,
      pending: courses.filter(c => c.status === 'pending').length,
      approved: courses.filter(c => c.status === 'approved').length,
      archived: courses.filter(c => c.status === 'archived').length
    };
  };

  const overview = getCourseOverview();

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
          Course Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and manage courses on the platform
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{overview.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses by title, description, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </p>
          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {courses.length === 0 ? 'No courses found' : 'No courses match your search criteria'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const stats = getCourseStats(course.id);
            
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
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

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>By {course.instructorName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span>{course.modules.length} modules</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{stats.enrollments} enrolled</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>${course.pricing === 0 ? 'Free' : course.pricing.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(course.createdDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{course.ratingAverage}</span>
                        </div>
                        <span>Revenue: ${stats.revenue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link to={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>

                      {course.status === 'pending' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedCourse(course)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Course</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to approve "{course.title}"? This will make it visible to students.
                                </DialogDescription>
                              </DialogHeader>
                              <div>
                                <label className="text-sm font-medium">Approval Note (Optional)</label>
                                <Textarea
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  placeholder="Add a note for the instructor..."
                                  className="mt-2"
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => handleCourseAction(course.id, 'approve', reviewNote)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve Course
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-red-600 hover:text-red-700"
                                onClick={() => setSelectedCourse(course)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Course</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting "{course.title}".
                                </DialogDescription>
                              </DialogHeader>
                              <div>
                                <label className="text-sm font-medium">Rejection Reason *</label>
                                <Textarea
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  placeholder="Explain why this course is being rejected..."
                                  className="mt-2"
                                  required
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => handleCourseAction(course.id, 'reject', reviewNote)}
                                  variant="destructive"
                                  disabled={!reviewNote.trim()}
                                >
                                  Reject Course
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{course.title}"? This action cannot be undone.
                              {stats.enrollments > 0 && (
                                <span className="text-red-600 font-medium">
                                  {' '}This course has {stats.enrollments} enrolled student{stats.enrollments > 1 ? 's' : ''}.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCourseAction(course.id, 'delete')}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Course
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CourseManagement;