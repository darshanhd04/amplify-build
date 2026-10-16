/**
 * AMPLIFY Application Constants
 * Campaign statuses, categories, reach multipliers, and fee schedules
 */

export const APP_NAME = 'AMPLIFY';
export const APP_TAGLINE = 'Important messages deserve a wider audience.';
export const APP_SUBTITLE = 'Discover campaigns, understand their stories, and help messages reach beyond existing networks.';

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
};

// Distinct Campaign Lifecycles
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SUBMITTED_FOR_REVIEW: 'submitted_for_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  AVAILABLE_FOR_FUNDING: 'available_for_funding',
  FUNDING_GOAL_REACHED: 'funding_goal_reached',
  FUNDING_PERIOD_ENDED: 'funding_period_ended',
  DISTRIBUTION_PREPARATION: 'distribution_preparation',
  PROMOTING: 'promoting',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUND_PENDING: 'refund_pending',
  FAILED: 'failed',
};

export const STATUS_METADATA = {
  [CAMPAIGN_STATUS.DRAFT]: {
    label: 'Draft',
    badgeBg: '#F3F4F6',
    textColor: '#4B5563',
    description: 'Campaign is saved locally and being authored.',
  },
  [CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW]: {
    label: 'Under Review',
    badgeBg: '#FEF3C7',
    textColor: '#B45309',
    description: 'Submitted for editorial and compliance fact-checking.',
  },
  [CAMPAIGN_STATUS.CHANGES_REQUESTED]: {
    label: 'Changes Requested',
    badgeBg: '#FEE2E2',
    textColor: '#B91C1C',
    description: 'Reviewers require updates or additional sources before approval.',
  },
  [CAMPAIGN_STATUS.APPROVED]: {
    label: 'Approved',
    badgeBg: '#DCFCE7',
    textColor: '#15803D',
    description: 'Campaign passed fact-checking and is ready for funding.',
  },
  [CAMPAIGN_STATUS.REJECTED]: {
    label: 'Rejected',
    badgeBg: '#FEE2E2',
    textColor: '#991B1B',
    description: 'Campaign did not meet factual verification criteria.',
  },
  [CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING]: {
    label: 'Funding Active',
    badgeBg: '#E6F3EA',
    textColor: '#174D3B',
    description: 'Actively accepting community amplification funds.',
  },
  [CAMPAIGN_STATUS.FUNDING_GOAL_REACHED]: {
    label: 'Goal Reached',
    badgeBg: '#D1FAE5',
    textColor: '#065F46',
    description: '100% of distribution budget funded. Preparing ad delivery.',
  },
  [CAMPAIGN_STATUS.FUNDING_PERIOD_ENDED]: {
    label: 'Funding Ended',
    badgeBg: '#E5E7EB',
    textColor: '#374151',
    description: 'Funding window concluded.',
  },
  [CAMPAIGN_STATUS.DISTRIBUTION_PREPARATION]: {
    label: 'Preparing Ads',
    badgeBg: '#E0E7FF',
    textColor: '#3730A3',
    description: 'Ad creative assets are undergoing platform ad review.',
  },
  [CAMPAIGN_STATUS.PROMOTING]: {
    label: 'Live Amplification',
    badgeBg: '#DBEAFE',
    textColor: '#1E40AF',
    description: 'Ad messages are actively serving across selected channels.',
  },
  [CAMPAIGN_STATUS.COMPLETED]: {
    label: 'Completed',
    badgeBg: '#F3F4F6',
    textColor: '#1F2937',
    description: 'Distribution completed. Verified report published.',
  },
  [CAMPAIGN_STATUS.CANCELLED]: {
    label: 'Cancelled',
    badgeBg: '#FEE2E2',
    textColor: '#991B1B',
    description: 'Cancelled by creator or community safety team.',
  },
  [CAMPAIGN_STATUS.REFUND_PENDING]: {
    label: 'Refund Pending',
    badgeBg: '#FEF3C7',
    textColor: '#92400E',
    description: 'Unspent funds are being calculated for pro-rata refunds.',
  },
  [CAMPAIGN_STATUS.FAILED]: {
    label: 'Delivery Incomplete',
    badgeBg: '#FEE2E2',
    textColor: '#991B1B',
    description: 'Ad delivery could not be completed by ad networks.',
  },
};

// Campaign Categories
export const CATEGORIES = [
  'All',
  'Environment',
  'Health',
  'Science',
  'Education',
  'Public Policy',
  'Economic Policy',
  'Community',
  'Arts & Culture',
  'Business',
  'Other',
];

// Fee Schedule Config (Transparent disclosure)
export const FEE_SCHEDULE = {
  platformFeeRate: 0.05, // 5% platform curation & compliance review fee
  paymentFeeRate: 0.025, // 2.5% card / payment network processing fee
  adBudgetRate: 0.925,   // 92.5% of gross funding goes directly to paid ad distribution
};

// Reach Estimation Model Config
// Illustrative benchmark: ~15 verified impressions per ₹1 net ad spend
export const ESTIMATION_MODEL = {
  reachPerCurrencyUnit: 15,
  minContribution: 50,
  maxContribution: 500000,
  defaultContribution: 250,
};

// Contribution Preset Amounts
export const CONTRIBUTION_PRESETS = [100, 250, 500, 1000];

// Simulated Payment Outcomes for QA / Demo
export const SIMULATED_PAYMENT_OUTCOMES = {
  SUCCESS: 'success',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  FAILED: 'failed',
};

// Distribution Placements
export const AD_PLACEMENTS = [
  { id: 'feed', name: 'Social In-Feed', desc: 'Promoted posts in mobile social feeds' },
  { id: 'stories', name: 'Stories & Reels', desc: 'Full screen vertical video and static cards' },
  { id: 'search', name: 'Search & Contextual', desc: 'Top contextual results on advocacy queries' },
  { id: 'local_news', name: 'Local News Networks', desc: 'High visibility regional publisher banners' },
];

// Available Distribution Channels
export const DISTRIBUTION_CHANNELS = [
  { id: 'instagram', name: 'Instagram & Meta Ads', icon: 'logo-instagram' },
  { id: 'youtube', name: 'YouTube Shorts & Video', icon: 'logo-youtube' },
  { id: 'linkedin', name: 'LinkedIn Professional', icon: 'logo-linkedin' },
  { id: 'regional_media', name: 'Regional Digital Media', icon: 'newspaper-outline' },
];

// Creator Dashboard Tabs
export const CREATOR_TABS = [
  { id: 'all', label: 'All' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'review', label: 'Under Review' },
  { id: 'funding', label: 'Funding' },
  { id: 'promoting', label: 'Promoting' },
  { id: 'completed', label: 'Completed' },
  { id: 'action', label: 'Requires Action' },
];
