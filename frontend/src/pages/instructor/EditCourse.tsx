import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Course, Module } from '@/types';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/toast';

interface ModuleFormData {
  id?: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz';
  contentUrl: string;
  duration?: number;
  orderSequence: number;
}

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    pricing: 0,
    previewVideoUrl: ''
  });

  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [hasEnrollments, setHasEnrollments] = useState(false);

  const categories = [
    'Programming',
    'Data Science',
    'Marketing',
    'Design',
    'Business',
    'Photography',
    'Music',
    'Language',
    'Health & Fitness',
    'Personal Development'
  ];

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id || !user) return;

    try {
      const res = await axios.get(`/api/courses/${id}`);
      if (!res.data) {
        navigate('/instructor/courses');
        return;
      }

      if (res.data.instructor_id !== user._id) {
        navigate('/instructor/courses');
        return;
      }

      setCourse(res.data);
      setCourseData({
        title: res.data.title,
        description: res.data.description,
        category: res.data.category,
        pricing: res.data.pricing,
        previewVideoUrl: res.data.previewVideoUrl || ''
      });

      setModules(res.data.modules.map((module: Module, index: number) => ({
        _id: module._id,
        title: module.title,
        type: module.type,
        contentUrl: module.content_url,
        duration: module.duration,
        orderSequence: index + 1
      })));

      const enrollmentsRes = await axios.get(`/api/instructor/enrollments/${id}`);
      setHasEnrollments(enrollmentsRes.data.length > 0);

    } catch (error) {
     if (axios.isAxiosError(error) && error.response) {
       showError(error.response.data.message || 'An error occurred while loading the course.');
     } else {
       showError('An unexpected error occurred.');
     }
     navigate('/instructor/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseDataChange = (field: string, value: string | number) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const addModule = () => {
    const newModule: ModuleFormData = {
      title: '',
      type: 'video',
      contentUrl: '',
      orderSequence: modules.length + 1
    };
    setModules(prev => [...prev, newModule]);
  };

  const updateModule = (index: number, field: keyof ModuleFormData, value: string | number) => {
    setModules(prev => prev.map((module, i) => 
      i === index ? { ...module, [field]: value } : module
    ));
  };

  const removeModule = (index: number) => {
    if (hasEnrollments) {
      showError('Cannot remove modules from courses with active enrollments');
      return;
    }
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    setModules(prev => {
      const newModules = [...prev];
      [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]];
      return newModules.map((module, i) => ({ ...module, orderSequence: i + 1 }));
    });
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

  const validateForm = () => {
    if (!courseData.title.trim()) {
      showError('Course title is required');
      return false;
    }
    if (!courseData.description.trim()) {
      showError('Course description is required');
      return false;
    }
    if (!courseData.category) {
      showError('Course category is required');
      return false;
    }
    if (modules.length === 0) {
      showError('At least one module is required');
      return false;
    }

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.title.trim()) {
        showError(`Module ${i + 1} title is required`);
        return false;
      }
      if (!module.contentUrl.trim()) {
        showError(`Module ${i + 1} content URL is required`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !course) return;

    setIsSaving(true);

    try {
      const updatedCourse = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        pricing: courseData.pricing,
        previewVideoUrl: courseData.previewVideoUrl || undefined,
        modules: modules.map(module => ({
          title: module.title,
          type: module.type,
          content_url: module.contentUrl,
          duration: module.duration
        }))
      };

      await axios.put(`/api/courses/${course._id}`, updatedCourse);
      showSuccess('Course updated successfully!');
      navigate('/instructor/courses');

    } catch (error) {
      showError('Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <Button onClick={() => navigate('/instructor/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/instructor/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Course
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your course content and settings
        </p>
      </div>

      {hasEnrollments && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This course has active enrollments. Some changes may affect enrolled students.
            Module removal and major structural changes are restricted.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Update basic course details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleCourseDataChange('title', e.target.value)}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={courseData.category} 
                  onValueChange={(value) => handleCourseDataChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => handleCourseDataChange('description', e.target.value)}
                placeholder="Describe what students will learn"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pricing">Price (USD)</Label>
                <Input
                  id="pricing"
                  type="number"
                  min="0"
                  step="0.01"
                  value={courseData.pricing}
                  onChange={(e) => handleCourseDataChange('pricing', parseFloat(e.target.value) || 0)}
                  placeholder="0.00 for free course"
                  disabled={hasEnrollments}
                />
                {hasEnrollments && (
                  <p className="text-sm text-gray-500 mt-1">
                    Price cannot be changed for courses with enrollments
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="previewVideo">Preview Video URL</Label>
                <Input
                  id="previewVideo"
                  value={courseData.previewVideoUrl}
                  onChange={(e) => handleCourseDataChange('previewVideoUrl', e.target.value)}
                  placeholder="YouTube embed URL"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Modules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>
                  Manage your course content and structure
                </CardDescription>
              </div>
              <Button onClick={addModule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {modules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No modules added yet</p>
                <Button onClick={addModule} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getModuleIcon(module.type)}
                          <Badge variant="outline">Module {index + 1}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveModule(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveModule(index, 'down')}
                            disabled={index === modules.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeModule(index)}
                            disabled={hasEnrollments}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Module Title *</Label>
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(index, 'title', e.target.value)}
                            placeholder="Enter module title"
                          />
                        </div>
                        <div>
                          <Label>Module Type *</Label>
                          <Select 
                            value={module.type} 
                            onValueChange={(value) => updateModule(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video Lesson</SelectItem>
                              <SelectItem value="pdf">PDF Resource</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Content URL *</Label>
                          <Input
                            value={module.contentUrl}
                            onChange={(e) => updateModule(index, 'contentUrl', e.target.value)}
                            placeholder={
                              module.type === 'video' 
                                ? 'YouTube embed URL' 
                                : module.type === 'pdf'
                                ? 'PDF file URL'
                                : 'Quiz identifier'
                            }
                          />
                        </div>
                        {module.type === 'video' && (
                          <div>
                            <Label>Duration (minutes)</Label>
                            <Input
                              type="number"
                              min="1"
                              value={module.duration || ''}
                              onChange={(e) => updateModule(index, 'duration', parseInt(e.target.value) || undefined)}
                              placeholder="Video duration"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/instructor/courses')}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;