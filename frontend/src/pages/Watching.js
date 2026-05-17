import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Watching.css';

const Watching = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => { if (!user) navigate('/login'); }, [navigate, user]);

  const userId = user?._id || user?.id || 'guest';

  const storageKeys = {
    watching: `watchingList_${userId}`,
    completed: `completedList_${userId}`,
    onHold: `onHoldList_${userId}`,
    dropped: `droppedList_${userId}`
  };

  const [watchingList, setWatchingList] = useState([]);

  const loadWatchingList = () => {
    setWatchingList(JSON.parse(localStorage.getItem(storageKeys.watching)) || []);
  };

  useEffect(() => {
    loadWatchingList();
    const handleEvent = () => loadWatchingList();

    window.addEventListener(`${storageKeys.watching}-updated`, handleEvent);

    return () => window.removeEventListener(`${storageKeys.watching}-updated`, handleEvent);
  }, [storageKeys.watching]);

  const saveWatchingList = (list) => {
    setWatchingList(list);
    localStorage.setItem(storageKeys.watching, JSON.stringify(list));
    window.dispatchEvent(new Event(`${storageKeys.watching}-updated`));
  };

  const moveToList = (anime, targetListName) => {
    const updatedWatchingList = watchingList.filter(item => (item._id || item.mal_id) !== (anime._id || anime.mal_id));
    saveWatchingList(updatedWatchingList);

    const key = storageKeys[targetListName];
    if (!key) return;

    const targetList = JSON.parse(localStorage.getItem(key)) || [];
    targetList.push(anime);
    localStorage.setItem(key, JSON.stringify(targetList));
    window.dispatchEvent(new Event(`${key}-updated`));
  };

  const updateEpisodeCount = (id, change) => {
    const updatedList = watchingList.map(anime => {
      const animeId = anime._id || anime.mal_id;
      if (animeId === id) {
        let newCount = (anime.episodesWatched || 0) + change;
        newCount = Math.max(0, Math.min(newCount, anime.episodes || 100));

        if (anime.episodes && newCount >= anime.episodes) {
          moveToList({ ...anime, episodesWatched: anime.episodes }, 'completed');
          return null;
        }

        return { ...anime, episodesWatched: newCount };
      }
      return anime;
    }).filter(Boolean);

    saveWatchingList(updatedList);
  };

  const handleRemove = (id) => {
    const updated = watchingList.filter(item => (item._id || item.mal_id) !== id);
    saveWatchingList(updated);
  };

  const handleRemoveAll = () => saveWatchingList([]);

  const getCardStatusClass = (anime) => {
    if (anime.episodesWatched >= anime.episodes && anime.episodes) return 'status-completed';
    if (anime.episodesWatched > 0 && anime.episodesWatched < anime.episodes) return 'status-watching';
    return 'status-plantowatch';
  };

  return (
    <div className="watching-container">
      <h2>📺 Watching</h2>

      {watchingList.length > 0 && (
        <button className="remove-all-btn" onClick={handleRemoveAll}>
          Remove All
        </button>
      )}

      {watchingList.length === 0 ? (
        <p>You are not watching anything currently.</p>
      ) : (
        <div className="watching-list">
          {watchingList.map(anime => {
            const animeId = anime._id || anime.mal_id;
            const cardStatusClass = getCardStatusClass(anime);

            return (
              <div key={animeId} className={`watching-card ${cardStatusClass}`}>
                <Link to={`/anime/${animeId}`}>
                  <img
                    src={anime.image || anime.images?.jpg?.image_url || 'https://via.placeholder.com/150x220?text=No+Image'}
                    alt={anime.title}
                  />
                </Link>
                <h4>{anime.title}</h4>

                <div className="episode-controls">
                  <button onClick={() => updateEpisodeCount(animeId, -1)}>−</button>
                  <span>{anime.episodesWatched || 0} / {anime.episodes || '?'}</span>
                  <button onClick={() => updateEpisodeCount(animeId, 1)}>＋</button>
                </div>

                <div className="status-buttons">
                  {(anime.episodesWatched > 0 && anime.episodesWatched < anime.episodes) && (
                    <>
                      <button onClick={() => moveToList(anime, 'onHold')}>On Hold</button>
                      <button onClick={() => moveToList(anime, 'dropped')} className="danger">Dropped</button>
                    </>
                  )}
                  <button onClick={() => handleRemove(animeId)} className="grey">Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watching;
