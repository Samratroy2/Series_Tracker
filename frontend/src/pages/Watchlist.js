// frontend/src/pages/Watchlist.js

import React, {
  useEffect,
  useState,
} from 'react';

import './Watchlist.css';

const Watchlist = () => {

  const user = JSON.parse(
    localStorage.getItem('user')
  );

  const userId =
    user?.uid ||
    user?.email ||
    user?._id ||
    user?.id;

  const [watchingList, setWatchingList] =
    useState([]);

  const [planList, setPlanList] =
    useState([]);

  // =========================
  // LOAD LISTS
  // =========================

  const loadLists = () => {

    const watching =
      JSON.parse(
        localStorage.getItem(
          `watchingList_${userId}`
        )
      ) || [];

    const planned =
      JSON.parse(
        localStorage.getItem(
          `planToWatchList_${userId}`
        )
      ) || [];

    setWatchingList(
      watching
    );

    setPlanList(
      planned
    );
  };

  useEffect(() => {

    loadLists();

    const handleStorage =
      () => {
        loadLists();
      };

    window.addEventListener(
      'storage',
      handleStorage
    );

    window.addEventListener(
      'watchlistUpdated',
      handleStorage
    );

    return () => {

      window.removeEventListener(
        'storage',
        handleStorage
      );

      window.removeEventListener(
        'watchlistUpdated',
        handleStorage
      );

    };

  }, []);

  // =========================
  // REMOVE
  // =========================

  const removeFromList = (
    animeId,
    type
  ) => {

    if (
      type === 'watching'
    ) {

      const updated =
        watchingList.filter(
          (anime) =>
            anime._id !== animeId
        );

      setWatchingList(
        updated
      );

      localStorage.setItem(
        `watchingList_${userId}`,
        JSON.stringify(updated)
      );
    }

    if (
      type === 'plan'
    ) {

      const updated =
        planList.filter(
          (anime) =>
            anime._id !== animeId
        );

      setPlanList(
        updated
      );

      localStorage.setItem(
        `planToWatchList_${userId}`,
        JSON.stringify(updated)
      );
    }
  };

  return (
    <div className="watchlist-page">

      <h1 className="watchlist-title">
        My Watchlist
      </h1>

      {/* WATCHING */}

      <div className="watch-section">

        <h2>
          🎬 Watching
        </h2>

        {watchingList.length ===
        0 ? (
          <p>
            No anime in
            watching list
          </p>
        ) : (
          <div className="watch-grid">

            {watchingList.map(
              (anime) => (

                <div
                  className="watch-card"
                  key={
                    anime._id
                  }
                >

                  <img
                    src={
                      anime.image ||
                      'https://via.placeholder.com/300x400?text=No+Image'
                    }
                    alt={
                      anime.title
                    }
                  />

                  <div className="watch-info">

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

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeFromList(
                          anime._id,
                          'watching'
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* PLAN TO WATCH */}

      <div className="watch-section">

        <h2>
          📌 Plan To Watch
        </h2>

        {planList.length ===
        0 ? (
          <p>
            No anime in
            plan list
          </p>
        ) : (
          <div className="watch-grid">

            {planList.map(
              (anime) => (

                <div
                  className="watch-card"
                  key={
                    anime._id
                  }
                >

                  <img
                    src={
                      anime.image ||
                      'https://via.placeholder.com/300x400?text=No+Image'
                    }
                    alt={
                      anime.title
                    }
                  />

                  <div className="watch-info">

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

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeFromList(
                          anime._id,
                          'plan'
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Watchlist;