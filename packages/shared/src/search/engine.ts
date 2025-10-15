/**
 * Search Engine - Advanced Search and Filtering
 * Provides full-text search, filtering, and faceted search capabilities
 */

/**
 * Search Query Interface
 */
export interface SearchQuery {
  text?: string;
  filters: SearchFilters;
  sortBy?: 'date' | 'amount' | 'relevance' | 'duration';
  sortOrder?: 'asc' | 'desc';
  limit: number;
  offset: number;
}

/**
 * Search Filters
 */
export interface SearchFilters {
  privacyLevel?: number;
  status?: string;
  dateRange?: [number, number];
  addresses?: string[];
  amountRange?: [string, string];
  eventType?: string;
  userId?: string;
}

/**
 * Search Result
 */
export interface SearchResult {
  id: string;
  type: 'transaction' | 'note' | 'event' | 'address';
  title: string;
  description: string;
  privacyLevel: number;
  timestamp: number;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

/**
 * Search Response
 */
export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  filteredCount: number;
  aggregations?: Record<string, Record<string, number>>;
  executionTime: number;
}

/**
 * Saved Search
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: number;
  lastUsed: number;
  useCount: number;
}

/**
 * Search Engine - Advanced search capabilities
 */
export class SearchEngine {
  private transactions: Map<string, any>;
  private notes: Map<string, any>;
  private events: Map<string, any>;
  private addresses: Map<string, any>;
  private savedSearches: Map<string, SavedSearch>;
  private index: Map<string, Set<string>>;

  constructor() {
    this.transactions = new Map();
    this.notes = new Map();
    this.events = new Map();
    this.addresses = new Map();
    this.savedSearches = new Map();
    this.index = new Map();
  }

  /**
   * Index a transaction
   */
  indexTransaction(transaction: any): void {
    this.transactions.set(transaction.id, transaction);
    this.updateIndex(transaction.id, [
      transaction.txHash,
      transaction.fromAddress,
      transaction.toAddress,
      transaction.amount,
    ]);
  }

  /**
   * Index a note
   */
  indexNote(note: any): void {
    this.notes.set(note.id, note);
    this.updateIndex(note.id, [note.commitmentHash, note.encryptedData]);
  }

  /**
   * Index an event
   */
  indexEvent(event: any): void {
    this.events.set(event.id, event);
    this.updateIndex(event.id, [event.action, event.userId, event.details]);
  }

  /**
   * Index an address
   */
  indexAddress(address: string, data: any): void {
    this.addresses.set(address, data);
    this.updateIndex(address, [address]);
  }

  /**
   * Update search index
   */
  private updateIndex(id: string, terms: any[]): void {
    const keywords = this.extractKeywords(terms);
    keywords.forEach((keyword) => {
      if (!this.index.has(keyword)) {
        this.index.set(keyword, new Set());
      }
      this.index.get(keyword)!.add(id);
    });
  }

  /**
   * Extract keywords from terms
   */
  private extractKeywords(terms: any[]): string[] {
    const keywords = new Set<string>();

    terms.forEach((term) => {
      if (typeof term === 'string') {
        const words = term.toLowerCase().split(/\s+/);
        words.forEach((word) => {
          if (word.length > 2) {
            keywords.add(word);
          }
        });
      } else if (typeof term === 'object') {
        const str = JSON.stringify(term).toLowerCase();
        const words = str.split(/\s+/);
        words.forEach((word) => {
          if (word.length > 2) {
            keywords.add(word.replace(/[^a-z0-9]/g, ''));
          }
        });
      }
    });

    return Array.from(keywords);
  }

  /**
   * Search with query
   */
  search(query: SearchQuery): SearchResponse {
    const startTime = Date.now();
    const results: SearchResult[] = [];

    // Full-text search
    let matchingIds = new Set<string>();

    if (query.text) {
      const keywords = this.extractKeywords([query.text]);
      keywords.forEach((keyword) => {
        const ids = this.index.get(keyword) || new Set();
        if (matchingIds.size === 0) {
          matchingIds = new Set(ids);
        } else {
          matchingIds = new Set([...matchingIds].filter((id) => ids.has(id)));
        }
      });
    } else {
      matchingIds = new Set([
        ...this.transactions.keys(),
        ...this.notes.keys(),
        ...this.events.keys(),
        ...this.addresses.keys(),
      ]);
    }

    // Apply filters
    const filtered = this.applyFilters(Array.from(matchingIds), query.filters);

    // Convert to results
    filtered.forEach((id) => {
      const result = this.getSearchResult(id);
      if (result) {
        results.push(result);
      }
    });

    // Calculate relevance scores
    results.forEach((result) => {
      result.relevanceScore = this.calculateRelevance(result, query.text);
    });

    // Sort results
    this.sortResults(results, query.sortBy, query.sortOrder);

    // Apply pagination
    const totalCount = results.length;
    const paginatedResults = results.slice(query.offset, query.offset + query.limit);

    const executionTime = Date.now() - startTime;

    return {
      results: paginatedResults,
      totalCount,
      filteredCount: totalCount,
      executionTime,
    };
  }

  /**
   * Apply filters to results
   */
  private applyFilters(ids: string[], filters: SearchFilters): string[] {
    return ids.filter((id) => {
      const result = this.getSearchResult(id);
      if (!result) return false;

      if (filters.privacyLevel !== undefined && result.privacyLevel !== filters.privacyLevel) {
        return false;
      }

      if (filters.status && result.metadata?.status !== filters.status) {
        return false;
      }

      if (filters.dateRange) {
        if (
          result.timestamp < filters.dateRange[0] ||
          result.timestamp > filters.dateRange[1]
        ) {
          return false;
        }
      }

      if (filters.addresses && result.type === 'transaction') {
        const hasAddress =
          filters.addresses.includes(result.metadata?.fromAddress) ||
          filters.addresses.includes(result.metadata?.toAddress);
        if (!hasAddress) return false;
      }

      if (filters.amountRange && result.metadata?.amount) {
        const amount = BigInt(result.metadata.amount);
        const min = BigInt(filters.amountRange[0]);
        const max = BigInt(filters.amountRange[1]);
        if (amount < min || amount > max) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get search result
   */
  private getSearchResult(id: string): SearchResult | null {
    let item = this.transactions.get(id);
    if (item) {
      return {
        id,
        type: 'transaction',
        title: `Transaction ${id.substring(0, 8)}`,
        description: `${item.amount} from ${item.fromAddress}`,
        privacyLevel: item.privacyLevel,
        timestamp: item.timestamp,
        relevanceScore: 0,
        metadata: item,
      };
    }

    item = this.notes.get(id);
    if (item) {
      return {
        id,
        type: 'note',
        title: `Note ${id.substring(0, 8)}`,
        description: item.commitmentHash,
        privacyLevel: item.privacyLevel,
        timestamp: item.timestamp,
        relevanceScore: 0,
        metadata: item,
      };
    }

    item = this.events.get(id);
    if (item) {
      return {
        id,
        type: 'event',
        title: item.action,
        description: `${item.eventType} by ${item.userId}`,
        privacyLevel: item.privacyLevel,
        timestamp: item.timestamp,
        relevanceScore: 0,
        metadata: item,
      };
    }

    item = this.addresses.get(id);
    if (item) {
      return {
        id,
        type: 'address',
        title: `Address ${id.substring(0, 8)}`,
        description: `${item.transactionCount} transactions`,
        privacyLevel: 0,
        timestamp: item.lastActivity || 0,
        relevanceScore: 0,
        metadata: item,
      };
    }

    return null;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(result: SearchResult, searchText?: string): number {
    let score = 100;

    if (searchText) {
      const lowerText = searchText.toLowerCase();
      const titleMatch = result.title.toLowerCase().includes(lowerText);
      const descMatch = result.description.toLowerCase().includes(lowerText);

      if (titleMatch) score += 50;
      if (descMatch) score += 25;

      // Recent results score higher
      const daysSinceCreated = (Date.now() - result.timestamp) / 86400000;
      score -= Math.min(daysSinceCreated, 50);
    }

    return Math.max(score, 0);
  }

  /**
   * Sort results
   */
  private sortResults(
    results: SearchResult[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): void {
    const compareFn = (a: SearchResult, b: SearchResult): number => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = b.timestamp - a.timestamp;
          break;
        case 'amount':
          const aAmount = BigInt(a.metadata?.amount || '0');
          const bAmount = BigInt(b.metadata?.amount || '0');
          comparison = aAmount > bAmount ? 1 : aAmount < bAmount ? -1 : 0;
          break;
        case 'duration':
          comparison =
            (b.metadata?.duration || 0) - (a.metadata?.duration || 0);
          break;
        case 'relevance':
        default:
          comparison = b.relevanceScore - a.relevanceScore;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    };

    results.sort(compareFn);
  }

  /**
   * Search transactions
   */
  searchTransactions(filters: SearchFilters): SearchResult[] {
    const ids = Array.from(this.transactions.keys());
    const filtered = this.applyFilters(ids, filters);

    return filtered.map((id) => this.getSearchResult(id)!).filter((r) => !!r);
  }

  /**
   * Search notes
   */
  searchNotes(filters: SearchFilters): SearchResult[] {
    const ids = Array.from(this.notes.keys());
    const filtered = this.applyFilters(ids, filters);

    return filtered.map((id) => this.getSearchResult(id)!).filter((r) => !!r);
  }

  /**
   * Search events
   */
  searchEvents(filters: SearchFilters): SearchResult[] {
    const ids = Array.from(this.events.keys());
    const filtered = this.applyFilters(ids, filters);

    return filtered.map((id) => this.getSearchResult(id)!).filter((r) => !!r);
  }

  /**
   * Save search
   */
  saveSearch(name: string, query: SearchQuery): SavedSearch {
    const id = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const saved: SavedSearch = {
      id,
      name,
      query,
      createdAt: Date.now(),
      lastUsed: 0,
      useCount: 0,
    };

    this.savedSearches.set(id, saved);
    return saved;
  }

  /**
   * Get saved searches
   */
  getSavedSearches(): SavedSearch[] {
    return Array.from(this.savedSearches.values());
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(id: string): boolean {
    return this.savedSearches.delete(id);
  }

  /**
   * Execute saved search
   */
  executeSavedSearch(id: string): SearchResponse | null {
    const saved = this.savedSearches.get(id);
    if (!saved) return null;

    saved.lastUsed = Date.now();
    saved.useCount++;

    return this.search(saved.query);
  }

  /**
   * Get aggregations
   */
  getAggregations(): Record<string, Record<string, number>> {
    const aggregations: Record<string, Record<string, number>> = {
      byType: { transaction: 0, note: 0, event: 0, address: 0 },
      byPrivacyLevel: {},
    };

    this.transactions.forEach((t) => {
      aggregations.byType.transaction++;
      const level = t.privacyLevel;
      aggregations.byPrivacyLevel[level] =
        (aggregations.byPrivacyLevel[level] || 0) + 1;
    });

    this.notes.forEach((n) => {
      aggregations.byType.note++;
      const level = n.privacyLevel;
      aggregations.byPrivacyLevel[level] =
        (aggregations.byPrivacyLevel[level] || 0) + 1;
    });

    this.events.forEach((e) => {
      aggregations.byType.event++;
      const level = e.privacyLevel;
      aggregations.byPrivacyLevel[level] =
        (aggregations.byPrivacyLevel[level] || 0) + 1;
    });

    this.addresses.forEach(() => {
      aggregations.byType.address++;
    });

    return aggregations;
  }

  /**
   * Clear search index
   */
  clear(): void {
    this.transactions.clear();
    this.notes.clear();
    this.events.clear();
    this.addresses.clear();
    this.index.clear();
    this.savedSearches.clear();
  }

  /**
   * Get index size
   */
  getIndexSize(): { transactions: number; notes: number; events: number; addresses: number } {
    return {
      transactions: this.transactions.size,
      notes: this.notes.size,
      events: this.events.size,
      addresses: this.addresses.size,
    };
  }
}
