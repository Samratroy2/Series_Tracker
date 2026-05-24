// frontend/src/pages/Watching.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './Watching.css';

// ── Star Rating ────────────────────────────────────────────────
const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1,2,3,4,5,6,7,8,9,10].map(star => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >★</span>
      ))}
      {value > 0 && <span className="star-label">{value}/10</span>}
    </div>
  );
};

const Watching = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [watchingList,  setWatchingList]  = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [onHoldList,    setOnHoldList]    = useState([]);
  const [droppedList,   setDroppedList]   = useState([]);

  // Rating modal
  const [ratingModal, setRatingModal] = useState(null);
  const [userRating,  setUserRating]  = useState(0);

  const userId = user?.uid;

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => { loadLists(); }, [userId]);

  // ── Load ──────────────────────────────────────────────────────
  const loadLists = async () => {
    if (!userId) return;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const d = snap.data();
        setWatchingList (d.watching    || []);
        setCompletedList(d.completed   || []);
        setOnHoldList   (d.onHold      || []);
        setDroppedList  (d.dropped     || []);
      }
    } catch (e) { console.error(e); }
  };

  // ── Save user lists ───────────────────────────────────────────
  const saveLists = async (payload) => {
    try { await updateDoc(doc(db, 'users', userId), payload); }
    catch (e) { console.error(e); }
  };

  // ── Update anime doc: watchCount ±1 ──────────────────────────
  const updateWatchCount = async (animeId, delta) => {
    try {
      await updateDoc(doc(db, 'anime', animeId), {
        watchCount: increment(delta),
      });
    } catch (e) { console.error(e); }
  };

  // ── Update anime doc: rating (rolling avg per user) ──────────
  const updateAnimeRating = async (animeId, rating) => {
    try {
      const animeRef = doc(db, 'anime', animeId);
      const snap     = await getDoc(animeRef);
      const data     = snap.data() || {};
      const ratings  = { ...(data.userRatings || {}), [userId]: rating };
      const values   = Object.values(ratings).filter(v => typeof v === 'number');
      const avg      = parseFloat((values.reduce((s,v) => s+v, 0) / values.length).toFixed(1));
      await updateDoc(animeRef, { userRatings: ratings, avgRating: avg, score: avg });
    } catch (e) { console.error(e); }
  };

  // ── Submit rating after completing ───────────────────────────
  const submitRating = async () => {
    if (!ratingModal || userRating === 0) { setRatingModal(null); return; }
    const id   = ratingModal._id;
    const newC = completedList.map(a => a._id === id ? { ...a, userRating } : a);
    setCompletedList(newC);
    await saveLists({ completed: newC });
    await updateAnimeRating(id, userRating);
    setRatingModal(null);
    setUserRating(0);
  };

  // ── Remove one ───────────────────────────────────────────────
  const handleRemove = async (animeId) => {
    const updated = watchingList.filter(a => a._id !== animeId);
    setWatchingList(updated);
    await saveLists({ watching: updated });
    // leaving watchlist = -1 watchCount
    await updateWatchCount(animeId, -1);
  };

  // ── Remove all ───────────────────────────────────────────────
  const handleRemoveAll = async () => {
    // decrement watchCount for each
    for (const a of watchingList) await updateWatchCount(a._id, -1);
    setWatchingList([]);
    await saveLists({ watching: [] });
  };

  // ── Move to list ─────────────────────────────────────────────
  const moveToList = async (anime, target) => {
    const id = anime._id;
    const updatedWatching = watchingList.filter(a => a._id !== id);
    setWatchingList(updatedWatching);

    if (target === 'completed') {
      const updatedCompleted = [...completedList, { ...anime, episodesWatched: parseInt(anime.episodes) || anime.episodesWatched || 0 }];
      setCompletedList(updatedCompleted);
      await saveLists({ watching: updatedWatching, completed: updatedCompleted });
      // watching → completed: watchCount stays +1 (already counted), show rating modal
      setTimeout(() => { setRatingModal(anime); setUserRating(0); }, 150);
    }

    if (target === 'onHold') {
      const updatedOnHold = [...onHoldList, anime];
      setOnHoldList(updatedOnHold);
      await saveLists({ watching: updatedWatching, onHold: updatedOnHold });
      // pausing — no watchCount change
    }

    if (target === 'dropped') {
      // episodesWatched -1 when dropped
      const watched = Math.max(0, (anime.episodesWatched || 0) - 1);
      const updatedDropped = [...droppedList, { ...anime, episodesWatched: watched }];
      setDroppedList(updatedDropped);
      await saveLists({ watching: updatedWatching, dropped: updatedDropped });
      // watching → dropped: -1 watchCount
      await updateWatchCount(id, -1);
    }
  };

  // ── Update episode count ──────────────────────────────────────
  const updateEpisodeCount = async (animeId, change) => {
    let completedAnime = null;

    const updatedWatching = watchingList.map(anime => {
      if (anime._id !== animeId) return anime;
      let newCount = Math.max(0, Math.min((anime.episodesWatched || 0) + change, parseInt(anime.episodes) || 9999));
      if (anime.episodes && newCount >= parseInt(anime.episodes)) {
        completedAnime = { ...anime, episodesWatched: newCount };
        return null;
      }
      return { ...anime, episodesWatched: newCount };
    }).filter(Boolean);

    setWatchingList(updatedWatching);

    if (completedAnime) {
      const updatedCompleted = [...completedList, completedAnime];
      setCompletedList(updatedCompleted);
      await saveLists({ watching: updatedWatching, completed: updatedCompleted });
      setTimeout(() => { setRatingModal(completedAnime); setUserRating(0); }, 150);
    } else {
      await saveLists({ watching: updatedWatching });
    }
  };

  const getCardStatusClass = (anime) =>
    (anime.episodesWatched || 0) > 0 ? 'status-watching' : 'status-plan';

  return (
    <div className="watching-container">
      <h2>📺 Watching</h2>

      {watchingList.length > 0 && (
        <button className="remove-all-btn" onClick={handleRemoveAll}>🗑 Remove All</button>
      )}

      {watchingList.length === 0 ? (
        <p className="empty-msg">No anime in watching list.</p>
      ) : (
        <div className="watching-list">
          {watchingList.map(anime => {
            const animeId = anime._id;
            const total   = parseInt(anime.episodes) || 0;
            const watched = anime.episodesWatched || 0;
            const pct     = total ? Math.min(100, Math.round((watched / total) * 100)) : 0;

            return (
              <div key={animeId} className={`watching-card ${getCardStatusClass(anime)}`}>
                <Link to={`/anime/${animeId}`}>
                  <img
                    src={anime.image || 'https://via.placeholder.com/150x220?text=No+Image'}
                    alt={anime.title}
                  />
                </Link>

                <h4>{anime.title}</h4>

                {/* Progress bar */}
                <div className="w-progress-track">
                  <div className="w-progress-bar" style={{ width: pct + '%' }} />
                </div>

                <div className="episode-controls">
                  <button onClick={() => updateEpisodeCount(animeId, -1)}>−</button>
                  <span>{watched} / {anime.episodes || '?'}</span>
                  <button onClick={() => updateEpisodeCount(animeId, +1)}>＋</button>
                </div>

                <div className="status-buttons">
                  <button onClick={() => moveToList(anime, 'onHold')}>⏸ On Hold</button>
                  <button onClick={() => moveToList(anime, 'dropped')} className="danger">❌ Drop</button>
                  <button onClick={() => moveToList(anime, 'completed')} className="complete-btn">✅ Done</button>
                  <button onClick={() => handleRemove(animeId)} className="grey">🗑 Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      {ratingModal && (
        <div className="rating-overlay" onClick={() => setRatingModal(null)}>
          <div className="rating-modal" onClick={e => e.stopPropagation()}>
            <h3 className="rating-modal__title">Rate · {ratingModal.title}</h3>
            <p className="rating-modal__sub">How would you rate this?</p>
            <StarRating value={userRating} onChange={setUserRating} />
            <div className="rating-modal__actions">
              <button className="rate-submit-btn" onClick={submitRating} disabled={userRating === 0}>
                Submit Rating
              </button>
              <button className="rate-skip-btn" onClick={() => setRatingModal(null)}>Skip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watching;