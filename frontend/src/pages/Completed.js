// frontend/src/pages/Completed.js
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './Completed.css';

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1,2,3,4,5,6,7,8,9,10].map(star => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >★</span>
      ))}
      {value > 0 && <span className="star-label">{value}/10</span>}
    </div>
  );
};

const Completed = () => {
  const { user } = useAuth();

  const [completedList, setCompletedList] = useState([]);
  const [watchingList,  setWatchingList]  = useState([]);

  // Re-rate modal
  const [ratingModal, setRatingModal] = useState(null);
  const [userRating,  setUserRating]  = useState(0);

  const userId = user?.uid;

  useEffect(() => { loadLists(); }, [userId]);

  const loadLists = async () => {
    if (!userId) return;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const d = snap.data();
        setCompletedList(d.completed || []);
        setWatchingList (d.watching  || []);
      }
    } catch (e) { console.error(e); }
  };

  const saveLists = async (payload) => {
    try { await updateDoc(doc(db, 'users', userId), payload); }
    catch (e) { console.error(e); }
  };

  // Update rolling avg rating on anime doc
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

  // Submit (or update) rating
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

  // Remove one — completed → gone: watchCount -1
  const handleRemove = async (id) => {
    const updated = completedList.filter(a => a._id !== id);
    setCompletedList(updated);
    await saveLists({ completed: updated });
    try { await updateDoc(doc(db, 'anime', id), { watchCount: increment(-1) }); }
    catch (e) { console.error(e); }
  };

  // Remove all
  const handleRemoveAll = async () => {
    for (const a of completedList) {
      try { await updateDoc(doc(db, 'anime', a._id), { watchCount: increment(-1) }); }
      catch (e) { console.error(e); }
    }
    setCompletedList([]);
    await saveLists({ completed: [] });
  };

  // Move back to watching — watchCount stays same (was +1, still +1)
  const moveToWatching = async (anime) => {
    const updatedCompleted = completedList.filter(a => a._id !== anime._id);
    const alreadyWatching  = watchingList.find(a => a._id === anime._id);
    const updatedWatching  = alreadyWatching
      ? watchingList
      : [...watchingList, { ...anime, episodesWatched: anime.episodesWatched || 0 }];
    setCompletedList(updatedCompleted);
    setWatchingList(updatedWatching);
    await saveLists({ completed: updatedCompleted, watching: updatedWatching });
  };

  return (
    <div className="completed-container">
      <h2>✅ Completed List</h2>

      {completedList.length > 0 && (
        <button className="remove-all-btn" onClick={handleRemoveAll}>🗑 Remove All</button>
      )}

      {completedList.length === 0 ? (
        <p className="empty-msg">No anime completed yet.</p>
      ) : (
        <div className="completed-list">
          {completedList.map(anime => {
            const id = anime._id;
            return (
              <div key={id} className="completed-card">
                <img
                  src={anime.image || 'https://via.placeholder.com/80x120?text=No+Image'}
                  alt={anime.title}
                />
                <div className="completed-card-info">
                  <h4>{anime.title}</h4>

                  <p className="ep-info">
                    {anime.episodesWatched || 0} / {anime.episodes || '?'} eps
                  </p>

                  {/* Show existing rating or prompt to rate */}
                  {anime.userRating ? (
                    <div className="rating-row">
                      <StarRating value={anime.userRating} readOnly />
                      <button
                        className="rerate-btn"
                        onClick={() => { setRatingModal(anime); setUserRating(anime.userRating); }}
                      >
                        Edit Rating
                      </button>
                    </div>
                  ) : (
                    <button
                      className="rate-btn"
                      onClick={() => { setRatingModal(anime); setUserRating(0); }}
                    >
                      ★ Rate This
                    </button>
                  )}

                  <div className="completed-card-buttons">
                    <button onClick={() => moveToWatching(anime)}>↩ Re-watch</button>
                    <button onClick={() => handleRemove(id)}>🗑 Remove</button>
                  </div>
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
            <p className="rating-modal__sub">Your rating updates the community score</p>
            <StarRating value={userRating} onChange={setUserRating} />
            <div className="rating-modal__actions">
              <button className="rate-submit-btn" onClick={submitRating} disabled={userRating === 0}>
                Submit
              </button>
              <button className="rate-skip-btn" onClick={() => setRatingModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Completed;