// frontend/src/contexts/ClubContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ClubContext = createContext();
export const useClubs = () => useContext(ClubContext);

export const ClubProvider = ({ children }) => {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/clubs`);
      setClubs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
    }
  };

  const addClub = async (name, createdBy) => {
    if (!name || !createdBy) return;
    try {
      const res = await axios.post('http://localhost:5000/api/clubs', { name, createdBy });
      setClubs(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to create club:', err);
      return null;
    }
  };

  const requestJoinClub = async (clubId, email) => {
    if (!clubId || !email) return;
    try {
      await axios.post(`http://localhost:5000/api/clubs/${clubId}/join`, { email });
      setClubs(prev => prev.map(c => c._id === clubId ? { ...c, joinRequests: [...(c.joinRequests||[]), email] } : c));
      alert('Join request sent. Wait for approval.');
    } catch (err) {
      console.error('Failed to send join request:', err);
    }
  };

  const approveJoin = async (clubId, email) => {
    if (!clubId || !email) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/clubs/${clubId}/approve`, { email });
      setClubs(prev => prev.map(c => c._id === clubId ? res.data : c));
    } catch (err) {
      console.error('Failed to approve join request:', err);
    }
  };

  const addMessage = async (clubId, user, text) => {
    if (!clubId || !user || !text) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/clubs/${clubId}/message`, { user, text });
      setClubs(prev => prev.map(c => c._id === clubId ? res.data : c));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const addPoll = async (clubId, question, options) => {
    if (!clubId || !question || !options || options.length < 2) return;
    try {
      const filteredOptions = options.filter(opt => opt.trim() !== '');
      const res = await axios.post(`http://localhost:5000/api/clubs/${clubId}/polls`, { question, options: filteredOptions });
      setClubs(prev => prev.map(c => c._id === clubId ? res.data : c));
    } catch (err) {
      console.error('Failed to add poll:', err);
    }
  };

  const votePoll = async (clubId, pollId, optionIndex, voter) => {
    if (!clubId || !pollId || !voter) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/clubs/${clubId}/polls/${pollId}/vote`,
        { optionIndex, voter }
      );
      setClubs(prev => prev.map(c => c._id === clubId ? res.data : c));
    } catch (err) {
      console.error('Failed to vote in poll:', err);
    }
  };

  const createClub = async (name, createdBy) => {
    if (!name || !createdBy) return null;
    try {
      const response = await axios.post('http://localhost:5000/api/clubs', { name, createdBy });
      setClubs(prev => [...prev, response.data]);
      return response.data; // return new club
    } catch (error) {
      console.error("Error creating club:", error);
      return null;
    }
  };

  return (
    <ClubContext.Provider value={{
      clubs,
      addClub,
      requestJoinClub,
      approveJoin,
      addMessage,
      addPoll,
      votePoll,
      fetchClubs,
      createClub
    }}>
      {children}
    </ClubContext.Provider>
  );
};
