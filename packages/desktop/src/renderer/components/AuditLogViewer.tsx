/**
 * Audit Log Viewer Component
 * Displays audit events with filtering and search capabilities
 */

import React, { useState, useMemo } from 'react';

interface AuditEventUI {
  id: string;
  timestamp: number;
  eventType: string;
  action: string;
  userId: string;
  status: 'success' | 'failure';
  privacyLevel: number;
  details?: any;
}

interface AuditLogViewerProps {
  events?: AuditEventUI[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onExport?: () => void;
  pageSize?: number;
}

/**
 * Get event type icon
 */
const getEventTypeIcon = (eventType: string): string => {
  const icons: Record<string, string> = {
    transaction: '💰',
    encryption: '🔒',
    access: '👁️',
    config_change: '⚙️',
    error: '❌',
    sync: '🔄',
    search: '🔍',
  };
  return icons[eventType] || '📋';
};

/**
 * Get status indicator
 */
const getStatusIcon = (status: string): string => {
  return status === 'success' ? '✅' : '❌';
};

/**
 * Get privacy level label
 */
const getPrivacyLabel = (level: number): string => {
  const labels: Record<number, string> = {
    0: 'PUBLIC',
    1: 'SEMI_PRIVATE',
    2: 'FULL_PRIVATE',
  };
  return labels[level] || 'UNKNOWN';
};

/**
 * Audit Log Viewer Component
 */
const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  events = [],
  isLoading = false,
  onSearch,
  onExport,
  pageSize = 50,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(event.details).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !filterType || event.eventType === filterType;
      const matchesStatus = !filterStatus || event.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, searchQuery, filterType, filterStatus]);

  const paginatedEvents = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
    onSearch?.(query);
  };

  const handleExport = () => {
    const csv = convertToCSV(filteredEvents);
    downloadCSV(csv, 'audit-log.csv');
    onExport?.();
  };

  const convertToCSV = (data: AuditEventUI[]): string => {
    const headers = ['Timestamp', 'Type', 'Action', 'User', 'Status', 'Privacy Level'];
    const rows = data.map((e) => [
      new Date(e.timestamp).toISOString(),
      e.eventType,
      e.action,
      e.userId,
      e.status,
      getPrivacyLabel(e.privacyLevel),
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="audit-log-viewer">
      {/* Header */}
      <div className="audit-log-header">
        <h2 className="audit-log-title">Audit Log Viewer</h2>
        <div className="audit-log-actions">
          <button className="audit-log-export-btn" onClick={handleExport} title="Export to CSV">
            📥 Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-log-filters">
        <input
          type="text"
          className="audit-log-search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <select
          className="audit-log-filter"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(0);
          }}
        >
          <option value="">All Types</option>
          <option value="transaction">Transaction</option>
          <option value="encryption">Encryption</option>
          <option value="access">Access</option>
          <option value="config_change">Config Change</option>
          <option value="error">Error</option>
          <option value="sync">Sync</option>
          <option value="search">Search</option>
        </select>

        <select
          className="audit-log-filter"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(0);
          }}
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>

        <span className="audit-log-count">
          {filteredEvents.length} events found
        </span>
      </div>

      {/* Events List */}
      <div className="audit-log-list">
        {isLoading ? (
          <div className="audit-log-loading">Loading events...</div>
        ) : paginatedEvents.length > 0 ? (
          <div className="audit-log-table">
            <div className="audit-log-table-header">
              <div className="audit-log-col-time">Timestamp</div>
              <div className="audit-log-col-type">Type</div>
              <div className="audit-log-col-action">Action</div>
              <div className="audit-log-col-user">User</div>
              <div className="audit-log-col-status">Status</div>
              <div className="audit-log-col-privacy">Privacy</div>
            </div>

            {paginatedEvents.map((event) => (
              <div key={event.id} className="audit-log-table-row">
                <div className="audit-log-col-time">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                <div className="audit-log-col-type">
                  <span className="audit-log-type-icon">{getEventTypeIcon(event.eventType)}</span>
                  {event.eventType}
                </div>
                <div className="audit-log-col-action">{event.action}</div>
                <div className="audit-log-col-user">{event.userId.substring(0, 12)}...</div>
                <div className="audit-log-col-status">
                  <span className="audit-log-status-icon">{getStatusIcon(event.status)}</span>
                  {event.status}
                </div>
                <div className="audit-log-col-privacy">
                  <span className={`privacy-badge privacy-${event.privacyLevel}`}>
                    {getPrivacyLabel(event.privacyLevel)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="audit-log-empty">No events found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="audit-log-pagination">
          <button
            className="audit-log-pagination-btn"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          <span className="audit-log-pagination-info">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            className="audit-log-pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
