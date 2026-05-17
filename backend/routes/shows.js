
let shows = [
  { id: 1, title: "Attack on Titan", totalEpisodes: 25, streaming: "https://www.crunchyroll.com/attack-on-titan", genre: "Action", language: "Japanese", year: 2013 },
  { id: 2, title: "Demon Slayer", totalEpisodes: 26, streaming: "https://www.netflix.com/title/81091393", genre: "Adventure", language: "Japanese", year: 2019 },
  { id: 3, title: "My Hero Academia", totalEpisodes: 25, streaming: "https://www.hulu.com/series/my-hero-academia", genre: "Superhero", language: "Japanese", year: 2016 },
  { id: 4, title: "Arcane", totalEpisodes: 9, streaming: "https://www.netflix.com/title/81435684", genre: "Fantasy", language: "English", year: 2021 }
];

app.get('/api/shows', (req, res) => {
  res.json(shows);
});
