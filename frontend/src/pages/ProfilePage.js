// src/pages/ProfilePage.js
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css'; // optional external CSS
import defaultAvatar from '../assets/default-avatar.jpg'; // fallback image (optional)

const ProfilePage = () => {
  const { user, updateUser, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    password: '',
    profilePhoto: '',
    location: '',
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (user) {
        setFormData({
        name: user.name || '',
        email: user.email || '',
        userId: user.userId || '',
        location: user.location || '',
        password: '',
        profilePhoto: user.profileImage || '',
        });

        // Smart preview resolution
        const imageUrl = user.profileImage
        ? user.profileImage.startsWith('http')
            ? user.profileImage
            : `process.env.REACT_APP_API_URL/uploads/${user.profileImage}`
        : null;

        setPreview(imageUrl);
    }
    }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(formData);
  };

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="profile-image">
          <img
            src={preview || defaultAvatar}
            alt="Profile Preview"
          />
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <label>
          Name:
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Email:
          <input name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>
          User ID:
          <input name="userId" value={formData.userId} onChange={handleChange} required />
        </label>

        <label>
          Location:
          <input name="location" value={formData.location} onChange={handleChange} />
        </label>

        <label>
          New Password:
          <input name="password" type="password" value={formData.password} onChange={handleChange} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
