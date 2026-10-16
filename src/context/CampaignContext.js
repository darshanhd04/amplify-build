/**
 * Campaign Context
 * Central campaign state, search, category filtering, and real-time funding updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CampaignRepository, BookmarksRepository } from '../services/repository';
import { CAMPAIGN_STATUS } from '../constants';

const CampaignContext = createContext(null);

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // featured, newest, progress, goal
  const [savedIds, setSavedIds] = useState([]);

  // Load campaigns from local persistence
  const loadCampaigns = useCallback(async () => {
    try {
      const data = await CampaignRepository.getAllCampaigns();
      const saved = await BookmarksRepository.getSavedCampaignIds();
      setCampaigns(data);
      setSavedIds(saved);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCampaigns();
  }, [loadCampaigns]);

  // Toggle bookmark / saved
  const toggleSave = async (id) => {
    const updated = await BookmarksRepository.toggleSaveCampaign(id);
    setSavedIds(updated);
  };

  // Contribute to a campaign
  const recordContribution = async (campaignId, amount, backerInfo) => {
    const { updatedCampaign, receipt } = await CampaignRepository.recordContribution(campaignId, amount, backerInfo);
    setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c));
    return { updatedCampaign, receipt };
  };

  // Update status (e.g., from simulated reviewer actions)
  const updateCampaignStatus = async (campaignId, nextStatus, extraData = {}) => {
    const updated = await CampaignRepository.updateStatus(campaignId, nextStatus, extraData);
    setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
    return updated;
  };

  // Reset to seeds for clean demo
  const resetToSeeds = async () => {
    setLoading(true);
    const seeded = await CampaignRepository.resetToSeeds();
    setCampaigns(seeded);
    setSavedIds([]);
    setLoading(false);
  };

  // Filtered & sorted campaigns computation
  const filteredCampaigns = campaigns.filter(item => {
    // Category match
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.creatorName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'progress') {
      const progressA = (a.amountRaised / a.fundingGoal) || 0;
      const progressB = (b.amountRaised / b.fundingGoal) || 0;
      return progressB - progressA;
    }
    if (sortBy === 'reach') {
      return (b.fundingGoal || 0) - (a.fundingGoal || 0);
    }
    // Default featured: Active funding first, then promoting, completed
    return 0;
  });

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        filteredCampaigns,
        loading,
        refreshing,
        onRefresh,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        savedIds,
        toggleSave,
        recordContribution,
        updateCampaignStatus,
        resetToSeeds,
        loadCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error('useCampaigns must be used within CampaignProvider');
  return context;
};
