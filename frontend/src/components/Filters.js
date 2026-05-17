// src/Filters.js
import React from 'react';

const Filters = ({ filters, onChange }) => {
  return (
    <div className="filters">
      <select value={filters.genre} onChange={(e) => onChange('genre', e.target.value)}>
        <option value="">All Genres</option>
        <option value="Action">Action</option>
        <option value="Comedy">Comedy</option>
        <option value="Romance">Romance</option>
        {/* Add more genres as needed */}
      </select>

      <select value={filters.status} onChange={(e) => onChange('status', e.target.value)}>
        <option value="">All Status</option>
        <option value="Watching">Watching</option>
        <option value="Completed">Completed</option>
        <option value="Plan to Watch">Plan to Watch</option>
      </select>

      <input
        type="text"
        placeholder="Search by name"
        value={filters.search}
        onChange={(e) => onChange('search', e.target.value)}
      />
    </div>
  );
};

export default Filters;
