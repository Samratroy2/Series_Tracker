// frontend/src/pages/Search.js

import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../firebase';

import './Search.css';

const Search = () => {

  const [animeList,
    setAnimeList] =
    useState([]);

  const [searchTerm,
    setSearchTerm] =
    useState('');

  const [loading,
    setLoading] =
    useState(true);

  // =========================
  // FETCH ANIME FROM FIREBASE
  // =========================

  useEffect(() => {

    const fetchAnime =
      async () => {

        try {

          const snapshot =
            await getDocs(
              collection(
                db,
                'anime'
              )
            );

          const animeData =
            snapshot.docs.map(
              (doc) => ({
                _id:
                  doc.id,
                ...doc.data(),
              })
            );

          setAnimeList(
            animeData
          );

        } catch (err) {

          console.error(
            'Failed to fetch anime:',
            err
          );

        } finally {

          setLoading(
            false
          );

        }
      };

    fetchAnime();

  }, []);

  // =========================
  // FILTER RESULTS
  // =========================

  const filteredResults =
    animeList.filter(
      (anime) => {

        if (
          searchTerm.trim() ===
          ''
        ) {
          return false;
        }

        return (

          anime.title
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          anime.genre
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          anime.language
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          anime.type
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        );
      }
    );

  return (

    <div className="search-container">

      <h2>
        Search 🔍
      </h2>

      <input
        type="text"
        placeholder="Search by title, genre, language, or type..."
        value={
          searchTerm
        }
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
        className="search-input"
      />

      <div className="search-results">

        {loading ? (

          <p className="loading-text">
            Loading...
          </p>

        ) : searchTerm &&
          filteredResults.length ===
            0 ? (

          <p className="no-results">
            No results found.
          </p>

        ) : (

          searchTerm && (

            <div className="search-grid">

              {filteredResults.map(
                (
                  anime,
                  index
                ) => {

                  const imageUrl =
                    anime.image ||
                    anime.images
                      ?.jpg
                      ?.image_url ||
                    'https://via.placeholder.com/300x400?text=No+Image';

                  return (

                    <Link
                      to={`/anime/${anime._id}`}
                      className="search-card-link"
                      key={
                        anime._id ||
                        anime.title +
                          index
                      }
                    >

                      <div className="search-card">

                        <img
                          src={
                            imageUrl
                          }
                          alt={
                            anime.title
                          }
                        />

                        <div className="search-info">

                          <h4>
                            {
                              anime.title
                            }
                          </h4>

                          <p>
                            {
                              anime.genre
                            }
                            {' • '}
                            {
                              anime.language ||
                              'Unknown'
                            }
                            {' • '}
                            {
                              anime.year
                            }
                          </p>

                          <p>

                            Rating:
                            {' '}

                            {anime.rating ??
                              anime.score ??
                              'N/A'}

                          </p>

                          <span className="anime-type">

                            {
                              anime.type
                            }

                          </span>

                        </div>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default Search;