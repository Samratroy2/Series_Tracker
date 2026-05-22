// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';

import './ProfilePage.css';

import defaultAvatar from '../assets/default-avatar.jpg';

const ProfilePage = () => {
  const { user, updateUser, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    password: '',
    photoURL: '',
    location: '',
  });

  const [preview, setPreview] =
    useState(null);

  // ✅ Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        userId: user.userId || '',
        location: user.location || '',
        password: '',
        photoURL: '',
      });

      // ✅ Firebase image URL
      setPreview(user.photoURL || null);
    }
  }, [user]);

  // ✅ Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Image preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        photoURL: file,
      }));

      setPreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ✅ Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateUser(formData);
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* Profile Image */}
        <div className="profile-image">
          <img
            src={
              preview || defaultAvatar
            }
            alt="Profile Preview"
          />

          <input
            type="file"
            accept="image/*"
            onChange={
              handlePhotoChange
            }
          />
        </div>

        {/* Name */}
        <label>
          Name:
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        {/* Email */}
        <label>
          Email:
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        {/* User ID */}
        <label>
          User ID:
          <input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            readOnly
          />
        </label>

        {/* Location */}
        <label>
          Location:
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </label>

        {/* Password */}
        <label>
          New Password:
          <input
            name="password"
            type="password"
            value={
              formData.password
            }
            onChange={handleChange}
          />
        </label>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;