// frontend/src/pages/Dropped.js

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

import './Dropped.css';

const Dropped = () => {

  const { user } =
    useAuth();

  const [droppedList,
    setDroppedList] =
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

          setDroppedList(
            data.dropped ||
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
      dropped =
        droppedList,
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
            dropped,
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
        droppedList.filter(
          (
            item
          ) =>
            item._id !==
            id
        );

      setDroppedList(
        updated
      );

      await updateLists(
        {
          dropped:
            updated,
        }
      );
    };

  // =========================
  // REMOVE ALL
  // =========================

  const handleRemoveAll =
    async () => {

      setDroppedList(
        []
      );

      await updateLists(
        {
          dropped:
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

      // REMOVE FROM DROPPED

      const updatedDropped =
        droppedList.filter(
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

      setDroppedList(
        updatedDropped
      );

      setWatchingList(
        updatedWatching
      );

      await updateLists(
        {
          dropped:
            updatedDropped,

          watching:
            updatedWatching,
        }
      );
    };

  return (

    <div className="dropped-container">

      <h2>
        📉 Dropped List
      </h2>

      {droppedList.length >
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

      {droppedList.length ===
      0 ? (

        <p>
          No anime dropped.
        </p>

      ) : (

        <div className="dropped-list">

          {droppedList.map(
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
                  className="dropped-card"
                >

                  <img
                    src={
                      imageUrl
                    }
                    alt={
                      anime.title
                    }
                  />

                  <div className="dropped-card-info">

                    <h4>
                      {
                        anime.title
                      }
                    </h4>

                    <p>
                      Episodes
                      Watched:
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

                    <div className="dropped-card-buttons">

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

export default Dropped;