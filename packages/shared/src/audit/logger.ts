/**
 * Audit Logger - Privacy-Aware Event Logging
 * Logs all system events with privacy-aware visibility controls
 */

export enum PrivacyLevel {
  PUBLIC = 0,
  SEMI_PRIVATE = 1,
  FULL_PRIVATE = 2,
}

/**
 * Audit Event Type
 */
export type AuditEventType = 'transaction' | 'encryption' | 'access' | 'config_change' | 'error' | 'sync' | 'search';

/**
 * Audit Event Interface
 */
export interface AuditEvent {
  id: string;
  timestamp: number;
  eventType: AuditEventType;
  privacyLevel: PrivacyLevel;
  visibilityLevel: PrivacyLevel; // Who can see this event
  userId: string;
  action: string;
  details: Record<string, any>;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
}

/**
 * Audit Log Interface
 */
export interface AuditLog {
  events: AuditEvent[];
  totalCount: number;
  filteredCount: number;
}

/**
 * Audit Event Filter
 */
export interface AuditEventFilter {
  eventType?: AuditEventType;
  userId?: string;
  privacyLevel?: PrivacyLevel;
  status?: 'success' | 'failure';
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

/**
 * Audit Statistics
 */
export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByUser: Record<string, number>;
  eventsByStatus: Record<string, number>;
  eventsByPrivacyLevel: Record<number, number>;
  successRate: number;
  lastEventTime: number;
}

/**
 * Audit Logger - Singleton Pattern
 * Logs and retrieves audit events with privacy-aware controls
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private events: Map<string, AuditEvent>;
  private eventsByUser: Map<string, string[]>;
  private eventsByType: Map<AuditEventType, string[]>;
  private statistics: AuditStatistics;
  private lastPurgeTime: number;
  private purgeInterval: number;

  private constructor() {
    this.events = new Map();
    this.eventsByUser = new Map();
    this.eventsByType = new Map();
    this.lastPurgeTime = Date.now();
    this.purgeInterval = 3600000; // 1 hour
    this.statistics = this.initializeStats();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): AuditStatistics {
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByUser: {},
      eventsByStatus: {},
      eventsByPrivacyLevel: {},
      successRate: 100,
      lastEventTime: 0,
    };
  }

  /**
   * Log an event
   */
  logEvent(event: Omit<AuditEvent, 'id'>): AuditEvent {
    const auditEvent: AuditEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.events.set(auditEvent.id, auditEvent);

    // Index by user
    if (!this.eventsByUser.has(event.userId)) {
      this.eventsByUser.set(event.userId, []);
    }
    this.eventsByUser.get(event.userId)!.push(auditEvent.id);

    // Index by type
    if (!this.eventsByType.has(event.eventType)) {
      this.eventsByType.set(event.eventType, []);
    }
    this.eventsByType.get(event.eventType)!.push(auditEvent.id);

    // Update statistics
    this.updateStatistics(auditEvent);

    return auditEvent;
  }

  /**
   * Update statistics
   */
  private updateStatistics(event: AuditEvent): void {
    this.statistics.totalEvents++;
    this.statistics.eventsByType[event.eventType] =
      (this.statistics.eventsByType[event.eventType] || 0) + 1;
    this.statistics.eventsByUser[event.userId] =
      (this.statistics.eventsByUser[event.userId] || 0) + 1;
    this.statistics.eventsByStatus[event.status] =
      (this.statistics.eventsByStatus[event.status] || 0) + 1;
    this.statistics.eventsByPrivacyLevel[event.privacyLevel] =
      (this.statistics.eventsByPrivacyLevel[event.privacyLevel] || 0) + 1;
    this.statistics.lastEventTime = event.timestamp;

    // Calculate success rate
    const successful = this.statistics.eventsByStatus['success'] || 0;
    this.statistics.successRate = (successful / this.statistics.totalEvents) * 100;
  }

  /**
   * Get events with filtering
   */
  getEvents(filter: AuditEventFilter = {}): AuditLog {
    let events = Array.from(this.events.values());

    if (filter.eventType) {
      events = events.filter((e) => e.eventType === filter.eventType);
    }

    if (filter.userId) {
      events = events.filter((e) => e.userId === filter.userId);
    }

    if (filter.privacyLevel !== undefined) {
      events = events.filter((e) => e.privacyLevel === filter.privacyLevel);
    }

    if (filter.status) {
      events = events.filter((e) => e.status === filter.status);
    }

    if (filter.startTime) {
      events = events.filter((e) => e.timestamp >= filter.startTime!);
    }

    if (filter.endTime) {
      events = events.filter((e) => e.timestamp <= filter.endTime!);
    }

    const filteredCount = events.length;

    // Apply pagination
    const limit = filter.limit || 100;
    const offset = filter.offset || 0;
    events = events.slice(offset, offset + limit);

    return {
      events,
      totalCount: this.events.size,
      filteredCount,
    };
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string, limit: number = 100): AuditEvent[] {
    const eventIds = this.eventsByUser.get(userId) || [];
    return eventIds
      .slice(-limit)
      .map((id) => this.events.get(id)!)
      .filter((e) => !!e);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: AuditEventType, limit: number = 100): AuditEvent[] {
    const eventIds = this.eventsByType.get(eventType) || [];
    return eventIds
      .slice(-limit)
      .map((id) => this.events.get(id)!)
      .filter((e) => !!e);
  }

  /**
   * Get events by privacy level
   */
  getEventsByPrivacyLevel(privacyLevel: PrivacyLevel, limit: number = 100): AuditEvent[] {
    const filtered = Array.from(this.events.values())
      .filter((e) => e.privacyLevel === privacyLevel)
      .slice(-limit);
    return filtered;
  }

  /**
   * Search events
   */
  searchEvents(query: string, limit: number = 100): AuditEvent[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.events.values())
      .filter((e) => {
        const detailsStr = JSON.stringify(e.details).toLowerCase();
        return (
          e.action.toLowerCase().includes(searchTerm) ||
          e.userId.toLowerCase().includes(searchTerm) ||
          e.errorMessage?.toLowerCase().includes(searchTerm) ||
          detailsStr.includes(searchTerm)
        );
      })
      .slice(-limit);
  }

  /**
   * Export audit log
   */
  exportLog(): { events: AuditEvent[]; exportedAt: number } {
    return {
      events: Array.from(this.events.values()),
      exportedAt: Date.now(),
    };
  }

  /**
   * Import audit log
   */
  importLog(data: { events: AuditEvent[]; exportedAt: number }): void {
    data.events.forEach((event) => {
      this.events.set(event.id, event);
      this.updateStatistics(event);
    });
  }

  /**
   * Clear old events
   */
  clearOldEvents(daysOld: number): number {
    const cutoffTime = Date.now() - daysOld * 86400000;
    let count = 0;

    this.events.forEach((event, id) => {
      if (event.timestamp < cutoffTime) {
        this.events.delete(id);
        count++;

        // Remove from indices
        const userEvents = this.eventsByUser.get(event.userId);
        if (userEvents) {
          const index = userEvents.indexOf(id);
          if (index > -1) {
            userEvents.splice(index, 1);
          }
        }

        const typeEvents = this.eventsByType.get(event.eventType);
        if (typeEvents) {
          const index = typeEvents.indexOf(id);
          if (index > -1) {
            typeEvents.splice(index, 1);
          }
        }
      }
    });

    return count;
  }

  /**
   * Verify audit log integrity
   */
  verifyIntegrity(): { isValid: boolean; tamperedEvents: string[] } {
    const tamperedEvents: string[] = [];

    // Check for suspicious patterns
    this.events.forEach((event, id) => {
      if (event.timestamp > Date.now()) {
        tamperedEvents.push(id);
      }

      if (!event.id || event.id !== id) {
        tamperedEvents.push(id);
      }
    });

    return {
      isValid: tamperedEvents.length === 0,
      tamperedEvents,
    };
  }

  /**
   * Get audit statistics
   */
  getStatistics(): AuditStatistics {
    return { ...this.statistics };
  }

  /**
   * Flag suspicious activity
   */
  flagSuspiciousActivity(
    userId: string,
    reason: string
  ): AuditEvent {
    return this.logEvent({
      timestamp: Date.now(),
      eventType: 'error',
      privacyLevel: PrivacyLevel.FULL_PRIVATE,
      visibilityLevel: PrivacyLevel.FULL_PRIVATE,
      userId,
      action: 'suspicious_activity_flagged',
      details: { reason },
      status: 'failure',
    });
  }

  /**
   * Get access log for an entity
   */
  getAccessLog(entityId: string): AuditEvent[] {
    return Array.from(this.events.values()).filter((e) => {
      const detailsStr = JSON.stringify(e.details);
      return detailsStr.includes(entityId);
    });
  }

  /**
   * Generate audit report
   */
  generateReport(startTime: number, endTime: number): {
    totalEvents: number;
    successCount: number;
    failureCount: number;
    eventsByType: Record<AuditEventType, number>;
    eventsByUser: Record<string, number>;
    summary: string;
  } {
    const events = this.getEvents({ startTime, endTime }).events;

    const eventsByType: Record<AuditEventType, number> = {} as any;
    const eventsByUser: Record<string, number> = {};
    let successCount = 0;
    let failureCount = 0;

    events.forEach((e) => {
      eventsByType[e.eventType] = (eventsByType[e.eventType] || 0) + 1;
      eventsByUser[e.userId] = (eventsByUser[e.userId] || 0) + 1;

      if (e.status === 'success') {
        successCount++;
      } else {
        failureCount++;
      }
    });

    const successRate = (successCount / events.length) * 100;
    const summary = `Report: ${events.length} events, ${successRate.toFixed(2)}% success rate`;

    return {
      totalEvents: events.length,
      successCount,
      failureCount,
      eventsByType,
      eventsByUser,
      summary,
    };
  }

  /**
   * Get all events
   */
  getAllEvents(): AuditEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this.events.size;
  }

  /**
   * Reset logger
   */
  reset(): void {
    this.events.clear();
    this.eventsByUser.clear();
    this.eventsByType.clear();
    this.statistics = this.initializeStats();
  }
}
