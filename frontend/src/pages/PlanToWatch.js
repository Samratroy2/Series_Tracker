// frontend/src/pages/PlanToWatch.js

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PlanToWatch.css';

const PlanToWatch = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => { if (!user) navigate('/login'); }, [navigate, user]);

  const userId = user?._id || user?.id || 'guest';
  const storageKey = `planToWatchList_${userId}`;

  const [planList, setPlanList] = useState([]);

  const loadPlanList = () => {
    setPlanList(JSON.parse(localStorage.getItem(storageKey)) || []);
  };

  useEffect(() => {
    loadPlanList();
    const handleEvent = () => loadPlanList();
    window.addEventListener(`${storageKey}-updated`, handleEvent);
    return () => window.removeEventListener(`${storageKey}-updated`, handleEvent);
  }, [storageKey]);

  const savePlanList = (list) => {
    setPlanList(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
    window.dispatchEvent(new Event(`${storageKey}-updated`));
  };

  const removeAnime = (id) => {
    const updated = planList.filter(a => (a._id || a.mal_id) !== id);
    savePlanList(updated);
  };

  const removeAll = () => {
    savePlanList([]);
  };

  const moveToWatching = (anime) => {
    const watchingKey = `watchingList_${userId}`;
    const watchingList = JSON.parse(localStorage.getItem(watchingKey)) || [];
    if (!watchingList.find(a => (a._id || a.mal_id) === (anime._id || anime.mal_id))) {
      watchingList.push({ ...anime, episodesWatched: 0 });
      localStorage.setItem(watchingKey, JSON.stringify(watchingList));
      window.dispatchEvent(new Event(`${watchingKey}-updated`));
    }
    removeAnime(anime._id || anime.mal_id);
  };

  return (
    <div className="plan-container">
      <h2>📝 Plan to Watch</h2>

      {planList.length > 0 && (
        <button className="remove-all-btn" onClick={removeAll}>🗑 Remove All</button>
      )}

      {planList.length === 0 ? (
        <p>No anime in your plan to watch list.</p>
      ) : (
        <div className="plan-list">
          {planList.map(anime => {
            const id = anime._id || anime.mal_id;
            const imageUrl = anime.image || anime.images?.jpg?.image_url || 'https://via.placeholder.com/150x220?text=No+Image';

            return (
              <div key={id} className="plan-card">
                <Link to={`/anime/${id}`}>
                  <img src={imageUrl} alt={anime.title} />
                </Link>
                <div className="plan-card-info">
                  <h4 style={{ color: 'red', fontSize: '1rem' }}>{anime.title}</h4>
                  <div className="plan-card-buttons">
                    <button className="move-btn" onClick={() => moveToWatching(anime)}>
                      Move to Watching
                    </button>
                    <button className="remove-btn" onClick={() => removeAnime(id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlanToWatch;
