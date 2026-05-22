// frontend/src/pages/PlanToWatch.js

import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase';

import {
  useAuth,
} from '../contexts/AuthContext';

import './PlanToWatch.css';

const PlanToWatch = () => {

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [planList,
    setPlanList] =
    useState([]);

  const [watchingList,
    setWatchingList] =
    useState([]);

  useEffect(() => {

    if (!user) {
      navigate('/login');
    }

  }, [user, navigate]);

  const userId =
    user?.uid;

  // =========================
  // LOAD DATA
  // =========================

  const loadLists =
    async () => {

      if (!userId)
        return;

      try {

        const userRef =
          doc(
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

          setPlanList(
            data.planToWatch ||
            []
          );

          setWatchingList(
            data.watching ||
            []
          );
        }

      } catch (err) {

        console.error(
          err
        );

      }
    };

  useEffect(() => {

    loadLists();

  }, [userId]);

  // =========================
  // UPDATE FIREBASE
  // =========================

  const updateLists =
    async (
      newPlan,
      newWatching
    ) => {

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
            planToWatch:
              newPlan,

            watching:
              newWatching,
          }
        );

      } catch (err) {

        console.error(
          err
        );

      }
    };

  // =========================
  // REMOVE ONE
  // =========================

  const removeAnime =
    async (id) => {

      const updated =
        planList.filter(
          (anime) =>
            anime._id !==
            id
        );

      setPlanList(
        updated
      );

      await updateLists(
        updated,
        watchingList
      );
    };

  // =========================
  // REMOVE ALL
  // =========================

  const removeAll =
    async () => {

      setPlanList([]);

      await updateLists(
        [],
        watchingList
      );
    };

  // =========================
  // MOVE TO WATCHING
  // =========================

  const moveToWatching =
    async (
      anime
    ) => {

      const animeId =
        anime._id;

      // REMOVE FROM PLAN

      const updatedPlan =
        planList.filter(
          (a) =>
            a._id !==
            animeId
        );

      // CHECK DUPLICATE

      const alreadyExists =
        watchingList.find(
          (a) =>
            a._id ===
            animeId
        );

      let updatedWatching =
        [...watchingList];

      if (
        !alreadyExists
      ) {

        updatedWatching.push({
          ...anime,
          episodesWatched:
            anime
              .episodesWatched ||
            0,
        });
      }

      // UPDATE STATE

      setPlanList(
        updatedPlan
      );

      setWatchingList(
        updatedWatching
      );

      // UPDATE FIREBASE

      await updateLists(
        updatedPlan,
        updatedWatching
      );
    };

  return (

    <div className="plan-container">

      <h2>
        📝 Plan To Watch
      </h2>

      {planList.length >
        0 && (

        <button
          className="remove-all-btn"
          onClick={
            removeAll
          }
        >
          🗑 Remove All
        </button>
      )}

      {planList.length ===
      0 ? (

        <p>
          No anime in your
          plan list.
        </p>

      ) : (

        <div className="plan-list">

          {planList.map(
            (
              anime
            ) => {

              const id =
                anime._id;

              const imageUrl =
                anime.image ||
                'https://via.placeholder.com/150x220?text=No+Image';

              return (

                <div
                  key={id}
                  className="plan-card"
                >

                  <Link
                    to={`/anime/${id}`}
                  >

                    <img
                      src={
                        imageUrl
                      }
                      alt={
                        anime.title
                      }
                    />

                  </Link>

                  <div className="plan-card-info">

                    <h4>
                      {
                        anime.title
                      }
                    </h4>

                    <p>
                      Episodes:
                      {' '}
                      {
                        anime.episodes
                      }
                    </p>

                    <p>
                      Rating:
                      {' '}
                      {
                        anime.score
                      }
                    </p>

                    <div className="plan-card-buttons">

                      <button
                        className="move-btn"
                        onClick={() =>
                          moveToWatching(
                            anime
                          )
                        }
                      >
                        ▶ Move To Watching
                      </button>

                      <button
                        className="remove-btn"
                        onClick={() =>
                          removeAnime(
                            id
                          )
                        }
                      >
                        🗑 Remove
                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
};

export default PlanToWatch;