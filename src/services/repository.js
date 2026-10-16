/**
 * Unified Repository Layer (Offline-First Local Demo Persistence)
 * Uses AsyncStorage for reliable state persistence without requiring cloud credentials
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_CAMPAIGNS } from '../data/seedCampaigns';
import { CAMPAIGN_STATUS } from '../constants';
import { calculateContributionBreakdown, calculateFundingMetrics } from '../utils/calculations';
import { isValidTransition } from '../utils/lifecycle';

const STORAGE_KEYS = {
  CAMPAIGNS: '@amplify_campaigns_v1',
  CONTRIBUTIONS: '@amplify_contributions_v1',
  NOTIFICATIONS: '@amplify_notifications_v1',
  DRAFT: '@amplify_creator_draft_v1',
  SAVED_CAMPAIGNS: '@amplify_saved_campaigns_v1',
  FOLLOWED_CAMPAIGNS: '@amplify_followed_campaigns_v1',
};

// Initial Activity / Notifications
const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'campaign_approved',
    title: 'Campaign Approved for Funding',
    message: '“Protect Local Drinking Wells” passed factual review and is now accepting community amplification funds.',
    timestamp: '2026-09-16T10:00:00Z',
    read: false,
    campaignId: 'camp-water-01',
  },
  {
    id: 'notif-2',
    type: 'milestone_reached',
    title: '50% Funding Milestone Reached!',
    message: 'Your campaign “Protect Local Drinking Wells” has reached 50% of its amplification goal (₹22,500).',
    timestamp: '2026-09-28T14:30:00Z',
    read: false,
    campaignId: 'camp-water-01',
  },
  {
    id: 'notif-3',
    type: 'changes_requested',
    title: 'Reviewer Feedback Received',
    message: 'Editorial board requested additional source links on “Preserve Heritage Handloom Weaving Traditions”.',
    timestamp: '2026-10-10T16:00:00Z',
    read: true,
    campaignId: 'camp-craft-06',
  },
  {
    id: 'notif-4',
    type: 'report_available',
    title: 'Audited Distribution Report Ready',
    message: 'Urban Micro-Forests campaign finished ad delivery. View measured reach and click breakdown.',
    timestamp: '2026-09-06T09:00:00Z',
    read: true,
    campaignId: 'camp-forest-04',
  },
];

export const CampaignRepository = {
  /**
   * Get all active and stored campaigns
   */
  async getAllCampaigns() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (stored) {
        return JSON.parse(stored);
      }
      // Seed initial data
      await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(SEED_CAMPAIGNS));
      return SEED_CAMPAIGNS;
    } catch (err) {
      console.warn('Error loading campaigns from storage, falling back to seed:', err);
      return SEED_CAMPAIGNS;
    }
  },

  /**
   * Get campaign by stable ID
   */
  async getCampaignById(id) {
    const campaigns = await this.getAllCampaigns();
    return campaigns.find(c => c.id === id) || null;
  },

  /**
   * Create or update a campaign
   */
  async saveCampaign(campaignData) {
    const campaigns = await this.getAllCampaigns();
    const existingIndex = campaigns.findIndex(c => c.id === campaignData.id);
    
    let updatedCampaigns;
    if (existingIndex >= 0) {
      updatedCampaigns = [...campaigns];
      updatedCampaigns[existingIndex] = {
        ...updatedCampaigns[existingIndex],
        ...campaignData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newCampaign = {
        ...campaignData,
        id: campaignData.id || `camp-custom-${Date.now()}`,
        amountRaised: campaignData.amountRaised || 0,
        backersCount: campaignData.backersCount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedCampaigns = [newCampaign, ...campaigns];
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(updatedCampaigns));
    return campaigns.find(c => c.id === campaignData.id) || updatedCampaigns[0];
  },

  /**
   * Safe status transition enforcement
   */
  async updateStatus(campaignId, nextStatus, extraData = {}) {
    const campaigns = await this.getAllCampaigns();
    const idx = campaigns.findIndex(c => c.id === campaignId);
    if (idx === -1) throw new Error(`Campaign ${campaignId} not found`);

    const currentStatus = campaigns[idx].status;
    if (!isValidTransition(currentStatus, nextStatus)) {
      console.warn(`Attempted invalid transition from ${currentStatus} to ${nextStatus}`);
      // In demo mode we allow reviewer simulation override if marked
      if (!extraData.isSimulationOverride) {
        throw new Error(`Cannot transition campaign from ${currentStatus} to ${nextStatus}`);
      }
    }

    const updated = {
      ...campaigns[idx],
      status: nextStatus,
      ...extraData,
      updatedAt: new Date().toISOString(),
    };

    campaigns[idx] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    return updated;
  },

  /**
   * Record contribution and update campaign funding safely
   */
  async recordContribution(campaignId, amount, backerInfo = {}) {
    const campaigns = await this.getAllCampaigns();
    const idx = campaigns.findIndex(c => c.id === campaignId);
    if (idx === -1) throw new Error('Campaign not found');

    const campaign = campaigns[idx];
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid contribution amount');
    }

    const newRaised = (Number(campaign.amountRaised) || 0) + numericAmount;
    const newBackersCount = (Number(campaign.backersCount) || 0) + 1;
    
    // Check if goal reached
    let nextStatus = campaign.status;
    if (newRaised >= campaign.fundingGoal && campaign.status === CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING) {
      nextStatus = CAMPAIGN_STATUS.FUNDING_GOAL_REACHED;
    }

    const updatedCampaign = {
      ...campaign,
      amountRaised: newRaised,
      backersCount: newBackersCount,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    campaigns[idx] = updatedCampaign;
    await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));

    // Save contribution record
    const receipt = await ContributionRepository.addContribution({
      campaignId,
      campaignTitle: campaign.title,
      category: campaign.category,
      amount: numericAmount,
      backerName: backerInfo.name || 'Anonymous Backer',
      backerEmail: backerInfo.email || null,
      isGuest: !backerInfo.email,
      status: 'successful',
    });

    // Notify backer & creator
    await NotificationRepository.addNotification({
      type: 'contribution_success',
      title: 'Contribution Confirmed',
      message: `You backed “${campaign.title}” with ₹${numericAmount}. Receipt #${receipt.receiptId}.`,
      campaignId,
    });

    if (nextStatus === CAMPAIGN_STATUS.FUNDING_GOAL_REACHED) {
      await NotificationRepository.addNotification({
        type: 'goal_reached',
        title: 'Goal 100% Funded!',
        message: `“${campaign.title}” has achieved its full distribution goal! Moving to ad preparation.`,
        campaignId,
      });
    }

    return { updatedCampaign, receipt };
  },

  /**
   * Reset data to initial seeds for testing/demonstration
   */
  async resetToSeeds() {
    await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(SEED_CAMPAIGNS));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    await AsyncStorage.removeItem(STORAGE_KEYS.CONTRIBUTIONS);
    await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT);
    return SEED_CAMPAIGNS;
  },
};

export const ContributionRepository = {
  async getAllContributions() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async addContribution(contributionData) {
    const list = await this.getAllContributions();
    const breakdown = calculateContributionBreakdown(contributionData.amount);
    
    const receipt = {
      id: `contrib-${Date.now()}`,
      receiptId: `AMP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      ...contributionData,
      breakdown,
    };

    const updatedList = [receipt, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(updatedList));
    return receipt;
  },

  async getContributionsByCampaign(campaignId) {
    const list = await this.getAllContributions();
    return list.filter(c => c.campaignId === campaignId);
  },
};

export const NotificationRepository = {
  async getNotifications() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  async markAsRead(id) {
    const list = await this.getNotifications();
    const updated = list.map(item => item.id === id ? { ...item, read: true } : item);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
  },

  async markAllAsRead() {
    const list = await this.getNotifications();
    const updated = list.map(item => ({ ...item, read: true }));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
  },

  async addNotification(notif) {
    const list = await this.getNotifications();
    const newItem = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif,
    };
    const updated = [newItem, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return newItem;
  },
};

export const DraftRepository = {
  async getDraft() {
    try {
      const draft = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  },

  async saveDraft(draftData) {
    const payload = {
      ...draftData,
      savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(payload));
    return payload;
  },

  async clearDraft() {
    await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT);
  },
};

export const BookmarksRepository = {
  async getSavedCampaignIds() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAMPAIGNS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async toggleSaveCampaign(id) {
    const list = await this.getSavedCampaignIds();
    let updated;
    if (list.includes(id)) {
      updated = list.filter(item => item !== id);
    } else {
      updated = [...list, id];
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CAMPAIGNS, JSON.stringify(updated));
    return updated;
  },
};
