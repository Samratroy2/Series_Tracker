import React, {
  useEffect,
  useState,
} from 'react';

import './AdminPanel.css';

import { useAuth } from '../contexts/AuthContext';

import { Navigate } from 'react-router-dom';

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';

import { db } from '../firebase';

const AdminPanel = () => {
  const { user } = useAuth();

  const [users, setUsers] =
    useState([]);

  const [clubs, setClubs] =
    useState([]);

  const [animeList, setAnimeList] =
    useState([]);

  // ✅ Admin access
  const isAdmin =
    user?.role === 'admin';

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  // ✅ Realtime Firestore data
  useEffect(() => {
    const unsubscribeUsers =
      onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const usersData =
            snapshot.docs.map((doc) => ({
              _id: doc.id,
              ...doc.data(),
            }));

          setUsers(usersData);
        }
      );

    const unsubscribeClubs =
      onSnapshot(
        collection(db, 'clubs'),
        (snapshot) => {
          const clubsData =
            snapshot.docs.map((doc) => ({
              _id: doc.id,
              ...doc.data(),
            }));

          setClubs(clubsData);
        }
      );

    const unsubscribeAnime =
      onSnapshot(
        collection(db, 'anime'),
        (snapshot) => {
          const animeData =
            snapshot.docs.map((doc) => ({
              _id: doc.id,
              ...doc.data(),
            }));

          setAnimeList(animeData);
        }
      );

    return () => {
      unsubscribeUsers();
      unsubscribeClubs();
      unsubscribeAnime();
    };
  }, []);

  // ✅ Delete user
  const deleteUser = async (
    id,
    email
  ) => {
    if (
      user.email === email
    ) {
      alert(
        "You can't delete yourself!"
      );

      return;
    }

    const confirmDelete =
      window.confirm(
        `Delete user ${email}?`
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, 'users', id)
      );

      alert(
        'User deleted successfully'
      );
    } catch (err) {
      console.error(err);

      alert(
        'Error deleting user'
      );
    }
  };

  // ✅ Delete club
  const deleteClub = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        'Delete this club?'
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, 'clubs', id)
      );

      alert(
        'Club deleted successfully'
      );
    } catch (err) {
      console.error(err);

      alert(
        'Error deleting club'
      );
    }
  };

  // =========================
  // ✅ Statistics
  // =========================

  const adminCount =
    users.filter(
      (u) =>
        u.role === 'admin'
    ).length;

  const userCount =
    users.filter(
      (u) =>
        u.role !== 'admin'
    ).length;

  const totalUsers =
    adminCount + userCount;

  const animeCount =
    animeList.filter(
      (a) =>
        a.type === 'Anime'
    ).length;

  const serialCount =
    animeList.filter(
      (a) =>
        a.type === 'Serial'
    ).length;

  const movieCount =
    animeList.filter(
      (a) =>
        a.type === 'Movie'
    ).length;

  const dramaCount =
    animeList.filter(
      (a) =>
        a.type === 'Drama'
    ).length;

  return (
    <div className="admin-container">
      <h1>
        Admin Dashboard
      </h1>

      {/* SUMMARY */}
      <section className="admin-summary">
        <h2>App Summary</h2>
        
        <div className="summary-grid">
          
          <div className="summary-card">
            <h3>
              Regular Users
            </h3>

            <p>
              {userCount}
            </p>
          </div>

          <div className="summary-card">
            <h3>Total Users</h3>

            <p>{totalUsers}</p>
          </div>

          

          <div className="summary-card">
            <h3>Anime</h3>

            <p>{animeCount}</p>
          </div>

          <div className="summary-card">
            <h3>Serial</h3>

            <p>{serialCount}</p>
          </div>

          <div className="summary-card">
            <h3>
              Movie
            </h3>

            <p>
              {movieCount}
            </p>
          </div>

          <div className="summary-card">
            <h3>
              Drama
            </h3>

            <p>
                {dramaCount}
            </p>
          </div>
        </div>
      </section>

      {/* USERS */}
      <section>
        <h2>
          Users (
          {users.length})
        </h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="admin-list">
            {users.map((u) => (
              <li
                key={u._id}
                className="admin-item"
              >
                <span>
                  <strong>
                    {u.name ||
                      'No Name'}
                  </strong>{' '}
                  ({u.email})
                  {' • '}
                  Role:{' '}
                  {u.role ||
                    'user'}
                </span>

                {u.email !==
                  user.email && (
                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteUser(
                        u._id,
                        u.email
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CLUBS */}
      <section>
        <h2>
          Clubs (
          {clubs.length})
        </h2>

        {clubs.length === 0 ? (
          <p>
            No clubs available.
          </p>
        ) : (
          <ul className="admin-list">
            {clubs.map((club) => (
              <li
                key={club._id}
                className="admin-item"
              >
                <span>
                  <strong>
                    {club.name}
                  </strong>{' '}
                  -{' '}
                  {club.members
                    ?.length || 0}{' '}
                  members
                </span>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteClub(
                      club._id
                    )
                  }
                >
                  Delete Club
                </button>

                {club.joinRequests
                  ?.length > 0 && (
                  <div className="join-requests">
                    <strong>
                      Pending Join
                      Requests:
                    </strong>

                    {club.joinRequests.map(
                      (
                        email
                      ) => (
                        <div
                          key={
                            email
                          }
                        >
                          {email}
                        </div>
                      )
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ANIME */}
      <section>
        <h2>
          Anime Library (
          {animeList.length})
        </h2>

        {animeList.length === 0 ? (
          <p>
            No anime available.
          </p>
        ) : (
          <div className="anime-grid">
            {animeList.map(
              (anime) => (
                <div
                  key={anime._id}
                  className="anime-card"
                >
                  <img
                    src={
                      anime.image ||
                      anime.images?.jpg
                        ?.image_url
                    }
                    alt={
                      anime.title
                    }
                  />

                  <div className="anime-info">
                    <h4>
                      {
                        anime.title
                      }
                    </h4>

                    <p>
                      {
                        anime.genre
                      }{' '}
                      •{' '}
                      {
                        anime.year
                      }
                    </p>

                    <p>
                      Rating:{' '}
                      {anime.score ||
                        'N/A'}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPanel;