// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  UserCircle,
  Search,
  Filter,
} from 'lucide-react';

import './Sidebar.css';
import defaultAvatar from '../assets/default-avatar.jpg';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user, logout, loading } = useAuth();

  const toggleSidebar = () => setIsOpen(prev => !prev);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const profileImageUrl = user?.photoURL || defaultAvatar;

  const menuItems = [
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} />, title: 'Edit Profile' },
    { name: 'Home', path: '/', icon: <Home size={20} />, title: 'Home' },
    { name: 'Watching', path: '/watchlist/watching', icon: <Eye size={20} />, title: 'Watching' },
    { name: 'Completed', path: '/watchlist/completed', icon: <CheckCircle size={20} />, title: 'Completed' },
    { name: 'On Hold', path: '/watchlist/on-hold', icon: <PauseCircle size={20} />, title: 'On Hold' },
    { name: 'Dropped', path: '/watchlist/dropped', icon: <XCircle size={20} />, title: 'Dropped' },
    { name: 'Plan to Watch', path: '/watchlist/plan-to-watch', icon: <Clock size={20} />, title: 'Plan to Watch' },
    { name: 'Clubs', path: '/clubs', icon: <Users size={20} />, title: 'Clubs' },
    { name: 'Search', path: '/search', icon: <Search size={20} />, title: 'Search Anime' },
    { name: 'Filter', path: '/filter?filter=true', icon: <Filter size={20} />, title: 'Filter by Genre' },
    ...(user?.role === 'admin'
    ? [
        {
          name: 'Admin Panel',
          path: '/admin',
          icon: <Shield size={20} />,
          title: 'Admin Panel',
        },
      ]
    : []),
  ];

  return (
    <div className={`sidebar ${isOpen ? 'expanded' : 'collapsed'} ${isMobile ? 'mobile' : ''}`}>
      <div className="sidebar-top">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="sidebar-header">
        <div className={isOpen ? 'profile-wrapper' : 'profile-wrapper-collapsed'}>
          <div className="logo-circle">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="sidebar-avatar"
            />
          </div>
          {!loading && isOpen && (
            <h2 className="sidebar-user-name">{user?.name || 'Guest'}</h2>
          )}
        </div>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <li
              key={idx}
              className={`menu-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? item.title : ''}
            >
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                {isOpen && <span className="text">{item.name}</span>}
              </Link>
            </li>
          );
        })}

        <li className="menu-item logout" title={!isOpen ? 'Logout' : ''}>
          <button className="logout-link" onClick={handleLogout}>
            <span className="icon"><LogOut size={20} /></span>
            {isOpen && <span className="text">Logout</span>}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
