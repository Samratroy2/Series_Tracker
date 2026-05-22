// frontend/src/pages/Watching.js

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

import './Watching.css';

const Watching = () => {

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [watchingList,
    setWatchingList] =
    useState([]);

  const [completedList,
    setCompletedList] =
    useState([]);

  const [onHoldList,
    setOnHoldList] =
    useState([]);

  const [droppedList,
    setDroppedList] =
    useState([]);

  useEffect(() => {

    if (!user) {
      navigate('/login');
    }

  }, [user, navigate]);

  const userId =
    user?.uid;

  // =========================
  // LOAD USER DATA
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

          setWatchingList(
            data.watching ||
            []
          );

          setCompletedList(
            data.completed ||
            []
          );

          setOnHoldList(
            data.onHold ||
            []
          );

          setDroppedList(
            data.dropped ||
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
    async ({
      watching =
        watchingList,
      completed =
        completedList,
      onHold =
        onHoldList,
      dropped =
        droppedList,
    }) => {

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
            watching,
            completed,
            onHold,
            dropped,
          }
        );

      } catch (err) {

        console.error(
          err
        );

      }
    };

  // =========================
  // REMOVE
  // =========================

  const handleRemove =
    async (
      animeId
    ) => {

      const updated =
        watchingList.filter(
          (
            anime
          ) =>
            anime._id !==
            animeId
        );

      setWatchingList(
        updated
      );

      await updateLists(
        {
          watching:
            updated,
        }
      );
    };

  // =========================
  // REMOVE ALL
  // =========================

  const handleRemoveAll =
    async () => {

      setWatchingList(
        []
      );

      await updateLists(
        {
          watching:
            [],
        }
      );
    };

  // =========================
  // MOVE TO OTHER LIST
  // =========================

  const moveToList =
    async (
      anime,
      target
    ) => {

      const animeId =
        anime._id;

      // REMOVE FROM WATCHING

      const updatedWatching =
        watchingList.filter(
          (
            item
          ) =>
            item._id !==
            animeId
        );

      setWatchingList(
        updatedWatching
      );

      // COMPLETED

      if (
        target ===
        'completed'
      ) {

        const updatedCompleted =
          [
            ...completedList,
            anime,
          ];

        setCompletedList(
          updatedCompleted
        );

        await updateLists(
          {
            watching:
              updatedWatching,

            completed:
              updatedCompleted,
          }
        );
      }

      // ON HOLD

      if (
        target ===
        'onHold'
      ) {

        const updatedOnHold =
          [
            ...onHoldList,
            anime,
          ];

        setOnHoldList(
          updatedOnHold
        );

        await updateLists(
          {
            watching:
              updatedWatching,

            onHold:
              updatedOnHold,
          }
        );
      }

      // DROPPED

      if (
        target ===
        'dropped'
      ) {

        const updatedDropped =
          [
            ...droppedList,
            anime,
          ];

        setDroppedList(
          updatedDropped
        );

        await updateLists(
          {
            watching:
              updatedWatching,

            dropped:
              updatedDropped,
          }
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

      let completedAnime =
        null;

      const updatedWatching =
        watchingList
          .map(
            (
              anime
            ) => {

              if (
                anime._id ===
                animeId
              ) {

                let newCount =
                  (
                    anime.episodesWatched ||
                    0
                  ) +
                  change;

                newCount =
                  Math.max(
                    0,
                    Math.min(
                      newCount,
                      anime.episodes
                    )
                  );

                // AUTO COMPLETE

                if (
                  anime.episodes &&
                  newCount >=
                    anime.episodes
                ) {

                  completedAnime =
                    {
                      ...anime,
                      episodesWatched:
                        newCount,
                    };

                  return null;
                }

                return {
                  ...anime,
                  episodesWatched:
                    newCount,
                };
              }

              return anime;
            }
          )
          .filter(
            Boolean
          );

      setWatchingList(
        updatedWatching
      );

      // AUTO MOVE TO COMPLETED

      if (
        completedAnime
      ) {

        const updatedCompleted =
          [
            ...completedList,
            completedAnime,
          ];

        setCompletedList(
          updatedCompleted
        );

        await updateLists(
          {
            watching:
              updatedWatching,

            completed:
              updatedCompleted,
          }
        );

      } else {

        await updateLists(
          {
            watching:
              updatedWatching,
          }
        );
      }
    };

  // =========================
  // CARD STATUS COLOR
  // =========================

  const getCardStatusClass =
    (
      anime
    ) => {

      if (
        anime.episodesWatched >
        0
      ) {
        return 'status-watching';
      }

      return 'status-plan';
    };

  return (

    <div className="watching-container">

      <h2>
        📺 Watching
      </h2>

      {watchingList.length >
        0 && (

        <button
          className="remove-all-btn"
          onClick={
            handleRemoveAll
          }
        >
          🗑 Remove All
        </button>
      )}

      {watchingList.length ===
      0 ? (

        <p>
          No anime in
          watching list.
        </p>

      ) : (

        <div className="watching-list">

          {watchingList.map(
            (
              anime
            ) => {

              const animeId =
                anime._id;

              const cardStatusClass =
                getCardStatusClass(
                  anime
                );

              return (

                <div
                  key={
                    animeId
                  }
                  className={`watching-card ${cardStatusClass}`}
                >

                  <Link
                    to={`/anime/${animeId}`}
                  >

                    <img
                      src={
                        anime.image ||
                        'https://via.placeholder.com/150x220?text=No+Image'
                      }
                      alt={
                        anime.title
                      }
                    />

                  </Link>

                  <h4>
                    {
                      anime.title
                    }
                  </h4>

                  <div className="episode-controls">

                    <button
                      onClick={() =>
                        updateEpisodeCount(
                          animeId,
                          -1
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {
                        anime.episodesWatched ||
                        0
                      }
                      {' / '}
                      {
                        anime.episodes ||
                        '?'
                      }
                    </span>

                    <button
                      onClick={() =>
                        updateEpisodeCount(
                          animeId,
                          1
                        )
                      }
                    >
                      ＋
                    </button>

                  </div>

                  <div className="status-buttons">

                    <button
                      onClick={() =>
                        moveToList(
                          anime,
                          'onHold'
                        )
                      }
                    >
                      ⏸ On Hold
                    </button>

                    <button
                      onClick={() =>
                        moveToList(
                          anime,
                          'dropped'
                        )
                      }
                      className="danger"
                    >
                      ❌ Dropped
                    </button>

                    <button
                      onClick={() =>
                        moveToList(
                          anime,
                          'completed'
                        )
                      }
                      className="complete-btn"
                    >
                      ✅ Complete
                    </button>

                    <button
                      onClick={() =>
                        handleRemove(
                          animeId
                        )
                      }
                      className="grey"
                    >
                      🗑 Remove
                    </button>

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

export default Watching;