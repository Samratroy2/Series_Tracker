// frontend/src/pages/OnHold.js

import React, {
  useEffect,
  useState,
} from 'react';

import {
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

import './OnHold.css';

const OnHold = () => {

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [onHoldList,
    setOnHoldList] =
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

          setOnHoldList(
            data.onHold ||
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
  // SAVE TO FIREBASE
  // =========================

  const updateLists =
    async (
      newOnHold,
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
            onHold:
              newOnHold,

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
  // REMOVE SINGLE
  // =========================

  const handleRemove =
    async (id) => {

      const updated =
        onHoldList.filter(
          (anime) =>
            anime._id !==
            id
        );

      setOnHoldList(
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

  const handleRemoveAll =
    async () => {

      setOnHoldList([]);

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

      // REMOVE FROM HOLD

      const updatedOnHold =
        onHoldList.filter(
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

      setOnHoldList(
        updatedOnHold
      );

      setWatchingList(
        updatedWatching
      );

      // UPDATE FIREBASE

      await updateLists(
        updatedOnHold,
        updatedWatching
      );
    };

  return (
    <div className="onhold-container">

      <h2>
        📌 On Hold List
      </h2>

      {onHoldList.length >
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

      {onHoldList.length ===
      0 ? (

        <p>
          No anime on hold.
        </p>

      ) : (

        <div className="onhold-list">

          {onHoldList.map(
            (
              anime
            ) => {

              const id =
                anime._id;

              return (

                <div
                  key={id}
                  className="onhold-card"
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

                  <div className="onhold-card-info">

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
                      /
                      {
                        anime.episodes ||
                        '?'
                      }
                    </p>

                    <div className="onhold-card-buttons">

                      <button
                        onClick={() =>
                          moveToWatching(
                            anime
                          )
                        }
                      >
                        ▶ Back to Watching
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

export default OnHold;