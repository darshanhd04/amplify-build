/**
 * UserContext
 * Manages user profile, contribution history, backed campaigns, and simulated Reviewer Desk mode
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContributionRepository } from '../services/repository';

const USER_SESSION_KEY = '@amplify_user_session_v1';

const DEFAULT_USER = {
  id: 'user-demo-01',
  name: 'Ananya Sharma',
  handle: '@ananya_amplifies',
  email: 'ananya.s@example.org',
  role: 'Creator & Community Backer',
  isReviewerSimulated: true, // Allows testing the review & approval workflow
};

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore session from AsyncStorage if available
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(USER_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.isLoggedIn && parsed?.user) {
            setUser(parsed.user);
            setIsLoggedIn(true);
          }
        }
      } catch (e) {
        console.warn('Failed to restore user session:', e);
      }
    };
    restoreSession();
  }, []);

  const login = async (customUser = {}) => {
    const updated = {
      ...user,
      ...customUser,
    };
    setUser(updated);
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem(
        USER_SESSION_KEY,
        JSON.stringify({ isLoggedIn: true, user: updated })
      );
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
    return updated;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  };

  const loadContributions = useCallback(async () => {
    try {
      const data = await ContributionRepository.getAllContributions();
      setContributions(data);
    } catch (e) {
      console.warn('Failed to load user contributions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContributions();
  }, [loadContributions]);

  const toggleReviewerMode = () => {
    setUser(prev => ({
      ...prev,
      isReviewerSimulated: !prev.isReviewerSimulated,
    }));
  };

  // Aggregated impact statistics
  const totalContributed = contributions
    .filter(c => c.status === 'successful')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const totalAmplifiedReach = contributions
    .filter(c => c.status === 'successful')
    .reduce((sum, c) => sum + (c.breakdown?.estimatedReach || 0), 0);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        contributions,
        totalContributed,
        totalAmplifiedReach,
        loading,
        loadContributions,
        toggleReviewerMode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
