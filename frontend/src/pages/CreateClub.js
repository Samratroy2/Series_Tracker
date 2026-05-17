//frontend\src\pages\CreateClub.js

import React, { useState } from 'react';
import { useClubs } from '../contexts/ClubContext';
import { useNavigate } from 'react-router-dom';

const CreateClub = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createClub } = useClubs();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Club name is required');

    setLoading(true);
    try {
      await createClub(name.trim());
      navigate('/clubs'); // redirect to club list
    } catch (err) {
      setError('Failed to create club');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-club">
      <h2>Create a New Club</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter club name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Club'}
        </button>
      </form>
    </div>
  );
};

export default CreateClub;
