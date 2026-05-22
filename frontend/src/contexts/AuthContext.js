// src/contexts/AuthContext.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { toast } from 'react-toastify';

import { auth, db, storage } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        const firestoreUser = userSnap.exists()
          ? userSnap.data()
          : {};

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          ...firestoreUser,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    try {
      setLoading(true);

      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const userRef = doc(db, 'users', res.user.uid);

    const userSnap = await getDoc(userRef);

    const firestoreUser = userSnap.exists()
      ? userSnap.data()
      : {};

    const loggedInUser = {
      uid: res.user.uid,
      email: res.user.email,
      ...firestoreUser,
    };

    // ✅ immediately replace guest user
    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signup
  const signup = async (name, email, password) => {
    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(res.user, {
        displayName: name,
      });

      const customUserId = `USER_${Math.floor(
        10000 + Math.random() * 90000
      )}`;

      const userData = {
        uid: res.user.uid,
        userId: customUserId,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      await setDoc(
        doc(db, 'users', res.user.uid),
        userData
      );

      setUser(userData);

      return {
        success: true,
        user: userData,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Continue as Guest
  const continueAsGuest = () => {
    const guestUser = {
      uid: `guest_${Date.now()}`,
      name: 'Guest',
      email: 'guest@guest.com',
      role: 'guest',
    };

    setUser(guestUser);
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Update User Profile
  const updateUser = async (updatedData) => {
    try {
      setLoading(true);

      let photoURL = user?.photoURL || '';

      // Upload new profile image
      if (updatedData.photoURL instanceof File) {
        const storageRef = ref(
          storage,
          `profilePhotos/${user.uid}`
        );

        await uploadBytes(
          storageRef,
          updatedData.photoURL
        );

        photoURL = await getDownloadURL(storageRef);
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: updatedData.name,
        photoURL,
      });

      // Update password if provided
      if (updatedData.password) {
        await updatePassword(
          auth.currentUser,
          updatedData.password
        );
      }

      // Update Firestore user document
      const updatedUser = {
        name: updatedData.name,
        email: updatedData.email,
        userId: updatedData.userId || user.userId,
        location: updatedData.location || '',
        photoURL,
      };

      await updateDoc(
        doc(db, 'users', user.uid),
        updatedUser
      );

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        continueAsGuest,
        updateUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);