/**
 * ContributionScreen
 * Complete 5-step contribution flow with transparent fee disclosures,
 * live incremental reach calculation, and deterministic simulated checkout.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { CONTRIBUTION_PRESETS, SIMULATED_PAYMENT_OUTCOMES } from '../../constants';
import { useCampaigns } from '../../context/CampaignContext';
import { useUser } from '../../context/UserContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FeeBreakdownView } from '../../components/campaign/FeeBreakdownView';
import { NoticeBanner } from '../../components/common/NoticeBanner';
import { formatCurrency, calculateFundingMetrics } from '../../utils/calculations';
import { validateContribution } from '../../utils/validation';

export const ContributionScreen = ({ route, navigation }) => {
  const { campaignId } = route.params || {};
  const { campaigns, recordContribution } = useCampaigns();
  const { loadContributions } = useUser();

  const campaign = campaigns.find(c => c.id === campaignId) || campaigns[0];

  const [selectedPreset, setSelectedPreset] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Backer info (guest by default)
  const [backerName, setBackerName] = useState('');
  const [backerEmail, setBackerEmail] = useState('');
  const [keepAnonymous, setKeepAnonymous] = useState(true);

  // Simulated Payment Outcome Selector for QA / Testing
  const [simulatedOutcome, setSimulatedOutcome] = useState(SIMULATED_PAYMENT_OUTCOMES.SUCCESS);
  const [processing, setProcessing] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState(null);

  const activeAmount = useCustom ? Number(customAmount) || 0 : selectedPreset;
  const metrics = calculateFundingMetrics(campaign.amountRaised, campaign.fundingGoal);

  const handleSelectPreset = (amount) => {
    setSelectedPreset(amount);
    setUseCustom(false);
    setCustomAmount('');
    setPaymentFeedback(null);
  };

  const handleCustomChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setCustomAmount(numeric);
    setUseCustom(true);
    setPaymentFeedback(null);
  };

  const handleProceedPayment = async () => {
    const valResult = validateContribution(activeAmount);
    if (!valResult.isValid) {
      setPaymentFeedback({
        type: 'error',
        message: valResult.error,
      });
      return;
    }

    setProcessing(true);
    setPaymentFeedback(null);

    // Simulate 1.2s network banking response
    setTimeout(async () => {
      setProcessing(false);

      if (simulatedOutcome === SIMULATED_PAYMENT_OUTCOMES.SUCCESS) {
        try {
          const { updatedCampaign, receipt } = await recordContribution(
            campaign.id,
            activeAmount,
            {
              name: keepAnonymous ? 'Community Backer' : backerName || 'Community Backer',
              email: backerEmail || null,
            }
          );
          await loadContributions();
          navigation.replace('Confirmation', {
            receipt,
            campaignTitle: campaign.title,
            updatedCampaign,
          });
        } catch (err) {
          setPaymentFeedback({
            type: 'error',
            message: 'Failed to record contribution: ' + err.message,
          });
        }
      } else if (simulatedOutcome === SIMULATED_PAYMENT_OUTCOMES.PENDING) {
        setPaymentFeedback({
          type: 'warning',
          message: 'Payment status: PENDING. Funds will be applied once the banking gateway clears.',
        });
      } else if (simulatedOutcome === SIMULATED_PAYMENT_OUTCOMES.CANCELLED) {
        setPaymentFeedback({
          type: 'error',
          message: 'Checkout was cancelled by user. No funds were debited.',
        });
      } else if (simulatedOutcome === SIMULATED_PAYMENT_OUTCOMES.REJECTED) {
        setPaymentFeedback({
          type: 'error',
          message: 'Card bank declined transaction. Reason: Simulated test decline.',
        });
      } else if (simulatedOutcome === SIMULATED_PAYMENT_OUTCOMES.FAILED) {
        setPaymentFeedback({
          type: 'error',
          message: 'Network timeout: Bank gateway did not respond. No funds deducted.',
        });
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Amplify This Message</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Campaign Mini Summary */}
        <View style={styles.campaignSummaryCard}>
          <Text style={styles.campaignCategory}>{campaign.category}</Text>
          <Text style={styles.campaignTitle}>{campaign.title}</Text>
          <Text style={styles.campaignCreator}>By {campaign.creatorName}</Text>
          <View style={styles.currentFundingRow}>
            <Text style={styles.currentFundingText}>
              Current funding: <Text style={styles.boldText}>{formatCurrency(metrics.raised)}</Text> of {formatCurrency(metrics.goal)} ({metrics.percentage}%)
            </Text>
          </View>
        </View>

        {/* Non-Donation Disclosure */}
        <NoticeBanner />

        {/* Step 2: Choose Contribution Amount */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Select Amplification Amount</Text>
          <Text style={styles.sectionSubtext}>
            Choose a preset or enter a custom distribution contribution amount.
          </Text>

          {/* Preset Buttons */}
          <View style={styles.presetsRow}>
            {CONTRIBUTION_PRESETS.map(amount => {
              const isSelected = !useCustom && selectedPreset === amount;
              return (
                <TouchableOpacity
                  key={amount}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPreset(amount)}
                  style={[
                    styles.presetBtn,
                    isSelected && styles.presetBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      isSelected && styles.presetBtnTextSelected,
                    ]}
                  >
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Amount Input */}
          <View style={styles.customAmountContainer}>
            <Text style={styles.customAmountLabel}>Or enter custom amount (₹):</Text>
            <View style={[styles.customInputRow, useCustom && styles.customInputRowActive]}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                value={customAmount}
                onChangeText={handleCustomChange}
                placeholder="Custom amount (min ₹50)"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                style={styles.customTextInput}
              />
            </View>
          </View>
        </View>

        {/* Transparent Fee & Reach Allocation Breakdown */}
        <FeeBreakdownView contributionAmount={activeAmount} />

        {/* Backer Details & Privacy */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Backer Identity (Optional)</Text>
          <Text style={styles.sectionSubtext}>
            Guest contributions are fully supported. Public identities remain anonymous by default.
          </Text>

          <Input
            label="Your Name (Optional)"
            value={backerName}
            onChangeText={setBackerName}
            placeholder="Anonymous Backer"
          />

          <Input
            label="Email for Receipt (Optional)"
            value={backerEmail}
            onChangeText={setBackerEmail}
            placeholder="your.email@example.org"
            keyboardType="email-address"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setKeepAnonymous(!keepAnonymous)}
            style={styles.privacyCheckboxRow}
          >
            <Ionicons
              name={keepAnonymous ? 'checkbox' : 'square-outline'}
              size={20}
              color={keepAnonymous ? colors.forestGreen : colors.textTertiary}
              style={{ marginRight: spacing.xs }}
            />
            <Text style={styles.privacyText}>
              Keep my contribution anonymous on the public backer roll
            </Text>
          </TouchableOpacity>
        </View>

        {/* Simulated Payment Gateway Selection (DEMO CONTROLS) */}
        <View style={styles.demoGatewayCard}>
          <View style={styles.demoHeaderRow}>
            <Ionicons name="construct-outline" size={16} color={colors.warning} />
            <Text style={styles.demoGatewayTitle}>Simulated Checkout Environment</Text>
          </View>
          <Text style={styles.demoGatewayNotice}>
            For hackathon evaluation: Select the simulated banking gateway outcome to test payment handling and funding updates.
          </Text>

          <View style={styles.outcomePillsRow}>
            {Object.values(SIMULATED_PAYMENT_OUTCOMES).map(outcome => {
              const isSelected = simulatedOutcome === outcome;
              return (
                <TouchableOpacity
                  key={outcome}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSimulatedOutcome(outcome);
                    setPaymentFeedback(null);
                  }}
                  style={[
                    styles.outcomePill,
                    isSelected && styles.outcomePillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.outcomePillText,
                      isSelected && styles.outcomePillTextSelected,
                    ]}
                  >
                    {outcome.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment Feedback Banner (Error / Warning / Decline) */}
        {paymentFeedback && (
          <View
            style={[
              styles.feedbackBanner,
              paymentFeedback.type === 'error' && styles.feedbackBannerError,
              paymentFeedback.type === 'warning' && styles.feedbackBannerWarning,
            ]}
          >
            <Ionicons
              name={paymentFeedback.type === 'error' ? 'alert-circle' : 'time-outline'}
              size={18}
              color={paymentFeedback.type === 'error' ? colors.error : colors.warning}
              style={{ marginRight: spacing.xs }}
            />
            <Text style={styles.feedbackBannerText}>{paymentFeedback.message}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Payment Action Bar */}
      <View style={styles.checkoutBottomBar}>
        <View style={styles.checkoutTotalCol}>
          <Text style={styles.checkoutTotalLabel}>Total to pay:</Text>
          <Text style={styles.checkoutTotalAmount}>{formatCurrency(activeAmount)}</Text>
        </View>

        <Button
          title={processing ? 'Processing...' : `Pay ${formatCurrency(activeAmount)}`}
          variant="primary"
          loading={processing}
          icon="shield-checkmark"
          onPress={handleProceedPayment}
          style={styles.payBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
  header: {
    height: 52,
    backgroundColor: colors.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textInverse,
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  campaignSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  campaignCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  campaignTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
    marginVertical: 4,
  },
  campaignCreator: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  currentFundingRow: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginTop: 2,
  },
  currentFundingText: {
    fontSize: 11,
    color: colors.charcoal,
  },
  boldText: {
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: 2,
  },
  sectionSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: spacing.md,
  },
  presetBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnSelected: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  presetBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
  },
  presetBtnTextSelected: {
    color: colors.textInverse,
  },
  customAmountContainer: {
    marginTop: spacing.xs,
  },
  customAmountLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  customInputRowActive: {
    borderColor: colors.primaryGreen,
  },
  rupeePrefix: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginRight: spacing.xs,
  },
  customTextInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.charcoal,
    paddingVertical: 0,
  },
  privacyCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  privacyText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  demoGatewayCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoGatewayTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  demoGatewayNotice: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  outcomePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  outcomePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  outcomePillSelected: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
  },
  outcomePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  outcomePillTextSelected: {
    color: '#FFFFFF',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  feedbackBannerError: {
    backgroundColor: colors.errorLight,
    borderColor: colors.errorBorder,
  },
  feedbackBannerWarning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningBorder,
  },
  feedbackBannerText: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    fontWeight: '600',
    flex: 1,
  },
  checkoutBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    ...shadows.bottomBar,
  },
  checkoutTotalCol: {
    flex: 1,
  },
  checkoutTotalLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  checkoutTotalAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  payBtn: {
    width: 190,
  },
});
