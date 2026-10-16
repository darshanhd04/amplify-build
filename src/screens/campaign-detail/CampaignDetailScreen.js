/**
 * CampaignDetailScreen
 * Editorial campaign detail view with story sections, visible supporting sources,
 * transparent use-of-funds, audience targeting, and backer action bar.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { NoticeBanner } from '../../components/common/NoticeBanner';
import { FeeBreakdownView } from '../../components/campaign/FeeBreakdownView';
import { useCampaigns } from '../../context/CampaignContext';
import { formatCurrency, formatMetric, calculateFundingMetrics } from '../../utils/calculations';
import { CAMPAIGN_STATUS } from '../../constants';

export const CampaignDetailScreen = ({ route, navigation }) => {
  const { campaignId } = route.params || {};
  const { campaigns, savedIds, toggleSave } = useCampaigns();

  const campaign = campaigns.find(c => c.id === campaignId) || campaigns[0];
  const isSaved = savedIds.includes(campaign?.id);

  // Expandable sections state
  const [showFundsAccordion, setShowFundsAccordion] = useState(false);
  const [showTrustAccordion, setShowTrustAccordion] = useState(false);
  
  // Feedback survey state
  const [feedbackSelected, setFeedbackSelected] = useState(null);

  if (!campaign) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Campaign not found.</Text>
          <Button title="Back to Explore" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const metrics = calculateFundingMetrics(campaign.amountRaised, campaign.fundingGoal);
  const canBack = campaign.status === CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING;
  const hasReport = campaign.status === CAMPAIGN_STATUS.PROMOTING || campaign.status === CAMPAIGN_STATUS.COMPLETED;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Amplify this important message: "${campaign.title}" on AMPLIFY. https://amplify.platform/c/${campaign.id}`,
        title: campaign.title,
      });
    } catch (e) {
      // share dismissed
    }
  };

  const handleOpenSourceUrl = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (e) {
      console.warn('Cannot open url:', url);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Detail Navigation Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.navIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
        </TouchableOpacity>

        <View style={styles.navActionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleSave(campaign.id)}
            style={styles.navIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? colors.softMint : colors.textInverse}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={[styles.navIconBtn, { marginLeft: spacing.xs }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: campaign.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>

        {/* Header Metadata */}
        <View style={styles.headerSection}>
          <View style={styles.categoryRow}>
            <Badge label={campaign.category} variant="category" />
            <Badge status={campaign.status} style={{ marginLeft: spacing.xs }} />
          </View>

          <Text style={styles.title}>{campaign.title}</Text>

          {/* Creator Attribution */}
          <View style={styles.creatorRow}>
            <View style={styles.creatorAvatar}>
              <Ionicons name="shield-checkmark" size={16} color={colors.forestGreen} />
            </View>
            <View style={styles.creatorMeta}>
              <Text style={styles.creatorName}>{campaign.creatorName}</Text>
              <Text style={styles.creatorBio} numberOfLines={1}>
                {campaign.creatorBio || 'Verified Campaign Creator'}
              </Text>
            </View>
          </View>
        </View>

        {/* Funding Summary Card */}
        <View style={styles.fundingSummaryCard}>
          <View style={styles.fundingTopRow}>
            <View>
              <Text style={styles.raisedValue}>{formatCurrency(metrics.raised)}</Text>
              <Text style={styles.raisedSubLabel}>
                raised of {formatCurrency(metrics.goal)} goal ({metrics.percentage}%)
              </Text>
            </View>
            <View style={styles.reachPill}>
              <Ionicons name="people" size={14} color={colors.primaryGreen} />
              <Text style={styles.reachPillText}>
                ~{formatMetric(metrics.estimatedGoalReach)} reach
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={metrics.percentage}
            height={8}
            style={styles.fundingProgress}
          />

          <View style={styles.fundingMetaRow}>
            <Text style={styles.backersCountText}>
              <Text style={styles.boldText}>{campaign.backersCount || 0}</Text> community backers
            </Text>
            <Text style={styles.deadlineText}>
              {metrics.remaining > 0 ? `${formatCurrency(metrics.remaining)} remaining` : 'Fully Funded'}
            </Text>
          </View>

          {/* Direct link to distribution report if available */}
          {hasReport && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DistributionReport', { campaignId: campaign.id })}
              style={styles.auditReportLink}
            >
              <Ionicons name="document-text-outline" size={16} color={colors.forestGreen} />
              <Text style={styles.auditReportLinkText}>
                Inspect Audited Distribution Report & Clicks
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.forestGreen} />
            </TouchableOpacity>
          )}
        </View>

        {/* Non-Donation Disclosure */}
        <NoticeBanner />

        {/* Editorial Story Section */}
        <View style={styles.storySection}>
          <Text style={styles.storySectionEyebrow}>THE STORY & EVIDENCE</Text>
          <Text style={styles.storyHeadline}>{campaign.story?.headline}</Text>

          {campaign.story?.introduction ? (
            <Text style={styles.storyIntro}>{campaign.story.introduction}</Text>
          ) : null}

          {/* Narrative Blocks */}
          {campaign.story?.sections?.map((section, idx) => {
            if (section.type === 'stats') {
              return (
                <View key={section.id || idx} style={styles.statCalloutBox}>
                  <Text style={styles.statBigNumber}>{section.statNumber}</Text>
                  <Text style={styles.statLabel}>{section.statLabel}</Text>
                </View>
              );
            }

            return (
              <View key={section.id || idx} style={styles.storyBlock}>
                {section.title ? (
                  <Text style={styles.storyBlockTitle}>{section.title}</Text>
                ) : null}
                <Text style={styles.storyParagraph}>{section.content}</Text>
              </View>
            );
          })}
        </View>

        {/* Visible Supporting Sources (CRITICAL REQUIREMENT) */}
        <View style={styles.sourcesSection}>
          <View style={styles.sourcesHeaderRow}>
            <Ionicons name="checkbox-outline" size={20} color={colors.primaryGreen} />
            <Text style={styles.sourcesTitle}>Visible Supporting Sources</Text>
          </View>
          <Text style={styles.sourcesExplanation}>
            AMPLIFY requires visible public citations so backers can independently review the facts before funding message reach.
          </Text>

          {campaign.story?.sources?.map((src, index) => (
            <TouchableOpacity
              key={src.id || index}
              activeOpacity={0.7}
              onPress={() => handleOpenSourceUrl(src.url)}
              style={styles.sourceCard}
            >
              <View style={styles.sourceContentCol}>
                <View style={styles.sourceBadgeRow}>
                  <Text style={styles.sourceIndex}>Source #{index + 1}</Text>
                  {src.verified && (
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.primaryGreen} />
                      <Text style={styles.verifiedTagText}>Fact-Checked</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sourceItemTitle}>{src.title}</Text>
                <Text style={styles.sourceUrl} numberOfLines={1}>
                  {src.url}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.primaryGreen} style={styles.openIcon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested Audience Actions */}
        {campaign.story?.suggestedActions?.length > 0 && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionHeaderTitle}>Suggested Community Actions</Text>
            {campaign.story.suggestedActions.map((action, i) => (
              <View key={i} style={styles.actionItemRow}>
                <View style={styles.actionBullet} />
                <Text style={styles.actionItemText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Intended Distribution & Targeting */}
        <View style={styles.targetingSection}>
          <Text style={styles.sectionHeaderTitle}>Intended Amplification Plan</Text>
          
          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Target Geography:</Text>
            <Text style={styles.targetValue}>{campaign.targetGeography || 'Regional Basin'}</Text>
          </View>

          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Audience Demographics:</Text>
            <Text style={styles.targetValue}>{campaign.targetAudience || 'Adults 21+, community voters'}</Text>
          </View>

          <View style={styles.targetItem}>
            <Text style={styles.targetLabel}>Selected Channels:</Text>
            <View style={styles.channelsPillsRow}>
              {campaign.channels?.map((ch, idx) => (
                <View key={idx} style={styles.channelPill}>
                  <Text style={styles.channelPillText}>{ch}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Expandable Accordion: Use of Funds */}
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowFundsAccordion(!showFundsAccordion)}
            style={styles.accordionHeader}
          >
            <View style={styles.accordionTitleRow}>
              <Ionicons name="cash-outline" size={20} color={colors.forestGreen} />
              <Text style={styles.accordionTitle}>Transparent Use of Funds</Text>
            </View>
            <Ionicons
              name={showFundsAccordion ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.charcoal}
            />
          </TouchableOpacity>

          {showFundsAccordion && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionDescription}>
                AMPLIFY is strictly a message amplification platform. Funds raised never transfer as charitable grants to creators.
              </Text>
              <FeeBreakdownView contributionAmount={1000} />
            </View>
          )}
        </View>

        {/* Expandable Accordion: Trust, Verification & Policies */}
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowTrustAccordion(!showTrustAccordion)}
            style={styles.accordionHeader}
          >
            <View style={styles.accordionTitleRow}>
              <Ionicons name="shield-outline" size={20} color={colors.forestGreen} />
              <Text style={styles.accordionTitle}>Review Process & Trust Safeguards</Text>
            </View>
            <Ionicons
              name={showTrustAccordion ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.charcoal}
            />
          </TouchableOpacity>

          {showTrustAccordion && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionParagraph}>
                • <Text style={styles.boldText}>Pre-publication Verification:</Text> Every campaign undergoes source verification to ensure primary documentation exists for all claims.
              </Text>
              <Text style={styles.accordionParagraph}>
                • <Text style={styles.boldText}>Simulated Ad Delivery Safeguards:</Text> In production, ad creatives conform to platform advertising safety policies.
              </Text>
              <Text style={styles.accordionParagraph}>
                • <Text style={styles.boldText}>Refund Guarantee:</Text> If a campaign fails to launch distribution within 90 days, remaining unspent balances are accounted for pro-rata refunds.
              </Text>
            </View>
          )}
        </View>

        {/* Backer Mindset Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Reader Impression</Text>
          <Text style={styles.feedbackSubtitle}>Did this story change your perspective on this topic?</Text>
          <View style={styles.feedbackBtnRow}>
            {['No', 'Somewhat', 'Yes'].map(option => (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                onPress={() => setFeedbackSelected(option)}
                style={[
                  styles.feedbackOptionBtn,
                  feedbackSelected === option && styles.feedbackOptionBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.feedbackOptionText,
                    feedbackSelected === option && styles.feedbackOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {feedbackSelected && (
            <Text style={styles.feedbackThankYou}>
              Thank you for sharing your feedback with the editorial team!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarMeta}>
          <Text style={styles.bottomBarRaised}>{formatCurrency(metrics.raised)}</Text>
          <Text style={styles.bottomBarGoal}>
            of {formatCurrency(metrics.goal)} ({metrics.percentage}%)
          </Text>
        </View>

        {canBack ? (
          <Button
            title="Back This Campaign"
            variant="primary"
            size="md"
            icon="flash"
            onPress={() => navigation.navigate('Contribution', { campaignId: campaign.id })}
            style={styles.bottomBarBtn}
          />
        ) : (
          <Button
            title={hasReport ? 'View Audit Report' : 'Review Status'}
            variant="secondary"
            size="md"
            onPress={() => {
              if (hasReport) {
                navigation.navigate('DistributionReport', { campaignId: campaign.id });
              } else {
                alert(`Current status: ${campaign.status.replace(/_/g, ' ')}`);
              }
            }}
            style={styles.bottomBarBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
  navBar: {
    height: 52,
    backgroundColor: colors.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    paddingBottom: 110,
  },
  coverImageContainer: {
    height: 230,
    width: '100%',
    backgroundColor: colors.forestGreen,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.charcoal,
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  creatorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.softMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
  },
  creatorBio: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  fundingSummaryCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  fundingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  raisedValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  raisedSubLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  reachPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginLeft: 4,
  },
  fundingProgress: {
    marginVertical: spacing.sm,
  },
  fundingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backersCountText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.charcoal,
  },
  deadlineText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  auditReportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  auditReportLinkText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
    flex: 1,
    marginLeft: spacing.xs,
  },
  storySection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  storySectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: 1,
    marginBottom: 4,
  },
  storyHeadline: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.charcoal,
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  storyIntro: {
    fontSize: typography.sizes.md,
    color: colors.charcoal,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryGreen,
    paddingLeft: spacing.sm,
  },
  storyBlock: {
    marginBottom: spacing.md,
  },
  storyBlockTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  storyParagraph: {
    fontSize: typography.sizes.md,
    color: colors.charcoal,
    lineHeight: 24,
  },
  statCalloutBox: {
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  statBigNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    color: colors.forestGreen,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    textAlign: 'center',
    fontWeight: '600',
  },
  sourcesSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sourcesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourcesTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
    marginLeft: spacing.xs,
  },
  sourcesExplanation: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  sourceContentCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  sourceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sourceIndex: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginLeft: 2,
  },
  sourceItemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
  },
  sourceUrl: {
    fontSize: 11,
    color: colors.primaryGreen,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  openIcon: {
    marginLeft: spacing.xs,
  },
  actionsSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionHeaderTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  actionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryGreen,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  actionItemText: {
    fontSize: typography.sizes.sm,
    color: colors.charcoal,
    lineHeight: 20,
    flex: 1,
  },
  targetingSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  targetItem: {
    marginBottom: spacing.sm,
  },
  targetLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  targetValue: {
    fontSize: typography.sizes.sm,
    color: colors.charcoal,
    fontWeight: '600',
  },
  channelsPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  channelPill: {
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  channelPillText: {
    fontSize: typography.sizes.xs,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  accordionContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginLeft: spacing.xs,
  },
  accordionContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  accordionDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  accordionParagraph: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  feedbackSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 2,
  },
  feedbackSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  feedbackBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackOptionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  feedbackOptionBtnActive: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  feedbackOptionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
  },
  feedbackOptionTextActive: {
    color: colors.textInverse,
  },
  feedbackThankYou: {
    fontSize: typography.sizes.xs,
    color: colors.primaryGreen,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  bottomBar: {
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
  bottomBarMeta: {
    flex: 1,
  },
  bottomBarRaised: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  bottomBarGoal: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  bottomBarBtn: {
    width: 170,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
});
