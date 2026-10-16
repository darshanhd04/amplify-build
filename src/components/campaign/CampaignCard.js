/**
 * Editorial Campaign Card Component
 * Displays cover, category, funding progress, estimated reach, and action
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../theme';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { formatCurrency, formatMetric, calculateFundingMetrics } from '../../utils/calculations';
import { useCampaigns } from '../../context/CampaignContext';
import { CAMPAIGN_STATUS } from '../../constants';

export const CampaignCard = ({
  campaign,
  onPress,
  onBackPress,
  featured = false,
  style,
}) => {
  const { savedIds, toggleSave } = useCampaigns();
  const [imageError, setImageError] = useState(false);
  
  if (!campaign) return null;

  const isSaved = savedIds.includes(campaign.id);
  const metrics = calculateFundingMetrics(campaign.amountRaised, campaign.fundingGoal);
  const canBack = campaign.status === CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        featured && styles.featuredCard,
        style,
      ]}
    >
      {/* Cover Image Container */}
      <View style={styles.imageContainer}>
        {!imageError && campaign.coverImage ? (
          <Image
            source={{ uri: campaign.coverImage }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="megaphone-outline" size={36} color={colors.primaryGreen} />
            <Text style={styles.placeholderCategory}>{campaign.category}</Text>
          </View>
        )}

        {/* Category & Status Overlay Badges */}
        <View style={styles.badgeRow}>
          <Badge label={campaign.category} variant="category" size="sm" />
          {campaign.status !== CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING && (
            <Badge status={campaign.status} size="sm" style={styles.statusBadge} />
          )}
        </View>

        {/* Save/Bookmark Action Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleSave(campaign.id)}
          style={styles.saveBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? colors.primaryGreen : colors.charcoal}
          />
        </TouchableOpacity>
      </View>

      {/* Card Content Body */}
      <View style={styles.content}>
        <Text style={styles.creatorName} numberOfLines={1}>
          {campaign.creatorName}
        </Text>

        <Text style={styles.title} numberOfLines={2}>
          {campaign.title}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {campaign.summary}
        </Text>

        {/* Funding Progress Section */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={metrics.percentage}
            height={6}
            style={styles.progressBar}
          />
          <View style={styles.metricsRow}>
            <View>
              <Text style={styles.raisedAmount}>
                {formatCurrency(metrics.raised)}
              </Text>
              <Text style={styles.metricLabel}>
                raised of {formatCurrency(metrics.goal)} ({metrics.percentage}%)
              </Text>
            </View>
            <View style={styles.reachCol}>
              <View style={styles.reachInline}>
                <Ionicons name="people-outline" size={13} color={colors.primaryGreen} />
                <Text style={styles.reachVal}>
                  ~{formatMetric(metrics.estimatedGoalReach)}
                </Text>
              </View>
              <Text style={styles.reachLabel}>est. reach at goal</Text>
            </View>
          </View>
        </View>

        {/* Action Button Row */}
        <View style={styles.actionRow}>
          {canBack ? (
            <Button
              title="Back This Campaign"
              size="sm"
              variant="primary"
              icon="flash-outline"
              onPress={onBackPress || onPress}
              style={styles.backBtn}
            />
          ) : (
            <Button
              title={campaign.status === CAMPAIGN_STATUS.COMPLETED ? 'View Distribution Audit' : 'Inspect Story'}
              size="sm"
              variant="outline"
              icon="arrow-forward-outline"
              iconPosition="right"
              onPress={onPress}
              style={styles.backBtn}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  featuredCard: {
    borderColor: colors.borderFocus,
    borderWidth: 1.5,
  },
  imageContainer: {
    height: 175,
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softMint,
  },
  placeholderCategory: {
    fontSize: typography.sizes.xs,
    color: colors.forestGreen,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  badgeRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    marginLeft: spacing.xs,
  },
  saveBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  content: {
    padding: spacing.md,
  },
  creatorName: {
    fontSize: typography.sizes.xs,
    color: colors.primaryGreen,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.charcoal,
    lineHeight: 22,
    marginBottom: 6,
  },
  summary: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  progressBar: {
    marginBottom: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  raisedAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 1,
  },
  reachCol: {
    alignItems: 'flex-end',
  },
  reachInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reachVal: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginLeft: 3,
  },
  reachLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 1,
  },
  actionRow: {
    marginTop: spacing.xs,
  },
  backBtn: {
    width: '100%',
  },
});
