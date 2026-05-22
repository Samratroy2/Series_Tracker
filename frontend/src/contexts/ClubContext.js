// src/contexts/ClubContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';

import { db } from '../firebase';

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [clubs, setClubs] = useState([]);

  // ✅ Real-time clubs
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'clubs'),
      (snapshot) => {
        const clubsData = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));

        setClubs(clubsData);
      }
    );

    return () => unsubscribe();
  }, []);

  // ✅ Create Club
  const createClub = async (
    name,
    creatorEmail
  ) => {
    const clubData = {
      name,
      createdBy: creatorEmail,
      members: [creatorEmail],
      joinRequests: [],
      messages: [],
      polls: [],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
      collection(db, 'clubs'),
      clubData
    );

    return {
      _id: docRef.id,
      ...clubData,
    };
  };

  // ✅ Add Message
  const addMessage = async (
    clubId,
    username,
    text
  ) => {
    const clubRef = doc(db, 'clubs', clubId);

    await updateDoc(clubRef, {
      messages: arrayUnion({
        _id: Date.now().toString(),
        user: username,
        text,
        createdAt:
          new Date().toISOString(),
      }),
    });
  };

  // ✅ Add Poll
  const addPoll = async (
    clubId,
    question,
    options,
    createdBy
  ) => {
    const clubRef = doc(db, 'clubs', clubId);

    const poll = {
      _id: Date.now().toString(),
      question,
      createdBy,
      createdAt:
        new Date().toISOString(),
      voters: [],
      options: options.map((opt) => ({
        text: opt,
        votes: 0,
      })),
    };

    const club = clubs.find(
      (c) => c._id === clubId
    );

    await updateDoc(clubRef, {
      polls: [...(club.polls || []), poll],
    });
  };

  // ✅ Vote Poll
  const votePoll = async (
    clubId,
    pollId,
    optionIndex,
    voterEmail
  ) => {
    const club = clubs.find(
      (c) => c._id === clubId
    );

    if (!club) return;

    const updatedPolls = club.polls.map(
      (poll) => {
        if (poll._id !== pollId)
          return poll;

        if (
          poll.voters?.includes(
            voterEmail
          )
        )
          return poll;

        poll.options[optionIndex]
          .votes += 1;

        poll.voters = [
          ...(poll.voters || []),
          voterEmail,
        ];

        return poll;
      }
    );

    await updateDoc(
      doc(db, 'clubs', clubId),
      {
        polls: updatedPolls,
      }
    );
  };

  // ✅ Request Join
  const requestJoinClub = async (
    clubId,
    email
  ) => {
    const clubRef = doc(
      db,
      'clubs',
      clubId
    );

    await updateDoc(clubRef, {
      joinRequests: arrayUnion(email),
    });
  };

  // ✅ Approve Join
  const approveJoin = async (
    clubId,
    email
  ) => {
    const club = clubs.find(
      (c) => c._id === clubId
    );

    if (!club) return;

    const updatedRequests =
      club.joinRequests.filter(
        (e) => e !== email
      );

    const updatedMembers = [
      ...(club.members || []),
      email,
    ];

    await updateDoc(
      doc(db, 'clubs', clubId),
      {
        joinRequests:
          updatedRequests,
        members: updatedMembers,
      }
    );
  };

  return (
    <ClubContext.Provider
      value={{
        clubs,
        createClub,
        addMessage,
        addPoll,
        votePoll,
        requestJoinClub,
        approveJoin,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClubs = () =>
  useContext(ClubContext);