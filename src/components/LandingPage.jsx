import React from "react";
import "../styles/LandingPage.css";

const LandingPage = ({ 
  onSearch, 
  username, 
  setUsername, 
  loading
}) => {
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username);
    }
  };

  return (
    <div className="landing-container">
      <div className="stars-background">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }}></div>
        ))}
      </div>

      <div className="logo-container">
        <img
          src="https://res.cloudinary.com/depyc5ywg/image/upload/v1754757809/download_27_-Photoroom_wzzwgy.png"
          alt="Gitify Logo"
          className="logo"
        />
      </div>

      <h1 className="title">GITIFY</h1>
      <p className="subtitle">Advanced GitHub Profile Analytics</p>

      <div className="search-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Enter GitHub Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="search-input"
              disabled={loading}
            />
            <div className="input-glow"></div>
          </div>
        </form>
      </div>

      <div className="button-container">
        <button 
          className="btn btn-search"
          onClick={() => onSearch(username)}
          disabled={loading || !username.trim()}
        >
          {loading ? (
            <>
              <div className="btn-spinner"></div>
              Analyzing...
            </>
          ) : (
            'Analyze Profile'
          )}
        </button>
      </div>

      <footer className="footer">
        Made with <span className="emoji">🧠</span> by Divyanshu (DG)
      </footer>
    </div>
  );
};

export default LandingPage;
