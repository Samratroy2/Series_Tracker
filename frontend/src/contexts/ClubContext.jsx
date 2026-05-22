//frontend\src\contexts\ClubContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ClubContext = createContext();
export const useClubs = () => useContext(ClubContext);

export const ClubProvider = ({ children }) => {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/clubs`);
      setClubs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
    }
  };

  const createClub = async (name, createdBy) => {
    if (!name || !createdBy) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/clubs`,
        { name, createdBy }
      );

      setClubs(prev => [...prev, res.data]);

      return res.data;

    } catch (err) {
      console.error('Failed to create club:', err);
      return null;
    }
  };

  const requestJoinClub = async (clubId, email) => {
    try {
      await axios.post(
        `${API_URL}/api/clubs/${clubId}/join`,
        { email }
      );

      setClubs(prev =>
        prev.map(c =>
          c._id === clubId
            ? {
                ...c,
                joinRequests: [...(c.joinRequests || []), email]
              }
            : c
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  const approveJoin = async (clubId, email) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/clubs/${clubId}/approve`,
        { email }
      );

      setClubs(prev =>
        prev.map(c => c._id === clubId ? res.data : c)
      );

    } catch (err) {
      console.error(err);
    }
  };

  const addMessage = async (clubId, user, text) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/clubs/${clubId}/message`,
        { user, text }
      );

      setClubs(prev =>
        prev.map(c => c._id === clubId ? res.data : c)
      );

    } catch (err) {
      console.error(err);
    }
  };

  const addPoll = async (clubId, question, options) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/clubs/${clubId}/polls`,
        { question, options }
      );

      setClubs(prev =>
        prev.map(c => c._id === clubId ? res.data : c)
      );

    } catch (err) {
      console.error(err);
    }
  };

  const votePoll = async (clubId, pollId, optionIndex, voter) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/clubs/${clubId}/polls/${pollId}/vote`,
        { optionIndex, voter }
      );

      setClubs(prev =>
        prev.map(c => c._id === clubId ? res.data : c)
      );

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ClubContext.Provider
      value={{
        clubs,
        createClub,
        requestJoinClub,
        approveJoin,
        addMessage,
        addPoll,
        votePoll,
        fetchClubs
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};