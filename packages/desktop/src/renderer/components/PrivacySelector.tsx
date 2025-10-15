/**
 * PrivacySelector - Privacy Level Selector Component
 * Allows users to select privacy levels with visual feedback
 */

import React, { useMemo } from 'react';
import { PrivacyLevel } from '../../utils/usePrivacy';
import {
  getPrivacyLevelName,
  getPrivacyLevelIcon,
  getPrivacyLevelColor,
} from '../../utils/usePrivacy';
import '../styles/Privacy.css';

interface PrivacySelectorProps {
  selectedLevel: PrivacyLevel;
  availableLevels: PrivacyLevel[];
  onLevelChange: (level: PrivacyLevel) => void;
  showCosts?: boolean;
  costs?: Record<PrivacyLevel, { total: string; premium: string; time: number }>;
  disabled?: boolean;
  compact?: boolean;
}

const PrivacySelector: React.FC<PrivacySelectorProps> = ({
  selectedLevel,
  availableLevels,
  onLevelChange,
  showCosts = false,
  costs,
  disabled = false,
  compact = false,
}) => {
  /**
   * Format gas amount for display
   */
  const formatGas = (value: string): string => {
    try {
      const bigValue = BigInt(value);
      const gweiValue = Number(bigValue) / 1e9;
      return gweiValue < 1 ? '< 0.01' : gweiValue.toFixed(2);
    } catch {
      return '0';
    }
  };

  /**
   * Format time for display
   */
  const formatTime = (ms: number): string => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  const levelConfig = useMemo(
    () =>
      availableLevels.map((level) => ({
        level,
        name: getPrivacyLevelName(level),
        icon: getPrivacyLevelIcon(level),
        color: getPrivacyLevelColor(level),
        cost: costs?.[level],
      })),
    [availableLevels, costs]
  );

  if (compact) {
    return (
      <div className="privacy-selector-compact">
        <select
          className="privacy-select"
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value as PrivacyLevel)}
          disabled={disabled}
        >
          {levelConfig.map((config) => (
            <option key={config.level} value={config.level}>
              {config.icon} {config.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="privacy-selector">
      <div className="selector-header">
        <h3>Privacy Level</h3>
        <p className="selector-description">
          Choose how much privacy you want for this transaction
        </p>
      </div>

      <div className="selector-options">
        {levelConfig.map((config) => {
          const isSelected = config.level === selectedLevel;
          const cost = config.cost;

          return (
            <button
              key={config.level}
              className={`privacy-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onLevelChange(config.level)}
              disabled={disabled}
              style={{
                borderColor: isSelected ? config.color : undefined,
                backgroundColor: isSelected
                  ? `${config.color}15`
                  : undefined,
              }}
            >
              {/* Icon */}
              <div className="option-icon" style={{ fontSize: '28px' }}>
                {config.icon}
              </div>

              {/* Info */}
              <div className="option-info">
                <h4>{config.name}</h4>

                {/* Cost info */}
                {showCosts && cost && (
                  <div className="option-costs">
                    <span className="cost-item">
                      <span className="label">Gas:</span>
                      <span className="value">{formatGas(cost.total)} Gwei</span>
                    </span>

                    {cost.premium !== '0' && (
                      <span className="cost-item">
                        <span className="label">Premium:</span>
                        <span className="value">
                          {formatGas(cost.premium)} Gwei
                        </span>
                      </span>
                    )}

                    <span className="cost-item">
                      <span className="label">Time:</span>
                      <span className="value">{formatTime(cost.time)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="option-check">✓</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PrivacySelector;
