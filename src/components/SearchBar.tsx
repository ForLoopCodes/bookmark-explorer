'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { searchBookmarks, getAllCategories, getAllTags } from '@/utils/search';
import { Bookmark } from '@/types';

interface SearchBarProps {
  onResults: (results: Bookmark[]) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResults, onClear }) => {
  const { bookmarks } = useBookmarks();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = getAllCategories(bookmarks);
  const tags = getAllTags(bookmarks);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim() || selectedCategory || selectedTags.length > 0) {
      let filteredBookmarks = [...bookmarks];

      // Apply search query
      if (query.trim()) {
        filteredBookmarks = searchBookmarks(filteredBookmarks, query);
      }

      // Apply category filter
      if (selectedCategory) {
        filteredBookmarks = filteredBookmarks.filter(
          bookmark => bookmark.category === selectedCategory
        );
      }

      // Apply tag filters
      if (selectedTags.length > 0) {
        filteredBookmarks = filteredBookmarks.filter(bookmark =>
          selectedTags.some(tag => bookmark.tags.includes(tag))
        );
      }

      onResults(filteredBookmarks);
    } else {
      onClear();
    }
  }, [query, selectedCategory, selectedTags, bookmarks, onResults, onClear]);

  const clearSearch = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setShowFilters(false);
    onClear();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const hasActiveFilters = query.trim() || selectedCategory || selectedTags.length > 0;

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search bookmarks..."
          />
          {hasActiveFilters && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            showFilters || selectedCategory || selectedTags.length > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Filters
          {(selectedCategory || selectedTags.length > 0) && (
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {(selectedCategory ? 1 : 0) + selectedTags.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(selectedCategory || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedTags([]);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
