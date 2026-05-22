// frontend/src/pages/Home.js

import React, {
  useEffect,
  useState,
} from 'react';

import './Home.css';

import { useTheme } from '../ThemeContext';

import { useNavigate } from 'react-router-dom';

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase';

import { useAuth } from '../contexts/AuthContext';

const Home = () => {

  const { theme } = useTheme();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [animeList, setAnimeList] =
    useState([]);

  const [watchingList, setWatchingList] =
    useState([]);

  const [planList, setPlanList] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [newAnime, setNewAnime] =
    useState({
      title: '',
      episodes: '',
      score: '',
      genre: '',
      type: 'Anime',
      year:
        new Date().getFullYear(),
      image: '',
    });

  // =========================
  // AUTH
  // =========================

  useEffect(() => {

    if (!user) {
      navigate('/login');
    }

  }, [user, navigate]);

  const userId = user?.uid;

  // =========================
  // FETCH ANIME
  // =========================

  useEffect(() => {

    fetchAnime();

  }, []);

  const fetchAnime = async () => {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            'anime'
          )
        );

      const animeData =
        snapshot.docs.map(
          (doc) => ({
            _id: doc.id,
            ...doc.data(),
          })
        );

      setAnimeList(
        animeData
      );

    } catch (err) {

      console.error(err);

    }
  };

  // =========================
  // LOAD USER LISTS
  // =========================

  const loadLists = async () => {

    if (!userId)
      return;

    try {

      const userRef = doc(
        db,
        'users',
        userId
      );

      const userSnap =
        await getDoc(
          userRef
        );

      if (
        userSnap.exists()
      ) {

        const data =
          userSnap.data();

        setWatchingList(
          data.watching ||
            []
        );

        setPlanList(
          data.planToWatch ||
            []
        );

      } else {

        await setDoc(
          userRef,
          {
            watching: [],
            planToWatch: [],
          }
        );

      }

    } catch (err) {

      console.error(err);

    }
  };

  useEffect(() => {

    loadLists();

  }, [userId]);

  // =========================
  // GET STATUS
  // =========================

  const getStatus = (
    anime
  ) => {

    const id =
      anime._id;

    if (
      watchingList.find(
        (a) =>
          a._id === id
      )
    ) {
      return 'Watching';
    }

    if (
      planList.find(
        (a) =>
          a._id === id
      )
    ) {
      return 'Plan to Watch';
    }

    return 'None';
  };

  // =========================
  // CHANGE STATUS
  // =========================

  const changeStatus =
    async (
      anime,
      status
    ) => {

      const animeId =
        anime._id;

      // REMOVE FROM BOTH

      const newWatching =
        watchingList.filter(
          (a) =>
            a._id !==
            animeId
        );

      const newPlan =
        planList.filter(
          (a) =>
            a._id !==
            animeId
        );

      // ADD TO CURRENT

      if (
        status ===
        'Watching'
      ) {

        newWatching.push({
          ...anime,
          episodesWatched: 0,
        });
      }

      if (
        status ===
        'Plan to Watch'
      ) {

        newPlan.push(
          anime
        );
      }

      // UPDATE STATE

      setWatchingList(
        newWatching
      );

      setPlanList(
        newPlan
      );

      // UPDATE FIREBASE

      try {

        const userRef =
          doc(
            db,
            'users',
            userId
          );

        await updateDoc(
          userRef,
          {
            watching:
              newWatching,

            planToWatch:
              newPlan,
          }
        );

      } catch (err) {

        console.error(
          err
        );

      }
    };

  // =========================
  // UPDATE EPISODES
  // =========================

  const updateEpisodeCount =
    async (
      animeId,
      change
    ) => {

      const updatedWatching =
        watchingList.map(
          (anime) => {

            if (
              anime._id ===
              animeId
            ) {

              let newCount =
                (
                  anime.episodesWatched ||
                  0
                ) + change;

              newCount =
                Math.max(
                  0,
                  Math.min(
                    newCount,
                    anime.episodes
                  )
                );

              return {
                ...anime,
                episodesWatched:
                  newCount,
              };
            }

            return anime;
          }
        );

      setWatchingList(
        updatedWatching
      );

      try {

        const userRef =
          doc(
            db,
            'users',
            userId
          );

        await updateDoc(
          userRef,
          {
            watching:
              updatedWatching,
          }
        );

      } catch (err) {

        console.error(
          err
        );

      }
    };

  // =========================
  // INPUT CHANGE
  // =========================

  const handleInputChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;

      setNewAnime(
        (prev) => ({
          ...prev,
          [name]:
            value,
        })
      );
    };

  // =========================
  // ADD ANIME
  // =========================

  const addNewAnime =
    async () => {

      if (
        !newAnime.title
      ) {

        return alert(
          'Title required'
        );
      }

      try {

        const docRef =
          await addDoc(
            collection(
              db,
              'anime'
            ),
            newAnime
          );

        const addedAnime =
          {
            _id:
              docRef.id,
            ...newAnime,
          };

        setAnimeList(
          (prev) => [
            ...prev,
            addedAnime,
          ]
        );

        setNewAnime({
          title: '',
          episodes: '',
          score: '',
          genre: '',
          type:
            'Anime',
          year:
            new Date().getFullYear(),
          image: '',
        });

        setShowForm(
          false
        );

      } catch (err) {

        console.error(
          err
        );

      }
    };

  return (
    <div
      className={`home ${theme}`}
    >

      {/* ADD BUTTON */}

      <button
        className="toggle-form-btn"
        onClick={() =>
          setShowForm(
            true
          )
        }
      >
        + Add Anime
      </button>

      {/* MODAL */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowForm(
              false
            )
          }
        >

          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2>
              Add Anime
            </h2>

            <div className="form-grid">

              {[
                'title',
                'episodes',
                'genre',
                'score',
                'image',
              ].map(
                (
                  field
                ) => (

                  <input
                    key={
                      field
                    }
                    type="text"
                    name={
                      field
                    }
                    placeholder={
                      field
                    }
                    value={
                      newAnime[
                        field
                      ]
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                )
              )}

              <select
                name="type"
                value={
                  newAnime.type
                }
                onChange={
                  handleInputChange
                }
              >

                <option value="Anime">
                  Anime
                </option>

                <option value="Serial">
                  Serial
                </option>

                <option value="Movie">
                  Movie
                </option>

                <option value="Drama">
                  Drama
                </option>

              </select>

              <input
                type="number"
                name="year"
                value={
                  newAnime.year
                }
                onChange={
                  handleInputChange
                }
              />

              <button
                className="submit-btn"
                onClick={
                  addNewAnime
                }
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ANIME GRID */}

      <div className="anime-grid">

        {animeList.map(
          (
            anime
          ) => {

            const status =
              getStatus(
                anime
              );

            const inWatching =
              watchingList.find(
                (a) =>
                  a._id ===
                  anime._id
              );

            return (

              <div
                className="anime-card"
                key={
                  anime._id
                }
              >

                <img
                  className="anime-image"
                  src={
                    anime.image
                  }
                  alt={
                    anime.title
                  }
                />

                <div className="anime-info">

                  <h3>
                    {
                      anime.title
                    }
                  </h3>

                  <p>
                    Episodes:{' '}
                    {
                      anime.episodes
                    }
                  </p>

                  <p>
                    Rating:{' '}
                    {
                      anime.score
                    }
                  </p>

                  {/* BUTTONS */}

                  <div className="anime-action-buttons">

                    {/* WATCHING */}

                    <button
                      disabled={
                        status ===
                        'Plan to Watch'
                      }
                      className={`status-btn ${
                        status ===
                        'Watching'
                          ? 'active-watching'
                          : ''
                      }`}
                      onClick={() =>
                        changeStatus(
                          anime,
                          status ===
                            'Watching'
                            ? 'None'
                            : 'Watching'
                        )
                      }
                    >
                      {status ===
                      'Watching'
                        ? 'Watching'
                        : 'Add Watching'}
                    </button>

                    {/* PLAN */}

                    <button
                      disabled={
                        status ===
                        'Watching'
                      }
                      className={`status-btn ${
                        status ===
                        'Plan to Watch'
                          ? 'active-plan'
                          : ''
                      }`}
                      onClick={() =>
                        changeStatus(
                          anime,
                          status ===
                            'Plan to Watch'
                            ? 'None'
                            : 'Plan to Watch'
                        )
                      }
                    >
                      {status ===
                      'Plan to Watch'
                        ? 'Planned'
                        : 'Plan To Watch'}
                    </button>

                  </div>
                  
                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
};

export default Home;