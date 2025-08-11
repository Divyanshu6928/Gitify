import React, { useState } from 'react';
import { getActivityGraphUrl } from '../utils/api';
import '../styles/ActivityGraph.css';

const ActivityGraph = ({ username }) => {
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
      <div className="activity-graph">
        <div className="graph-header">
          <h3>Activity Graph</h3>
        </div>
        <div className="graph-error">
          <div className="error-icon">📈</div>
          <p>Unable to load activity graph</p>
          <small>Graph service might be temporarily unavailable</small>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-graph">
      <div className="graph-header">
        <h3>Activity Graph</h3>
        <div className="graph-badge">12 Months</div>
      </div>
      <div className="graph-content">
        {!imageLoaded && (
          <div className="graph-loading">
            <div className="loading-graph">
              <div className="graph-line"></div>
              <div className="graph-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
            <p>Loading activity graph...</p>
          </div>
        )}
        <img
          src={getActivityGraphUrl(username)}
          alt={`${username}'s activity graph`}
          className={`graph-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default ActivityGraph;
