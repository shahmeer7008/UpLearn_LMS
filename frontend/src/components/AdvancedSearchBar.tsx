import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  BookOpen, 
  User, 
  Star,
  Clock,
  DollarSign,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Course } from '@/types';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  duration: string[];
  level: string[];
  features: string[];
}

interface SearchResult {
  type: 'course' | 'instructor';
  id: string;
  title: string;
  description: string;
  category?: string;
  instructor?: string;
  rating?: number;
  price?: number;
  image?: string;
}

interface AdvancedSearchBarProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ 
  placeholder = "Search courses, instructors, or topics...",
  onResultSelect,
  onFiltersChange
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: [0, 500],
    rating: 0,
    duration: [],
    level: [],
    features: []
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Programming', 'Data Science', 'Marketing', 'Design', 'Business',
    'Photography', 'Music', 'Language', 'Health & Fitness', 'Personal Development'
  ];

  const durations = [
    { id: 'short', label: 'Under 3 hours' },
    { id: 'medium', label: '3-10 hours' },
    { id: 'long', label: 'Over 10 hours' }
  ];

  const levels = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const features = [
    { id: 'certificate', label: 'Certificate' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'projects', label: 'Projects' },
    { id: 'lifetime', label: 'Lifetime Access' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, filters]);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/courses');
      const courses = res.data;
      
      let filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(query.toLowerCase())
      );

      // Apply filters
      if (filters.categories.length > 0) {
        filteredCourses = filteredCourses.filter(course => 
          filters.categories.includes(course.category)
        );
      }

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
        filteredCourses = filteredCourses.filter(course => 
          course.pricing >= filters.priceRange[0] && course.pricing <= filters.priceRange[1]
        );
      }

      if (filters.rating > 0) {
        filteredCourses = filteredCourses.filter(course => 
          course.ratingAverage >= filters.rating
        );
      }

      if (filters.duration.length > 0) {
        filteredCourses = filteredCourses.filter(course => {
          const moduleCount = course.modules.length;
          return filters.duration.some(duration => {
            switch (duration) {
              case 'short': return moduleCount <= 5;
              case 'medium': return moduleCount > 5 && moduleCount <= 15;
              case 'long': return moduleCount > 15;
              default: return true;
            }
          });
        });
      }

      const searchResults: SearchResult[] = filteredCourses.map(course => ({
        type: 'course',
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        instructor: course.instructorName,
        rating: course.ratingAverage,
        price: course.pricing
      }));

      setResults(searchResults.slice(0, 8));
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    onResultSelect?.(result);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'categories' | 'duration' | 'level' | 'features', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 500],
      rating: 0,
      duration: [],
      level: [],
      features: []
    });
  };

  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.priceRange[0] > 0 ||
           filters.priceRange[1] < 500 ||
           filters.rating > 0 ||
           filters.duration.length > 0 ||
           filters.level.length > 0 ||
           filters.features.length > 0;
  };

  const getActiveFilterCount = () => {
    return filters.categories.length +
           (filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ? 1 : 0) +
           (filters.rating > 0 ? 1 : 0) +
           filters.duration.length +
           filters.level.length +
           filters.features.length;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {hasActiveFilters() && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 w-8 p-0 ${showFilters ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="absolute top-12 left-0 right-0 z-50 mt-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters() && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleArrayFilter('categories', category)}
                      />
                      <label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-4">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value)}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map(rating => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={filters.rating === rating}
                        onCheckedChange={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                      />
                      <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {rating}+ Stars
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h4 className="font-medium mb-3">Course Duration</h4>
                <div className="space-y-2">
                  {durations.map(duration => (
                    <div key={duration.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={duration.id}
                        checked={filters.duration.includes(duration.id)}
                        onCheckedChange={() => toggleArrayFilter('duration', duration.id)}
                      />
                      <label htmlFor={duration.id} className="text-sm cursor-pointer">
                        {duration.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <h4 className="font-medium mb-3">Difficulty Level</h4>
                <div className="space-y-2">
                  {levels.map(level => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={level.id}
                        checked={filters.level.includes(level.id)}
                        onCheckedChange={() => toggleArrayFilter('level', level.id)}
                      />
                      <label htmlFor={level.id} className="text-sm cursor-pointer">
                        {level.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Features</h4>
                <div className="space-y-2">
                  {features.map(feature => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.id}
                        checked={filters.features.includes(feature.id)}
                        onCheckedChange={() => toggleArrayFilter('features', feature.id)}
                      />
                      <label htmlFor={feature.id} className="text-sm cursor-pointer">
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isOpen && !showFilters && (
        <Card className="absolute top-12 left-0 right-0 z-40 mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    to={`/courses/${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{result.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {result.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          {result.category && (
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                          {result.instructor && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{result.instructor}</span>
                            </div>
                          )}
                          {result.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">{result.rating}</span>
                            </div>
                          )}
                          {result.price !== undefined && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {result.price === 0 ? 'Free' : `$${result.price}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && !showFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
              <button
                onClick={() => toggleArrayFilter('categories', category)}
                className="ml-1 hover:bg-gray-300 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && (
            <Badge variant="secondary" className="text-xs">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <button
                onClick={() => updateFilter('priceRange', [0, 500])}
                className="ml-1 hover:bg-gray-300 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.rating}+ Stars
              <button
                onClick={() => updateFilter('rating', 0)}
                className="ml-1 hover:bg-gray-300 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;