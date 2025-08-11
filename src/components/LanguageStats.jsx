import React from 'react';
import { getLanguageStatsUrl } from '../utils/api';
import '../styles/LanguageStats.css';

const LanguageStats = ({ username, repoLanguages }) => {
  const calculateLanguageStats = () => {
    const languageStats = {};
    let totalBytes = 0;

    repoLanguages?.forEach(({ repo, languages }) => {
      Object.entries(languages).forEach(([lang, bytes]) => {
        languageStats[lang] = (languageStats[lang] || 0) + bytes;
        totalBytes += bytes;
      });
    });

    return Object.entries(languageStats)
      .map(([lang, bytes]) => ({
        language: lang,
        bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(1)
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10);
  };

  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Scala: '#c22d40',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Shell: '#89e051',
    Vue: '#2c3e50',
    React: '#61dafb',
    Dart: '#0175C2',
    Lua: '#000080',
    R: '#198CE7',
    Perl: '#0298c3',
    Haskell: '#5e5086'
  };

  const stats = calculateLanguageStats();

  return (
    <div className="language-stats">
      <div className="stats-header">
        <h3>Programming Languages</h3>
        <div className="stats-badge">Top {stats.length}</div>
      </div>

      <div className="github-stats-card">
          <div className="card-header">
            <h4>GitHub Language Stats</h4>
          </div>
          <div className="stats-image-container">
            <img
              src={getLanguageStatsUrl(username)}
              alt={`${username}'s top languages`}
              className="stats-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="stats-fallback" style={{ display: 'none' }}>
              <div className="fallback-icon">📊</div>
              <p>Language stats unavailable</p>
            </div>
          </div>
        </div>
        
      <div className="stats-content">
        {/* GitHub Language Stats Card */}
        

        {/* Detailed Language Breakdown */}
        {stats.length > 0 && (
          <div className="language-breakdown">
            <div className="breakdown-header">
              <h4>Detailed Breakdown</h4>
              <div className="total-languages">{stats.length} languages</div>
            </div>
            
            <div className="languages-list">
              {stats.map(({ language, bytes, percentage }, index) => (
                <div key={language} className="language-item">
                  <div className="language-info">
                    <div className="language-header">
                      <div 
                        className="language-dot"
                        style={{ backgroundColor: languageColors[language] || '#8b5cf6' }}
                      />
                      <span className="language-name">{language}</span>
                      <span className="language-rank">#{index + 1}</span>
                    </div>
                    <div className="language-details">
                      <span className="language-percentage">{percentage}%</span>
                      <span className="language-bytes">{formatBytes(bytes)}</span>
                    </div>
                  </div>
                  
                  <div className="progress-container">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: languageColors[language] || '#8b5cf6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Language Insights */}
        {stats.length > 0 && (
          <div className="language-insights">
            <h4>Language Insights</h4>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">🏆</div>
                <div className="insight-content">
                  <div className="insight-label">Most Used</div>
                  <div className="insight-value">{stats[0]?.language || 'N/A'}</div>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <div className="insight-label">Diversity Score</div>
                  <div className="insight-value">{Math.min(stats.length * 10, 100)}%</div>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">💻</div>
                <div className="insight-content">
                  <div className="insight-label">Total Languages</div>
                  <div className="insight-value">{stats.length}</div>
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <div className="insight-label">Specialization</div>
                  <div className="insight-value">
                    {parseFloat(stats[0]?.percentage || 0) > 50 ? 'High' : 
                     parseFloat(stats[0]?.percentage || 0) > 30 ? 'Medium' : 'Low'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default LanguageStats;
