// frontend/src/pages/Dropped.js
import React, { useEffect, useState } from 'react';
import './Dropped.css';

const Dropped = () => {
  const [droppedList, setDroppedList] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id || 'guest';

  const loadDroppedList = () => {
    const stored = JSON.parse(localStorage.getItem(`droppedList_${userId}`)) || [];
    setDroppedList(stored);
  };

  useEffect(() => {
    loadDroppedList();

    const handleStorageChange = (e) => {
      if (e.key === `droppedList_${userId}`) loadDroppedList();
    };

    const handleCustomEvent = () => loadDroppedList();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('droppedListUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('droppedListUpdated', handleCustomEvent);
    };
  }, [userId]);

  const handleRemove = (id) => {
    const updated = droppedList.filter(item => (item._id || item.mal_id) !== id);
    setDroppedList(updated);
    localStorage.setItem(`droppedList_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('droppedListUpdated'));
  };

  const handleRemoveAll = () => {
    setDroppedList([]);
    localStorage.removeItem(`droppedList_${userId}`);
    window.dispatchEvent(new Event('droppedListUpdated'));
  };

  const moveToWatching = (anime) => {
    const watchingList = JSON.parse(localStorage.getItem(`watchingList_${userId}`)) || [];
    if (!watchingList.find(a => (a._id || a.mal_id) === (anime._id || anime.mal_id))) {
      watchingList.push({ ...anime, episodesWatched: anime.episodesWatched || 0 });
      localStorage.setItem(`watchingList_${userId}`, JSON.stringify(watchingList));
      window.dispatchEvent(new Event('watchingListUpdated'));
    }
    handleRemove(anime._id || anime.mal_id);
  };

  return (
    <div className="dropped-container">
      <h2>📉 Dropped List</h2>

      {droppedList.length > 0 && (
        <button onClick={handleRemoveAll} className="remove-all-btn">
          🗑 Remove All
        </button>
      )}

      {droppedList.length === 0 ? (
        <p>No anime dropped.</p>
      ) : (
        <div className="dropped-list">
          {droppedList.map(anime => {
            const id = anime._id || anime.mal_id;
            const imageUrl = anime.image || anime.images?.jpg?.image_url || 'https://via.placeholder.com/150x220?text=No+Image';

            return (
              <div key={id} className="dropped-card">
                <img src={imageUrl} alt={anime.title} />
                <div className="dropped-card-info">
                  <h4>{anime.title}</h4>
                  <p>Episodes Watched: {anime.episodesWatched || 0} / {anime.episodes || '?'}</p>
                  <div className="dropped-card-buttons">
                    <button onClick={() => moveToWatching(anime)}>↩ Back to Watching</button>
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

export default Dropped;
