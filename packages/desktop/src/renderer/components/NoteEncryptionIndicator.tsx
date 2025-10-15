/**
 * NoteEncryptionIndicator - Encryption Status Badge
 * Displays encryption status and privacy level of a note
 */

import React from 'react';
import { PrivacyLevel } from '../privacy/manager';

interface NoteEncryptionIndicatorProps {
  privacyLevel: PrivacyLevel;
  isEncrypted: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  tooltip?: string;
}

/**
 * NoteEncryptionIndicator Component
 */
export const NoteEncryptionIndicator: React.FC<NoteEncryptionIndicatorProps> = ({
  privacyLevel,
  isEncrypted,
  showLabel = true,
  size = 'medium',
  onClick,
  tooltip,
}) => {
  /**
   * Get privacy level name
   */
  const getPrivacyLevelName = (): string => {
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        return 'Public';
      case PrivacyLevel.SEMI_PRIVATE:
        return 'Semi-Private';
      case PrivacyLevel.FULL_PRIVATE:
        return 'Full Private';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get privacy level icon
   */
  const getPrivacyLevelIcon = (): string => {
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        return '🌐';
      case PrivacyLevel.SEMI_PRIVATE:
        return '🔒';
      case PrivacyLevel.FULL_PRIVATE:
        return '🔐';
      default:
        return '❓';
    }
  };

  /**
   * Get privacy level color
   */
  const getPrivacyLevelColor = (): string => {
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        return '#EF4444'; // Red
      case PrivacyLevel.SEMI_PRIVATE:
        return '#F59E0B'; // Amber
      case PrivacyLevel.FULL_PRIVATE:
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  /**
   * Get encryption status icon
   */
  const getEncryptionIcon = (): string => {
    return isEncrypted ? '🔒' : '🔓';
  };

  /**
   * Get size styles
   */
  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'small':
        return { padding: '4px 8px', fontSize: '12px', gap: '4px' };
      case 'large':
        return { padding: '12px 16px', fontSize: '16px', gap: '12px' };
      case 'medium':
      default:
        return { padding: '8px 12px', fontSize: '14px', gap: '8px' };
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '6px',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    border: `2px solid ${getPrivacyLevelColor()}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...getSizeStyles(),
  };

  const progressStyle: React.CSSProperties = {
    width: '100%',
    height: '3px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '2px',
    marginTop: '4px',
    overflow: 'hidden',
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: getPrivacyLevelColor(),
    width: getProgressPercentage() + '%',
    transition: 'width 0.3s ease',
  };

  /**
   * Get progress percentage based on privacy level
   */
  function getProgressPercentage(): number {
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        return 0;
      case PrivacyLevel.SEMI_PRIVATE:
        return 50;
      case PrivacyLevel.FULL_PRIVATE:
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Get full tooltip text
   */
  const fullTooltip = tooltip || `${getPrivacyLevelName()} - ${getEncryptionIcon()}`;

  return (
    <div
      className="note-encryption-indicator"
      style={containerStyle}
      onClick={onClick}
      title={fullTooltip}
    >
      <span className="note-encryption-indicator-icon" style={{ fontSize: '18px' }}>
        {getPrivacyLevelIcon()}
      </span>

      {showLabel && (
        <div className="note-encryption-indicator-content">
          <span className="note-encryption-indicator-label">{getPrivacyLevelName()}</span>
          <span
            className={`note-encryption-indicator-status ${
              isEncrypted ? 'encrypted' : 'not-encrypted'
            }`}
            style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}
          >
            {isEncrypted ? 'Encrypted' : 'Not Encrypted'}
          </span>
          <div style={progressStyle}>
            <div style={progressFillStyle} />
          </div>
        </div>
      )}

      <span className="note-encryption-indicator-lock" style={{ fontSize: '16px' }}>
        {getEncryptionIcon()}
      </span>
    </div>
  );
};

export default NoteEncryptionIndicator;
