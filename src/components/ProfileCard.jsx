import React, { useState } from 'react';
import { MapPin, Link2, Calendar, Users, Building2, Twitter, Mail, FileText, Eye, GitFork } from 'lucide-react';
import '../styles/ProfileCard.css';

const ProfileCard = ({ user, repos, orgs, gists }) => {
  const [showAllRepos, setShowAllRepos] = useState(false);

  // Handle case when data is not available
  if (!user) {
    return (
      <div className="profile-card">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatUrl = (url) => {
    return url?.startsWith('http') ? url : `https://${url}`;
  };

  const totalStars = repos?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0;
  const totalForks = repos?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0;
  const totalWatchers = repos?.reduce((sum, repo) => sum + repo.watchers_count, 0) || 0;

  return (
    <div className="profile-card">
      {/* Header Section */}
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container">
            <img
              src={user.avatar_url}
              alt={`${user.login}'s avatar`}
              className="profile-avatar"
            />
            <div className="avatar-glow"></div>
          </div>
          
          {/* Status Badges */}
          <div className="status-badges">
            {user.hireable && (
              <span className="badge badge-success">
                <span className="pulse-dot"></span>
                Available for hire
              </span>
            )}
            {user.type === 'Organization' && (
              <span className="badge badge-info">
                <Building2 size={12} />
                Organization
              </span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          <h1 className="profile-name">{user.name || user.login}</h1>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-username"
          >
            @{user.login}
          </a>

          {user.bio && (
            <div className="profile-bio">
              <p>{user.bio}</p>
            </div>
          )}

          {/* Contact Details */}
          <div className="contact-details">
            {user.location && (
              <div className="detail-item">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            )}

            {user.email && (
              <div className="detail-item">
                <Mail size={16} />
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>
            )}

            {user.blog && (
              <div className="detail-item">
                <Link2 size={16} />
                <a
                  href={formatUrl(user.blog)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.blog.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {user.company && (
              <div className="detail-item">
                <Building2 size={16} />
                <span>{user.company}</span>
              </div>
            )}

            {user.twitter_username && (
              <div className="detail-item">
                <Twitter size={16} />
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{user.twitter_username}
                </a>
              </div>
            )}

            <div className="detail-item">
              <Calendar size={16} />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-number">{user.followers.toLocaleString()}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-number">{user.following.toLocaleString()}</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-number">{user.public_repos.toLocaleString()}</div>
          <div className="stat-label">Repositories</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-number">{user.public_gists?.toLocaleString() || 0}</div>
          <div className="stat-label">Gists</div>
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-number">{totalStars.toLocaleString()}</div>
          <div className="stat-label">Total Stars</div>
        </div>
        <div className="stat-card stat-cyan">
          <div className="stat-number">{totalForks.toLocaleString()}</div>
          <div className="stat-label">Total Forks</div>
        </div>
      </div>

      {/* Organizations */}
      {orgs && orgs.length > 0 && (
        <div className="organizations-section">
          <h3 className="section-title">
            Organizations ({orgs.length})
          </h3>
          <div className="organizations-grid">
            {orgs.map((org) => (
              <a
                key={org.id}
                href={`https://github.com/${org.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="org-card"
              >
                <img src={org.avatar_url} alt={org.login} className="org-avatar" />
                <span className="org-name">{org.login}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Repositories */}
      {repos && repos.length > 0 && (
        <div className="repositories-section">
          <div className="section-header">
            <h3 className="section-title">Repositories ({repos.length})</h3>
            {repos.length > 6 && (
              <button
                onClick={() => setShowAllRepos(!showAllRepos)}
                className="btn-toggle"
              >
                {showAllRepos ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
          
          <div className="repositories-grid">
            {(showAllRepos ? repos : repos.slice(0, 6)).map((repo) => (
              <div key={repo.id} className="repo-card">
                <div className="repo-header">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-name"
                  >
                    {repo.name}
                  </a>
                  <div className="repo-badges">
                    {repo.private && <span className="badge badge-warning">Private</span>}
                    {repo.fork && <span className="badge badge-secondary">Fork</span>}
                  </div>
                </div>
                
                {repo.description && (
                  <p className="repo-description" >{repo.description}</p>
                )}
                
                <div className="repo-footer">
                  <div className="repo-stats">
                    {repo.language && (
                      <span className="repo-language">
                        <span className="language-dot"></span>
                        {repo.language}
                      </span>
                    )}
                    <span className="repo-stat">
                      <Eye size={12} />
                      {repo.stargazers_count}
                    </span>
                    <span className="repo-stat">
                      <GitFork size={12} />
                      {repo.forks_count}
                    </span>
                  </div>
                  <div className="repo-updated">
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gists Section */}
      {gists && gists.length > 0 && (
        <div className="gists-section">
          <h3 className="section-title">Recent Gists ({gists.length})</h3>
          <div className="gists-container">
            {gists.slice(0, 5).map((gist) => (
              <div key={gist.id} className="gist-card">
                <div className="gist-header">
                  <a
                    href={gist.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gist-name"
                  >
                    <FileText size={16} />
                    {Object.keys(gist.files)[0] || 'Untitled'}
                  </a>
                  <div className="gist-meta">
                    <span className={`badge ${gist.public ? 'badge-success' : 'badge-warning'}`}>
                      {gist.public ? 'Public' : 'Private'}
                    </span>
                    <span className="gist-date">
                      {new Date(gist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {gist.description && (
                  <p className="gist-description">{gist.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
