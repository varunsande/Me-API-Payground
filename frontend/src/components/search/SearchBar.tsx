'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { debounce } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterBySkill: (skill: string) => void;
  onSort: (sortBy: string) => void;
  skills: string[];
  isLoading?: boolean;
}

export function SearchBar({ onSearch, onFilterBySkill, onSort, skills, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Debounced search function
  const debouncedSearch = debounce((...args: unknown[]) => {
    const searchQuery = args[0] as string;
    if (searchQuery.trim().length > 2) {
      onSearch(searchQuery);
    } else if (searchQuery.trim().length === 0) {
      onSearch('');
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skill = e.target.value;
    setSelectedSkill(skill);
    onFilterBySkill(skill);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    setSortBy(sort);
    onSort(sort);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedSkill('');
    setSortBy('');
    onSearch('');
    onFilterBySkill('');
    onSort('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search profiles, projects, skills, work experience..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="px-6"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedSkill}
              onChange={handleSkillChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Filter by skill...</option>
              {skills.map((skill, index) => (
                <option key={`skill-${index}-${skill}`} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort by...</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="created_at">Date Created</option>
            </select>
          </div>

          {(query || selectedSkill || sortBy) && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="text-sm"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
