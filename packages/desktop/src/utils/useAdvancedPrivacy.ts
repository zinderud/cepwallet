/**
 * React Hooks for Analytics and Security
 * Custom hooks for integration with React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyticsManager, TransactionMetric, AnalyticsData, AnomalyAlert } from '../analytics/manager';
import { AuditLogger, AuditEvent, AuditStatistics } from '../audit/logger';
import { SearchEngine, SearchQuery, SearchResponse } from '../search/engine';
import { RateLimiter, RateLimitStatus } from '../security/rateLimiter';

/**
 * Analytics Hook State
 */
interface AnalyticsHookState {
  metrics: TransactionMetric[];
  anomalies: AnomalyAlert[];
  statistics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Audit Log Hook State
 */
interface AuditLogHookState {
  events: AuditEvent[];
  statistics: AuditStatistics | null;
  isLoading: boolean;
  error: string | null;
  totalEvents: number;
}

/**
 * Search Hook State
 */
interface SearchHookState {
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  totalResults: number;
}

/**
 * Rate Limiter Hook State
 */
interface RateLimiterHookState {
  status: Record<string, RateLimitStatus>;
  securityStats: any;
  isLoading: boolean;
  error: string | null;
}

/**
 * useAnalytics Hook
 */
export function useAnalytics(refreshInterval: number = 5000) {
  const [state, setState] = useState<AnalyticsHookState>({
    metrics: [],
    anomalies: [],
    statistics: null,
    isLoading: true,
    error: null,
  });

  const analyticsRef = useRef(AnalyticsManager.getInstance());

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const all = analyticsRef.current.getAllMetrics();
        const anomalies = analyticsRef.current.calculateAnomalies();
        const now = Date.now();
        const stats = analyticsRef.current.getMetrics(now - 86400000, now);

        const analyticsData: AnalyticsData = {
          totalTransactions: stats.length,
          successRate: analyticsRef.current.getSuccessRate(),
          avgDuration: analyticsRef.current.getAvgDuration(),
          totalVolume: '0', // Calculated from metrics
          byPrivacyLevel: {},
          byStatus: {},
          timeSeriesData: analyticsRef.current.getTimeSeriesData(now - 3600000, now, 60000),
          topAddresses: analyticsRef.current.getTopAddresses(10),
          peakHours: analyticsRef.current.getPeakHours(now - 604800000, now),
          averageAmount: '0',
          medianDuration: 0,
        };

        setState({
          metrics: all,
          anomalies,
          statistics: analyticsData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: (error as Error).message,
        }));
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const recordTransaction = useCallback((metric: TransactionMetric) => {
    analyticsRef.current.recordTransaction(metric);
  }, []);

  const getMetrics = useCallback((startTime: number, endTime: number) => {
    return analyticsRef.current.getMetrics(startTime, endTime);
  }, []);

  const getAnomalies = useCallback(() => {
    return analyticsRef.current.getAnomalies();
  }, []);

  return { ...state, recordTransaction, getMetrics, getAnomalies };
}

/**
 * useAuditLog Hook
 */
export function useAuditLog(userId: string, limit: number = 100) {
  const [state, setState] = useState<AuditLogHookState>({
    events: [],
    statistics: null,
    isLoading: true,
    error: null,
    totalEvents: 0,
  });

  const auditRef = useRef(AuditLogger.getInstance());

  useEffect(() => {
    try {
      const events = auditRef.current.getEventsByUser(userId, limit);
      const stats = auditRef.current.getStatistics();
      const totalEvents = auditRef.current.getEventCount();

      setState({
        events,
        statistics: stats,
        isLoading: false,
        error: null,
        totalEvents,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, [userId, limit]);

  const logEvent = useCallback((event: Omit<AuditEvent, 'id'>) => {
    return auditRef.current.logEvent(event);
  }, []);

  const getEvents = useCallback((filter?: any) => {
    return auditRef.current.getEvents(filter);
  }, []);

  const searchEvents = useCallback((query: string) => {
    return auditRef.current.searchEvents(query, limit);
  }, [limit]);

  const exportLog = useCallback(() => {
    return auditRef.current.exportLog();
  }, []);

  const getStatistics = useCallback(() => {
    return auditRef.current.getStatistics();
  }, []);

  return {
    ...state,
    logEvent,
    getEvents,
    searchEvents,
    exportLog,
    getStatistics,
  };
}

/**
 * useSearch Hook
 */
export function useSearch() {
  const [state, setState] = useState<SearchHookState>({
    results: null,
    isLoading: false,
    error: null,
    totalResults: 0,
  });

  const searchRef = useRef(new SearchEngine());

  const search = useCallback((query: SearchQuery) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const results = searchRef.current.search(query);
      setState({
        results,
        isLoading: false,
        error: null,
        totalResults: results.totalCount,
      });
      return results;
    } catch (error) {
      setState({
        results: null,
        isLoading: false,
        error: (error as Error).message,
        totalResults: 0,
      });
      return null;
    }
  }, []);

  const indexTransaction = useCallback((transaction: any) => {
    searchRef.current.indexTransaction(transaction);
  }, []);

  const indexNote = useCallback((note: any) => {
    searchRef.current.indexNote(note);
  }, []);

  const indexEvent = useCallback((event: any) => {
    searchRef.current.indexEvent(event);
  }, []);

  const getSavedSearches = useCallback(() => {
    return searchRef.current.getSavedSearches();
  }, []);

  const saveSearch = useCallback((name: string, query: SearchQuery) => {
    return searchRef.current.saveSearch(name, query);
  }, []);

  const deleteSavedSearch = useCallback((id: string) => {
    return searchRef.current.deleteSavedSearch(id);
  }, []);

  return {
    ...state,
    search,
    indexTransaction,
    indexNote,
    indexEvent,
    getSavedSearches,
    saveSearch,
    deleteSavedSearch,
  };
}

/**
 * useRateLimiter Hook
 */
export function useRateLimiter(userId: string) {
  const [state, setState] = useState<RateLimiterHookState>({
    status: {},
    securityStats: null,
    isLoading: true,
    error: null,
  });

  const rateLimiterRef = useRef(RateLimiter.getInstance());

  useEffect(() => {
    try {
      const status = rateLimiterRef.current.getStatus(userId);
      const securityStats = rateLimiterRef.current.getSecurityStats();

      setState({
        status,
        securityStats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message,
      }));
    }

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      const status = rateLimiterRef.current.getStatus(userId);
      const securityStats = rateLimiterRef.current.getSecurityStats();

      setState({
        status,
        securityStats,
        isLoading: false,
        error: null,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const checkLimit = useCallback(
    (action: string): RateLimitStatus => {
      return rateLimiterRef.current.checkLimit(userId, action);
    },
    [userId]
  );

  const recordRequest = useCallback(
    (action: string) => {
      rateLimiterRef.current.recordRequest(userId, action);
    },
    [userId]
  );

  const getSecurityStats = useCallback(() => {
    return rateLimiterRef.current.getSecurityStats();
  }, []);

  const getDDoSInfo = useCallback(() => {
    return rateLimiterRef.current.getDDoSInfo();
  }, []);

  const getBlockedUsers = useCallback(() => {
    return rateLimiterRef.current.getBlockedUsers();
  }, []);

  const blockUser = useCallback((targetUserId: string, duration: number) => {
    rateLimiterRef.current.blockUser(targetUserId, duration);
  }, []);

  const unblockUser = useCallback((targetUserId: string) => {
    rateLimiterRef.current.unblockUser(targetUserId);
  }, []);

  return {
    ...state,
    checkLimit,
    recordRequest,
    getSecurityStats,
    getDDoSInfo,
    getBlockedUsers,
    blockUser,
    unblockUser,
  };
}
