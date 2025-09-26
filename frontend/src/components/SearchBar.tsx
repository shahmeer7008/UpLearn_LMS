import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X, 
  BookOpen, 
  User, 
  Star,
  Clock,
  DollarSign
} from 'lucide-react';
import { Course } from '@/types';
import { getCourses } from '@/data/mockData';
import { Link } from 'react-router-dom';

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

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  onResultSelect?: (result: SearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search courses, instructors, or topics...",
  showFilters = true,
  onResultSelect
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    duration: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFilterPanel(false);
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

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const courses = await getCourses();
      
      let filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(query.toLowerCase())
      );

      // Apply filters
      if (filters.category) {
        filteredCourses = filteredCourses.filter(course => 
          course.category === filters.category
        );
      }

      if (filters.priceRange) {
        filteredCourses = filteredCourses.filter(course => {
          switch (filters.priceRange) {
            case 'free': return course.pricing === 0;
            case 'under50': return course.pricing > 0 && course.pricing < 50;
            case 'under100': return course.pricing >= 50 && course.pricing < 100;
            case 'over100': return course.pricing >= 100;
            default: return true;
          }
        });
      }

      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        filteredCourses = filteredCourses.filter(course => 
          course.ratingAverage >= minRating
        );
      }

      const searchResults: SearchResult[] = filteredCourses.map(course => ({
        type: 'course',
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        instructor: course.instructorName,
        rating: course.ratingAverage,
        price: course.pricing
      }));

      setResults(searchResults.slice(0, 8)); // Limit to 8 results
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

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      duration: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
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
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {Object.values(filters).filter(f => f !== '').length}
            </Badge>
          )}
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`h-8 w-8 p-0 ${showFilterPanel ? 'bg-gray-100' : ''}`}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <Card className="absolute top-12 left-0 right-0 z-50 mt-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Any Price</option>
                  <option value="free">Free</option>
                  <option value="under50">Under $50</option>
                  <option value="under100">$50 - $100</option>
                  <option value="over100">Over $100</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Any Duration</option>
                  <option value="short">Under 3 hours</option>
                  <option value="medium">3-10 hours</option>
                  <option value="long">Over 10 hours</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isOpen && (
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
    </div>
  );
};

export default SearchBar;