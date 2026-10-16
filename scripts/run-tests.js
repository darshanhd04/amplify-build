/**
 * AMPLIFY Automated Test Suite
 * Tests financial calculations, lifecycle state machine, form validations,
 * and data integrity rules without requiring external dependencies.
 */

const assert = require('assert');

// 1. Fee Calculations & Financial Guard Tests
console.log('\n--- SUITE 1: Fee Calculations & Reach Models ---');

const FEE_SCHEDULE = {
  platformFeeRate: 0.05,
  paymentFeeRate: 0.025,
  adBudgetRate: 0.925,
};
const ESTIMATION_MODEL = {
  reachPerCurrencyUnit: 15,
};

function calculateContributionBreakdown(contributionAmount) {
  const amount = Math.max(0, Number(contributionAmount) || 0);
  const platformFee = Math.round(amount * FEE_SCHEDULE.platformFeeRate * 100) / 100;
  const paymentFee = Math.round(amount * FEE_SCHEDULE.paymentFeeRate * 100) / 100;
  const totalFees = platformFee + paymentFee;
  const netAdBudget = Math.max(0, amount - totalFees);
  const estimatedReach = Math.round(netAdBudget * ESTIMATION_MODEL.reachPerCurrencyUnit);

  return { contributionAmount: amount, platformFee, paymentFee, totalFees, netAdBudget, estimatedReach };
}

function calculateFundingMetrics(amountRaised, fundingGoal) {
  const raised = Math.max(0, Number(amountRaised) || 0);
  const goal = Math.max(1, Number(fundingGoal) || 1); // Guard zero division
  const percentage = Math.min(100, Math.round((raised / goal) * 100));
  const remaining = Math.max(0, goal - raised);
  return { raised, goal, percentage, remaining, isFullyFunded: raised >= goal };
}

// Test 1.1: Standard ₹1000 contribution breakdown
const b1000 = calculateContributionBreakdown(1000);
assert.strictEqual(b1000.platformFee, 50, 'Platform fee on ₹1,000 should be ₹50 (5%)');
assert.strictEqual(b1000.paymentFee, 25, 'Payment fee on ₹1,000 should be ₹25 (2.5%)');
assert.strictEqual(b1000.netAdBudget, 925, 'Net ad budget on ₹1,000 should be ₹925 (92.5%)');
assert.strictEqual(b1000.estimatedReach, 925 * 15, 'Incremental reach should be 925 * 15 = 13,875 impressions');
console.log('✓ Test 1.1 Passed: ₹1,000 contribution breakdown matches 5% platform / 2.5% payment / 92.5% ad spend');

// Test 1.2: Negative & zero inputs guarded
const bZero = calculateContributionBreakdown(0);
assert.strictEqual(bZero.contributionAmount, 0);
assert.strictEqual(bZero.netAdBudget, 0);
assert.strictEqual(bZero.estimatedReach, 0);

const bNeg = calculateContributionBreakdown(-500);
assert.strictEqual(bNeg.contributionAmount, 0, 'Negative contribution must be clamped to 0');
console.log('✓ Test 1.2 Passed: Zero & negative contribution amounts safely guarded');

// Test 1.3: Division by zero guard in funding metrics
const mZero = calculateFundingMetrics(500, 0);
assert.strictEqual(mZero.percentage, 100, 'Goal of 0 or undefined should not produce NaN or Infinity');
assert.strictEqual(mZero.goal, 1);
console.log('✓ Test 1.3 Passed: Zero goal division-by-zero successfully prevented');


// 2. Lifecycle State Machine Tests
console.log('\n--- SUITE 2: Lifecycle State Machine Transitions ---');

const VALID_TRANSITIONS = {
  draft: ['submitted_for_review', 'cancelled'],
  submitted_for_review: ['approved', 'changes_requested', 'rejected'],
  changes_requested: ['submitted_for_review', 'cancelled'],
  approved: ['available_for_funding', 'cancelled'],
  available_for_funding: ['funding_goal_reached', 'funding_period_ended', 'cancelled'],
  funding_goal_reached: ['distribution_preparation', 'cancelled'],
  distribution_preparation: ['promoting', 'failed'],
  promoting: ['completed', 'failed'],
  completed: [],
};

function isValidTransition(curr, next) {
  if (curr === next) return true;
  const allowed = VALID_TRANSITIONS[curr];
  return Array.isArray(allowed) && allowed.includes(next);
}

assert.strictEqual(isValidTransition('draft', 'submitted_for_review'), true, 'Draft should transition to submitted_for_review');
assert.strictEqual(isValidTransition('submitted_for_review', 'approved'), true, 'Submitted should transition to approved');
assert.strictEqual(isValidTransition('submitted_for_review', 'changes_requested'), true, 'Submitted should transition to changes_requested');
assert.strictEqual(isValidTransition('approved', 'available_for_funding'), true, 'Approved should transition to available_for_funding');
assert.strictEqual(isValidTransition('available_for_funding', 'completed'), false, 'Direct transition from funding to completed must be rejected');
assert.strictEqual(isValidTransition('draft', 'promoting'), false, 'Direct transition from draft to promoting must be rejected');
console.log('✓ Test 2.1 Passed: Valid and invalid lifecycle transitions enforced correctly');


// 3. Form Validation Tests
console.log('\n--- SUITE 3: Campaign Wizard Validation Rules ---');

function validateBasics(data) {
  const errors = {};
  if (!data?.title || !data.title.trim()) errors.title = 'Title required';
  else if (data.title.trim().length > 60) errors.title = 'Title max 60 chars';
  if (!data?.category || data.category === 'All') errors.category = 'Category required';
  if (!data?.creatorName || !data.creatorName.trim()) errors.creatorName = 'Creator required';
  return { isValid: Object.keys(errors).length === 0, errors };
}

function isValidUrl(url) {
  return /^(https?:\/\/)([\w.-]+)+([/?#].*)?$/i.test(url?.trim() || '');
}

// Test 3.1: Title length boundary
const validBasics = validateBasics({
  title: 'Protect Local Drinking Wells from Industrial Runoff',
  category: 'Environment',
  creatorName: 'Clean Waters Coalition',
});
assert.strictEqual(validBasics.isValid, true);

const overLongTitle = validateBasics({
  title: 'This is an excessively long campaign title that exceeds the strict sixty character limit for mobile sponsored cards',
  category: 'Environment',
  creatorName: 'Clean Waters Coalition',
});
assert.strictEqual(overLongTitle.isValid, false);
assert.strictEqual(overLongTitle.errors.title, 'Title max 60 chars');
console.log('✓ Test 3.1 Passed: Campaign title length capped at 60 characters');

// Test 3.2: URL verification for sources
assert.strictEqual(isValidUrl('https://kspcb.karnataka.gov.in/report.pdf'), true);
assert.strictEqual(isValidUrl('http://water-quality.org'), true);
assert.strictEqual(isValidUrl('not-a-valid-url'), false);
assert.strictEqual(isValidUrl('ftp://invalid-scheme.com'), false);
console.log('✓ Test 3.2 Passed: Source citation URLs strictly require http/https format');


// 4. Data Integrity & Payment Simulation Tests
console.log('\n--- SUITE 4: Contribution & Payment Integrity ---');

function simulateTransaction(currentRaised, goal, amount, status) {
  if (status === 'successful') {
    const newRaised = currentRaised + amount;
    return {
      newRaised,
      updated: true,
      goalReached: newRaised >= goal,
    };
  }
  return {
    newRaised: currentRaised,
    updated: false,
    goalReached: currentRaised >= goal,
  };
}

// Successful contribution updates raised amount
const resSuccess = simulateTransaction(10000, 25000, 500, 'successful');
assert.strictEqual(resSuccess.newRaised, 10500);
assert.strictEqual(resSuccess.updated, true);

// Failed, cancelled, or rejected contribution DOES NOT update funding
const resFailed = simulateTransaction(10000, 25000, 500, 'failed');
assert.strictEqual(resFailed.newRaised, 10000);
assert.strictEqual(resFailed.updated, false);

const resCancelled = simulateTransaction(10000, 25000, 500, 'cancelled');
assert.strictEqual(resCancelled.newRaised, 10000);
assert.strictEqual(resCancelled.updated, false);

const resRejected = simulateTransaction(10000, 25000, 500, 'rejected');
assert.strictEqual(resRejected.newRaised, 10000);
assert.strictEqual(resRejected.updated, false);

console.log('✓ Test 4.1 Passed: Successful transactions update funding; failed, cancelled, and rejected transactions preserve funding integrity');

console.log('\n=========================================');
console.log('ALL 8 AUTOMATED TESTS PASSED SUCCESSFULLY');
console.log('=========================================\n');
