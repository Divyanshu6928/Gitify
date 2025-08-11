import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Crown, Star, GitFork, Eye, Calendar, Users, Award } from 'lucide-react';
import '../styles/ComparisonView.css';

const ComparisonView = ({ user1Data, user2Data }) => {
  const [activeComparison, setActiveComparison] = useState('overview');

  const user1 = user1Data.user;
  const user2 = user2Data.user;

  const calculatePercentageDifference = (val1, val2) => {
    if (val2 === 0) return val1 > 0 ? 100 : 0;
    return ((val1 - val2) / val2) * 100;
  };

  const getComparisonIcon = (diff) => {
    if (diff > 0) return <TrendingUp size={16} className="trend-up" />;
    if (diff < 0) return <TrendingDown size={16} className="trend-down" />;
    return <Minus size={16} className="trend-equal" />;
  };

  const formatDifference = (diff) => {
    if (diff === 0) return '0%';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  };

  const getWinner = (val1, val2) => {
    if (val1 > val2) return 'user1';
    if (val2 > val1) return 'user2';
    return 'tie';
  };

  const comparisonData = {
    followers: {
      user1: user1.followers,
      user2: user2.followers,
      label: 'Followers'
    },
    following: {
      user1: user1.following,
      user2: user2.following,
      label: 'Following'
    },
    repos: {
      user1: user1.public_repos,
      user2: user2.public_repos,
      label: 'Public Repos'
    },
    gists: {
      user1: user1.public_gists || 0,
      user2: user2.public_gists || 0,
      label: 'Public Gists'
    },
    totalStars: {
      user1: user1Data.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      user2: user2Data.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      label: 'Total Stars'
    },
    totalForks: {
      user1: user1Data.repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      user2: user2Data.repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      label: 'Total Forks'
    },
    contributions: {
      user1: user1Data.contributions.total[new Date().getFullYear()] || 0,
      user2: user2Data.contributions.total[new Date().getFullYear()] || 0,
      label: 'This Year Contributions'
    }
  };

  const calculateOverallWinner = () => {
    let user1Wins = 0;
    let user2Wins = 0;
    
    Object.values(comparisonData).forEach(data => {
      const winner = getWinner(data.user1, data.user2);
      if (winner === 'user1') user1Wins++;
      else if (winner === 'user2') user2Wins++;
    });

    if (user1Wins > user2Wins) return 'user1';
    if (user2Wins > user1Wins) return 'user2';
    return 'tie';
  };

  const overallWinner = calculateOverallWinner();

  const comparisonTabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'repos', label: 'Repositories', icon: Star },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
    { id: 'languages', label: 'Languages', icon: Award }
  ];

  const renderProfileComparison = (userData, position) => (
    <div className={`profile-column ${position} ${overallWinner === position ? 'winner' : ''}`}>
      <div className="profile-header">
        <div className="avatar-container">
          <img
            src={userData.user.avatar_url}
            alt={`${userData.user.login}'s avatar`}
            className="profile-avatar"
          />
          {overallWinner === position && (
            <div className="winner-crown">
              <Crown size={24} />
            </div>
          )}
        </div>
        <div className="profile-info">
          <h3 className="profile-name">{userData.user.name || userData.user.login}</h3>
          <a
            href={userData.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-username"
          >
            @{userData.user.login}
          </a>
          {userData.user.bio && (
            <p className="profile-bio">{userData.user.bio}</p>
          )}
          <div className="profile-meta">
            <div className="meta-item">
              <Calendar size={14} />
              Joined {new Date(userData.user.created_at).getFullYear()}
            </div>
            {userData.user.location && (
              <div className="meta-item">
                📍 {userData.user.location}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComparisonStats = () => (
    <div className="comparison-stats">
      {Object.entries(comparisonData).map(([key, data]) => {
        const diff = calculatePercentageDifference(data.user1, data.user2);
        const winner = getWinner(data.user1, data.user2);
        
        return (
          <div key={key} className="stat-comparison">
            <div className="stat-label">{data.label}</div>
            <div className="stat-values">
              <div className={`stat-value ${winner === 'user1' ? 'winner' : ''}`}>
                {data.user1.toLocaleString()}
                {winner === 'user1' && <Crown size={12} className="winner-icon" />}
              </div>
              <div className="stat-difference">
                {getComparisonIcon(diff)}
                <span>{formatDifference(Math.abs(diff))}</span>
              </div>
              <div className={`stat-value ${winner === 'user2' ? 'winner' : ''}`}>
                {data.user2.toLocaleString()}
                {winner === 'user2' && <Crown size={12} className="winner-icon" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderRepositoryComparison = () => (
    <div className="repo-comparison">
      <div className="repo-grid">
        <div className="repo-column">
          <h4>Top Repositories - {user1.login}</h4>
          <div className="repo-list">
            {user1Data.repos.slice(0, 5).map(repo => (
              <div key={repo.id} className="repo-item">
                <div className="repo-header">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name">
                    {repo.name}
                  </a>
                  <div className="repo-stats">
                    <span><Star size={12} /> {repo.stargazers_count}</span>
                    <span><GitFork size={12} /> {repo.forks_count}</span>
                  </div>
                </div>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
                <div className="repo-footer">
                  {repo.language && (
                    <span className="repo-language">
                      <span className="language-dot"></span>
                      {repo.language}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="repo-column">
          <h4>Top Repositories - {user2.login}</h4>
          <div className="repo-list">
            {user2Data.repos.slice(0, 5).map(repo => (
              <div key={repo.id} className="repo-item">
                <div className="repo-header">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name">
                    {repo.name}
                  </a>
                  <div className="repo-stats">
                    <span><Star size={12} /> {repo.stargazers_count}</span>
                    <span><GitFork size={12} /> {repo.forks_count}</span>
                  </div>
                </div>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
                <div className="repo-footer">
                  {repo.language && (
                    <span className="repo-language">
                      <span className="language-dot"></span>
                      {repo.language}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h2>Profile Comparison</h2>
        <div className="vs-indicator">
          <span className="vs-text">VS</span>
        </div>
      </div>

      <div className="comparison-profiles">
        {renderProfileComparison(user1Data, 'user1')}
        <div className="comparison-divider">
          <div className="divider-line"></div>
          <div className="vs-circle">VS</div>
          <div className="divider-line"></div>
        </div>
        {renderProfileComparison(user2Data, 'user2')}
      </div>

      {overallWinner !== 'tie' && (
        <div className="overall-winner">
          <div className="winner-announcement">
            <Crown size={24} />
            <span>
              {overallWinner === 'user1' ? user1.login : user2.login} wins overall!
            </span>
            <Crown size={24} />
          </div>
        </div>
      )}

      <div className="comparison-tabs">
        {comparisonTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveComparison(tab.id)}
              className={`tab-button ${activeComparison === tab.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="comparison-content">
        {activeComparison === 'overview' && renderComparisonStats()}
        {activeComparison === 'repos' && renderRepositoryComparison()}
        {activeComparison === 'activity' && (
          <div className="activity-comparison">
            <div className="activity-grid">
              <div className="activity-column">
                <h4>Activity - {user1.login}</h4>
                <div className="activity-summary">
                  <div className="activity-stat">
                    <span className="stat-number">{user1Data.events?.length || 0}</span>
                    <span className="stat-label">Recent Events</span>
                  </div>
                  <div className="activity-stat">
                    <span className="stat-number">{comparisonData.contributions.user1}</span>
                    <span className="stat-label">Contributions</span>
                  </div>
                </div>
              </div>
              <div className="activity-column">
                <h4>Activity - {user2.login}</h4>
                <div className="activity-summary">
                  <div className="activity-stat">
                    <span className="stat-number">{user2Data.events?.length || 0}</span>
                    <span className="stat-label">Recent Events</span>
                  </div>
                  <div className="activity-stat">
                    <span className="stat-number">{comparisonData.contributions.user2}</span>
                    <span className="stat-label">Contributions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeComparison === 'languages' && (
          <div className="language-comparison">
            <div className="language-grid">
              <div className="language-column">
                <h4>Languages - {user1.login}</h4>
                <div className="language-list">
                  {user1Data.repoLanguages?.slice(0, 5).map((item, index) => (
                    <div key={index} className="language-item">
                      <span className="language-name">{item.repo}</span>
                      <div className="language-stats">
                        {Object.keys(item.languages).slice(0, 3).map(lang => (
                          <span key={lang} className="language-tag">{lang}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="language-column">
                <h4>Languages - {user2.login}</h4>
                <div className="language-list">
                  {user2Data.repoLanguages?.slice(0, 5).map((item, index) => (
                    <div key={index} className="language-item">
                      <span className="language-name">{item.repo}</span>
                      <div className="language-stats">
                        {Object.keys(item.languages).slice(0, 3).map(lang => (
                          <span key={lang} className="language-tag">{lang}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
