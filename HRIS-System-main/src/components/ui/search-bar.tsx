import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../../context/SearchContext';

type SearchBarProps = {
  placeholder?: string;
  collection: string;
  searchFields: string[];
  maxResults?: number;
  onResultSelect?: (result: any) => void;
  className?: string;
  autoSearch?: boolean;
  debounceMs?: number;
};

export function SearchBar({
  placeholder = 'Search...',
  collection,
  searchFields,
  maxResults = 10,
  onResultSelect,
  className = '',
  autoSearch = true,
  debounceMs = 300,
}: SearchBarProps) {
  const { 
    searchTerm, 
    setSearchTerm, 
    performSearch, 
    searchResults, 
    isSearching, 
    clearSearch,
    searchError
  } = useSearch();
  
  const [showResults, setShowResults] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  
  // Handle search term changes with debounce
  useEffect(() => {
    if (autoSearch) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      if (searchTerm.trim()) {
        debounceTimeout.current = setTimeout(() => {
          performSearch(collection, searchFields, maxResults);
        }, debounceMs);
      }
    }
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, autoSearch, collection, searchFields, maxResults, performSearch, debounceMs]);
  
  // Handle clicks outside the search bar to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') {
      clearSearch();
    }
    setShowResults(true);
  };
  
  const handleInputFocus = () => {
    setShowResults(true);
  };
  
  const handleSearch = () => {
    if (searchTerm.trim()) {
      performSearch(collection, searchFields, maxResults);
      setShowResults(true);
    }
  };
  
  const handleResultClick = (result: any) => {
    if (onResultSelect) {
      onResultSelect(result);
      setShowResults(false);
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={searchBarRef}>
      <div className="flex items-center rounded-md border bg-background">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          onClick={handleSearch}
          className="p-2 text-muted-foreground hover:text-foreground"
          aria-label="Search"
          disabled={isSearching}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
      
      {showResults && (searchResults.length > 0 || isSearching || searchError) && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          {isSearching ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : searchError ? (
            <div className="p-2 text-center text-sm text-destructive">
              {searchError}
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto py-1">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                >
                  {/* Customize this based on your data structure */}
                  {result.name || result.title || result.id}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}