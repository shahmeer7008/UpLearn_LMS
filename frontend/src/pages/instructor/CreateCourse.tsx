import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  PlayCircle, 
  FileText, 
  HelpCircle,
  ArrowLeft,
  Save
} from 'lucide-react';
import { Course, Module } from '@/types';
import api from '@/services/api';
import { showSuccess, showError } from '@/utils/toast';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  pricing: number;
  previewVideoUrl: string;
}

interface ModuleFormData {
  title: string;
  type: 'video' | 'pdf' | 'quiz';
  contentUrl: string;
  duration?: number;
}

const CreateCourse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    pricing: 0,
    previewVideoUrl: ''
  });

  const [modules, setModules] = useState<ModuleFormData[]>([]);
  const [currentModule, setCurrentModule] = useState<ModuleFormData>({
    title: '',
    type: 'video',
    contentUrl: '',
    duration: undefined
  });

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

  const handleCourseDataChange = (field: keyof CourseFormData, value: string | number) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (field: keyof ModuleFormData, value: string | number) => {
    setCurrentModule(prev => ({ ...prev, [field]: value }));
  };

  const addModule = () => {
    if (!currentModule.title || !currentModule.contentUrl) {
      showError('Please fill in module title and content URL');
      return;
    }

    setModules(prev => [...prev, { ...currentModule }]);
    setCurrentModule({
      title: '',
      type: 'video',
      contentUrl: '',
      duration: undefined
    });
    showSuccess('Module added successfully');
  };

  const removeModule = (index: number) => {
    setModules(prev => prev.filter((_, i) => i !== index));
    showSuccess('Module removed');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('User not authenticated');
      return;
    }
    if (modules.length === 0) {
      showError('Please add at least one module');
      return;
    }
    setIsLoading(true);
    try {
      const newCourse = {
        ...courseData,
        instructor_id: user._id,
        modules,
      };
      await api.post('/courses', newCourse);
      showSuccess('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (error) {
      // Error is handled by the axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/instructor')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Course
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your knowledge and create an engaging learning experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Basic details about your course
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
                  required
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
                placeholder="Describe what students will learn in this course"
                rows={4}
                required
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
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set to 0 for a free course
                </p>
              </div>
              <div>
                <Label htmlFor="previewVideo">Preview Video URL (Optional)</Label>
                <Input
                  id="previewVideo"
                  value={courseData.previewVideoUrl}
                  onChange={(e) => handleCourseDataChange('previewVideoUrl', e.target.value)}
                  placeholder="YouTube embed URL"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use YouTube embed format: https://www.youtube.com/embed/VIDEO_ID
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
            <CardDescription>
              Add lessons, resources, and quizzes to your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Module Form */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-4">Add New Module</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="moduleTitle">Module Title</Label>
                  <Input
                    id="moduleTitle"
                    value={currentModule.title}
                    onChange={(e) => handleModuleChange('title', e.target.value)}
                    placeholder="Enter module title"
                  />
                </div>
                <div>
                  <Label htmlFor="moduleType">Module Type</Label>
                  <Select 
                    value={currentModule.type} 
                    onValueChange={(value) => handleModuleChange('type', value as 'video' | 'pdf' | 'quiz')}
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="contentUrl">Content URL</Label>
                  <Input
                    id="contentUrl"
                    value={currentModule.contentUrl}
                    onChange={(e) => handleModuleChange('contentUrl', e.target.value)}
                    placeholder={
                      currentModule.type === 'video' 
                        ? 'YouTube embed URL' 
                        : currentModule.type === 'pdf'
                        ? 'PDF file URL'
                        : 'Quiz identifier'
                    }
                  />
                </div>
                {currentModule.type === 'video' && (
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={currentModule.duration || ''}
                      onChange={(e) => handleModuleChange('duration', parseInt(e.target.value) || undefined)}
                      placeholder="Video duration"
                    />
                  </div>
                )}
              </div>
              <Button type="button" onClick={addModule} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {/* Module List */}
            {modules.length > 0 && (
              <div>
                <h3 className="font-medium mb-4">Course Modules ({modules.length})</h3>
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getModuleIcon(module.type)}
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {module.type}
                            {module.duration && ` • ${module.duration} min`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Module {index + 1}</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeModule(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/instructor')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              'Creating...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Course
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;