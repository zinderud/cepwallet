/**
 * Rate Limiter - Request Rate Limiting and Security
 * Implements rate limiting, DDoS protection, and access control
 */

/**
 * Rate Limit Rule
 */
export interface RateLimitRule {
  name: string;
  maxRequests: number;
  timeWindow: number; // milliseconds
  bypassFor: string[]; // admin addresses
  onLimitExceeded: 'block' | 'queue' | 'throttle';
  enabled: boolean;
}

/**
 * Rate Limit Status
 */
export interface RateLimitStatus {
  isLimited: boolean;
  requestsRemaining: number;
  resetTime: number;
  nextAvailableTime: number;
  isBlocked: boolean;
  blockReason?: string;
}

/**
 * User Rate Limit State
 */
interface UserLimitState {
  requests: number[];
  blocked: boolean;
  blockUntil?: number;
  blockReason?: string;
}

/**
 * Rate Limiter - Singleton Pattern
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private rules: Map<string, RateLimitRule>;
  private userState: Map<string, Map<string, UserLimitState>>;
  private blockedUsers: Map<string, number>;
  private ddosThreshold: number;
  private securityStats: {
    totalRequests: number;
    blockedRequests: number;
    ddosAttempts: number;
    lastDdosDetection: number;
  };

  private constructor() {
    this.rules = new Map();
    this.userState = new Map();
    this.blockedUsers = new Map();
    this.ddosThreshold = 1000; // requests per second
    this.securityStats = {
      totalRequests: 0,
      blockedRequests: 0,
      ddosAttempts: 0,
      lastDdosDetection: 0,
    };

    this.initializeDefaultRules();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Initialize default rules
   */
  private initializeDefaultRules(): void {
    // Transaction submission
    this.addRule({
      name: 'transaction_submit',
      maxRequests: 100,
      timeWindow: 60000, // 1 minute
      bypassFor: [],
      onLimitExceeded: 'block',
      enabled: true,
    });

    // API calls
    this.addRule({
      name: 'api_calls',
      maxRequests: 1000,
      timeWindow: 60000,
      bypassFor: [],
      onLimitExceeded: 'throttle',
      enabled: true,
    });

    // Authentication attempts
    this.addRule({
      name: 'auth_attempts',
      maxRequests: 10,
      timeWindow: 60000,
      bypassFor: [],
      onLimitExceeded: 'block',
      enabled: true,
    });

    // Data retrieval
    this.addRule({
      name: 'data_retrieval',
      maxRequests: 500,
      timeWindow: 60000,
      bypassFor: [],
      onLimitExceeded: 'throttle',
      enabled: true,
    });
  }

  /**
   * Check if request is allowed
   */
  checkLimit(userId: string, action: string): RateLimitStatus {
    this.securityStats.totalRequests++;

    // Check if user is blocked
    const blockUntil = this.blockedUsers.get(userId);
    if (blockUntil && blockUntil > Date.now()) {
      this.securityStats.blockedRequests++;
      return {
        isLimited: true,
        requestsRemaining: 0,
        resetTime: blockUntil,
        nextAvailableTime: blockUntil,
        isBlocked: true,
        blockReason: 'User is temporarily blocked',
      };
    } else if (blockUntil) {
      this.blockedUsers.delete(userId);
    }

    const rule = this.rules.get(action);
    if (!rule || !rule.enabled) {
      return {
        isLimited: false,
        requestsRemaining: -1,
        resetTime: 0,
        nextAvailableTime: 0,
        isBlocked: false,
      };
    }

    // Check bypass list
    if (rule.bypassFor.includes(userId)) {
      return {
        isLimited: false,
        requestsRemaining: rule.maxRequests,
        resetTime: 0,
        nextAvailableTime: 0,
        isBlocked: false,
      };
    }

    // Get user state
    if (!this.userState.has(userId)) {
      this.userState.set(userId, new Map());
    }

    const userActions = this.userState.get(userId)!;
    if (!userActions.has(action)) {
      userActions.set(action, {
        requests: [],
        blocked: false,
      });
    }

    const state = userActions.get(action)!;
    const now = Date.now();

    // Clean old requests outside time window
    state.requests = state.requests.filter((ts) => ts > now - rule.timeWindow);

    // Check if limit exceeded
    if (state.requests.length >= rule.maxRequests) {
      this.securityStats.blockedRequests++;

      if (rule.onLimitExceeded === 'block') {
        state.blocked = true;
        const blockDuration = rule.timeWindow;
        this.blockUser(userId, blockDuration);

        return {
          isLimited: true,
          requestsRemaining: 0,
          resetTime: now + blockDuration,
          nextAvailableTime: now + blockDuration,
          isBlocked: true,
          blockReason: `Rate limit exceeded for ${action}`,
        };
      } else if (rule.onLimitExceeded === 'throttle') {
        return {
          isLimited: true,
          requestsRemaining: 0,
          resetTime: state.requests[0] + rule.timeWindow,
          nextAvailableTime: state.requests[0] + rule.timeWindow,
          isBlocked: false,
        };
      }
    }

    return {
      isLimited: false,
      requestsRemaining: rule.maxRequests - state.requests.length - 1,
      resetTime: state.requests.length > 0 ? state.requests[0] + rule.timeWindow : now + rule.timeWindow,
      nextAvailableTime: 0,
      isBlocked: false,
    };
  }

  /**
   * Record a request
   */
  recordRequest(userId: string, action: string): void {
    if (!this.userState.has(userId)) {
      this.userState.set(userId, new Map());
    }

    const userActions = this.userState.get(userId)!;
    if (!userActions.has(action)) {
      userActions.set(action, {
        requests: [],
        blocked: false,
      });
    }

    const state = userActions.get(action)!;
    state.requests.push(Date.now());

    // Detect DDoS
    this.detectDDoS();
  }

  /**
   * Get rate limit status
   */
  getStatus(userId: string): Record<string, RateLimitStatus> {
    const status: Record<string, RateLimitStatus> = {};

    this.rules.forEach((rule, action) => {
      status[action] = this.checkLimit(userId, action);
    });

    return status;
  }

  /**
   * Add rate limit rule
   */
  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * Remove rate limit rule
   */
  removeRule(name: string): boolean {
    return this.rules.delete(name);
  }

  /**
   * Get rate limit rule
   */
  getRule(name: string): RateLimitRule | undefined {
    return this.rules.get(name);
  }

  /**
   * Get all rules
   */
  getAllRules(): RateLimitRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Reset user limits
   */
  resetLimits(userId: string): void {
    this.userState.delete(userId);
    this.blockedUsers.delete(userId);
  }

  /**
   * Block user temporarily
   */
  blockUser(userId: string, duration: number): void {
    this.blockedUsers.set(userId, Date.now() + duration);
  }

  /**
   * Unblock user
   */
  unblockUser(userId: string): void {
    this.blockedUsers.delete(userId);
  }

  /**
   * Get blocked users
   */
  getBlockedUsers(): { userId: string; blockUntil: number }[] {
    const blocked: { userId: string; blockUntil: number }[] = [];
    const now = Date.now();

    this.blockedUsers.forEach((blockUntil, userId) => {
      if (blockUntil > now) {
        blocked.push({ userId, blockUntil });
      }
    });

    return blocked;
  }

  /**
   * Detect DDoS patterns
   */
  private detectDDoS(): void {
    const now = Date.now();
    const windowStart = now - 1000; // Last second
    let requestsInWindow = 0;

    this.userState.forEach((userActions) => {
      userActions.forEach((state) => {
        requestsInWindow += state.requests.filter((ts) => ts > windowStart).length;
      });
    });

    if (requestsInWindow > this.ddosThreshold) {
      this.securityStats.ddosAttempts++;
      this.securityStats.lastDdosDetection = now;

      // Block top requesters
      const requestCounts = new Map<string, number>();

      this.userState.forEach((userActions, userId) => {
        let count = 0;
        userActions.forEach((state) => {
          count += state.requests.filter((ts) => ts > windowStart).length;
        });
        requestCounts.set(userId, count);
      });

      // Sort by request count
      const topRequesters = Array.from(requestCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 requesters

      topRequesters.forEach(([userId]) => {
        this.blockUser(userId, 60000); // Block for 1 minute
      });
    }
  }

  /**
   * Get DDoS detection info
   */
  getDDoSInfo(): {
    threshold: number;
    attempts: number;
    lastDetection: number;
  } {
    return {
      threshold: this.ddosThreshold,
      attempts: this.securityStats.ddosAttempts,
      lastDetection: this.securityStats.lastDdosDetection,
    };
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalRequests: number;
    blockedRequests: number;
    ddosAttempts: number;
    blockRate: number;
    lastDdosDetection: number;
  } {
    return {
      totalRequests: this.securityStats.totalRequests,
      blockedRequests: this.securityStats.blockedRequests,
      ddosAttempts: this.securityStats.ddosAttempts,
      blockRate:
        this.securityStats.totalRequests > 0
          ? (this.securityStats.blockedRequests / this.securityStats.totalRequests) * 100
          : 0,
      lastDdosDetection: this.securityStats.lastDdosDetection,
    };
  }

  /**
   * Update DDoS threshold
   */
  setDDoSThreshold(threshold: number): void {
    this.ddosThreshold = threshold;
  }

  /**
   * Get active users
   */
  getActiveUsers(): number {
    return this.userState.size;
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.securityStats = {
      totalRequests: 0,
      blockedRequests: 0,
      ddosAttempts: 0,
      lastDdosDetection: 0,
    };
  }

  /**
   * Clear all limits
   */
  clear(): void {
    this.userState.clear();
    this.blockedUsers.clear();
    this.resetStatistics();
  }

  /**
   * Get user limit state for action
   */
  getUserLimitState(userId: string, action: string): { requestCount: number; resetTime: number } | null {
    const userActions = this.userState.get(userId);
    if (!userActions) return null;

    const state = userActions.get(action);
    if (!state) return null;

    const rule = this.rules.get(action);
    if (!rule) return null;

    const now = Date.now();
    const validRequests = state.requests.filter((ts) => ts > now - rule.timeWindow);

    return {
      requestCount: validRequests.length,
      resetTime: validRequests.length > 0 ? validRequests[0] + rule.timeWindow : now + rule.timeWindow,
    };
  }
}
