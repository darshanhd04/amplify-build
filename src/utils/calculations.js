/**
 * Calculations & Financial Breakdown Utilities
 * Ensures transparent fee disclosures and deterministic reach estimates
 */

import { CURRENCY, FEE_SCHEDULE, ESTIMATION_MODEL } from '../constants';

/**
 * Format a number as currency (e.g., ₹2,500)
 */
export const formatCurrency = (amount, includeDecimals = false) => {
  const num = Number(amount);
  if (isNaN(num)) return `${CURRENCY.symbol}0`;
  
  const options = {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  };
  
  return `${CURRENCY.symbol}${num.toLocaleString('en-IN', options)}`;
};

/**
 * Format large reach numbers concisely (e.g., 45,200 or 1.2M)
 */
export const formatMetric = (num) => {
  const val = Number(num);
  if (isNaN(val) || val <= 0) return '0';
  
  if (val >= 10000000) {
    return `${(val / 10000000).toFixed(1)}Cr`;
  }
  if (val >= 100000) {
    return `${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}k`;
  }
  return val.toLocaleString('en-IN');
};

/**
 * Calculate transparent fee breakdown for an incoming contribution
 */
export const calculateContributionBreakdown = (contributionAmount) => {
  const amount = Math.max(0, Number(contributionAmount) || 0);
  
  // Explicit fee breakdown
  const platformFee = Math.round(amount * FEE_SCHEDULE.platformFeeRate * 100) / 100;
  const paymentFee = Math.round(amount * FEE_SCHEDULE.paymentFeeRate * 100) / 100;
  const totalFees = platformFee + paymentFee;
  const netAdBudget = Math.max(0, amount - totalFees);

  // Estimated incremental reach specifically unlocked by this contribution
  const estimatedReach = Math.round(netAdBudget * ESTIMATION_MODEL.reachPerCurrencyUnit);

  return {
    contributionAmount: amount,
    platformFee,
    paymentFee,
    totalFees,
    netAdBudget,
    estimatedReach,
  };
};

/**
 * Calculate campaign-level funding metrics
 */
export const calculateFundingMetrics = (amountRaised, fundingGoal) => {
  const raised = Math.max(0, Number(amountRaised) || 0);
  const goal = Math.max(1, Number(fundingGoal) || 1); // Guard division by zero
  
  const percentage = Math.min(100, Math.round((raised / goal) * 100));
  const remaining = Math.max(0, goal - raised);
  
  // Total ad budget generated from raised funds
  const netAdBudgetRaised = Math.round(raised * FEE_SCHEDULE.adBudgetRate);
  const estimatedCurrentReach = Math.round(netAdBudgetRaised * ESTIMATION_MODEL.reachPerCurrencyUnit);
  
  // Total ad budget potential at 100% goal
  const netAdBudgetAtGoal = Math.round(goal * FEE_SCHEDULE.adBudgetRate);
  const estimatedGoalReach = Math.round(netAdBudgetAtGoal * ESTIMATION_MODEL.reachPerCurrencyUnit);

  return {
    raised,
    goal,
    percentage,
    remaining,
    isFullyFunded: raised >= goal,
    netAdBudgetRaised,
    estimatedCurrentReach,
    netAdBudgetAtGoal,
    estimatedGoalReach,
  };
};

/**
 * Calculate campaign reach potential for a given creator funding goal
 */
export const calculateGoalEstimates = (fundingGoal) => {
  const goal = Math.max(0, Number(fundingGoal) || 0);
  const platformFee = Math.round(goal * FEE_SCHEDULE.platformFeeRate);
  const paymentFee = Math.round(goal * FEE_SCHEDULE.paymentFeeRate);
  const netAdBudget = Math.max(0, goal - platformFee - paymentFee);
  const estimatedTotalReach = Math.round(netAdBudget * ESTIMATION_MODEL.reachPerCurrencyUnit);

  return {
    fundingGoal: goal,
    platformFee,
    paymentFee,
    netAdBudget,
    estimatedTotalReach,
  };
};
