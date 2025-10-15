/**
 * Analytics Chart Component
 * Time-series data visualization for transaction analytics
 */

import React, { useMemo } from 'react';

interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface AnalyticsChartProps {
  data?: DataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  type?: 'line' | 'bar' | 'area';
  showLegend?: boolean;
  showTooltip?: boolean;
  color?: string;
  valueFormatter?: (value: number) => string;
}

/**
 * Simple SVG-based chart component
 */
const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data = [],
  title = 'Analytics Chart',
  xAxisLabel = 'Time',
  yAxisLabel = 'Value',
  height = 300,
  type = 'line',
  showLegend = true,
  showTooltip = true,
  color = '#2196F3',
  valueFormatter = (v) => v.toFixed(2),
}) => {
  const { min, max, range, points, scaleX, scaleY } = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 100, range: 100, points: [], scaleX: 1, scaleY: 1 };
    }

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 600;
    const chartHeight = height - 80;
    const scaleX = width / (data.length - 1 || 1);
    const scaleY = chartHeight / range;

    const points = data.map((d, i) => ({
      x: i * scaleX + 50,
      y: chartHeight - (d.value - min) * scaleY + 40,
      value: d.value,
      timestamp: d.timestamp,
      label: d.label,
    }));

    return { min, max, range, points, scaleX, scaleY };
  }, [data, height]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return (
      'M ' +
      points.map((p) => `${p.x},${p.y}`).join(' L ')
    );
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const bottom = height - 40;
    return (
      'M ' +
      points[0].x +
      ',' +
      points[0].y +
      ' L ' +
      points.map((p) => `${p.x},${p.y}`).join(' L ') +
      ` L ${points[points.length - 1].x},${bottom} L ${points[0].x},${bottom} Z`
    );
  }, [points, height]);

  const avgValue = data.length > 0 ? data.reduce((sum, d) => sum + d.value, 0) / data.length : 0;

  return (
    <div className="analytics-chart">
      {/* Header */}
      <div className="analytics-chart-header">
        <h3 className="analytics-chart-title">{title}</h3>
        <div className="analytics-chart-stats">
          <span className="chart-stat">
            <strong>Min:</strong> {valueFormatter(min)}
          </span>
          <span className="chart-stat">
            <strong>Max:</strong> {valueFormatter(max)}
          </span>
          <span className="chart-stat">
            <strong>Avg:</strong> {valueFormatter(avgValue)}
          </span>
          <span className="chart-stat">
            <strong>Points:</strong> {data.length}
          </span>
        </div>
      </div>

      {/* Chart */}
      <svg
        className="analytics-chart-svg"
        width="100%"
        height={height}
        viewBox={`0 0 650 ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect x="50" y="40" width="600" height={height - 80} fill="url(#grid)" />

        {/* Y Axis */}
        <line x1="50" y1="40" x2="50" y2={height - 40} stroke="#333" strokeWidth="2" />

        {/* X Axis */}
        <line x1="50" y1={height - 40} x2="650" y2={height - 40} stroke="#333" strokeWidth="2" />

        {/* Y Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = (height - 80) * (1 - ratio) + 40;
          const value = min + range * ratio;
          return (
            <g key={`y-${i}`}>
              <line x1="45" y1={y} x2="50" y2={y} stroke="#333" strokeWidth="1" />
              <text
                x="40"
                y={y + 3}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {valueFormatter(value)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.length > 0 &&
          [0, Math.floor(points.length / 2), points.length - 1]
            .filter((i) => i >= 0 && i < points.length)
            .map((i) => {
              const point = points[i];
              const date = new Date(data[i].timestamp);
              const label = data[i].label || date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <g key={`x-${i}`}>
                  <line x1={point.x} y1={height - 40} x2={point.x} y2={height - 35} stroke="#333" strokeWidth="1" />
                  <text
                    x={point.x}
                    y={height - 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

        {/* Axis Labels */}
        <text
          x={25}
          y={height / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
          transform={`rotate(-90 25 ${height / 2})`}
        >
          {yAxisLabel}
        </text>

        <text
          x={350}
          y={height - 5}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
        >
          {xAxisLabel}
        </text>

        {/* Chart Area/Line */}
        {type === 'area' && (
          <path d={areaD} fill={color} fillOpacity="0.2" />
        )}

        {type === 'line' && points.length > 0 && (
          <path d={pathD} stroke={color} strokeWidth="2" fill="none" />
        )}

        {type === 'bar' && points.length > 0 && (
          <g>
            {points.map((p, i) => (
              <rect
                key={`bar-${i}`}
                x={p.x - 15}
                y={p.y}
                width="30"
                height={height - 40 - p.y}
                fill={color}
                fillOpacity="0.7"
              />
            ))}
          </g>
        )}

        {/* Data Points */}
        {points.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={color}
            opacity="0.8"
            className="chart-data-point"
          >
            {showTooltip && (
              <title>
                {p.label || new Date(p.timestamp).toLocaleString()}: {valueFormatter(p.value)}
              </title>
            )}
          </circle>
        ))}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="analytics-chart-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ backgroundColor: color }}></span>
            {title}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
