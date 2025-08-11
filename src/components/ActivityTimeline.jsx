import React, { useState } from 'react';
import { GitCommit, GitPullRequest, Star, GitFork, Eye, MessageCircle, Plus, Trash2, Calendar, Users } from 'lucide-react';
import '../styles/ActivityTimeline.css';

const ActivityTimeline = ({ events, starred }) => {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [filter, setFilter] = useState('all');

  const getEventIcon = (type) => {
    const iconProps = { size: 18 };
    switch (type) {
      case 'PushEvent':
        return <GitCommit {...iconProps} className="icon-green" />;
      case 'PullRequestEvent':
        return <GitPullRequest {...iconProps} className="icon-blue" />;
      case 'IssuesEvent':
        return <MessageCircle {...iconProps} className="icon-orange" />;
      case 'CreateEvent':
        return <Plus {...iconProps} className="icon-purple" />;
      case 'DeleteEvent':
        return <Trash2 {...iconProps} className="icon-red" />;
      case 'ForkEvent':
        return <GitFork {...iconProps} className="icon-yellow" />;
      case 'WatchEvent':
        return <Eye {...iconProps} className="icon-pink" />;
      default:
        return <GitCommit {...iconProps} className="icon-gray" />;
    }
  };

  const getEventDescription = (event) => {
    const repo = event.repo.name;
    
    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.commits?.length || 0;
        return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${repo}`;
      case 'PullRequestEvent':
        const action = event.payload.action;
        return `${action.charAt(0).toUpperCase() + action.slice(1)} pull request in ${repo}`;
      case 'IssuesEvent':
        return `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} issue in ${repo}`;
      case 'CreateEvent':
        return `Created ${event.payload.ref_type} in ${repo}`;
      case 'DeleteEvent':
        return `Deleted ${event.payload.ref_type} in ${repo}`;
      case 'ForkEvent':
        return `Forked ${repo}`;
      case 'WatchEvent':
        return `Starred ${repo}`;
      default:
        return `${event.type.replace('Event', '')} in ${repo}`;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredEvents = events?.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  }) || [];

  const displayEvents = showAllEvents ? filteredEvents : filteredEvents.slice(0, 10);
  const eventTypes = [...new Set(events?.map(e => e.type) || [])];

  return (
    <div className="activity-timeline">
      <div className="timeline-header">
        <div className="header-left">
          <h3>Recent Activity</h3>
          <div className="activity-count">{filteredEvents.length} activities</div>
        </div>
        <div className="timeline-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Activities</option>
            {eventTypes.map(type => (
              <option key={type} value={type} style={{color : "white" , backgroundColor : "black"}}>
                {type.replace('Event', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="timeline-content">
        <div className="timeline-line"></div>
        {displayEvents.map((event, index) => (
          <div key={`${event.id}-${index}`} className="timeline-item">
            <div className="timeline-marker">
              {getEventIcon(event.type)}
            </div>
            <div className="timeline-card">
              <div className="card-header">
                <div className="event-description">
                  {getEventDescription(event)}
                </div>
                <div className="event-time">
                  {formatTimeAgo(event.created_at)}
                </div>
              </div>
              
              {event.payload.commits && event.payload.commits.length > 0 && (
                <div className="commit-list">
                  {event.payload.commits.slice(0, 3).map((commit, i) => (
                    <div key={i} className="commit-item">
                      <div className="commit-hash">
                        {commit.sha?.substring(0, 7) || 'unknown'}
                      </div>
                      <div className="commit-message">
                        {commit.message}
                      </div>
                    </div>
                  ))}
                  {event.payload.commits.length > 3 && (
                    <div className="more-commits">
                      ... and {event.payload.commits.length - 3} more commits
                    </div>
                  )}
                </div>
              )}

              {event.payload.pull_request && (
                <div className="pr-details">
                  <div className="pr-title">
                    {event.payload.pull_request.title}
                  </div>
                  <div className="pr-meta">
                    #{event.payload.pull_request.number} • {event.payload.pull_request.state}
                  </div>
                </div>
              )}

              {event.payload.issue && (
                <div className="issue-details">
                  <div className="issue-title">
                    {event.payload.issue.title}
                  </div>
                  <div className="issue-meta">
                    #{event.payload.issue.number} • {event.payload.issue.state}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length > 10 && (
        <div className="timeline-footer">
          <button
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="btn-show-more"
          >
            {showAllEvents ? 'Show Less' : `Show All ${filteredEvents.length} Activities`}
          </button>
        </div>
      )}

      {starred && starred.length > 0 && (
        <div className="starred-section">
          <div className="starred-header">
            <Star size={20} className="icon-yellow" />
            <h4>Recently Starred</h4>
          </div>
          <div className="starred-grid">
            {starred.slice(0, 6).map((repo) => (
              <div key={repo.id} className="starred-card">
                <div className="starred-info">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-name"
                  >
                    {repo.full_name}
                  </a>
                  {repo.description && (
                    <p className="repo-description">{repo.description}</p>
                  )}
                </div>
                <div className="repo-stats">
                  <div className="stat-item">
                    <Star size={12} />
                    {repo.stargazers_count}
                  </div>
                  {repo.language && (
                    <div className="stat-item">
                      <div className="language-dot"></div>
                      {repo.language}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
