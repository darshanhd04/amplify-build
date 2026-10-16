/**
 * CreatorDashboardScreen
 * Management center for creator campaigns across all lifecycle states:
 * Drafts -> Under Review -> Funding -> Promoting -> Completed -> Requires Action
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { CREATOR_TABS, CAMPAIGN_STATUS } from '../../constants';
import { useCampaigns } from '../../context/CampaignContext';
import { useDraft } from '../../context/DraftContext';
import { useUser } from '../../context/UserContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { ModerationReviewModal } from './ModerationReviewModal';
import { formatCurrency, formatMetric, calculateFundingMetrics } from '../../utils/calculations';

export const CreatorDashboardScreen = ({ navigation, route }) => {
  const { initialTab } = route?.params || {};
  const { campaigns } = useCampaigns();
  const { hasSavedDraft, resumeDraft } = useDraft();
  const { isLoggedIn, user, logout } = useUser();

  const [activeTab, setActiveTab] = useState(initialTab || 'all');
  const [selectedReviewCampaign, setSelectedReviewCampaign] = useState(null);

  // Guard: require login before accessing dashboard
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.headerEyebrow}>SECURITY CLEARANCE</Text>
            <Text style={styles.headerTitle}>Sign In Required</Text>
          </View>
        </View>

        <View style={styles.authRequiredContainer}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={36} color={colors.primaryGreen} />
          </View>
          <Text style={styles.authRequiredTitle}>Creator & Desk Access</Text>
          <Text style={styles.authRequiredSub}>
            You must authenticate to access the Creator Center, manage campaign drafts, and interact with the live Reviewer Moderation Desk.
          </Text>

          <Button
            title="Sign In to Dashboard"
            onPress={() => navigation.navigate('Login', { returnTo: 'Dashboard', initialTab })}
            icon="log-in-outline"
            style={{ width: '100%', marginBottom: spacing.sm }}
          />

          <Button
            title="Back to Public Discovery"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Filter campaigns matching tab
  const getTabCampaigns = () => {
    if (activeTab === 'all') return campaigns;
    if (activeTab === 'drafts') {
      return campaigns.filter(c => c.status === CAMPAIGN_STATUS.DRAFT);
    }
    if (activeTab === 'review') {
      return campaigns.filter(c => c.status === CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW);
    }
    if (activeTab === 'funding') {
      return campaigns.filter(c => c.status === CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING || c.status === CAMPAIGN_STATUS.FUNDING_GOAL_REACHED);
    }
    if (activeTab === 'promoting') {
      return campaigns.filter(c => c.status === CAMPAIGN_STATUS.PROMOTING || c.status === CAMPAIGN_STATUS.DISTRIBUTION_PREPARATION);
    }
    if (activeTab === 'completed') {
      return campaigns.filter(c => c.status === CAMPAIGN_STATUS.COMPLETED);
    }
    if (activeTab === 'action') {
      return campaigns.filter(c => c.status === CAMPAIGN_STATUS.CHANGES_REQUESTED || c.status === CAMPAIGN_STATUS.REJECTED);
    }
    return campaigns;
  };

  const displayedList = getTabCampaigns();

  const handleResumeDraft = async () => {
    await resumeDraft();
    navigation.navigate('Create');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerEyebrow}>{user?.handle || 'CREATOR CENTER'}</Text>
            <Text style={styles.headerTitle}>Campaign Dashboard</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="New"
            size="sm"
            variant="secondary"
            icon="add"
            onPress={() => navigation.navigate('Create')}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              logout();
              navigation.goBack();
            }}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {CREATOR_TABS.map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              >
                <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Unfinished Local Draft Alert */}
      {hasSavedDraft && (
        <View style={styles.draftAlertBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.draftAlertTitle}>Unsubmitted Draft In Progress</Text>
            <Text style={styles.draftAlertSub}>You have an unsubmitted campaign draft saved locally.</Text>
          </View>
          <Button
            title="Resume"
            size="sm"
            variant="primary"
            onPress={handleResumeDraft}
          />
        </View>
      )}

      {/* Campaign Cards List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {displayedList.map(camp => {
          const metrics = calculateFundingMetrics(camp.amountRaised, camp.fundingGoal);
          const isUnderReview = camp.status === CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW;
          const isChangesReq = camp.status === CAMPAIGN_STATUS.CHANGES_REQUESTED;
          const hasReport = camp.status === CAMPAIGN_STATUS.PROMOTING || camp.status === CAMPAIGN_STATUS.COMPLETED;

          return (
            <View key={camp.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Image
                  source={{ uri: camp.coverImage }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.cardHeaderMeta}>
                  <Badge status={camp.status} size="sm" />
                  <Text style={styles.cardCategory}>{camp.category}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{camp.title}</Text>
                </View>
              </View>

              {/* Moderation Review Feedback Banner */}
              {isChangesReq && camp.reviewNotes && (
                <View style={styles.feedbackNotice}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.feedbackNoticeText}>
                    Reviewer Note: {camp.reviewNotes.reviewerFeedback}
                  </Text>
                </View>
              )}

              {/* Funding Progress Section */}
              <View style={styles.cardProgressSection}>
                <ProgressBar progress={metrics.percentage} height={6} style={{ marginBottom: 4 }} />
                <View style={styles.cardMetricsRow}>
                  <Text style={styles.cardFundingText}>
                    {formatCurrency(metrics.raised)} of {formatCurrency(metrics.goal)} ({metrics.percentage}%)
                  </Text>
                  <Text style={styles.cardReachText}>
                    ~{formatMetric(metrics.estimatedGoalReach)} reach
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <Button
                  title="Inspect"
                  size="sm"
                  variant="outline"
                  onPress={() => navigation.navigate('CampaignDetail', { campaignId: camp.id })}
                  style={{ flex: 1, marginRight: 6 }}
                />

                {hasReport && (
                  <Button
                    title="Audit Report"
                    size="sm"
                    variant="secondary"
                    icon="document-text-outline"
                    onPress={() => navigation.navigate('DistributionReport', { campaignId: camp.id })}
                    style={{ flex: 1, marginRight: 6 }}
                  />
                )}

                {/* Reviewer Desk Action */}
                <Button
                  title={isUnderReview ? 'Review Desk' : 'Simulate Review'}
                  size="sm"
                  variant={isUnderReview ? 'primary' : 'text'}
                  icon="shield-outline"
                  onPress={() => setSelectedReviewCampaign(camp)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          );
        })}

        {displayedList.length === 0 && (
          <EmptyState
            icon="folder-open-outline"
            title="No Campaigns in This Filter"
            description="Campaigns matching this status tab will appear here once created."
            actionTitle="Start New Campaign"
            onAction={() => navigation.navigate('Create')}
          />
        )}
      </ScrollView>

      {/* Reviewer Desk Simulation Modal */}
      <ModerationReviewModal
        visible={!!selectedReviewCampaign}
        campaign={selectedReviewCampaign}
        onClose={() => setSelectedReviewCampaign(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.forestGreen,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authRequiredContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  lockIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  authRequiredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  authRequiredSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.softMint,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textInverse,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  tabBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  draftAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.mintBadge,
  },
  draftAlertTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  draftAlertSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSubtle,
    marginRight: spacing.sm,
  },
  cardHeaderMeta: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 2,
    lineHeight: 18,
  },
  feedbackNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.errorLight,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  feedbackNoticeText: {
    fontSize: 11,
    color: colors.error,
    marginLeft: spacing.xs,
    flex: 1,
    fontWeight: '500',
  },
  cardProgressSection: {
    marginBottom: spacing.sm,
  },
  cardMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFundingText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.charcoal,
  },
  cardReachText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
});
