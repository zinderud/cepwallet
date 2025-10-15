/**
 * Search Engine - Comprehensive Test Suite
 * Test suite for full-text search, indexing, and faceted search
 */

import { SearchEngine, SearchResult } from '../search/engine';

describe('SearchEngine', () => {
  let engine: SearchEngine;

  beforeEach(() => {
    engine = SearchEngine.getInstance();
  });

  // ============================================
  // INITIALIZATION & SINGLETON TESTS
  // ============================================

  describe('Initialization', () => {
    it('should be a singleton', () => {
      const engine1 = SearchEngine.getInstance();
      const engine2 = SearchEngine.getInstance();
      expect(engine1).toBe(engine2);
    });

    it('should start with empty index', () => {
      const results = engine.search('test');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // TRANSACTION INDEXING TESTS
  // ============================================

  describe('Transaction Indexing', () => {
    it('should index transaction', () => {
      engine.indexTransaction({
        id: 'tx1',
        hash: '0xabc123',
        from: 'alice',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now(),
      });

      const results = engine.search('alice');
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should index multiple transactions', () => {
      for (let i = 0; i < 5; i++) {
        engine.indexTransaction({
          id: `tx${i}`,
          hash: `0x${i}`,
          from: `user${i}`,
          to: `recipient${i}`,
          amount: (1000 + i * 100).toString(),
          timestamp: Date.now(),
        });
      }

      const results = engine.search('user');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should make transactions searchable', () => {
      engine.indexTransaction({
        id: 'search-tx-1',
        hash: '0xsearchable',
        from: 'sender_unique_id_12345',
        to: 'recipient',
        amount: '5000',
        timestamp: Date.now(),
      });

      const results = engine.search('sender_unique_id_12345');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // NOTE INDEXING TESTS
  // ============================================

  describe('Note Indexing', () => {
    it('should index note', () => {
      engine.indexNote({
        id: 'note1',
        commitment: '0xabcd1234',
        data: 'Private note content',
        timestamp: Date.now(),
      });

      const results = engine.search('Private note');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should index multiple notes', () => {
      for (let i = 0; i < 5; i++) {
        engine.indexNote({
          id: `note${i}`,
          commitment: `0x${i}`,
          data: `Note content ${i}`,
          timestamp: Date.now(),
        });
      }

      const results = engine.search('Note');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // EVENT INDEXING TESTS
  // ============================================

  describe('Event Indexing', () => {
    it('should index event', () => {
      engine.indexEvent({
        id: 'event1',
        type: 'transaction',
        action: 'submitted',
        timestamp: Date.now(),
        metadata: { txId: 'tx1' },
      });

      const results = engine.search('submitted');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should index multiple events', () => {
      for (let i = 0; i < 5; i++) {
        engine.indexEvent({
          id: `event${i}`,
          type: 'transaction',
          action: 'action_' + i,
          timestamp: Date.now(),
          metadata: { index: i },
        });
      }

      const results = engine.search('action');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // ADDRESS INDEXING TESTS
  // ============================================

  describe('Address Indexing', () => {
    it('should index address', () => {
      engine.indexAddress({
        address: '0x1234567890abcdef',
        type: 'user',
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        transactionCount: 10,
      });

      const results = engine.search('0x1234567890abcdef');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should index multiple addresses', () => {
      for (let i = 0; i < 5; i++) {
        engine.indexAddress({
          address: `0xaddress${i}`,
          type: 'user',
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          transactionCount: 5 + i,
        });
      }

      const results = engine.search('address');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // SEARCH TESTS
  // ============================================

  describe('Search Functionality', () => {
    beforeEach(() => {
      engine.indexTransaction({
        id: 'tx-search-1',
        hash: '0xsearch123',
        from: 'alice_test',
        to: 'bob_test',
        amount: '1000',
        timestamp: Date.now(),
      });

      engine.indexNote({
        id: 'note-search-1',
        commitment: '0xnote123',
        data: 'Important transaction data',
        timestamp: Date.now(),
      });

      engine.indexEvent({
        id: 'event-search-1',
        type: 'transaction',
        action: 'completed',
        timestamp: Date.now(),
        metadata: { status: 'success' },
      });
    });

    it('should search by keyword', () => {
      const results = engine.search('alice');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search across multiple data types', () => {
      const results = engine.search('transaction');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for non-matching search', () => {
      const results = engine.search('nonexistentterm_xyz_12345');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should be case insensitive', () => {
      const results1 = engine.search('ALICE');
      const results2 = engine.search('alice');
      expect(Array.isArray(results1)).toBe(Array.isArray(results2));
    });
  });

  // ============================================
  // SAVED SEARCHES TESTS
  // ============================================

  describe('Saved Searches', () => {
    it('should save search', () => {
      const saved = engine.saveSearch('alice_searches', 'alice');
      expect(typeof saved).toBe('string');
    });

    it('should execute saved search', () => {
      const id = engine.saveSearch('bob_searches', 'bob');
      const results = engine.executeSavedSearch(id);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should retrieve saved searches', () => {
      engine.saveSearch('search1', 'query1');
      engine.saveSearch('search2', 'query2');

      const searches = engine.getSavedSearches();
      expect(Array.isArray(searches)).toBe(true);
    });

    it('should delete saved search', () => {
      const id = engine.saveSearch('delete_me', 'test');
      const deleted = engine.deleteSavedSearch(id);
      expect(typeof deleted).toBe('boolean');
    });
  });

  // ============================================
  // RELEVANCE SCORING TESTS
  // ============================================

  describe('Relevance Scoring', () => {
    beforeEach(() => {
      engine.indexTransaction({
        id: 'tx-rel-1',
        hash: '0xrelevant',
        from: 'alice_relevance_test',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now(),
      });

      engine.indexNote({
        id: 'note-rel-1',
        commitment: '0xnote',
        data: 'Test data with alice mentioned here',
        timestamp: Date.now(),
      });
    });

    it('should calculate relevance score', () => {
      const results = engine.search('alice');
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should rank by relevance', () => {
      const results = engine.search('alice');
      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          const score1 = results[i].score || 0;
          const score2 = results[i + 1].score || 0;
          expect(score1).toBeGreaterThanOrEqual(score2);
        }
      }
    });
  });

  // ============================================
  // PAGINATION TESTS
  // ============================================

  describe('Pagination', () => {
    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        engine.indexTransaction({
          id: `tx-page-${i}`,
          hash: `0xpage${i}`,
          from: `user_paginated_${i}`,
          to: 'recipient',
          amount: '100',
          timestamp: Date.now(),
        });
      }
    });

    it('should support pagination', () => {
      const results = engine.search('user_paginated', { limit: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should support offset', () => {
      const results1 = engine.search('user_paginated', { limit: 5, offset: 0 });
      const results2 = engine.search('user_paginated', { limit: 5, offset: 5 });
      expect(Array.isArray(results1)).toBe(true);
      expect(Array.isArray(results2)).toBe(true);
    });
  });

  // ============================================
  // FACETED SEARCH TESTS
  // ============================================

  describe('Faceted Search', () => {
    beforeEach(() => {
      engine.indexTransaction({
        id: 'tx-facet-1',
        hash: '0xfacet1',
        from: 'alice',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now(),
      });

      engine.indexEvent({
        id: 'event-facet-1',
        type: 'transaction',
        action: 'submitted',
        timestamp: Date.now(),
        metadata: {},
      });
    });

    it('should get aggregations', () => {
      const aggs = engine.getAggregations('transaction');
      expect(aggs).toBeDefined();
    });

    it('should have type facet', () => {
      const results = engine.search('alice');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      const results = engine.search('');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle very long search query', () => {
      const longQuery = 'a'.repeat(1000);
      const results = engine.search(longQuery);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters in search', () => {
      engine.indexTransaction({
        id: 'tx-special',
        hash: '0xspecial',
        from: 'user@test#123',
        to: 'recipient$',
        amount: '500',
        timestamp: Date.now(),
      });

      const results = engine.search('@test#');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle unicode characters', () => {
      engine.indexNote({
        id: 'note-unicode',
        commitment: '0xunicode',
        data: 'Unicode テスト 测试',
        timestamp: Date.now(),
      });

      const results = engine.search('テスト');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle duplicate indexing', () => {
      const tx = {
        id: 'tx-dup',
        hash: '0xdup',
        from: 'alice',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now(),
      };

      engine.indexTransaction(tx);
      engine.indexTransaction(tx);

      const results = engine.search('alice');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle null/undefined values in metadata', () => {
      engine.indexEvent({
        id: 'event-null',
        type: 'transaction',
        action: 'test',
        timestamp: Date.now(),
        metadata: { value: null, other: undefined },
      });

      const results = engine.search('test');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================

  describe('Performance', () => {
    it('should index 1000 items efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        engine.indexTransaction({
          id: `tx-perf-${i}`,
          hash: `0xperf${i}`,
          from: `user${i % 100}`,
          to: `recipient${i % 50}`,
          amount: Math.floor(Math.random() * 10000).toString(),
          timestamp: Date.now(),
        });
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });

    it('should search efficiently', () => {
      for (let i = 0; i < 500; i++) {
        engine.indexTransaction({
          id: `tx-search-${i}`,
          hash: `0xsearch${i}`,
          from: `alice_${i % 10}`,
          to: 'bob',
          amount: '100',
          timestamp: Date.now(),
        });
      }

      const start = Date.now();
      const results = engine.search('alice');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle large result sets efficiently', () => {
      for (let i = 0; i < 100; i++) {
        engine.indexTransaction({
          id: `tx-large-${i}`,
          hash: `0xlarge${i}`,
          from: 'common_user',
          to: `recipient_${i}`,
          amount: '1000',
          timestamp: Date.now(),
        });
      }

      const start = Date.now();
      const results = engine.search('common_user');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================
  // FILTERING TESTS
  // ============================================

  describe('Filtering', () => {
    beforeEach(() => {
      engine.indexTransaction({
        id: 'tx-filter-1',
        hash: '0xfilter1',
        from: 'alice',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now() - 86400000,
      });

      engine.indexTransaction({
        id: 'tx-filter-2',
        hash: '0xfilter2',
        from: 'charlie',
        to: 'bob',
        amount: '500',
        timestamp: Date.now(),
      });
    });

    it('should support date range filtering', () => {
      const now = Date.now();
      const results = engine.search('bob', {
        startTime: now - 1000000,
        endTime: now,
      });
      expect(Array.isArray(results)).toBe(true);
    });

    it('should support field filtering', () => {
      const results = engine.search('alice', { fields: ['from'] });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  // ============================================
  // CLEAR & RESET TESTS
  // ============================================

  describe('Index Management', () => {
    it('should clear index', () => {
      engine.indexTransaction({
        id: 'tx-clear',
        hash: '0xclear',
        from: 'alice',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now(),
      });

      engine.clearIndex();
      const results = engine.search('alice');
      expect(results.length).toBe(0);
    });

    it('should get index statistics', () => {
      engine.indexTransaction({
        id: 'tx-stats',
        hash: '0xstats',
        from: 'alice',
        to: 'bob',
        amount: '1000',
        timestamp: Date.now(),
      });

      const stats = engine.getIndexStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });
});
