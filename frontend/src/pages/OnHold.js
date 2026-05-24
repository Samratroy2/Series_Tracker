// frontend/src/pages/OnHold.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './OnHold.css';

const OnHold = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [onHoldList,   setOnHoldList]   = useState([]);
  const [watchingList, setWatchingList] = useState([]);

  const userId = user?.uid;

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => { loadLists(); }, [userId]);

  const loadLists = async () => {
    if (!userId) return;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const d = snap.data();
        setOnHoldList  (d.onHold   || []);
        setWatchingList(d.watching || []);
      }
    } catch (e) { console.error(e); }
  };

  const saveLists = async (payload) => {
    try { await updateDoc(doc(db, 'users', userId), payload); }
    catch (e) { console.error(e); }
  };

  // Remove one — onHold → gone. OnHold didn't count toward watchCount,
  // so no watchCount change needed.
  const handleRemove = async (id) => {
    const updated = onHoldList.filter(a => a._id !== id);
    setOnHoldList(updated);
    await saveLists({ onHold: updated, watching: watchingList });
  };

  const handleRemoveAll = async () => {
    setOnHoldList([]);
    await saveLists({ onHold: [], watching: watchingList });
  };

  // Move back to watching — onHold was previously watching (watchCount already +1),
  // so no watchCount change needed here.
  const moveToWatching = async (anime) => {
    const updatedOnHold   = onHoldList.filter(a => a._id !== anime._id);
    const alreadyWatching = watchingList.find(a => a._id === anime._id);
    const updatedWatching = alreadyWatching
      ? watchingList
      : [...watchingList, { ...anime, episodesWatched: anime.episodesWatched || 0 }];

    setOnHoldList(updatedOnHold);
    setWatchingList(updatedWatching);
    await saveLists({ onHold: updatedOnHold, watching: updatedWatching });
  };

  return (
    <div className="onhold-container">
      <h2>📌 On Hold List</h2>

      {onHoldList.length > 0 && (
        <button className="remove-all-btn" onClick={handleRemoveAll}>🗑 Remove All</button>
      )}

      {onHoldList.length === 0 ? (
        <p className="empty-msg">No anime on hold.</p>
      ) : (
        <div className="onhold-list">
          {onHoldList.map(anime => {
            const id    = anime._id;
            const total = parseInt(anime.episodes) || 0;
            const pct   = total ? Math.min(100, Math.round(((anime.episodesWatched||0) / total) * 100)) : 0;

            return (
              <div key={id} className="onhold-card">
                <img
                  src={anime.image || 'https://via.placeholder.com/150x220?text=No+Image'}
                  alt={anime.title}
                />
                <div className="onhold-card-info">
                  <h4>{anime.title}</h4>

                  {/* Progress bar */}
                  <div className="oh-progress-track">
                    <div className="oh-progress-bar" style={{ width: pct + '%' }} />
                  </div>

                  <p className="ep-info">
                    {anime.episodesWatched || 0} / {anime.episodes || '?'} eps · paused
                  </p>

                  <div className="onhold-card-buttons">
                    <button onClick={() => moveToWatching(anime)}>▶ Resume</button>
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