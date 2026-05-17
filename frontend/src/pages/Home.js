// frontend/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import './Home.css';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [animeList, setAnimeList] = useState([]);
  const [watchingList, setWatchingList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [onHoldList, setOnHoldList] = useState([]);
  const [droppedList, setDroppedList] = useState([]);
  const [planList, setPlanList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newAnime, setNewAnime] = useState({
    title: '',
    episodes: '',
    score: '',
    genre: '',
    type: 'Anime',
    year: new Date().getFullYear(),
    image: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  const userId = user?._id || user?.id || 'guest';

  // Load lists for this user
  const loadLists = () => {
    setWatchingList(JSON.parse(localStorage.getItem(`watchingList_${userId}`)) || []);
    setCompletedList(JSON.parse(localStorage.getItem(`completedList_${userId}`)) || []);
    setOnHoldList(JSON.parse(localStorage.getItem(`onHoldList_${userId}`)) || []);
    setDroppedList(JSON.parse(localStorage.getItem(`droppedList_${userId}`)) || []);
    setPlanList(JSON.parse(localStorage.getItem(`planToWatchList_${userId}`)) || []);

    const storedAnime = JSON.parse(localStorage.getItem('animeList')) || [];
    setAnimeList(storedAnime);
  };

  useEffect(() => {
    loadLists();
    const handleStorage = (e) => {
      if (e.key?.includes(userId)) loadLists();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userId]);

  useEffect(() => {
    fetch('process.env.REACT_APP_API_URL/api/anime')
      .then(res => res.json())
      .then(data => {
        setAnimeList(data);
        localStorage.setItem('animeList', JSON.stringify(data)); // save globally
      })
      .catch(err => console.error(err));
  }, []);

  const getStatus = (anime) => {
    const id = anime._id || anime.mal_id;
    if (completedList.find(a => (a._id || a.mal_id) === id)) return 'Completed';
    if (watchingList.find(a => (a._id || a.mal_id) === id)) return 'Watching';
    if (onHoldList.find(a => (a._id || a.mal_id) === id)) return 'On Hold';
    if (droppedList.find(a => (a._id || a.mal_id) === id)) return 'Dropped';
    if (planList.find(a => (a._id || a.mal_id) === id)) return 'Plan to Watch';
    return null;
  };

  const saveList = (name, list) => {
    localStorage.setItem(`${name}_${userId}`, JSON.stringify(list));
  };

  const addToWatching = (anime) => {
    if (!getStatus(anime)) {
      const updated = [...watchingList, { ...anime, episodesWatched: 0 }];
      setWatchingList(updated);
      saveList('watchingList', updated);
    }
  };

  const addToPlan = (anime) => {
    if (!getStatus(anime)) {
      const updated = [...planList, anime];
      setPlanList(updated);
      saveList('planToWatchList', updated);
    }
  };

  const updateEpisodeCount = (animeId, change) => {
    const updatedWatching = watchingList.map(anime => {
      const id = anime._id || anime.mal_id;
      if (id === animeId) {
        let newCount = (anime.episodesWatched || 0) + change;
        newCount = Math.max(0, Math.min(newCount, anime.episodes || 0));
        if (newCount === anime.episodes) {
          const newCompleted = [...completedList, { ...anime, episodesWatched: newCount }];
          setCompletedList(newCompleted);
          saveList('completedList', newCompleted);
          return null;
        }
        return { ...anime, episodesWatched: newCount };
      }
      return anime;
    }).filter(Boolean);

    setWatchingList(updatedWatching);
    saveList('watchingList', updatedWatching);
  };

  const moveToList = (anime, targetListName) => {
    const id = anime._id || anime.mal_id;

    const updatedWatchingList = watchingList.filter(a => (a._id || a.mal_id) !== id);
    setWatchingList(updatedWatchingList);
    saveList('watchingList', updatedWatchingList);

    const targetList = JSON.parse(localStorage.getItem(`${targetListName}_${userId}`)) || [];
    targetList.push(anime);
    localStorage.setItem(`${targetListName}_${userId}`, JSON.stringify(targetList));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnime(prev => ({ ...prev, [name]: value }));
  };

  const addNewAnime = () => {
    if (!newAnime.title) return alert('Title required');
    const newEntry = { ...newAnime, mal_id: Date.now() };
    const updatedAnimeList = [...animeList, newEntry];
    setAnimeList(updatedAnimeList);
    localStorage.setItem('animeList', JSON.stringify(updatedAnimeList)); // persist globally
    setNewAnime({ title: '', episodes: '', score: '', genre: '', type: 'Anime', year: new Date().getFullYear(), image: '' });
    setShowForm(false);
  };

  return (
    <div className={`home ${theme}`}>
      <button className="toggle-form-btn" onClick={() => setShowForm(true)}>Add New Anime</button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ background:'#2980b9', color:'white'}}>Enter your series details to track it</h2>
            <div className="form-grid">
              {['title','episodes','genre','score','image'].map(field => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type={field==='episodes' || field==='score' ? 'number' : 'text'}
                    name={field}
                    value={newAnime[field]}
                    onChange={handleInputChange}
                    placeholder={field==='image' ? 'Paste image URL' : `Enter ${field}`}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Type</label>
                <select name="type" value={newAnime.type} onChange={handleInputChange}>
                  <option value="Anime">Anime</option>
                  <option value="Serial">Serial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" name="year" value={newAnime.year} onChange={handleInputChange} min="1900" max={new Date().getFullYear()} />
              </div>
              <div className="form-group full-width">
                <button onClick={addNewAnime} className="submit-btn">Add Anime</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="home-section">
        {['Top Anime','Serials','New Releases','Popular in Action Genre'].map((title, idx) => {
          let data = [];
          if (title === 'Top Anime') data = animeList.filter(a => a.type === 'Anime');
          if (title === 'Serials') data = animeList.filter(a => a.type === 'Serial');
          if (title === 'New Releases') data = animeList.filter(a => a.year >= 2023);
          if (title === 'Popular in Action Genre') data = animeList.filter(a => a.genre?.toLowerCase() === 'action');
          return <AnimeSection key={idx} title={title} data={data} addToWatching={addToWatching} addToPlan={addToPlan} updateEpisode={updateEpisodeCount} getStatus={getStatus} watchingList={watchingList} />;
        })}

        {['Watching','Completed','On Hold','Dropped','Plan to Watch'].map(listName => {
          const listData = {
            'Watching': watchingList,
            'Completed': completedList,
            'On Hold': onHoldList,
            'Dropped': droppedList,
            'Plan to Watch': planList
          }[listName];
          return <AnimeSection key={listName} title={listName} data={listData} addToWatching={addToWatching} addToPlan={addToPlan} updateEpisode={updateEpisodeCount} getStatus={getStatus} watchingList={watchingList} />;
        })}
      </div>
    </div>
  );
};

const AnimeSection = ({ title, data, addToWatching, addToPlan, updateEpisode, getStatus, watchingList }) => {
  if (!data || !data.length) return null;
  return (
    <div className="section-block">
      <h2 className="section-title">{title}</h2>
      <div className="anime-grid">
        {data.map(anime => {
          const id = anime._id || anime.mal_id;
          const status = getStatus(anime);
          const inWatching = watchingList.find(a => (a._id || a.mal_id) === id);
          const imageUrl = anime.image || anime.images?.jpg?.image_url || 'https://via.placeholder.com/220x320?text=No+Image';

          return (
            <div className="anime-card" key={id}>
              <img className="anime-image" src={imageUrl} alt={anime.title} />
              {status && <span className={`badge badge-${status.replace(/ /g,'').toLowerCase()}`}>{status}</span>}
              <div className="anime-info">
                <h3>{anime.title}</h3>
                <p>{`Episodes: ${anime.episodes || '?'}`}</p>
                <p>{`Rating: ${anime.score || 'N/A'}`}</p>

                {!status && (
                  <div className="anime-action-buttons">
                    <button className="add-btn" onClick={() => addToWatching(anime)}>Add to Watching</button>
                    <button className="plan-btn" onClick={() => addToPlan(anime)}>Plan to Watch</button>
                  </div>
                )}

                {inWatching && (
                  <div className="episode-controls">
                    <button onClick={() => updateEpisode(id, -1)} disabled={(inWatching.episodesWatched || 0) === 0}>−</button>
                    <span>{inWatching.episodesWatched || 0} / {anime.episodes || '?'}</span>
                    <button onClick={() => updateEpisode(id, 1)} disabled={(inWatching.episodesWatched || 0) >= (anime.episodes || 0)}>＋</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
