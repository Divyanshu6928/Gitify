import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Settings, Calendar, BarChart3 } from 'lucide-react';
import '../styles/ContributionsHeatmap.css';

const ContributionsHeatmap = ({ 
  contributions, 
  username, 
  config = {},
  onDateSelect,
  onStatsChange 
}) => {
  // Core state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [localContributions, setLocalContributions] = useState(contributions);
  
  // Dynamic configuration state
  const [selectedYear, setSelectedYear] = useState(config.initialYear || new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [dateRange, setDateRange] = useState(config.defaultRange || 'year');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  
  // UI customization state
  const [theme, setTheme] = useState(config.theme || 'github');
  const [layout, setLayout] = useState(config.layout || 'horizontal');
  const [cellSize, setCellSize] = useState(config.cellSize || 12);
  const [showNumbers, setShowNumbers] = useState(config.showNumbers || false);
  const [zoomLevel, setZoomLevel] = useState('year');
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(config.autoRefresh || false);
  const [refreshInterval, setRefreshInterval] = useState(config.refreshInterval || 300000);
  
  // Statistics configuration
  const [visibleStats, setVisibleStats] = useState(
    config.visibleStats || ['total', 'current_streak', 'longest_streak', 'avg_daily', 'best_day']
  );
  
  // Filtering state
  const [filters, setFilters] = useState({
    minContributions: 0,
    maxContributions: Infinity,
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    repositories: 'all'
  });
  
  // Interactive state
  const [selectedDate, setSelectedDate] = useState(null);
  const [showControls, setShowControls] = useState(false);
  
  // Contribution level configuration
  const [contributionLevels, setContributionLevels] = useState([
    { min: 0, max: 0, color: '#ebedf0', label: 'No contributions' },
    { min: 1, max: 3, color: '#9be9a8', label: 'Low activity' },
    { min: 4, max: 6, color: '#40c463', label: 'Medium activity' },
    { min: 7, max: 10, color: '#30a14e', label: 'High activity' },
    { min: 11, max: Infinity, color: '#216e39', label: 'Very high activity' }
  ]);

  // Initialize available years
  useEffect(() => {
    const years = [...new Set(
      localContributions.contributions?.map(day => new Date(day.date).getFullYear()) || []
    )].sort((a, b) => b - a);
    setAvailableYears(years);
  }, [localContributions]);

  // Update local contributions when props change
  useEffect(() => {
    setLocalContributions(contributions);
    setLastUpdated(new Date());
  }, [contributions]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !username) return;

    const interval = setInterval(async () => {
      try {
        const { fetchContributions } = await import('../utils/api');
        const freshData = await fetchContributions(username);
        setLocalContributions(freshData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, username]);

  // Apply dynamic CSS variables
  useEffect(() => {
    contributionLevels.forEach((level, index) => {
      document.documentElement.style.setProperty(
        `--contrib-level-${index}`, 
        level.color
      );
    });
    
    document.documentElement.style.setProperty('--dynamic-cell-size', `${cellSize}px`);
  }, [contributionLevels, cellSize]);

  // Get dynamic date range
  const getDateRange = useCallback(() => {
    const now = new Date();
    
    switch (dateRange) {
      case 'last365':
        return {
          start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          end: now
        };
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now
        };
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return {
          start: new Date(now.getFullYear(), quarter * 3, 1),
          end: now
        };
      case 'custom':
        return {
          start: customStartDate || new Date(selectedYear, 0, 1),
          end: customEndDate || now
        };
      default: // 'year'
        return {
          start: new Date(selectedYear, 0, 1),
          end: new Date(selectedYear, 11, 31)
        };
    }
  }, [dateRange, selectedYear, customStartDate, customEndDate]);

  // Apply filters to contributions
  const applyFilters = useCallback((contributions) => {
    return contributions.filter(day => {
      const date = new Date(day.date);
      const weekday = date.getDay();
      
      return day.contributionCount >= filters.minContributions &&
             day.contributionCount <= filters.maxContributions &&
             filters.weekdays.includes(weekday);
    });
  }, [filters]);

  // Get filtered contributions for current range
  const rangeContributions = useMemo(() => {
    const { start, end } = getDateRange();
    const filtered = localContributions.contributions?.filter(day => {
      const date = new Date(day.date);
      return date >= start && date <= end;
    }) || [];
    
    return applyFilters(filtered);
  }, [localContributions, getDateRange, applyFilters]);

  // Get contribution level
  const getContributionLevel = useCallback((count) => {
    return contributionLevels.findIndex(level => 
      count >= level.min && count <= level.max
    );
  }, [contributionLevels]);

  // Calculate live streaks
  const calculateLiveStreaks = useCallback(() => {
    if (!rangeContributions.length) return { current: 0, longest: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedContributions = [...rangeContributions].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    for (let i = 0; i < sortedContributions.length; i++) {
      const contribDate = new Date(sortedContributions[i].date);
      contribDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (contribDate.getTime() === expectedDate.getTime()) {
        if (sortedContributions[i].contributionCount > 0) {
          currentStreak++;
        } else if (i === 0) {
          continue;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Calculate longest streak
    const allContributions = [...sortedContributions].reverse();
    for (const day of allContributions) {
      if (day.contributionCount > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  }, [rangeContributions]);

  // Calculate dynamic statistics
  const calculateDynamicStats = useCallback(() => {
    const total = rangeContributions.reduce((sum, day) => sum + (day.contributionCount || 0), 0);
    const streaks = calculateLiveStreaks();
    const activeDays = rangeContributions.filter(day => day.contributionCount > 0).length;
    const bestDay = rangeContributions.length > 0 ? Math.max(...rangeContributions.map(day => day.contributionCount || 0)) : 0;
    
    return {
      total,
      current_streak: streaks.current,
      longest_streak: streaks.longest,
      avg_daily: rangeContributions.length > 0 ? (total / rangeContributions.length).toFixed(1) : 0,
      best_day: bestDay,
      active_days: activeDays,
      week_avg: rangeContributions.length > 0 ? (total / (rangeContributions.length / 7)).toFixed(1) : 0
    };
  }, [rangeContributions, calculateLiveStreaks]);

  // Generate heatmap data
  const generateHeatmapData = useCallback(() => {
    const { start, end } = getDateRange();
    const weeks = [];
    const contributionMap = new Map();

    rangeContributions.forEach(day => {
      contributionMap.set(day.date, day.contributionCount);
    });

    const firstDay = new Date(start);
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());

    let currentDate = new Date(startOfWeek);
    
    while (currentDate <= end) {
      const week = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = contributionMap.get(dateStr) || 0;
        
        week.push({
          date: dateStr,
          count,
          level: getContributionLevel(count),
          isToday: dateStr === new Date().toISOString().split('T')[0]
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  }, [getDateRange, rangeContributions, getContributionLevel]);

  // Manual refresh function
  const refreshContributions = async () => {
    if (!username) return;
    
    setIsRefreshing(true);
    try {
      const { fetchContributions } = await import('../utils/api');
      const freshData = await fetchContributions(username);
      setLocalContributions(freshData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh contributions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle day click
  const handleDayClick = useCallback((day) => {
    setSelectedDate(day);
    if (onDateSelect) {
      onDateSelect(day);
    }
  }, [onDateSelect]);

  // Handle double click for zoom
  const handleDoubleClick = useCallback((day) => {
    if (zoomLevel === 'year') {
      setZoomLevel('month');
      const clickedDate = new Date(day.date);
      setSelectedYear(clickedDate.getFullYear());
      setDateRange('month');
    }
  }, [zoomLevel]);

  // Get heatmap CSS classes
  const getHeatmapClasses = () => {
    return `contributions-heatmap theme-${theme} layout-${layout} ${showNumbers ? 'show-numbers' : ''}`;
  };

  // Memoized calculations
  const stats = useMemo(() => calculateDynamicStats(), [calculateDynamicStats]);
  const heatmapData = useMemo(() => generateHeatmapData(), [generateHeatmapData]);
  
  // Notify parent of stats changes
  useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [stats, onStatsChange]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const statLabels = {
    total: 'Total contributions',
    current_streak: 'Current streak',
    longest_streak: 'Longest streak',
    avg_daily: 'Daily average',
    best_day: 'Best day',
    active_days: 'Active days',
    week_avg: 'Weekly average'
  };

  return (
    <div className={getHeatmapClasses()}>
      {/* Dynamic Header with Controls */}
      <div className="heatmap-header">
        <div className="header-left">
          <h3>
            {dateRange === 'year' ? `${selectedYear} Contributions` : 'Contributions'}
          </h3>
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            {autoRefresh ? 'Live Data' : 'Static Data'}
          </div>
        </div>
        
        <div className="header-controls">
          <button
            onClick={() => setShowControls(!showControls)}
            className="control-btn"
            title="Toggle Controls"
          >
            <Settings size={16} />
          </button>
          
          <button
            onClick={refreshContributions}
            disabled={isRefreshing}
            className="refresh-btn"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Collapsible Controls Panel */}
      {showControls && (
        <div className="controls-panel">
          <div className="control-group">
            <label>Time Period:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="control-select"
            >
              <option value="year">This Year</option>
              <option value="last365">Last 365 Days</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'year' && (
            <div className="control-group">
              <label>Year:</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="control-select"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <div className="control-group">
            <label>Theme:</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="control-select"
            >
              <option value="github">GitHub</option>
              <option value="dark">Dark</option>
              <option value="colorful">Colorful</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div className="control-group">
            <label>Auto Refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`toggle-btn ${autoRefresh ? 'active' : ''}`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="control-group">
            <label>Cell Size:</label>
            <input
              type="range"
              min="8"
              max="20"
              value={cellSize}
              onChange={(e) => setCellSize(parseInt(e.target.value))}
              className="control-slider"
            />
            <span>{cellSize}px</span>
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={showNumbers}
                onChange={(e) => setShowNumbers(e.target.checked)}
              />
              Show Numbers
            </label>
          </div>
        </div>
      )}
      
      {/* Dynamic Stats Grid */}
      <div className="stats-summary">
        {Object.entries(stats)
          .filter(([key]) => visibleStats.includes(key))
          .map(([key, value]) => (
            <div key={key} className={`stat-item stat-${key.replace('_', '-')}`}>
              <div className="stat-number">
                {typeof value === 'number' && value > 999 
                  ? value.toLocaleString() 
                  : value}
              </div>
              <div className="stat-label">{statLabels[key] || key.replace('_', ' ')}</div>
            </div>
          ))}
      </div>

      {/* Heatmap Container */}
      <div className="heatmap-container">
        <div className="heatmap-wrapper">
          <div className="month-labels">
            <div className="spacer"></div>
            {months.map((month, index) => (
              <div key={month} className="month-label">
                {month}
              </div>
            ))}
          </div>

          <div className="heatmap-grid">
            <div className="weekday-labels">
              <div></div>
              <div>Mon</div>
              <div></div>
              <div>Wed</div>
              <div></div>
              <div>Fri</div>
              <div></div>
            </div>

            <div className="contribution-grid">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="week-column">
                  {week.map((day, dayIndex) => (
                    <div
                      key={day.date}
                      className={`contribution-day level-${day.level} ${
                        day.isToday ? 'today' : ''
                      } ${selectedDate?.date === day.date ? 'selected' : ''}`}
                      title={`${day.count} contributions on ${day.date}${
                        day.isToday ? ' (Today)' : ''
                      }`}
                      onClick={() => handleDayClick(day)}
                      onDoubleClick={() => handleDoubleClick(day)}
                      style={{
                        '--cell-size': `${cellSize}px`
                      }}
                    >
                      {showNumbers && day.count > 0 && (
                        <span className="contribution-count">{day.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="heatmap-legend">
            <div className="legend-left">
              <span>Less</span>
              <div className="legend-squares">
                {contributionLevels.map((level, index) => (
                  <div
                    key={index}
                    className={`legend-square level-${index}`}
                    title={level.label}
                    style={{ backgroundColor: level.color }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
            <div className="legend-right">
              <div className="update-info">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {autoRefresh && (
                  <span className="auto-refresh-indicator">
                    • Auto-refresh: {refreshInterval / 1000}s
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="selected-date-info">
          <h4>Selected Date: {selectedDate.date}</h4>
          <p>Contributions: {selectedDate.count}</p>
          <p>Level: {contributionLevels[selectedDate.level]?.label}</p>
        </div>
      )}
    </div>
  );
};

export default ContributionsHeatmap;
