/**
 * UserContext
 * Manages user profile, contribution history, backed campaigns, and simulated Reviewer Desk mode
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContributionRepository } from '../services/repository';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'user-demo-01',
    name: 'Ananya Sharma',
    handle: '@ananya_amplifies',
    email: 'ananya.s@example.org',
    role: 'Creator & Community Backer',
    isReviewerSimulated: true, // Allows testing the review & approval workflow
  });

  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

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
