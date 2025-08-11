import React, { useState } from 'react';
import { getStatsCardUrl } from '../utils/api';
import '../styles/StatsCard.css';

const StatsCard = ({ username }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="stats-card">
        <div className="stats-header">
          <h3>GitHub Statistics</h3>
        </div>
        <div className="stats-error">
          <div className="error-icon">📊</div>
          <p>Unable to load GitHub stats</p>
          <small>Stats service might be temporarily unavailable</small>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <div className="stats-header">
        <h3>GitHub Statistics</h3>
        <div className="stats-badge">Live Data</div>
      </div>
      <div className="stats-content">
        {!imageLoaded && (
          <div className="stats-loading">
            <div className="loading-bars">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <p>Loading statistics...</p>
          </div>
        )}
        <img
          src={getStatsCardUrl(username)}
          alt={`${username}'s GitHub statistics`}
          className={`stats-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default StatsCard;
