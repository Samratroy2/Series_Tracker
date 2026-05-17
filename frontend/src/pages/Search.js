import React, { useState, useEffect } from 'react';
import './Search.css';

const Search = () => {
  const [animeList, setAnimeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('process.env.REACT_APP_API_URL/api/anime')
      .then(res => res.json())
      .then(data => setAnimeList(data))
      .catch(err => console.error('Failed to fetch anime:', err));
  }, []);

  const filteredResults = animeList.filter(anime =>
    searchTerm.trim() === '' ? false :
    anime.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anime.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anime.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="search-container">
      <h2>Search 🔍</h2>
      <input
        type="text"
        placeholder="Search by title, genre, or language..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="search-results">
        {searchTerm && filteredResults.length === 0 ? (
          <p className="no-results">No results found.</p>
        ) : (
          searchTerm && (
            <div className="search-grid">
              {filteredResults.map((anime, index) => (
                <div
                  className="search-card"
                  key={anime._id || anime.mal_id || anime.title + index}
                >
                  <img
                    src={anime.image || anime.images?.jpg?.image_url}
                    alt={anime.title}
                  />
                  <div className="search-info">
                    <h4>{anime.title}</h4>
                    <p>{anime.genre} • {anime.language} • {anime.year}</p>
                    <p>
                      Rating:{' '}
                      {anime.rating ?? anime.score ?? 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Search;
