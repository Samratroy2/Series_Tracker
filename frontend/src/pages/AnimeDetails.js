// frontend\src\pages\AnimeDetails.js
// frontend/src/pages/AnimeDetails.js

import React, {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'react-router-dom';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../firebase';

import './AnimeDetails.css';

const AnimeDetails = () => {
  const { id } = useParams();

  const [anime, setAnime] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchAnime =
      async () => {
        try {
          const docRef = doc(
            db,
            'anime',
            id
          );

          const docSnap =
            await getDoc(docRef);

          if (
            docSnap.exists()
          ) {
            setAnime({
              _id:
                docSnap.id,
              ...docSnap.data(),
            });
          } else {
            console.log(
              'Anime not found'
            );
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

    fetchAnime();
  }, [id]);

  if (loading) {
    return (
      <div className="details-loading">
        Loading...
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="details-loading">
        Anime not found
      </div>
    );
  }

  return (
    <div className="anime-details">
      <img
        src={
          anime.image ||
          'https://via.placeholder.com/300x400'
        }
        alt={anime.title}
        className="anime-image"
      />

      <div className="anime-info">
        <h2>
          {anime.title}
        </h2>

        <p>
          <strong>
            Type:
          </strong>{' '}
          {anime.type}
        </p>

        <p>
          <strong>
            Episodes:
          </strong>{' '}
          {
            anime.episodes
          }
        </p>

        <p>
          <strong>
            Genre:
          </strong>{' '}
          {anime.genre}
        </p>

        <p>
          <strong>
            Rating:
          </strong>{' '}
          {anime.score}
        </p>

        <p>
          <strong>
            Year:
          </strong>{' '}
          {anime.year}
        </p>
      </div>
    </div>
  );
};

export default AnimeDetails;