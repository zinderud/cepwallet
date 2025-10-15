/**
 * PrivacyIndicator - Privacy Status Badge Component
 * Displays current privacy level with visual indicators
 */

import React from 'react';
import { PrivacyLevel } from '../utils/usePrivacy';
import './Privacy.css';

interface PrivacyIndicatorProps {
  level: PrivacyLevel;
  showLabel?: boolean;
  showIcon?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Get privacy level display name
 */
function getPrivacyLevelName(level: PrivacyLevel): string {
  switch (level) {
    case 'public':
      return 'Public';
    case 'semi-private':
      return 'Semi-Private';
    case 'full-private':
      return 'Full Private';
  }
}

/**
 * Get privacy level icon
 */
function getPrivacyLevelIcon(level: PrivacyLevel): string {
  switch (level) {
    case 'public':
      return '🌐';
    case 'semi-private':
      return '🔒';
    case 'full-private':
      return '🔐';
  }
}

/**
 * Get privacy level color
 */
function getPrivacyLevelColor(level: PrivacyLevel): string {
  switch (level) {
    case 'public':
      return '#ef4444'; // Red
    case 'semi-private':
      return '#f59e0b'; // Amber
    case 'full-private':
      return '#10b981'; // Green
  }
}

const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({
  level,
  showLabel = true,
  showIcon = true,
  interactive = false,
  onClick,
  tooltip,
  size = 'medium',
}) => {
  const name = getPrivacyLevelName(level);
  const icon = getPrivacyLevelIcon(level);
  const color = getPrivacyLevelColor(level);

  const sizeClass = `indicator-${size}`;
  const interactiveClass = interactive ? 'interactive' : '';

  return (
    <div
      className={`privacy-indicator ${sizeClass} ${interactiveClass}`}
      style={{
        borderColor: color,
        backgroundColor: `${color}15`,
        cursor: interactive ? 'pointer' : 'default',
      }}
      onClick={onClick}
      title={tooltip || `Privacy Level: ${name}`}
    >
      {/* Icon */}
      {showIcon && <span className="indicator-icon">{icon}</span>}

      {/* Label */}
      {showLabel && <span className="indicator-label">{name}</span>}

      {/* Privacy bar */}
      <div className="privacy-bar">
        <div
          className="privacy-fill"
          style={{
            width: level === 'public' ? '33%' : level === 'semi-private' ? '66%' : '100%',
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

export default PrivacyIndicator;
