import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentData, Query } from 'firebase/firestore';
import { db } from '../config/firebase';

type SearchContextType = {
  searchTerm: string;
  searchResults: DocumentData[];
  isSearching: boolean;
  searchError: string | null;
  setSearchTerm: (term: string) => void;
  performSearch: (collectionName: string, fields: string[], maxResults?: number) => Promise<void>;
  clearSearch: () => void;
  pagination: {
    hasMore: boolean;
    loadMore: () => Promise<void>;
    currentPage: number;
  };
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

type SearchProviderProps = {
  children: ReactNode;
};

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCollection, setCurrentCollection] = useState('');
  const [currentFields, setCurrentFields] = useState<string[]>([]);
  const [currentMaxResults, setCurrentMaxResults] = useState(10);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
    setLastVisible(null);
    setHasMore(false);
    setCurrentPage(1);
  }, []);

  const buildSearchQuery = useCallback(
    (collectionName: string, fields: string[], maxResults: number, startAfterDoc?: DocumentData) => {
      // If search term is empty, return a basic query
      if (!searchTerm.trim()) {
        const baseQuery = query(
          collection(db, collectionName),
          orderBy('createdAt', 'desc'),
          limit(maxResults)
        );
        return startAfterDoc ? query(baseQuery, startAfter(startAfterDoc)) : baseQuery;
      }

      // For actual search terms, we need to create queries for each field
      // and combine the results (Firebase doesn't support OR queries directly)
      return fields.map((field) => {
        const baseQuery = query(
          collection(db, collectionName),
          where(field, '>=', searchTerm),
          where(field, '<=', searchTerm + '\uf8ff'), // This is a common technique for prefix search
          limit(maxResults)
        );
        return startAfterDoc ? query(baseQuery, startAfter(startAfterDoc)) : baseQuery;
      });
    },
    [searchTerm]
  );

  const performSearch = useCallback(
    async (collectionName: string, fields: string[], maxResults = 10) => {
      if (!collectionName || !fields.length) {
        setSearchError('Invalid search parameters');
        return;
      }

      setIsSearching(true);
      setSearchError(null);
      setCurrentCollection(collectionName);
      setCurrentFields(fields);
      setCurrentMaxResults(maxResults);
      setCurrentPage(1);

      try {
        const queries = buildSearchQuery(collectionName, fields, maxResults);

        // If we have an array of queries (for multiple fields), execute all and combine results
        if (Array.isArray(queries)) {
          const resultsArray = await Promise.all(queries.map((q) => getDocs(q)));
          
          // Combine and deduplicate results
          const combinedResults: DocumentData[] = [];
          const seenIds = new Set();
          
          resultsArray.forEach((snapshot) => {
            snapshot.docs.forEach((doc) => {
              if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                combinedResults.push({ id: doc.id, ...doc.data() });
              }
            });
          });

          setSearchResults(combinedResults);
          
          // Set pagination state
          const lastDoc = combinedResults.length > 0 ? combinedResults[combinedResults.length - 1] : null;
          setLastVisible(lastDoc);
          setHasMore(combinedResults.length >= maxResults);
        } else {
          // Single query case (e.g., empty search showing recent items)
          const snapshot = await getDocs(queries);
          const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          
          setSearchResults(results);
          
          // Set pagination state
          const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
          setLastVisible(lastDoc);
          setHasMore(snapshot.docs.length >= maxResults);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('An error occurred while searching');
        setSearchResults([]);
        setHasMore(false);
      } finally {
        setIsSearching(false);
      }
    },
    [buildSearchQuery]
  );

  const loadMore = useCallback(async () => {
    if (!lastVisible || !currentCollection || !currentFields.length) return;

    setIsSearching(true);
    try {
      const queries = buildSearchQuery(
        currentCollection,
        currentFields,
        currentMaxResults,
        lastVisible
      );

      // Similar logic as performSearch
      if (Array.isArray(queries)) {
        const resultsArray = await Promise.all(queries.map((q) => getDocs(q)));
        
        const newResults: DocumentData[] = [];
        const seenIds = new Set(searchResults.map((r) => r.id));
        
        resultsArray.forEach((snapshot) => {
          snapshot.docs.forEach((doc) => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              newResults.push({ id: doc.id, ...doc.data() });
            }
          });
        });

        if (newResults.length > 0) {
          setSearchResults([...searchResults, ...newResults]);
          setLastVisible(newResults[newResults.length - 1]);
          setHasMore(newResults.length >= currentMaxResults);
          setCurrentPage((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      } else {
        const snapshot = await getDocs(queries);
        const newResults = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        if (newResults.length > 0) {
          setSearchResults([...searchResults, ...newResults]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length >= currentMaxResults);
          setCurrentPage((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Load more error:', error);
      setSearchError('An error occurred while loading more results');
    } finally {
      setIsSearching(false);
    }
  }, [buildSearchQuery, currentCollection, currentFields, currentMaxResults, lastVisible, searchResults]);

  const value = {
    searchTerm,
    searchResults,
    isSearching,
    searchError,
    setSearchTerm,
    performSearch,
    clearSearch,
    pagination: {
      hasMore,
      loadMore,
      currentPage,
    },
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}