'use client';
import { useState, useEffect } from 'react';
import { useSearch } from '../../context/SearchContext/useSearch';
import SearchDialog from './SearchDialog';

const Search = () => {
  const [mounted, setMounted] = useState(false);
  const { isSearchOpen, closeSearch } = useSearch();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <SearchDialog isOpen={isSearchOpen} onClose={closeSearch} />;
};

export default Search;
