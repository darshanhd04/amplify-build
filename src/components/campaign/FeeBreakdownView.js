/**
 * FeeBreakdownView Component
 * Transparent breakdown of where every rupee goes:
 * 92.5% Direct Advertising Distribution, 5% Platform Curation, 2.5% Payment Network
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '../../theme';
import { formatCurrency, formatMetric, calculateContributionBreakdown } from '../../utils/calculations';

export const FeeBreakdownView = ({ contributionAmount = 250, style }) => {
  const breakdown = calculateContributionBreakdown(contributionAmount);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Ionicons name="pie-chart-outline" size={18} color={colors.primaryGreen} />
        <Text style={styles.headerTitle}>Transparent Allocation Breakdown</Text>
      </View>

      {/* Row 1: Net Ad Distribution */}
      <View style={styles.itemRow}>
        <View style={styles.labelCol}>
          <Text style={styles.itemTitle}>Direct Ad Distribution (92.5%)</Text>
          <Text style={styles.itemSubtitle}>Funds targeted social & digital news impressions</Text>
        </View>
        <Text style={styles.itemAmountPositive}>{formatCurrency(breakdown.netAdBudget, true)}</Text>
      </View>

      {/* Row 2: Platform Curation */}
      <View style={styles.itemRow}>
        <View style={styles.labelCol}>
          <Text style={styles.itemTitle}>Platform Curation & Fact-Check (5%)</Text>
          <Text style={styles.itemSubtitle}>Source verification and ad compliance review</Text>
        </View>
        <Text style={styles.itemAmountMuted}>{formatCurrency(breakdown.platformFee, true)}</Text>
      </View>

      {/* Row 3: Payment Network Fee */}
      <View style={styles.itemRow}>
        <View style={styles.labelCol}>
          <Text style={styles.itemTitle}>Payment Network Processing (2.5%)</Text>
          <Text style={styles.itemSubtitle}>Banking gateway & reconciliation charges</Text>
        </View>
        <Text style={styles.itemAmountMuted}>{formatCurrency(breakdown.paymentFee, true)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Total & Unlocked Reach */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Total Contribution</Text>
          <Text style={styles.totalDisclaimer}>Simulated Checkout</Text>
        </View>
        <Text style={styles.totalAmount}>{formatCurrency(breakdown.contributionAmount)}</Text>
      </View>

      <View style={styles.reachBanner}>
        <Ionicons name="flash" size={16} color={colors.forestGreen} />
        <Text style={styles.reachBannerText}>
          Unlocks approximately <Text style={styles.reachHighlight}>~{formatMetric(breakdown.estimatedReach)}</Text> verified audience impressions.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.forestGreen,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  labelCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  itemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
  },
  itemSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemAmountPositive: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  itemAmountMuted: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.charcoal,
  },
  totalDisclaimer: {
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  reachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  reachBannerText: {
    fontSize: typography.sizes.xs,
    color: colors.forestGreen,
    marginLeft: spacing.xs,
    flex: 1,
  },
  reachHighlight: {
    fontWeight: '800',
  },
});
