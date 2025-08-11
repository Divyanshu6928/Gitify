import React, { useState, useEffect } from 'react';
import { getStreakStatsUrl } from '../utils/api';
import { RefreshCw, TrendingUp, Calendar, Target, Award, Zap } from 'lucide-react';
import '../styles/StreakStats.css';

const StreakStats = ({ username, contributions }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    calculateDynamicStreaks();
  }, [contributions, username]);

  const calculateDynamicStreaks = () => {
    if (!contributions.contributions?.length) {
      setStreakData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const sortedContributions = [...contributions.contributions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const contributionMap = new Map();
      sortedContributions.forEach(day => {
        contributionMap.set(day.date, day.contributionCount);
      });

      // Calculate current streak
      let currentStreak = 0;
      let currentDate = new Date();
      
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const contributions = contributionMap.get(dateStr) || 0;
        
        if (contributions > 0) {
          currentStreak++;
        } else if (dateStr !== todayStr && dateStr !== yesterdayStr) {
          break;
        } else if (dateStr === yesterdayStr && contributions === 0) {
          const todayContributions = contributionMap.get(todayStr) || 0;
          if (todayContributions === 0) {
            break;
          }
        }
        
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        
        if (currentDate.getFullYear() < today.getFullYear() - 2) {
          break;
        }
      }

      // Calculate longest streak and other stats
      let longestStreak = 0;
      let tempStreak = 0;
      let totalActiveDays = 0;
      let totalContributions = 0;
      let bestDay = { date: '', count: 0 };
      let monthlyStats = {};

      sortedContributions.forEach(day => {
        const count = day.contributionCount;
        totalContributions += count;
        
        if (count > 0) {
          tempStreak++;
          totalActiveDays++;
          longestStreak = Math.max(longestStreak, tempStreak);
          
          if (count > bestDay.count) {
            bestDay = { date: day.date, count };
          }
        } else {
          tempStreak = 0;
        }

        // Monthly stats
        const date = new Date(day.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { name: monthName, count: 0, date: date };
        }
        monthlyStats[monthKey].count += count;
      });

      const bestMonth = Object.values(monthlyStats).reduce((best, month) => 
        month.count > best.count ? month : best, 
        { count: 0, name: 'No data', date: new Date() }
      );

      // Calculate yearly stats
      const currentYear = today.getFullYear();
      const thisYearContributions = sortedContributions.filter(day => 
        new Date(day.date).getFullYear() === currentYear
      );
      
      const thisYearTotal = thisYearContributions.reduce((sum, day) => 
        sum + day.contributionCount, 0
      );

      const daysThisYear = Math.min(
        Math.floor((today - new Date(currentYear, 0, 1)) / (1000 * 60 * 60 * 24)) + 1,
        thisYearContributions.length
      );
      
      const averagePerDay = daysThisYear > 0 ? thisYearTotal / daysThisYear : 0;

      // Calculate streak status
      const todayContributions = contributionMap.get(todayStr) || 0;
      const streakStatus = todayContributions > 0 ? 'active' : 
                          currentStreak > 0 ? 'maintained' : 'broken';

      // Calculate streak level
      const getStreakLevel = (streak) => {
        if (streak >= 365) return { level: 'Legendary', color: '#ff6b35', icon: '🏆' };
        if (streak >= 100) return { level: 'Master', color: '#ffa500', icon: '👑' };
        if (streak >= 30) return { level: 'Expert', color: '#00ffff', icon: '⭐' };
        if (streak >= 7) return { level: 'Active', color: '#00ff00', icon: '🔥' };
        return { level: 'Beginner', color: '#8a2be2', icon: '🌱' };
      };

      setStreakData({
        currentStreak,
        longestStreak,
        totalActiveDays,
        thisYearTotal,
        averagePerDay,
        bestMonth,
        bestDay,
        streakStatus,
        todayContributions,
        totalContributions,
        daysTracked: sortedContributions.length,
        streakLevel: getStreakLevel(currentStreak),
        longestStreakLevel: getStreakLevel(longestStreak)
      });

    } catch (error) {
      console.error('Error calculating streak data:', error);
      setStreakData(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshStreaks = async () => {
    setRefreshing(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      calculateDynamicStreaks();
    } catch (error) {
      console.error('Error refreshing streaks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStreakStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00ff00';
      case 'maintained': return '#ffa500';
      case 'broken': return '#ff6b6b';
      default: return '#8a2be2';
    }
  };

  const getStreakStatusText = (status) => {
    switch (status) {
      case 'active': return '🔥 On fire today!';
      case 'maintained': return '⏳ Keep the streak alive';
      case 'broken': return '💔 Start a new streak';
      default: return '📊 Calculating...';
    }
  };

  if (loading) {
    return (
      <div className="streak-stats">
        <div className="streak-header">
          <h3>Contribution Streaks</h3>
        </div>
        <div className="streak-loading">
          <div className="loading-flame">🔥</div>
          <p>Calculating streaks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="streak-stats">
      <div className="streak-header">
        <div className="header-left">
          <h3>Contribution Streaks</h3>
          {streakData && (
            <div 
              className="streak-status"
              style={{ color: getStreakStatusColor(streakData.streakStatus) }}
            >
              {getStreakStatusText(streakData.streakStatus)}
            </div>
          )}
        </div>
        <button
          onClick={refreshStreaks}
          disabled={refreshing}
          className="refresh-btn"
        >
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* GitHub Streak Stats Image */}
      <div className="github-streak-card">
        <div className="card-header">
          <h4>GitHub Streak Statistics</h4>
        </div>
        <div className="streak-image-container">
          <img
            src={getStreakStatsUrl(username)}
            alt={`${username}'s streak statistics`}
            className="streak-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="streak-fallback" style={{ display: 'none' }}>
            <div className="fallback-icon">🔥</div>
            <p>Streak stats unavailable</p>
          </div>
        </div>
      </div>

      {/* Dynamic Streak Analytics */}
      {streakData && (
        <div className="streak-analytics">
          <div className="analytics-header">
            <h4>Live Streak Analytics</h4>
            <div className="streak-level-badge" style={{ backgroundColor: streakData.streakLevel.color }}>
              {streakData.streakLevel.icon} {streakData.streakLevel.level}
            </div>
          </div>
          
          <div className="streak-grid">
            <div className="streak-card primary">
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <div className="card-number">{streakData.currentStreak}</div>
                <div className="card-label">Current Streak</div>
                <div className="card-sublabel">
                  {streakData.currentStreak === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div className="card-glow"></div>
            </div>

            <div className="streak-card secondary">
              <div className="card-icon">👑</div>
              <div className="card-content">
                <div className="card-number">{streakData.longestStreak}</div>
                <div className="card-label">Longest Streak</div>
                <div className="card-sublabel">personal best</div>
              </div>
              <div className="card-glow"></div>
            </div>

            <div className="streak-card tertiary">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <div className="card-number">{streakData.totalActiveDays}</div>
                <div className="card-label">Active Days</div>
                <div className="card-sublabel">out of {streakData.daysTracked}</div>
              </div>
              <div className="card-glow"></div>
            </div>

            <div className="streak-card quaternary">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-number">{streakData.thisYearTotal.toLocaleString()}</div>
                <div className="card-label">This Year</div>
                <div className="card-sublabel">{new Date().getFullYear()} contributions</div>
              </div>
              <div className="card-glow"></div>
            </div>

            <div className="streak-card quinary">
              <div className="card-icon">⚡</div>
              <div className="card-content">
                <div className="card-number">{streakData.averagePerDay.toFixed(1)}</div>
                <div className="card-label">Daily Average</div>
                <div className="card-sublabel">this year</div>
              </div>
              <div className="card-glow"></div>
            </div>

            <div className="streak-card senary">
              <div className="card-icon">🏆</div>
              <div className="card-content">
                <div className="card-number">{streakData.bestMonth.count.toLocaleString()}</div>
                <div className="card-label">Best Month</div>
                <div className="card-sublabel">{streakData.bestMonth.name.split(' ')[0]}</div>
              </div>
              <div className="card-glow"></div>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="today-progress">
            <div className="progress-header">
              <div className="progress-title">
                <Calendar size={20} />
                <h5>Today's Progress</h5>
              </div>
              <div className="progress-date">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div className="progress-content">
              <div className="today-contributions">
                <div className="contrib-number">{streakData.todayContributions}</div>
                <div className="contrib-label">
                  {streakData.todayContributions === 1 ? 'contribution' : 'contributions'} today
                </div>
              </div>
              <div className="streak-motivation">
                {streakData.streakStatus === 'active' && (
                  <div className="motivation-text">🔥 You're on fire! Keep it up!</div>
                )}
                {streakData.streakStatus === 'maintained' && (
                  <div className="motivation-text">⚡ One contribution away from extending your streak!</div>
                )}
                {streakData.streakStatus === 'broken' && (
                  <div className="motivation-text">🌱 Every day is a new beginning!</div>
                )}
              </div>
            </div>
          </div>

          {/* Best Day Achievement */}
          {streakData.bestDay.count > 0 && (
            <div className="achievement-card">
              <div className="achievement-icon">🏅</div>
              <div className="achievement-content">
                <h5>Personal Best Day</h5>
                <div className="achievement-details">
                  <div className="best-day-count">{streakData.bestDay.count}</div>
                  <div className="best-day-info">
                    <div>contributions on</div>
                    <div className="best-day-date">
                      {new Date(streakData.bestDay.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!streakData && !loading && (
        <div className="streak-error">
          <div className="error-icon">❌</div>
          <h4>No contribution data available</h4>
          <p>Unable to calculate streak statistics</p>
        </div>
      )}
    </div>
  );
};

export default StreakStats;
