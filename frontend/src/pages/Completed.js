// frontend/src/pages/Completed.js
import React, { useEffect, useState } from 'react';
import './Completed.css';

const Completed = () => {
  const [completedList, setCompletedList] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id || 'guest';

  const loadCompleted = () => {
    const stored = JSON.parse(localStorage.getItem(`completedList_${userId}`)) || [];
    setCompletedList(stored);
  };

  useEffect(() => {
    loadCompleted();

    const handleStorageChange = (e) => {
      if (e.key === `completedList_${userId}`) loadCompleted();
    };

    const handleCustomEvent = () => loadCompleted();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('completedListUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('completedListUpdated', handleCustomEvent);
    };
  }, [userId]);

  const handleRemove = (id) => {
    const updated = completedList.filter(item => (item._id || item.mal_id) !== id);
    setCompletedList(updated);
    localStorage.setItem(`completedList_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('completedListUpdated'));
  };

  const handleRemoveAll = () => {
    setCompletedList([]);
    localStorage.removeItem(`completedList_${userId}`);
    window.dispatchEvent(new Event('completedListUpdated'));
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
    <div className="completed-container">
      <h2>✅ Completed List</h2>

      {completedList.length > 0 && (
        <button onClick={handleRemoveAll} className="remove-all-btn">
          🗑 Remove All
        </button>
      )}

      {completedList.length === 0 ? (
        <p>No anime completed yet.</p>
      ) : (
        <div className="completed-list">
          {completedList.map(anime => {
            const id = anime._id || anime.mal_id;
            const imageUrl = anime.image || anime.images?.jpg?.image_url || 'https://via.placeholder.com/80x120?text=No+Image';

            return (
              <div key={id} className="completed-card">
                <img src={imageUrl} alt={anime.title} />
                <div className="completed-card-info">
                  <h4>{anime.title}</h4>
                  <p>Episodes: {anime.episodesWatched || 0} / {anime.episodes || '?'}</p>
                  <div className="completed-card-buttons">
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

export default Completed;
