/**
 * ConfirmationScreen
 * Displays verifiable reference receipt ID, updated campaign funding progress,
 * unlocked audience reach, and next steps.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { formatCurrency, formatMetric, calculateFundingMetrics } from '../../utils/calculations';

export const ConfirmationScreen = ({ route, navigation }) => {
  const { receipt, campaignTitle, updatedCampaign } = route.params || {};

  const metrics = calculateFundingMetrics(
    updatedCampaign?.amountRaised || receipt?.amount || 0,
    updatedCampaign?.fundingGoal || 10000
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just backed the message amplification campaign "${campaignTitle}" on AMPLIFY! Every rupee expands verified reach: https://amplify.platform`,
        title: 'Amplified on AMPLIFY',
      });
    } catch (e) {
      // share dismissed
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon Header */}
        <View style={styles.heroBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={36} color={colors.textInverse} />
          </View>
          <Text style={styles.heroTitle}>Contribution Confirmed</Text>
          <Text style={styles.heroSubtitle}>
            Your message amplification contribution has been successfully processed.
          </Text>
        </View>

        {/* Receipt Details Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptTopRow}>
            <Text style={styles.receiptTag}>REFERENCE RECEIPT</Text>
            <Text style={styles.receiptId}>{receipt?.receiptId || 'AMP-2026-DEMO'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Campaign:</Text>
            <Text style={styles.receiptValueBold} numberOfLines={2}>
              {campaignTitle}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total Contribution:</Text>
            <Text style={styles.receiptAmount}>
              {formatCurrency(receipt?.amount || 0)}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Direct Ad Allocation (92.5%):</Text>
            <Text style={styles.receiptValue}>
              {formatCurrency(receipt?.breakdown?.netAdBudget || 0, true)}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Platform Curation (5%):</Text>
            <Text style={styles.receiptValue}>
              {formatCurrency(receipt?.breakdown?.platformFee || 0, true)}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Payment Network (2.5%):</Text>
            <Text style={styles.receiptValue}>
              {formatCurrency(receipt?.breakdown?.paymentFee || 0, true)}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Date & Time:</Text>
            <Text style={styles.receiptValue}>
              {new Date(receipt?.timestamp || Date.now()).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.reachUnlockBanner}>
            <Ionicons name="flash" size={18} color={colors.forestGreen} />
            <Text style={styles.reachUnlockText}>
              You unlocked approximately <Text style={styles.boldText}>~{formatMetric(receipt?.breakdown?.estimatedReach || 0)}</Text> verified audience impressions.
            </Text>
          </View>
        </View>

        {/* Updated Campaign Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Updated Campaign Funding Status</Text>
          <ProgressBar
            progress={metrics.percentage}
            height={8}
            style={styles.progressBar}
          />
          <View style={styles.progressMetricsRow}>
            <Text style={styles.progressText}>
              <Text style={styles.boldText}>{formatCurrency(metrics.raised)}</Text> raised of {formatCurrency(metrics.goal)}
            </Text>
            <Text style={styles.percentageText}>{metrics.percentage}%</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionCol}>
          <Button
            title="Share Amplification Link"
            variant="primary"
            icon="share-social-outline"
            onPress={handleShare}
            style={{ marginBottom: spacing.sm }}
          />

          <Button
            title="Back to Campaign"
            variant="secondary"
            onPress={() => navigation.navigate('CampaignDetail', { campaignId: updatedCampaign?.id })}
            style={{ marginBottom: spacing.sm }}
          />

          <Button
            title="Return to Home"
            variant="text"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroBox: {
    backgroundColor: colors.forestGreen,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textInverseMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  receiptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: 0.5,
  },
  receiptId: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  receiptLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  receiptValue: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
  },
  receiptValueBold: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
    flex: 1,
    textAlign: 'right',
  },
  receiptAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  reachUnlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  reachUnlockText: {
    fontSize: typography.sizes.xs,
    color: colors.forestGreen,
    marginLeft: spacing.xs,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  progressCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  progressBar: {
    marginVertical: spacing.xs,
  },
  progressMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  percentageText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  actionCol: {
    marginTop: spacing.xs,
  },
});
