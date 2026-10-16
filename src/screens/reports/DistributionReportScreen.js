/**
 * DistributionReportScreen
 * Verified Distribution Audit & Impact Report
 * Separates estimated models from actual measured impressions, clicks, and channels
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useCampaigns } from '../../context/CampaignContext';
import { formatCurrency, formatMetric } from '../../utils/calculations';

export const DistributionReportScreen = ({ route, navigation }) => {
  const { campaignId } = route.params || {};
  const { campaigns } = useCampaigns();

  const campaign = campaigns.find(c => c.id === campaignId) || campaigns[2]; // Default to health/microforest
  const report = campaign?.distributionReport;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verified Distribution Audit</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Campaign Info Card */}
        <View style={styles.campaignMetaCard}>
          <Text style={styles.reportTag}>OFFICIAL AUDIT REPORT</Text>
          <Text style={styles.campaignTitle}>{campaign.title}</Text>
          <Text style={styles.campaignCreator}>Organized by {campaign.creatorName}</Text>
          <Text style={styles.reportDate}>
            Published: {report ? new Date(report.reportDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'In Progress'}
          </Text>
        </View>

        {/* Demo Data Transparency Notice */}
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle" size={18} color={colors.forestGreen} />
          <Text style={styles.demoBannerText}>
            DEMONSTRATION AUDIT: This report illustrates verifiable distribution metrics (impressions, clicks, CPM, and channel spend) for hackathon evaluation.
          </Text>
        </View>

        {/* Big Impact Metric Cards (Separating Estimated vs Measured) */}
        <View style={styles.metricsGrid}>
          {/* Measured Impressions */}
          <View style={styles.metricCard}>
            <Text style={styles.metricCardEyebrow}>MEASURED IMPRESSIONS</Text>
            <Text style={styles.metricCardValue}>
              {report ? formatMetric(report.measuredImpressions) : '785k'}
            </Text>
            <Text style={styles.metricCardSub}>Served across mobile news & social feeds</Text>
          </View>

          {/* Verified Unique Reach */}
          <View style={styles.metricCard}>
            <Text style={styles.metricCardEyebrow}>VERIFIED REACH</Text>
            <Text style={styles.metricCardValue}>
              {report ? formatMetric(report.verifiedReach) : '698k'}
            </Text>
            <Text style={styles.metricCardSub}>Unique households reached</Text>
          </View>

          {/* Link Clicks / Engagements */}
          <View style={styles.metricCard}>
            <Text style={styles.metricCardEyebrow}>CLICKS TO SOURCE</Text>
            <Text style={styles.metricCardValue}>
              {report ? formatMetric(report.clicks) : '41.2k'}
            </Text>
            <Text style={styles.metricCardSub}>Direct visits to primary evidence</Text>
          </View>

          {/* Average CPM */}
          <View style={styles.metricCard}>
            <Text style={styles.metricCardEyebrow}>AVERAGE CPM</Text>
            <Text style={styles.metricCardValue}>
              {report ? `₹${report.avgCpm}` : '₹61.70'}
            </Text>
            <Text style={styles.metricCardSub}>Cost per 1,000 ad impressions</Text>
          </View>
        </View>

        {/* Financial Reconciliation Audit */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Financial Reconciliation Audit</Text>
          <Text style={styles.sectionSubtext}>
            100% transparent audit of gross contributions vs direct ad media spend.
          </Text>

          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Gross Backer Contributions:</Text>
            <Text style={styles.auditValueBold}>
              {formatCurrency(report ? report.grossFunding : campaign.amountRaised)}
            </Text>
          </View>

          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Platform Curation & Clicks Fee (5%):</Text>
            <Text style={styles.auditValue}>
              {formatCurrency(report ? report.platformFee : campaign.amountRaised * 0.05, true)}
            </Text>
          </View>

          <View style={styles.auditRow}>
            <Text style={styles.auditLabel}>Payment Gateway Processing (2.5%):</Text>
            <Text style={styles.auditValue}>
              {formatCurrency(report ? report.paymentFees : campaign.amountRaised * 0.025, true)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.auditRow}>
            <Text style={styles.auditLabelHighlight}>Net Digital Ad Spend Executed:</Text>
            <Text style={styles.auditValueHighlight}>
              {formatCurrency(report ? report.netAdSpend : campaign.amountRaised * 0.925, true)}
            </Text>
          </View>
        </View>

        {/* Channel Performance Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Channel Performance Breakdown</Text>
          
          {(report?.channelPerformance || [
            { channel: 'Meta In-Feed', impressions: 450000, clicks: 26500 },
            { channel: 'Regional News Portals', impressions: 185400, clicks: 9200 },
            { channel: 'YouTube Shorts', impressions: 150000, clicks: 5500 },
          ]).map((ch, idx) => (
            <View key={idx} style={styles.channelRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>{ch.channel}</Text>
                <Text style={styles.channelMeta}>
                  {formatMetric(ch.impressions)} impressions • {formatMetric(ch.clicks)} clicks
                </Text>
              </View>
              <Text style={styles.channelCtr}>
                {((ch.clicks / ch.impressions) * 100).toFixed(2)}% CTR
              </Text>
            </View>
          ))}
        </View>

        {/* Top Geographic Clusters */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Top Geographic Taluks Reached</Text>
          <View style={styles.taluksRow}>
            {(report?.topRegions || ['Regional Taluk 1', 'Rural Sector 4', 'Municipal Zone B']).map((reg, i) => (
              <View key={i} style={styles.talukPill}>
                <Ionicons name="location" size={12} color={colors.forestGreen} />
                <Text style={styles.talukPillText}>{reg}</Text>
              </View>
            ))}
          </View>
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
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.forestGreen,
  },
  backBtn: {
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
    paddingBottom: spacing.xxl,
  },
  campaignMetaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  reportTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: 0.5,
  },
  campaignTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.charcoal,
    marginVertical: 4,
  },
  campaignCreator: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  reportDate: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  demoBannerText: {
    fontSize: 11,
    color: colors.forestGreen,
    marginLeft: spacing.xs,
    flex: 1,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadows.card,
  },
  metricCardEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
    color: colors.forestGreen,
    marginVertical: 2,
  },
  metricCardSub: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionHeading: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: 2,
  },
  sectionSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  auditLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  auditValue: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
  },
  auditValueBold: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  auditLabelHighlight: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  auditValueHighlight: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  channelTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
  },
  channelMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  channelCtr: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  taluksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  talukPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  talukPillText: {
    fontSize: typography.sizes.xs,
    color: colors.forestGreen,
    fontWeight: '600',
    marginLeft: 4,
  },
});
