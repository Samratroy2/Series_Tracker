// frontend\src\pages\AnimeDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AnimeDetails.css';

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`process.env.REACT_APP_API_URL/api/shows/${id}`);
        const data = await res.json();
        setAnime(data);
      } catch (err) {
        console.error('Error fetching anime:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id]);

  if (loading) {
    return <div className="details-loading">Loading anime details...</div>;
  }

  if (!anime) {
    return <div className="details-error">Failed to load anime data.</div>;
  }

  return (
    <div className="anime-details">
      <img
        src={anime.image || '/default-poster.jpg'}
        alt={anime.title}
        className="anime-image"
      />
      <div className="anime-info">
        <h2>{anime.title || 'Untitled'}</h2>
        <p><strong>Episodes:</strong> {anime.totalEpisodes || 'N/A'}</p>
        <p><strong>Description:</strong> {anime.description || 'No description available.'}</p>
        <p><strong>Genres:</strong> {anime.genres?.join(', ') || 'Unknown'}</p>
        <p><strong>Status:</strong> {anime.status || 'Unknown'}</p>
      </div>
    </div>
  );
};

export default AnimeDetails;
