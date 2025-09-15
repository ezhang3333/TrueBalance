import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterState {
  search: string;
  category: string;
  account: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface SearchAndFilterProps {
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  accounts: string[];
}

export function SearchAndFilter({ 
  onFilterChange, 
  categories = [], 
  accounts = [] 
}: SearchAndFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    account: "",
    dateRange: { from: undefined, to: undefined }
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
    console.log('Filters updated:', updated);
  };

  const clearFilters = () => {
    const cleared = {
      search: "",
      category: "",
      account: "",
      dateRange: { from: undefined, to: undefined }
    };
    setFilters(cleared);
    onFilterChange(cleared);
    console.log('Filters cleared');
  };

  const hasActiveFilters = filters.search || filters.category || filters.account || 
                          filters.dateRange.from || filters.dateRange.to;

  return (
    <div className="space-y-4" data-testid="container-search-filter">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filters.category} 
            onValueChange={(value) => updateFilters({ category: value === "all" ? "" : value })}
          >
            <SelectTrigger className="w-[150px]" data-testid="select-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.account} 
            onValueChange={(value) => updateFilters({ account: value === "all" ? "" : value })}
          >
            <SelectTrigger className="w-[150px]" data-testid="select-account">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account} value={account}>
                  {account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={filters.dateRange.from ? "default" : "outline"} 
                className={cn("w-[150px] justify-start text-left font-normal")}
                data-testid="button-date-range"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                  ) : (
                    filters.dateRange.from.toLocaleDateString()
                  )
                ) : (
                  "Date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to
                }}
                onSelect={(range) => 
                  updateFilters({ 
                    dateRange: { from: range?.from, to: range?.to } 
                  })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" data-testid="badge-search-filter">
              Search: {filters.search}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ search: "" })}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" data-testid="badge-category-filter">
              Category: {filters.category}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ category: "" })}
              />
            </Badge>
          )}
          {filters.account && (
            <Badge variant="secondary" data-testid="badge-account-filter">
              Account: {filters.account}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ account: "" })}
              />
            </Badge>
          )}
          {filters.dateRange.from && (
            <Badge variant="secondary" data-testid="badge-date-filter">
              Date: {filters.dateRange.from.toLocaleDateString()}
              {filters.dateRange.to && ` - ${filters.dateRange.to.toLocaleDateString()}`}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ dateRange: { from: undefined, to: undefined } })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}