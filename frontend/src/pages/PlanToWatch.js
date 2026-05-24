// frontend/src/pages/PlanToWatch.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './PlanToWatch.css';

const PlanToWatch = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [planList,     setPlanList]     = useState([]);
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
        setPlanList    (d.planToWatch || []);
        setWatchingList(d.watching    || []);
      }
    } catch (e) { console.error(e); }
  };

  const saveLists = async (payload) => {
    try { await updateDoc(doc(db, 'users', userId), payload); }
    catch (e) { console.error(e); }
  };

  // Remove from plan — was never watching, so no watchCount change
  const removeAnime = async (id) => {
    const updated = planList.filter(a => a._id !== id);
    setPlanList(updated);
    await saveLists({ planToWatch: updated, watching: watchingList });
  };

  const removeAll = async () => {
    setPlanList([]);
    await saveLists({ planToWatch: [], watching: watchingList });
  };

  // Move to watching: plan → watching = +1 watchCount
  const moveToWatching = async (anime) => {
    const id               = anime._id;
    const updatedPlan      = planList.filter(a => a._id !== id);
    const alreadyWatching  = watchingList.find(a => a._id === id);
    const updatedWatching  = alreadyWatching
      ? watchingList
      : [...watchingList, { ...anime, episodesWatched: 0 }];

    setPlanList(updatedPlan);
    setWatchingList(updatedWatching);
    await saveLists({ planToWatch: updatedPlan, watching: updatedWatching });

    // +1 watchCount only if not already watching
    if (!alreadyWatching) {
      try { await updateDoc(doc(db, 'anime', id), { watchCount: increment(1) }); }
      catch (e) { console.error(e); }
    }
  };

  return (
    <div className="plan-container">
      <h2>📝 Plan To Watch</h2>

      {planList.length > 0 && (
        <button className="remove-all-btn" onClick={removeAll}>🗑 Remove All</button>
      )}

      {planList.length === 0 ? (
        <p className="empty-msg">No anime in your plan list.</p>
      ) : (
        <div className="plan-list">
          {planList.map(anime => {
            const id       = anime._id;
            const imageUrl = anime.image || 'https://via.placeholder.com/150x220?text=No+Image';
            return (
              <div key={id} className="plan-card">
                <Link to={`/anime/${id}`}>
                  <img src={imageUrl} alt={anime.title} />
                </Link>
                <div className="plan-card-info">
                  <h4>{anime.title}</h4>
                  <p>Episodes: {anime.episodes || '?'}</p>
                  <p className="score-row">★ {anime.avgRating || anime.score || 'N/A'}</p>

                  {/* Watch popularity */}
                  {anime.watchCount > 0 && (
                    <p className="watch-count">👥 {anime.watchCount} watching</p>
                  )}

                  <div className="plan-card-buttons">
                    <button className="move-btn" onClick={() => moveToWatching(anime)}>
                      ▶ Start Watching
                    </button>
                    <button className="remove-btn" onClick={() => removeAnime(id)}>
                      🗑 Remove
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