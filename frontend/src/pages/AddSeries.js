// src/pages/AddSeries.js

import React, { useState } from 'react';
import './AddSeries.css';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AddSeries = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    episodes: '',
    score: '',
    genre: '',
    language: '',
    type: 'Anime',
    year: new Date().getFullYear(),
    image: '',
  });

  // ─────────────────────────────────────
  // Handle Input Change
  // ─────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─────────────────────────────────────
  // Submit New Series
  // ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        episodes: Number(form.episodes) || 0,
        score: Number(form.score) || 0,
        year: Number(form.year) || new Date().getFullYear(),
        watchCount: 0,
        avgRating: Number(form.score) || 0,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'anime'), payload);

      alert('Your series added successfully');

      // Reset form
      setForm({
        title: '',
        episodes: '',
        score: '',
        genre: '',
        language: '',
        type: 'Anime',
        year: new Date().getFullYear(),
        image: '',
      });

    } catch (error) {
      console.error(error);
      alert('Failed to add your series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-series-page">
      <div className="modal-content">

        <h2>Add Your Series</h2>

        <form className="form-grid" onSubmit={handleSubmit}>

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="title"
            value={form.title}
            onChange={handleChange}
          />

          {/* Episodes */}
          <input
            type="number"
            name="episodes"
            placeholder="episodes"
            value={form.episodes}
            onChange={handleChange}
          />

          {/* Genre */}
          <input
            type="text"
            name="genre"
            placeholder="genre"
            value={form.genre}
            onChange={handleChange}
          />

          {/* Score */}
          <input
            type="number"
            step="0.1"
            name="score"
            placeholder="score"
            value={form.score}
            onChange={handleChange}
          />

          {/* Language */}
          <input
            type="text"
            name="language"
            placeholder="language"
            value={form.language}
            onChange={handleChange}
          />

          {/* Image URL */}
          <input
            type="text"
            name="image"
            placeholder="image url"
            value={form.image}
            onChange={handleChange}
          />

          {/* Type */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Anime">Anime</option>
            <option value="Serial">Serial</option>
            <option value="Movie">Movie</option>
            <option value="Drama">Drama</option>
          </select>

          {/* Year */}
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleChange}
          />

          {/* Submit */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddSeries;