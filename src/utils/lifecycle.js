/**
 * Campaign Lifecycle State Machine & Transition Rules
 * Validates legitimate status changes and guards business rules
 */

import { CAMPAIGN_STATUS } from '../constants';

// Explicit allowed transitions map
const VALID_TRANSITIONS = {
  [CAMPAIGN_STATUS.DRAFT]: [
    CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW,
    CAMPAIGN_STATUS.CANCELLED,
  ],
  [CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW]: [
    CAMPAIGN_STATUS.APPROVED,
    CAMPAIGN_STATUS.CHANGES_REQUESTED,
    CAMPAIGN_STATUS.REJECTED,
  ],
  [CAMPAIGN_STATUS.CHANGES_REQUESTED]: [
    CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW,
    CAMPAIGN_STATUS.CANCELLED,
  ],
  [CAMPAIGN_STATUS.APPROVED]: [
    CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING,
    CAMPAIGN_STATUS.CANCELLED,
  ],
  [CAMPAIGN_STATUS.REJECTED]: [
    CAMPAIGN_STATUS.DRAFT, // Allowed to revise as new draft
  ],
  [CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING]: [
    CAMPAIGN_STATUS.FUNDING_GOAL_REACHED,
    CAMPAIGN_STATUS.FUNDING_PERIOD_ENDED,
    CAMPAIGN_STATUS.CANCELLED,
  ],
  [CAMPAIGN_STATUS.FUNDING_GOAL_REACHED]: [
    CAMPAIGN_STATUS.DISTRIBUTION_PREPARATION,
    CAMPAIGN_STATUS.CANCELLED,
  ],
  [CAMPAIGN_STATUS.FUNDING_PERIOD_ENDED]: [
    CAMPAIGN_STATUS.DISTRIBUTION_PREPARATION, // If minimum threshold reached
    CAMPAIGN_STATUS.REFUND_PENDING,          // If threshold not met
  ],
  [CAMPAIGN_STATUS.DISTRIBUTION_PREPARATION]: [
    CAMPAIGN_STATUS.PROMOTING,
    CAMPAIGN_STATUS.FAILED,
  ],
  [CAMPAIGN_STATUS.PROMOTING]: [
    CAMPAIGN_STATUS.COMPLETED,
    CAMPAIGN_STATUS.FAILED,
  ],
  [CAMPAIGN_STATUS.CANCELLED]: [
    CAMPAIGN_STATUS.REFUND_PENDING,
  ],
  [CAMPAIGN_STATUS.REFUND_PENDING]: [
    CAMPAIGN_STATUS.COMPLETED,
  ],
  [CAMPAIGN_STATUS.FAILED]: [
    CAMPAIGN_STATUS.REFUND_PENDING,
  ],
  [CAMPAIGN_STATUS.COMPLETED]: [],
};

/**
 * Validate whether a transition from currentStatus to nextStatus is allowed
 */
export const isValidTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(nextStatus);
};

/**
 * Check if the campaign is currently open to accept backer contributions
 */
export const canAcceptContributions = (status) => {
  return status === CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING;
};

/**
 * Check if the creator can edit campaign story and visuals
 */
export const isCampaignEditable = (status) => {
  return (
    status === CAMPAIGN_STATUS.DRAFT ||
    status === CAMPAIGN_STATUS.CHANGES_REQUESTED
  );
};

/**
 * Check if a distribution / verification report exists to view
 */
export const hasDistributionReport = (status) => {
  return (
    status === CAMPAIGN_STATUS.PROMOTING ||
    status === CAMPAIGN_STATUS.COMPLETED
  );
};
