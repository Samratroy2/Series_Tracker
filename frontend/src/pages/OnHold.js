import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnHold.css';

const OnHold = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => { if (!user) navigate('/login'); }, [navigate, user]);

  const userId = user?._id || user?.id || 'guest';
  const storageKey = `onHoldList_${userId}`;
  const watchingKey = `watchingList_${userId}`;

  const [onHoldList, setOnHoldList] = useState([]);

  const loadOnHold = () => {
    setOnHoldList(JSON.parse(localStorage.getItem(storageKey)) || []);
  };

  useEffect(() => {
    loadOnHold();

    const handleEvent = () => loadOnHold();
    window.addEventListener(`${storageKey}-updated`, handleEvent);

    return () => window.removeEventListener(`${storageKey}-updated`, handleEvent);
  }, [storageKey]);

  const saveOnHoldList = (list) => {
    setOnHoldList(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
    window.dispatchEvent(new Event(`${storageKey}-updated`));
  };

  const handleRemove = (id) => {
    const updated = onHoldList.filter(item => (item.mal_id || item._id) !== id);
    saveOnHoldList(updated);
  };

  const handleRemoveAll = () => saveOnHoldList([]);

  const moveToWatching = (anime) => {
    // Remove from onHoldList
    const updatedOnHold = onHoldList.filter(item => (item.mal_id || item._id) !== (anime.mal_id || anime._id));
    saveOnHoldList(updatedOnHold);

    // Add to watching list
    const watchingList = JSON.parse(localStorage.getItem(watchingKey)) || [];
    if (!watchingList.find(a => (a.mal_id || a._id) === (anime.mal_id || anime._id))) {
      watchingList.push({ ...anime, episodesWatched: anime.episodesWatched || 0 });
      localStorage.setItem(watchingKey, JSON.stringify(watchingList));
      window.dispatchEvent(new Event(`${watchingKey}-updated`));
    }
  };

  return (
    <div className="onhold-container">
      <h2>📌 On Hold List</h2>

      {onHoldList.length > 0 && (
        <button onClick={handleRemoveAll} className="remove-all-btn">
          🗑 Remove All
        </button>
      )}

      {onHoldList.length === 0 ? (
        <p>No anime on hold.</p>
      ) : (
        <div className="onhold-list">
          {onHoldList.map(anime => {
            const id = anime.mal_id || anime._id;
            return (
              <div key={id} className="onhold-card">
                <img
                  src={anime.image || anime.images?.jpg?.image_url || 'https://via.placeholder.com/150x220?text=No+Image'}
                  alt={anime.title}
                />
                <div className="onhold-card-info">
                  <h4>{anime.title}</h4>
                  <p>Episodes: {anime.episodesWatched || 0} / {anime.episodes || '?'}</p>
                  <div className="onhold-card-buttons">
                    <button onClick={() => moveToWatching(anime)}>▶ Back to Watching</button>
                    <button onClick={() => handleRemove(id)}>🗑 Remove</button>
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

export default OnHold;
