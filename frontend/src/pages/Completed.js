// frontend/src/pages/Completed.js

import React, {
  useEffect,
  useState,
} from 'react';

import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase';

import {
  useAuth,
} from '../contexts/AuthContext';

import './Completed.css';

const Completed = () => {

  const { user } =
    useAuth();

  const [completedList,
    setCompletedList] =
    useState([]);

  const [watchingList,
    setWatchingList] =
    useState([]);

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

          setCompletedList(
            data.completed ||
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
    async ({
      completed =
        completedList,
      watching =
        watchingList,
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
            completed,
            watching,
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

  const handleRemove =
    async (id) => {

      const updated =
        completedList.filter(
          (
            item
          ) =>
            item._id !==
            id
        );

      setCompletedList(
        updated
      );

      await updateLists(
        {
          completed:
            updated,
        }
      );
    };

  // =========================
  // REMOVE ALL
  // =========================

  const handleRemoveAll =
    async () => {

      setCompletedList(
        []
      );

      await updateLists(
        {
          completed:
            [],
        }
      );
    };

  // =========================
  // MOVE TO WATCHING
  // =========================

  const moveToWatching =
    async (
      anime
    ) => {

      // REMOVE FROM COMPLETED

      const updatedCompleted =
        completedList.filter(
          (
            item
          ) =>
            item._id !==
            anime._id
        );

      // ADD TO WATCHING

      const alreadyExists =
        watchingList.find(
          (
            a
          ) =>
            a._id ===
            anime._id
        );

      let updatedWatching =
        watchingList;

      if (
        !alreadyExists
      ) {

        updatedWatching =
          [
            ...watchingList,
            {
              ...anime,
              episodesWatched:
                anime.episodesWatched ||
                0,
            },
          ];
      }

      setCompletedList(
        updatedCompleted
      );

      setWatchingList(
        updatedWatching
      );

      await updateLists(
        {
          completed:
            updatedCompleted,

          watching:
            updatedWatching,
        }
      );
    };

  return (

    <div className="completed-container">

      <h2>
        ✅ Completed List
      </h2>

      {completedList.length >
        0 && (

        <button
          onClick={
            handleRemoveAll
          }
          className="remove-all-btn"
        >
          🗑 Remove All
        </button>
      )}

      {completedList.length ===
      0 ? (

        <p>
          No anime
          completed yet.
        </p>

      ) : (

        <div className="completed-list">

          {completedList.map(
            (
              anime
            ) => {

              const id =
                anime._id;

              const imageUrl =
                anime.image ||
                'https://via.placeholder.com/80x120?text=No+Image';

              return (

                <div
                  key={id}
                  className="completed-card"
                >

                  <img
                    src={
                      imageUrl
                    }
                    alt={
                      anime.title
                    }
                  />

                  <div className="completed-card-info">

                    <h4>
                      {
                        anime.title
                      }
                    </h4>

                    <p>
                      Episodes:
                      {' '}
                      {
                        anime.episodesWatched ||
                        0
                      }
                      {' / '}
                      {
                        anime.episodes ||
                        '?'
                      }
                    </p>

                    <div className="completed-card-buttons">

                      <button
                        onClick={() =>
                          moveToWatching(
                            anime
                          )
                        }
                      >
                        ↩ Back To
                        Watching
                      </button>

                      <button
                        onClick={() =>
                          handleRemove(
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

export default Completed;