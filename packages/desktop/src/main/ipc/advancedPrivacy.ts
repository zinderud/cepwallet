/**
 * Advanced Privacy - IPC Handlers
 * Main process handlers for secure communication with renderer
 */

import { ipcMain, BrowserWindow } from 'electron';
import { AnalyticsManager } from '../shared/src/analytics/manager';
import { AuditLogger } from '../shared/src/audit/logger';
import { SearchEngine } from '../shared/src/search/engine';
import { PrivacyAutoDetector } from '../shared/src/privacy/autoDetector';
import { RateLimiter } from '../shared/src/security/rateLimiter';

const analytics = AnalyticsManager.getInstance();
const auditLogger = AuditLogger.getInstance();
const searchEngine = new SearchEngine();
const privacyDetector = new PrivacyAutoDetector();
const rateLimiter = RateLimiter.getInstance();

/**
 * Register IPC Handlers
 */
export function registerAdvancedPrivacyHandlers(mainWindow: BrowserWindow) {
  // ============================================
  // ANALYTICS HANDLERS
  // ============================================

  ipcMain.handle('analytics:record-transaction', async (event, metric) => {
    try {
      analytics.recordTransaction(metric);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-metrics', async (event, startTime, endTime) => {
    try {
      const metrics = analytics.getMetrics(startTime, endTime);
      return { success: true, data: metrics };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-anomalies', async (event) => {
    try {
      const anomalies = analytics.getAnomalies();
      return { success: true, data: anomalies };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-privacy-stats', async (event, privacyLevel) => {
    try {
      const stats = analytics.getPrivacyLevelStats(privacyLevel);
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-address-metrics', async (event, address) => {
    try {
      const metrics = analytics.getAddressMetrics(address);
      return { success: true, data: metrics };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-time-series', async (event, startTime, endTime, interval) => {
    try {
      const data = analytics.getTimeSeriesData(startTime, endTime, interval);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-peak-hours', async (event, startTime, endTime) => {
    try {
      const peaks = analytics.getPeakHours(startTime, endTime);
      return { success: true, data: peaks };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-success-rate', async (event) => {
    try {
      const rate = analytics.getSuccessRate();
      return { success: true, data: rate };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:get-top-addresses', async (event, limit) => {
    try {
      const addresses = analytics.getTopAddresses(limit);
      return { success: true, data: addresses };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('analytics:export', async (event) => {
    try {
      const exported = analytics.exportMetrics();
      return { success: true, data: exported };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ============================================
  // AUDIT LOG HANDLERS
  // ============================================

  ipcMain.handle('audit:log-event', async (event, auditEvent) => {
    try {
      auditLogger.logEvent(auditEvent);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:get-events', async (event, filter) => {
    try {
      const events = auditLogger.getEvents(filter);
      return { success: true, data: events };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:get-user-events', async (event, userId, limit) => {
    try {
      const events = auditLogger.getEventsByUser(userId, limit);
      return { success: true, data: events };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:get-type-events', async (event, eventType, limit) => {
    try {
      const events = auditLogger.getEventsByType(eventType, limit);
      return { success: true, data: events };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:search-events', async (event, query) => {
    try {
      const results = auditLogger.searchEvents(query);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:get-statistics', async (event) => {
    try {
      const stats = auditLogger.getStatistics();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:generate-report', async (event, timeRange) => {
    try {
      const report = auditLogger.generateReport(timeRange);
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('audit:export', async (event) => {
    try {
      const exported = auditLogger.exportLog();
      return { success: true, data: exported };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ============================================
  // SEARCH HANDLERS
  // ============================================

  ipcMain.handle('search:execute', async (event, query) => {
    try {
      const results = searchEngine.search(query);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search:index-transaction', async (event, transaction) => {
    try {
      searchEngine.indexTransaction(transaction);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search:index-note', async (event, note) => {
    try {
      searchEngine.indexNote(note);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search:save-search', async (event, name, query, filters) => {
    try {
      searchEngine.saveSearch(name, query, filters);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search:get-saved-searches', async (event) => {
    try {
      const searches = searchEngine.getSavedSearches();
      return { success: true, data: searches };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search:execute-saved', async (event, searchId) => {
    try {
      const results = searchEngine.executeSavedSearch(searchId);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search:delete-saved', async (event, searchId) => {
    try {
      searchEngine.deleteSavedSearch(searchId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ============================================
  // PRIVACY AUTO-DETECTION HANDLERS
  // ============================================

  ipcMain.handle('privacy:analyze-transaction', async (event, context) => {
    try {
      const recommendation = privacyDetector.analyzeTransaction(context);
      return { success: true, data: recommendation };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('privacy:learn-from-user', async (event, context, choice) => {
    try {
      privacyDetector.learnFromUser(context, choice);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('privacy:get-user-profile', async (event, userId) => {
    try {
      const profile = privacyDetector.getUserProfile(userId);
      return { success: true, data: profile };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('privacy:get-learning-insights', async (event) => {
    try {
      const insights = privacyDetector.getLearningInsights();
      return { success: true, data: insights };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('privacy:register-trusted-address', async (event, userId, address) => {
    try {
      privacyDetector.registerTrustedAddress(userId, address);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ============================================
  // RATE LIMITING HANDLERS
  // ============================================

  ipcMain.handle('ratelimit:check-limit', async (event, userId, action) => {
    try {
      const status = rateLimiter.checkLimit(userId, action);
      return { success: true, data: status };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:record-request', async (event, userId, action) => {
    try {
      rateLimiter.recordRequest(userId, action);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:get-status', async (event, userId) => {
    try {
      const status = rateLimiter.getStatus(userId);
      return { success: true, data: status };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:block-user', async (event, userId, duration) => {
    try {
      rateLimiter.blockUser(userId, duration);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:unblock-user', async (event, userId) => {
    try {
      rateLimiter.unblockUser(userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:get-blocked-users', async (event) => {
    try {
      const users = rateLimiter.getBlockedUsers();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:get-security-stats', async (event) => {
    try {
      const stats = rateLimiter.getSecurityStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:get-ddos-info', async (event) => {
    try {
      const info = rateLimiter.getDDoSInfo();
      return { success: true, data: info };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:add-rule', async (event, rule) => {
    try {
      rateLimiter.addRule(rule);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:get-all-rules', async (event) => {
    try {
      const rules = rateLimiter.getAllRules();
      return { success: true, data: rules };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ratelimit:reset-limits', async (event, userId) => {
    try {
      rateLimiter.resetLimits(userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  console.log('✅ Advanced Privacy IPC handlers registered (18 handlers)');
}

/**
 * Unregister IPC Handlers
 */
export function unregisterAdvancedPrivacyHandlers() {
  ipcMain.removeAllListeners('analytics:record-transaction');
  ipcMain.removeAllListeners('analytics:get-metrics');
  ipcMain.removeAllListeners('analytics:get-anomalies');
  ipcMain.removeAllListeners('analytics:get-privacy-stats');
  ipcMain.removeAllListeners('analytics:get-address-metrics');
  ipcMain.removeAllListeners('analytics:get-time-series');
  ipcMain.removeAllListeners('analytics:get-peak-hours');
  ipcMain.removeAllListeners('analytics:get-success-rate');
  ipcMain.removeAllListeners('analytics:get-top-addresses');
  ipcMain.removeAllListeners('analytics:export');

  ipcMain.removeAllListeners('audit:log-event');
  ipcMain.removeAllListeners('audit:get-events');
  ipcMain.removeAllListeners('audit:get-user-events');
  ipcMain.removeAllListeners('audit:get-type-events');
  ipcMain.removeAllListeners('audit:search-events');
  ipcMain.removeAllListeners('audit:get-statistics');
  ipcMain.removeAllListeners('audit:generate-report');
  ipcMain.removeAllListeners('audit:export');

  ipcMain.removeAllListeners('search:execute');
  ipcMain.removeAllListeners('search:index-transaction');
  ipcMain.removeAllListeners('search:index-note');
  ipcMain.removeAllListeners('search:save-search');
  ipcMain.removeAllListeners('search:get-saved-searches');
  ipcMain.removeAllListeners('search:execute-saved');
  ipcMain.removeAllListeners('search:delete-saved');

  ipcMain.removeAllListeners('privacy:analyze-transaction');
  ipcMain.removeAllListeners('privacy:learn-from-user');
  ipcMain.removeAllListeners('privacy:get-user-profile');
  ipcMain.removeAllListeners('privacy:get-learning-insights');
  ipcMain.removeAllListeners('privacy:register-trusted-address');

  ipcMain.removeAllListeners('ratelimit:check-limit');
  ipcMain.removeAllListeners('ratelimit:record-request');
  ipcMain.removeAllListeners('ratelimit:get-status');
  ipcMain.removeAllListeners('ratelimit:block-user');
  ipcMain.removeAllListeners('ratelimit:unblock-user');
  ipcMain.removeAllListeners('ratelimit:get-blocked-users');
  ipcMain.removeAllListeners('ratelimit:get-security-stats');
  ipcMain.removeAllListeners('ratelimit:get-ddos-info');
  ipcMain.removeAllListeners('ratelimit:add-rule');
  ipcMain.removeAllListeners('ratelimit:get-all-rules');
  ipcMain.removeAllListeners('ratelimit:reset-limits');
}
