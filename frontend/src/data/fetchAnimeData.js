// frontend\src\data\fetchAnimeData.js
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AnimeDetails.css';

const AnimeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [anime, setAnime] = useState(null);
  const [users, setUsers] = useState([]);

  // Redirect if user not logged in or not allowed
  if (!user || user.email !== 'trysamrat1@gmail.com') {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`process.env.REACT_APP_API_URL/api/shows/${id}`);
        const data = await res.json();
        setAnime(data);
      } catch (err) {
        console.error('Error fetching anime:', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`process.env.REACT_APP_API_URL/api/auth/users?email=${user.email}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchAnime();
    fetchUsers();
  }, [id, user.email]);

  if (!anime) return <div className="details-loading">Loading...</div>;

  return (
    <div className="anime-details">
      <img src={anime.image} alt={anime.title} className="anime-image" />
      <div className="anime-info">
        <h2>{anime.title}</h2>
        <p><strong>Episodes:</strong> {anime.totalEpisodes}</p>
        <p><strong>Description:</strong> {anime.description}</p>
        <p><strong>Genres:</strong> {anime.genres.join(', ')}</p>
        <p><strong>Status:</strong> {anime.status || 'Not Started'}</p>
      </div>

      <div className="user-management">
        <h3>👥 User Management</h3>
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              {u.name} - {u.email} ({u.role || 'user'})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnimeDetails;
