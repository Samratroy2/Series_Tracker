import React, { useState, useEffect } from 'react';
import './FilterPage.css';
import FilterSection from '../components/FilterSection';

import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../firebase';

const FilterPage = () => {
  const [animeList, setAnimeList] = useState([]);

  const [selectedFilters, setSelectedFilters] = useState({
    genre: [],
    year: [],
    type: [],
    language: [],
    rating: [],
  });

  // ✅ Fetch anime from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'anime'),
      (snapshot) => {
        const animeData = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));

        setAnimeList(animeData);
      },
      (err) => {
        console.error(
          'Failed to fetch anime data:',
          err
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleFilter = (
    category,
    value
  ) => {
    setSelectedFilters((prev) => {
      const current = prev[category];

      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      return {
        ...prev,
        [category]: updated,
      };
    });
  };

  const allGenres = [
  ...new Set(
    animeList.flatMap((a) => {

      // NEW ARRAY FORMAT
      if (Array.isArray(a.genre)) {
        return a.genre;
      }

      // OLD STRING FORMAT
      if (typeof a.genre === 'string') {

        // Handle merged words:
        // CrimeDrama -> Crime Drama

        const cleaned =
          a.genre.replace(
            /([a-z])([A-Z])/g,
            '$1,$2'
          );

        return cleaned
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean);
      }

      return [];
    })
  ),
];

  const allYears = [
    ...new Set(
      animeList
        .map((a) =>
          a.year?.toString()
        )
        .filter(Boolean)
    ),
  ];

  const allTypes = [
    ...new Set(
      animeList
        .map((a) => a.type)
        .filter(Boolean)
    ),
  ];

  const allLanguages = [
    ...new Set(
      animeList.flatMap((a) => {

        // NEW ARRAY FORMAT
        if (Array.isArray(a.language)) {
          return a.language;
        }

        // OLD STRING FORMAT
        if (typeof a.language === 'string') {
          return [a.language];
        }

        return [];
      })
    ),
  ];

  const allRatings = ['9', '8', '7', '6'];

  const isAnyFilterActive =
    Object.values(selectedFilters).some(
      (arr) => arr.length > 0
    );

        const filteredAnime = isAnyFilterActive
          ? animeList.filter((anime) => {
              const matchesGenre =
        selectedFilters.genre.length
          ? Array.isArray(anime.genre)
            ? anime.genre.some((g) =>
                selectedFilters.genre.includes(g)
              )
            : selectedFilters.genre.includes(
                anime.genre
              )
          : true;

        const matchesYear =
          selectedFilters.year.length
            ? selectedFilters.year.includes(
                anime.year?.toString()
              )
            : true;

        const matchesType =
          selectedFilters.type.length
            ? selectedFilters.type.includes(
                anime.type
              )
            : true;

        const matchesLanguage =
          selectedFilters.language.length
            ? Array.isArray(anime.language)
              ? anime.language.some((l) =>
                  selectedFilters.language.includes(l)
                )
              : selectedFilters.language.includes(
                  anime.language
                )
            : true;

        const matchesRating =
          selectedFilters.rating.length
            ? selectedFilters.rating.some(
                (r) =>
                  anime.score >=
                  parseInt(r)
              )
            : true;

        return (
          matchesGenre &&
          matchesYear &&
          matchesType &&
          matchesLanguage &&
          matchesRating
        );
      })
    : animeList;

  return (
    <div className="filter-container">
      <div className="filters-wrapper">
        <FilterSection
          title="Type"
          options={allTypes.map((t) => ({
            value: t,
            label: t,
          }))}
          selected={selectedFilters.type}
          onChange={(val) =>
            toggleFilter('type', val)
          }
        />

        <FilterSection
          title="Genre"
          options={allGenres.map((g) => ({
            value: g,
            label: g,
          }))}
          selected={selectedFilters.genre}
          onChange={(val) =>
            toggleFilter('genre', val)
          }
        />

        <FilterSection
          title="Language"
          options={allLanguages.map(
            (l) => ({
              value: l,
              label: l,
            })
          )}
          selected={
            selectedFilters.language
          }
          onChange={(val) =>
            toggleFilter(
              'language',
              val
            )
          }
        />

        <FilterSection
          title="Year"
          options={allYears.map((y) => ({
            value: y,
            label: y,
          }))}
          selected={selectedFilters.year}
          onChange={(val) =>
            toggleFilter('year', val)
          }
        />

        <FilterSection
          title="Rating"
          options={allRatings.map((r) => ({
            value: r,
            label: `${r}+`,
          }))}
          selected={selectedFilters.rating}
          onChange={(val) =>
            toggleFilter('rating', val)
          }
        />
      </div>

      <div className="anime-results">
        <h3 style={{ color: 'red' }}>
          {isAnyFilterActive
            ? `Filtered Results (${filteredAnime.length})`
            : 'All Anime'}
        </h3>

        {filteredAnime.length === 0 ? (
          <p className="placeholder-text">
            No anime found matching your
            filters.
          </p>
        ) : (
          <div className="anime-grid">
            {filteredAnime.map(
              (anime) => (
                <div
                  className="anime-card"
                  key={anime._id}
                >
                  <img
                    src={
                      anime.image ||
                      anime.images?.jpg
                        ?.image_url
                    }
                    alt={
                      anime.title ||
                      'Anime'
                    }
                  />

                  <div className="anime-info">
                    <h4>
                      {anime.title}
                    </h4>

                    <p>
                      {
                        Array.isArray(anime.genre)
                          ? anime.genre.join(', ')
                          : anime.genre
                      }
                      {' • '}
                      {anime.year} •{' '}
                      {
                        Array.isArray(anime.language)
                          ? anime.language.join(', ')
                          : anime.language
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
      </div>
    </div>
  );
};

export default FilterPage;