import { useSearch } from '../../context/SearchContext/useSearch';
import SearchDialog from './SearchDialog';

const Search = () => {
  const { isSearchOpen, closeSearch } = useSearch();

  return <SearchDialog isOpen={isSearchOpen} onClose={closeSearch} />;
};

export default Search;
