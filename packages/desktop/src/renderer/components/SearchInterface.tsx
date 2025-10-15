/**
 * Search Interface Component
 * Advanced search UI with filters and saved searches
 */

import React, { useState } from 'react';

interface SearchFilters {
  privacyLevel?: number;
  status?: string;
  dateRange?: { from: number; to: number };
  addresses?: string[];
  amountRange?: { min: number; max: number };
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: number;
  relevanceScore: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: number;
}

interface SearchInterfaceProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  results?: SearchResult[];
  savedSearches?: SavedSearch[];
  onSaveSearch?: (name: string, query: string, filters: SearchFilters) => void;
  onExecuteSavedSearch?: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Get result type badge
 */
const getResultTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    transaction: '#4CAF50',
    note: '#2196F3',
    event: '#FF9800',
    address: '#9C27B0',
  };
  return colors[type] || '#757575';
};

/**
 * Search Interface Component
 */
const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  results = [],
  savedSearches = [],
  onSaveSearch,
  onExecuteSavedSearch,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const handleSaveSearch = () => {
    if (saveName.trim()) {
      onSaveSearch?.(saveName, query, filters);
      setSaveName('');
      setShowSaveDialog(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="search-interface">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search transactions, notes, events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />

        <button className="search-button" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? '🔍 Searching...' : '🔍 Search'}
        </button>

        <button className="search-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
          ⚙️ {showAdvanced ? 'Hide' : 'Show'} Filters
        </button>

        <button className="search-save-button" onClick={() => setShowSaveDialog(true)} title="Save this search">
          ⭐ Save
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="search-filters">
          <div className="search-filter-group">
            <label>Privacy Level</label>
            <select
              value={filters.privacyLevel ?? ''}
              onChange={(e) =>
                handleFilterChange('privacyLevel', e.target.value ? parseInt(e.target.value) : undefined)
              }
            >
              <option value="">Any</option>
              <option value="0">PUBLIC</option>
              <option value="1">SEMI_PRIVATE</option>
              <option value="2">FULL_PRIVATE</option>
            </select>
          </div>

          <div className="search-filter-group">
            <label>Status</label>
            <select
              value={filters.status ?? ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">Any</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="search-filter-group">
            <label>Amount Min</label>
            <input
              type="number"
              placeholder="0"
              value={filters.amountRange?.min ?? ''}
              onChange={(e) =>
                handleFilterChange('amountRange', {
                  ...filters.amountRange,
                  min: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </div>

          <div className="search-filter-group">
            <label>Amount Max</label>
            <input
              type="number"
              placeholder="0"
              value={filters.amountRange?.max ?? ''}
              onChange={(e) =>
                handleFilterChange('amountRange', {
                  ...filters.amountRange,
                  max: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </div>

          <button className="search-clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="saved-searches">
          <h4 className="saved-searches-title">Saved Searches</h4>
          <div className="saved-searches-list">
            {savedSearches.map((search) => (
              <button
                key={search.id}
                className="saved-search-item"
                onClick={() => onExecuteSavedSearch?.(search.id)}
                title={`Query: ${search.query}`}
              >
                ⭐ {search.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="search-save-dialog">
          <div className="search-save-dialog-content">
            <h3>Save This Search</h3>
            <input
              type="text"
              className="search-save-input"
              placeholder="Enter search name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
              autoFocus
            />
            <div className="search-save-dialog-buttons">
              <button className="btn-primary" onClick={handleSaveSearch}>
                Save
              </button>
              <button className="btn-secondary" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="search-results">
          <h3 className="search-results-title">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </h3>

          <div className="search-results-list">
            {results.slice(0, 10).map((result) => (
              <div key={result.id} className="search-result-item">
                <div
                  className="search-result-type"
                  style={{ backgroundColor: getResultTypeColor(result.type) }}
                >
                  {result.type.substring(0, 1).toUpperCase()}
                </div>

                <div className="search-result-content">
                  <h4 className="search-result-title">{result.title}</h4>
                  <p className="search-result-description">{result.description}</p>
                  <div className="search-result-meta">
                    <span className="search-result-time">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                    <span className="search-result-score">
                      Relevance: {Math.round(result.relevanceScore)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && query && (
        <div className="search-no-results">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
