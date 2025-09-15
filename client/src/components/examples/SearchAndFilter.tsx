import { SearchAndFilter } from '../SearchAndFilter';

export default function SearchAndFilterExample() {
  // todo: remove mock functionality
  const categories = ["food", "transportation", "shopping", "housing", "entertainment", "healthcare"];
  const accounts = ["Main Checking", "High Yield Savings", "Travel Credit Card"];

  const handleFilterChange = (filters: any) => {
    console.log('Filter changed:', filters);
  };

  return (
    <SearchAndFilter
      onFilterChange={handleFilterChange}
      categories={categories}
      accounts={accounts}
    />
  );
}