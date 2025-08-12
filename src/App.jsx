import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import ProfileCard from "./components/ProfileCard";
import StatsCard from "./components/StatsCard";
import ActivityGraph from "./components/ActivityGraph";
import ContributionsHeatmap from "./components/ContributionsHeatmap";
import ActivityTimeline from "./components/ActivityTimeline";
import LanguageStats from "./components/LanguageStats";
import StreakStats from "./components/StreakStats";
import { fetchAllUserData } from './utils/api';
import { Search, Github, AlertCircle, Loader, Activity, BarChart3, Zap } from 'lucide-react';
import "./styles/App.css";

function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLanding, setShowLanding] = useState(true);

  const handleSearch = async (searchUsername) => {
    const usernameToSearch = searchUsername || username;
    if (!usernameToSearch.trim()) return;

    setLoading(true);
    setError(null);
    setUserData(null);
    setActiveTab('overview');
    setShowLanding(false);

    try {
      const data = await fetchAllUserData(usernameToSearch.trim());
      
      if (data.error) {
        setError(data.error);
      } else {
        setUserData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setUserData(null);
    setError(null);
    setActiveTab('overview');
    setShowLanding(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Github },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'languages', label: 'Languages', icon: BarChart3 },
    { id: 'streaks', label: 'Streaks', icon: Zap },
  ];

  const renderTabContent = () => {
    if (!userData || loading || error) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <ProfileCard 
              user={userData.user} 
              repos={userData.repos} 
              orgs={userData.orgs}
              gists={userData.gists}
            />
            <div className="stats-section">
              <StatsCard 
                username={userData.user.login}
                contributions={userData.contributions}
              />
              <ContributionsHeatmap 
                contributions={userData.contributions}
                username={userData.user.login}
              />
            </div>
            <ActivityGraph username={userData.user.login} />
          </div>
        );
      case 'activity':
        return (
          <ActivityTimeline 
            events={userData.events} 
            starred={userData.starred}
          />
        );
      case 'languages':
        return (
          <LanguageStats 
            username={userData.user.login}
            repoLanguages={userData.repoLanguages}
          />
        );
      case 'streaks':
        return (
          <StreakStats 
            username={userData.user.login}
            contributions={userData.contributions}
          />
        );
      default:
        return null;
    }
  };

  if (showLanding && !userData && !loading) {
    return (
      <LandingPage 
        onSearch={handleSearch}
        username={username}
        setUsername={setUsername}
        loading={loading}
      />
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section-centered" onClick={handleReset}>
            <div className="logo-icon">
              <Github size={32} />
            </div>
            <div className="logo-text">
              <h1>RepoX </h1>
              <p>Advanced GitHub Profile Analytics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="search-section">
          <div className="search-grid">
            <div className="search-box">
              <h3>GitHub Profile</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="input-group">
                  <Search size={20} className="input-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub username..."
                    disabled={loading}
                    className="search-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="btn-search"
                >
                  {loading ? (
                    <>
                      <Loader className="spinner" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Profile'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-section">
            <div className="error-message">
              <AlertCircle size={20} />
              <div>
                <h4>Error fetching profile</h4>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">
              <Loader className="spinner large" />
              <p>Loading GitHub data...</p>
            </div>
          </div>
        )}

        {userData && !loading && !error && (
          <div className="profile-section">
            <div className="tabs-container">
              <div className="tabs-nav">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tab-content-container">
              {renderTabContent()}
            </div>
          </div>
        )}

        {!userData && !loading && !error && !showLanding && (
          <div className="welcome-section">
            <div className="welcome-content">
              <Github size={80} className="welcome-icon" style={{width : 100}} />
              <h2>Discover GitHub Profiles</h2>
              <p>
                Enter a GitHub username above to explore comprehensive profile analytics 
                with beautiful visualizations and deep insights.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Made with 🧠 by Divyanshu (DG)</p>
          <p>Advanced GitHub Profile Analytics</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
