// frontend/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import './Home.css';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  collection, getDocs, addDoc,
  doc, getDoc, setDoc, updateDoc, increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─── Star Rating component ────────────────────────────────────────
const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
        <span
          key={star}
          className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
      {value > 0 && <span className="star-label">{value}/10</span>}
    </div>
  );
};

// ─── Scroll section ───────────────────────────────────────────────
const Section = ({ title, badge, items, onCard }) => {
  if (!items.length) return null;
  return (
    <section className="home-section">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {badge && <span className="section-badge">{badge}</span>}
      </div>
      <div className="section-scroll">
        {items.map(anime => (
          <AnimeCard key={anime._id} anime={anime} onClick={() => onCard(anime)} />
        ))}
      </div>
    </section>
  );
};

const AnimeCard = ({ anime, onClick }) => (
  <div className="sc-card" onClick={onClick}>
    <div className="sc-card__img-wrap">
      <img
        src={anime.image || 'https://via.placeholder.com/200x280?text=No+Image'}
        alt={anime.title}
        className="sc-card__img"
      />
      <div className="sc-card__overlay">
        <span className="sc-card__score">★ {anime.userRating || anime.score || 'N/A'}</span>
      </div>
      {anime.type && <span className="sc-card__type-tag">{anime.type}</span>}
    </div>
    <div className="sc-card__info">
      <p className="sc-card__title">{anime.title}</p>
      <p className="sc-card__sub">{anime.genre || '—'} · {anime.year || '—'}</p>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────
const Home = () => {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [animeList,    setAnimeList]    = useState([]);
  const [watchingList, setWatchingList] = useState([]);
  const [completedList,setCompletedList]= useState([]);
  const [droppedList,  setDroppedList]  = useState([]);
  const [planList,     setPlanList]     = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [detailAnime,  setDetailAnime]  = useState(null);

  // Rating modal state
  const [ratingModal,  setRatingModal]  = useState(null);  // anime object
  const [userRating,   setUserRating]   = useState(0);

  const [newAnime, setNewAnime] = useState({
    title: '', episodes: '', score: '', genre: '',
    language: '', type: 'Anime', year: new Date().getFullYear(), image: '',
  });

  // AI recs
  const [aiRecs,        setAiRecs]        = useState([]);
  const [aiRecsLoading, setAiRecsLoading] = useState(false);
  const [aiRecsError,   setAiRecsError]   = useState('');

  const userId = user?.uid;

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => { fetchAnime(); }, []);
  useEffect(() => { loadLists(); }, [userId]);
  useEffect(() => {
    if (animeList.length === 0) return;
    fetchAiRecommendations();
  }, [animeList.length, watchingList.length]);

  // ── Firebase: fetch library ──────────────────────────────────
  const fetchAnime = async () => {
    try {
      const snap = await getDocs(collection(db, 'anime'));
      setAnimeList(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  // ── Firebase: load user lists ────────────────────────────────
  const loadLists = async () => {
    if (!userId) return;
    try {
      const ref  = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setWatchingList (d.watching    || []);
        setCompletedList(d.completed   || []);
        setDroppedList  (d.dropped     || []);
        setPlanList     (d.planToWatch || []);
      } else {
        await setDoc(ref, { watching: [], completed: [], dropped: [], planToWatch: [] });
      }
    } catch (e) { console.error(e); }
  };

  // ── Save all lists to Firebase ───────────────────────────────
  const saveLists = async (payload) => {
    try {
      await updateDoc(doc(db, 'users', userId), payload);
    } catch (e) { console.error(e); }
  };

  // ── Status helper ────────────────────────────────────────────
  const getStatus = (anime) => {
    const id = anime._id;
    if (watchingList .find(a => a._id === id)) return 'Watching';
    if (completedList.find(a => a._id === id)) return 'Completed';
    if (droppedList  .find(a => a._id === id)) return 'Dropped';
    if (planList     .find(a => a._id === id)) return 'Plan to Watch';
    return 'None';
  };

  // ── Update anime stats in Firestore ─────────────────────────
  // watchDelta: +1 when starting watch, -1 when dropped, 0 otherwise
  // rating: number 1-10 or null
  const updateAnimeStats = async (animeId, watchDelta = 0, rating = null) => {
    try {
      const animeRef = doc(db, 'anime', animeId);
      const updates  = {};

      // Watch/drop counter
      if (watchDelta !== 0) {
        updates.watchCount = increment(watchDelta);
      }

      // User rating → store per-user + recalculate avg
      if (rating !== null && userId) {
        // Read current ratings map first
        const snap = await getDoc(animeRef);
        const data = snap.data() || {};
        const ratings = { ...(data.userRatings || {}), [userId]: rating };
        const values  = Object.values(ratings).filter(v => typeof v === 'number');
        const avg     = values.length
          ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
          : rating;

        updates.userRatings = ratings;
        updates.avgRating   = avg;
        updates.score       = avg; // keep score in sync for AI context
      }

      await updateDoc(animeRef, updates);

      // Update local animeList state
      setAnimeList(prev => prev.map(a => {
        if (a._id !== animeId) return a;
        const next = { ...a };
        if (watchDelta !== 0) next.watchCount = (a.watchCount || 0) + watchDelta;
        if (rating !== null)  next.avgRating  = updates.avgRating;
        if (rating !== null)  next.score      = updates.score;
        return next;
      }));
    } catch (e) { console.error(e); }
  };

  // ── Change status with side-effects ─────────────────────────
  const changeStatus = async (anime, newStatus) => {
    const id            = anime._id;
    const currentStatus = getStatus(anime);

    // Remove from every list first
    let newW = watchingList .filter(a => a._id !== id);
    let newC = completedList.filter(a => a._id !== id);
    let newD = droppedList  .filter(a => a._id !== id);
    let newP = planList     .filter(a => a._id !== id);

    // ── watchCount delta ──────────────────────────────────────
    // +1 when starting to watch (from any non-watching state)
    // -1 when dropping (was watching)
    //  0 for everything else
    let watchDelta = 0;
    if (newStatus === 'Watching' && currentStatus !== 'Watching') watchDelta = +1;
    if (newStatus === 'Dropped'  && currentStatus === 'Watching') watchDelta = -1;
    // Removing from watching without dropping (toggle off) also -1
    if (newStatus === 'None'     && currentStatus === 'Watching') watchDelta = -1;

    // ── Watching → restore episodesWatched if coming from Dropped ──
    if (newStatus === 'Watching') {
      const dropped = droppedList.find(a => a._id === id);
      const watched = dropped?.episodesWatched || 0;
      newW.push({ ...anime, episodesWatched: watched });
    }

    // ── Dropped → episodesWatched - 1 ──
    if (newStatus === 'Dropped') {
      const watching = watchingList.find(a => a._id === id);
      const watched  = Math.max(0, (watching?.episodesWatched || 0) - 1);
      newD.push({ ...anime, episodesWatched: watched });
    }

    // ── Completed → open rating modal ──
    if (newStatus === 'Completed') {
      const watching = watchingList.find(a => a._id === id);
      newC.push({
        ...anime,
        episodesWatched: parseInt(anime.episodes) || watching?.episodesWatched || 0,
      });
      setTimeout(() => { setRatingModal(anime); setUserRating(0); }, 150);
    }

    if (newStatus === 'Plan to Watch') newP.push(anime);

    // Update local state
    setWatchingList (newW);
    setCompletedList(newC);
    setDroppedList  (newD);
    setPlanList     (newP);

    // Save user lists to Firestore
    await saveLists({ watching: newW, completed: newC, dropped: newD, planToWatch: newP });

    // Update anime document: watchCount ±1
    if (watchDelta !== 0) {
      await updateAnimeStats(id, watchDelta, null);
    }
  };

  // ── Submit user rating ────────────────────────────────────────
  const submitRating = async () => {
    if (!ratingModal || userRating === 0) {
      setRatingModal(null);
      return;
    }
    const id = ratingModal._id;

    // 1. Store userRating on the completed list entry (user-side)
    const newC = completedList.map(a =>
      a._id === id ? { ...a, userRating } : a
    );
    setCompletedList(newC);
    await saveLists({ completed: newC });

    // 2. Write to anime doc:
    //    - userRatings[userId] = rating
    //    - recalculate avgRating across all users
    //    - update score to keep AI context fresh
    await updateAnimeStats(id, 0, userRating);

    setRatingModal(null);
    setUserRating(0);
  };

  // ── Increment episodes watched (Watching page style) ─────────
  const incrementEpisodes = async (anime) => {
    const id      = anime._id;
    const current = watchingList.find(a => a._id === id);
    if (!current) return;

    const maxEp   = parseInt(anime.episodes) || 9999;
    const newCount= Math.min((current.episodesWatched || 0) + 1, maxEp);

    // Auto-complete if reached last episode
    if (newCount >= maxEp) {
      await changeStatus(anime, 'Completed');
      return;
    }

    const newW = watchingList.map(a =>
      a._id === id ? { ...a, episodesWatched: newCount } : a
    );
    setWatchingList(newW);
    await saveLists({ watching: newW });
  };

  // ── Add anime ────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnime(prev => ({ ...prev, [name]: value }));
  };

  const addNewAnime = async () => {
    if (!newAnime.title) return alert('Title required');
    try {
      const ref = await addDoc(collection(db, 'anime'), newAnime);
      setAnimeList(prev => [...prev, { _id: ref.id, ...newAnime }]);
      setNewAnime({ title:'',episodes:'',score:'',genre:'',language:'',type:'Anime',year:new Date().getFullYear(),image:'' });
      setShowForm(false);
    } catch (e) { console.error(e); }
  };

  // ── AI Recommendations ───────────────────────────────────────
  const fetchAiRecommendations = async () => {
    setAiRecsLoading(true);
    setAiRecsError('');
    try {
      const watched    = watchingList .map(a => a.title).slice(0, 20);
      const doneIds    = new Set([
        ...completedList.map(a => a._id),
        ...watchingList .map(a => a._id),
        ...droppedList  .map(a => a._id),
      ]);
      // Sort by watchCount so popular titles appear first
      const library = animeList
        .filter(a => !doneIds.has(a._id))
        .sort((a, b) => (b.watchCount||0) - (a.watchCount||0))
        .map(a => (
          a.title +
          ' (type:'    + (a.type||'?') +
          ', genre:'   + (a.genre||'?') +
          ', year:'    + (a.year||'?') +
          ', score:'   + (a.avgRating||a.score||'?') +
          ', watches:' + (a.watchCount||0) + ')'
        ))
        .join('\n');

      const completedStr = completedList
        .map(a => a.title + (a.userRating ? ' (rated ' + a.userRating + '/10)' : ''))
        .join(', ') || 'None';

      const droppedStr = droppedList.map(a => a.title).join(', ') || 'None';
      const watchedStr = watched.length > 0 ? watched.join(', ') : 'None';

      const prompt = [
        'You are an anime/serial/movie recommendation engine.',
        '',
        'USER PROFILE:',
        '- Currently watching: ' + watchedStr,
        '- Completed: '          + completedStr,
        '- Dropped (disliked): ' + droppedStr,
        '',
        'LIBRARY (sorted by popularity, with community stats):',
        library,
        '',
        'RULES:',
        '- Pick exactly 8 titles the user has NOT watched from the library above.',
        '- Avoid genres/types similar to dropped titles.',
        '- Favour titles with high watches and score.',
        '- Ensure variety: mix genres and types.',
        '- Return ONLY a JSON array of title strings exactly as shown. No other text.',
        'Example: ["Title A","Title B"]',
      ].join('\n');

      console.log(process.env.REACT_APP_API_URL);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await res.json();
      const raw = data.message || '[]';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const titles  = JSON.parse(cleaned);
      const recs    = titles
        .map(t => animeList.find(a => a.title === t))
        .filter(Boolean)
        .slice(0, 8);
      setAiRecs(recs);
    } catch (err) {
      console.error('AI recs error:', err);
      setAiRecsError('Could not load recommendations.');
      setAiRecs(shuffle(animeList).slice(0, 8));
    } finally {
      setAiRecsLoading(false);
    }
  };

  // ── Derived lists ────────────────────────────────────────────
  const byScore  = (a, b) => (parseFloat(b.score)||0) - (parseFloat(a.score)||0);
  const topRated = [...animeList].sort(byScore).slice(0, 10);
  const animes   = animeList.filter(a => a.type === 'Anime') .sort(byScore).slice(0, 10);
  const serials  = animeList.filter(a => a.type === 'Serial' || a.type === 'Drama').sort(byScore).slice(0, 10);
  const movies   = animeList.filter(a => a.type === 'Movie') .sort(byScore).slice(0, 10);
  const continueW= watchingList .slice(0, 10);
  const planned  = planList     .slice(0, 8);

  const qvStatus = detailAnime ? getStatus(detailAnime) : 'None';
  const qvWatching = detailAnime
    ? watchingList.find(a => a._id === detailAnime._id)
    : null;

  return (
    <div className={`home ${theme}`}>

      {/* ── TOP BAR ── */}
      <div className="home-topbar">
        <div className="home-topbar__left">
          <h1 className="home-greeting">
            👋 Hey, <span>{user?.name || 'there'}</span>
          </h1>
          <p className="home-sub">What are you watching today?</p>
        </div>
        <button className="toggle-form-btn" onClick={() => setShowForm(true)}>
          + Add Series
        </button>
      </div>

      {/* ── HERO BANNER ── */}
      {topRated[0] && (
        <div className="hero-banner" onClick={() => setDetailAnime(topRated[0])}>
          <img src={topRated[0].image} alt={topRated[0].title} className="hero-banner__img" />
          <div className="hero-banner__gradient" />
          <div className="hero-banner__glass">
            <span className="hero-banner__tag"># 1 Top Rated</span>
            <h2 className="hero-banner__title">{topRated[0].title}</h2>
            <p className="hero-banner__meta">
              {topRated[0].genre} · {topRated[0].year} · ★ {topRated[0].score}
            </p>
            <button className="hero-banner__btn"
              onClick={e => { e.stopPropagation(); setDetailAnime(topRated[0]); }}>
              View Details
            </button>
          </div>
        </div>
      )}

      {/* ── CONTINUE WATCHING ── */}
      {continueW.length > 0 && (
        <Section title="Continue Watching" badge="In Progress" items={continueW} onCard={setDetailAnime} />
      )}

      {/* ── AI RECOMMENDED ── */}
      <section className="home-section">
        <div className="section-head">
          <h2 className="section-title">Recommended For You</h2>
          <span className="section-badge ai-badge">✦ AI Picks</span>
          <button className="ai-refresh-btn" onClick={fetchAiRecommendations}
            disabled={aiRecsLoading} title="Refresh">
            {aiRecsLoading ? '...' : '↻'}
          </button>
        </div>
        {aiRecsLoading && (
          <div className="ai-recs-loading">
            <div className="ai-recs-loading__dots"><span /><span /><span /></div>
            <p>Gemini is picking titles for you…</p>
          </div>
        )}
        {aiRecsError && !aiRecsLoading && <p className="ai-recs-error">{aiRecsError}</p>}
        {!aiRecsLoading && aiRecs.length > 0 && (
          <div className="section-scroll">
            {aiRecs.map(anime => (
              <AnimeCard key={anime._id} anime={anime} onClick={() => setDetailAnime(anime)} />
            ))}
          </div>
        )}
      </section>

      {/* ── TOP RATED ── */}
      <Section title="Top Rated" badge="⭐ Highest Scores" items={topRated} onCard={setDetailAnime} />

      {animes .length > 0 && <Section title="Anime Series"    badge="Anime"          items={animes}  onCard={setDetailAnime} />}
      {serials.length > 0 && <Section title="Serials & Dramas" badge="Serial · Drama" items={serials} onCard={setDetailAnime} />}
      {movies .length > 0 && <Section title="Movies"           badge="Film"           items={movies}  onCard={setDetailAnime} />}
      {planned.length > 0 && <Section title="Your Plan to Watch" badge="Up Next"      items={planned} onCard={setDetailAnime} />}

      {/* ── ALL TITLES GRID ── */}
      <section className="home-section">
        <div className="section-head">
          <h2 className="section-title">All Titles</h2>
          <span className="section-badge">{animeList.length} titles</span>
        </div>
        <div className="anime-grid">
          {animeList.map(anime => {
            const status   = getStatus(anime);
            const watching = watchingList.find(a => a._id === anime._id);
            return (
              <div className="anime-card" key={anime._id}>
                <img className="anime-image"
                  src={anime.image || 'https://via.placeholder.com/200x280?text=No+Image'}
                  alt={anime.title}
                  onClick={() => setDetailAnime(anime)}
                />
                <div className="anime-info">
                  <h3 onClick={() => setDetailAnime(anime)}>{anime.title}</h3>
                  <p>Episodes: {anime.episodes}</p>
                  <p>Rating: {anime.score}</p>
                  <p>Language: {anime.language}</p>

                  {/* Episode progress bar if watching */}
                  {status === 'Watching' && watching && (
                    <div className="ep-progress-wrap">
                      <div className="ep-progress">
                        <div className="ep-progress__bar"
                          style={{ width: anime.episodes
                            ? ((watching.episodesWatched / anime.episodes) * 100) + '%'
                            : '0%' }}
                        />
                      </div>
                      <div className="ep-progress__controls">
                        <span className="ep-count">
                          {watching.episodesWatched}/{anime.episodes || '?'} ep
                        </span>
                        <button className="ep-btn" onClick={e => { e.stopPropagation(); incrementEpisodes(anime); }}>
                          +1 ep
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="anime-action-buttons">
                    <button
                      disabled={status === 'Plan to Watch' || status === 'Completed'}
                      className={'status-btn' + (status === 'Watching' ? ' active-watching' : '')}
                      onClick={() => changeStatus(anime, status === 'Watching' ? 'None' : 'Watching')}
                    >
                      {status === 'Watching' ? 'Watching' : 'Watch'}
                    </button>
                    <button
                      disabled={status === 'Watching' || status === 'Completed'}
                      className={'status-btn' + (status === 'Plan to Watch' ? ' active-plan' : '')}
                      onClick={() => changeStatus(anime, status === 'Plan to Watch' ? 'None' : 'Plan to Watch')}
                    >
                      {status === 'Plan to Watch' ? 'Planned' : 'Plan'}
                    </button>
                    <button
                      disabled={status === 'Completed'}
                      className={'status-btn' + (status === 'Dropped' ? ' active-dropped' : '')}
                      onClick={() => changeStatus(anime, status === 'Dropped' ? 'None' : 'Dropped')}
                    >
                      {status === 'Dropped' ? 'Dropped' : 'Drop'}
                    </button>
                    {status === 'Watching' && (
                      <button
                        className="status-btn active-complete"
                        onClick={() => changeStatus(anime, 'Completed')}
                      >
                        ✓ Done
                      </button>
                    )}
                  </div>

                  {/* Completed badge with user rating */}
                  {status === 'Completed' && (
                    <div className="completed-badge">
                      ✅ Completed
                      {completedList.find(a => a._id === anime._id)?.userRating && (
                        <span className="user-rating-badge">
                          ★ {completedList.find(a => a._id === anime._id).userRating}/10
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ADD ANIME MODAL ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add Series</h2>
            <div className="form-grid">
              {['title','episodes','genre','score','language','image'].map(field => (
                <input key={field} type="text" name={field} placeholder={field}
                  value={newAnime[field]} onChange={handleInputChange} />
              ))}
              <select name="type" value={newAnime.type} onChange={handleInputChange}>
                <option value="Anime">Anime</option>
                <option value="Serial">Serial</option>
                <option value="Movie">Movie</option>
                <option value="Drama">Drama</option>
              </select>
              <input type="number" name="year" value={newAnime.year} onChange={handleInputChange} />
              <button className="submit-btn" onClick={addNewAnime}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK-VIEW MODAL ── */}
      {detailAnime && (
        <div className="modal-overlay" onClick={() => setDetailAnime(null)}>
          <div className="qv-modal" onClick={e => e.stopPropagation()}>
            <button className="qv-close" onClick={() => setDetailAnime(null)}>✕</button>
            <div className="qv-inner">
              <img className="qv-img"
                src={detailAnime.image || 'https://via.placeholder.com/200x280?text=No+Image'}
                alt={detailAnime.title}
              />
              <div className="qv-info">
                <span className="qv-type">{detailAnime.type}</span>
                <h2 className="qv-title">{detailAnime.title}</h2>

                <div className="qv-meta-grid">
                  {[
                    ['Genre',    detailAnime.genre],
                    ['Episodes', detailAnime.episodes],
                    ['Rating',   '★ ' + detailAnime.score],
                    ['Year',     detailAnime.year],
                    ['Language', detailAnime.language],
                  ].map(([label, val]) => val && (
                    <div key={label} className="qv-meta-item">
                      <span className="qv-meta-label">{label}</span>
                      <span className="qv-meta-val">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Episode progress in modal */}
                {qvStatus === 'Watching' && qvWatching && (
                  <div className="qv-ep-row">
                    <span className="qv-ep-count">
                      {qvWatching.episodesWatched} / {detailAnime.episodes || '?'} episodes
                    </span>
                    <button className="ep-btn"
                      onClick={() => incrementEpisodes(detailAnime)}>
                      +1 ep
                    </button>
                  </div>
                )}

                {/* User rating if completed */}
                {qvStatus === 'Completed' && (
                  <div className="qv-user-rating">
                    <span className="qv-meta-label">Your Rating</span>
                    <StarRating
                      value={completedList.find(a => a._id === detailAnime._id)?.userRating || 0}
                      readOnly
                    />
                  </div>
                )}

                <div className="qv-actions">
                  <button
                    disabled={qvStatus === 'Plan to Watch' || qvStatus === 'Completed'}
                    className={'status-btn' + (qvStatus === 'Watching' ? ' active-watching' : '')}
                    onClick={() => changeStatus(detailAnime, qvStatus === 'Watching' ? 'None' : 'Watching')}
                  >
                    {qvStatus === 'Watching' ? '✓ Watching' : '+ Watch'}
                  </button>
                  <button
                    disabled={qvStatus === 'Watching' || qvStatus === 'Completed'}
                    className={'status-btn' + (qvStatus === 'Plan to Watch' ? ' active-plan' : '')}
                    onClick={() => changeStatus(detailAnime, qvStatus === 'Plan to Watch' ? 'None' : 'Plan to Watch')}
                  >
                    {qvStatus === 'Plan to Watch' ? '✓ Planned' : '+ Plan'}
                  </button>
                  <button
                    disabled={qvStatus === 'Completed'}
                    className={'status-btn' + (qvStatus === 'Dropped' ? ' active-dropped' : '')}
                    onClick={() => changeStatus(detailAnime, qvStatus === 'Dropped' ? 'None' : 'Dropped')}
                  >
                    {qvStatus === 'Dropped' ? 'Dropped' : 'Drop'}
                  </button>
                  {qvStatus === 'Watching' && (
                    <button className="status-btn active-complete"
                      onClick={() => { changeStatus(detailAnime, 'Completed'); setDetailAnime(null); }}>
                      ✓ Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RATING MODAL (shown after marking Complete) ── */}
      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="rating-modal" onClick={e => e.stopPropagation()}>
            <h3 className="rating-modal__title">Rate {ratingModal.title}</h3>
            <p className="rating-modal__sub">How would you rate this?</p>
            <StarRating value={userRating} onChange={setUserRating} />
            <div className="rating-modal__actions">
              <button className="submit-btn" onClick={submitRating}
                disabled={userRating === 0}>
                Submit Rating
              </button>
              <button className="grey-btn" onClick={() => setRatingModal(null)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;