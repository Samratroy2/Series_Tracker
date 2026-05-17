// frontend/src/pages/ClubPage.js

// frontend/src/pages/ClubPage.js

import React, { useState, useEffect, useRef } from 'react';
import { useClubs } from '../contexts/ClubContext';
import { useAuth } from '../contexts/AuthContext';
import './ClubPage.css';

const ClubPage = () => {
  const { clubs, addMessage, addPoll, votePoll, requestJoinClub, approveJoin, createClub } = useClubs();
  const { user } = useAuth();
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [text, setText] = useState('');
  const [pollMode, setPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [newClubName, setNewClubName] = useState('');
  const [showChat, setShowChat] = useState(false); // mobile toggle
  const messagesEndRef = useRef(null);

  const club = clubs.find(c => c._id === selectedClubId);
  const isMember = club?.members?.includes(user.email);
  const isCreator = club?.createdBy === user.email;

  // Remove automatic selection of the first club
  useEffect(() => {
    // nothing here, user must click a club
  }, [clubs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [club?.messages, club?.polls]);

  const handleSendMessage = async () => {
    if (!text.trim() || !user || !club) return;
    await addMessage(club._id, user.name || user.email, text.trim());
    setText('');
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim()) || !club) return;
    await addPoll(club._id, pollQuestion.trim(), pollOptions.map(o => o.trim()), user.name || user.email);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollMode(false);
  };

  const handleVote = async (pollId, optionIndex) => {
    if (!user || !club) return;
    await votePoll(club._id, pollId, optionIndex, user.email);
  };

  const handleJoinRequest = async () => {
    if (!user || !club) return;
    await requestJoinClub(club._id, user.email);
  };

  const handleCreateClub = async () => {
    if (!newClubName.trim() || !user) return;
    const newClub = await createClub(newClubName.trim(), user.email);
    setNewClubName('');
    setSelectedClubId(newClub._id);
    if (window.innerWidth < 768) setShowChat(true); // open chat on mobile after creating a club
  };

  const handleSelectClub = (id) => {
    setSelectedClubId(id);
    if (window.innerWidth < 768) setShowChat(true); // open chat only when clicked
  };

  const handleBack = () => {
    setShowChat(false); // go back to club list on mobile
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="club-wrapper">
      {/* Sidebar */}
      {(!showChat || window.innerWidth >= 768) && (
        <div className="club-sidebar">
          <h3>Clubs</h3>
          <div className="create-club">
            <input
              type="text"
              placeholder="New club name..."
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
            />
            <button onClick={handleCreateClub}>+ Create</button>
          </div>
          {clubs.map(c => (
            <div
              key={c._id}
              className={`club-item ${selectedClubId === c._id ? 'selected' : ''}`}
              onClick={() => handleSelectClub(c._id)}
            >
              {c.name}
            </div>
          ))}
        </div>
      )}

      {/* Main chat area */}
      {(showChat || window.innerWidth >= 768) && (
        <div className="club-main">
          {/* Back button for mobile */}
          {window.innerWidth < 768 && (
            <button onClick={handleBack} style={{ margin: '10px', padding: '6px 12px' }}>
              ← Back
            </button>
          )}

          {club ? (
            <>
              <div className="club-header">{club.name}</div>

              {!isMember && !isCreator ? (
                <div style={{ textAlign: 'center', margin: '20px' }}>
                  <p>This club is private. You need approval to join.</p>
                  <button onClick={handleJoinRequest}>Request to Join</button>
                </div>
              ) : (
                <>
                  {/* Join Requests for creator */}
                  {isCreator && club.joinRequests?.length > 0 && (
                    <div className="join-requests">
                      <h4>Pending Join Requests</h4>
                      {club.joinRequests.map(email => (
                        <div key={email} className="join-request-item">
                          <span>{email}</span>
                          <button onClick={() => approveJoin(club._id, email)}>Approve</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Messages & Polls */}
                  <div className="messages">
                    {[...(club.messages?.map(m => ({ ...m, type: 'message' })) || []),
                      ...(club.polls?.map(p => ({ ...p, type: 'poll' })) || [])]
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map(item => {
                        if (item.type === 'message') {
                          return (
                            <div
                              key={item._id || item.createdAt}
                              className={`message ${item.user === user?.email ? 'own' : 'other'}`}
                            >
                              <div className="message-header">
                                <span className="user">{item.user}</span>
                                <span className="time">{formatTime(item.createdAt)}</span>
                              </div>
                              <div className="message-text">{item.text}</div>
                            </div>
                          );
                        } else if (item.type === 'poll') {
                          const isOwn = item.createdBy === user?.email;
                          return (
                            <div key={item._id} className={`poll ${isOwn ? 'own' : 'other'}`}>
                              <div className="message-header">
                                <span className="user">{item.createdByName || item.createdBy}</span>
                                <span className="time">{formatTime(item.createdAt)}</span>
                              </div>
                              <div className="poll-question">{item.question}</div>
                              {item.options?.map((opt, idx) => {
                                const hasVoted = item.voters?.includes(user?.email);
                                const totalVotes = item.options.reduce((sum, o) => sum + o.votes, 0);
                                const percentage = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                return (
                                  <div key={idx} className={`poll-option ${hasVoted ? 'voted' : ''}`}>
                                    <span className="label">{opt.text}</span>
                                    <div className="bar" style={{ width: `${percentage}%` }} />
                                    <span className="votes">{opt.votes} ({percentage}%)</span>
                                    {!hasVoted && <button onClick={() => handleVote(item._id, idx)}>Vote</button>}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send message / poll */}
                  <div className="send-message">
                    {pollMode ? (
                      <div className="poll-inputs">
                        <input
                          type="text"
                          placeholder="Poll question"
                          value={pollQuestion}
                          onChange={e => setPollQuestion(e.target.value)}
                        />
                        {pollOptions.map((opt, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={e => {
                              const newOpts = [...pollOptions];
                              newOpts[idx] = e.target.value;
                              setPollOptions(newOpts);
                            }}
                          />
                        ))}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button onClick={() => setPollOptions([...pollOptions, ''])}>+ Add Option</button>
                          <button onClick={handleCreatePoll}>Create Poll</button>
                          <button onClick={() => setPollMode(false)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={text}
                          onChange={e => setText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                        <button onClick={() => setPollMode(true)}>📊</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <p style={{ textAlign: 'center', marginTop: '50px' }}>Select a club to start chatting</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubPage;
