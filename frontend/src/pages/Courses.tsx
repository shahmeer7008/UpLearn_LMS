import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Course } from '@/types';
import axios from 'axios';
import CourseCard from '@/components/CourseCard';
import AdvancedSearchBar from '@/components/AdvancedSearchBar';
import CourseRecommendations from '@/components/CourseRecommendations';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<any>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, selectedCategory, priceFilter, sortBy, searchFilters]);

  const loadCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data);
    } catch (error) {
     if (axios.isAxiosError(error) && error.response) {
       console.error('Error loading courses:', error.response.data.message);
     } else {
       console.error('An unexpected error occurred.');
     }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses];

    // Apply search filters if available
    if (searchFilters) {
      if (searchFilters.categories.length > 0) {
        filtered = filtered.filter(course => searchFilters.categories.includes(course.category));
      }
      
      if (searchFilters.priceRange[0] > 0 || searchFilters.priceRange[1] < 500) {
        filtered = filtered.filter(course => 
          course.pricing >= searchFilters.priceRange[0] && course.pricing <= searchFilters.priceRange[1]
        );
      }
      
      if (searchFilters.rating > 0) {
        filtered = filtered.filter(course => course.ratingAverage >= searchFilters.rating);
      }
      
      if (searchFilters.duration.length > 0) {
        filtered = filtered.filter(course => {
          const moduleCount = course.modules.length;
          return searchFilters.duration.some((duration: string) => {
            switch (duration) {
              case 'short': return moduleCount <= 5;
              case 'medium': return moduleCount > 5 && moduleCount <= 15;
              case 'long': return moduleCount > 15;
              default: return true;
            }
          });
        });
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(course => course.pricing === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(course => course.pricing > 0);
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.ratingAverage - a.ratingAverage);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.pricing - b.pricing);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricing - a.pricing);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  const getCategories = () => {
    const categories = [...new Set(courses.map(course => course.category))];
    return categories;
  };

  const getFeaturedCourses = () => {
    return courses
      .filter(course => course.ratingAverage >= 4.5)
      .slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featuredCourses = getFeaturedCourses();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Explore Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover new skills with our comprehensive course catalog
        </p>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Browse</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>For You</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-8">
          {/* Advanced Search */}
          <div className="mb-8">
            <AdvancedSearchBar 
              placeholder="Search courses, instructors, or topics..."
              onFiltersChange={setSearchFilters}
            />
          </div>

          {/* Featured Courses */}
          {featuredCourses.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Featured Courses</h2>
                <Badge variant="secondary">Top Rated</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    variant="detailed"
                    showInstructor={true}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                </span>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {(selectedCategory !== 'all' || priceFilter !== 'all') && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>{selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')}>×</button>
                  </Badge>
                )}
                {priceFilter !== 'all' && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>{priceFilter}</span>
                    <button onClick={() => setPriceFilter('all')}>×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceFilter('all');
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Course Grid/List */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or browse all courses
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  showInstructor={true}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-8">
          <CourseRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Courses;