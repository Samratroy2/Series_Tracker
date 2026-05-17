//frontend\src\pages\Watchlist.js

import React, { useEffect, useState } from "react";
import fetchAnimeData from "../data/fetchAnimeData";

const Watchlist = () => {
  const [animeList, setAnimeList] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchAnimeData();
      setAnimeList(data);
    };
    getData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {animeList.map((anime) => (
          <div key={anime.mal_id} className="bg-white rounded shadow p-2">
            <img src={anime.images.jpg.image_url} alt={anime.title} className="rounded" />
            <h2 className="text-lg font-semibold mt-2">{anime.title}</h2>
            <p className="text-sm text-gray-600">{anime.synopsis.slice(0, 80)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
