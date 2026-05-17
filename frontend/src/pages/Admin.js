// frontend/src/pages/Admin.js

import React, { useEffect, useState } from 'react';
import './AdminPanel.css';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);

  const isAdmin = user?.email === 'trysamrat1@gmail.com';
  if (!user || !isAdmin) return <Navigate to="/login" />;

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`process.env.REACT_APP_API_URL/api/auth/users?email=${user.email}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch clubs from backend
  const fetchClubs = async () => {
    try {
      const res = await fetch('process.env.REACT_APP_API_URL/api/clubs');
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClubs();
  }, [user.email]);

  // Delete user
  const deleteUser = async (id, email) => {
    if (email === 'trysamrat1@gmail.com') {
      alert("You can't delete the admin!");
      return;
    }

    const confirmDel = window.confirm(`Delete user ${email} and all related data?`);
    if (!confirmDel) return;

    try {
      const res = await fetch(`process.env.REACT_APP_API_URL/api/auth/users/${id}?adminEmail=${user.email}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Deletion failed');
      }
      alert(`User ${email} deleted`);
      fetchUsers();
    } catch (err) {
      console.error(err.message);
      alert('Error deleting user.');
    }
  };

  // Delete club
  const deleteClub = async (id) => {
    const confirmDel = window.confirm('Delete this club and all data?');
    if (!confirmDel) return;

    try {
      const res = await fetch(`process.env.REACT_APP_API_URL/api/clubs/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ email: user.email }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to delete club');

      setClubs(prev => prev.filter(c => c._id !== id));
      alert('Club deleted successfully');
    } catch (err) {
      console.error(err.message);
      alert('Error deleting club.');
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      <section>
        <h2>Users</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="admin-list">
            {users.map(user => (
              <li key={user._id} className="admin-item">
                <span>
                  <strong>{user.name || 'No Name'}</strong> ({user.email})
                </span>
                {user.email !== 'trysamrat1@gmail.com' && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(user._id, user.email)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Clubs</h2>
        {clubs.length === 0 ? (
          <p>No clubs available.</p>
        ) : (
          <ul className="admin-list">
            {clubs.map(club => (
              <li key={club._id} className="admin-item">
                <span>
                  <strong>{club.name}</strong> - {club.members?.length || 0} members
                </span>
                <button className="delete-btn" onClick={() => deleteClub(club._id)}>
                  Delete Club
                </button>
                {club.joinRequests?.length > 0 && (
                  <div className="join-requests">
                    <strong>Pending Join Requests:</strong>
                    {club.joinRequests.map(email => (
                      <div key={email}>{email}</div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminPanel;
