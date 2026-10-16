/**
 * Home Screen
 * Hero section, message amplification concept, featured campaigns,
 * three-stage "How It Works" (CREATE -> REVIEW -> AMPLIFY), and campaign feed.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { APP_NAME, APP_TAGLINE, APP_SUBTITLE, CAMPAIGN_STATUS } from '../../constants';
import { useCampaigns } from '../../context/CampaignContext';
import { CampaignCard } from '../../components/campaign/CampaignCard';
import { Button } from '../../components/common/Button';
import { NoticeBanner } from '../../components/common/NoticeBanner';

export const HomeScreen = ({ navigation }) => {
  const { campaigns, loading, refreshing, onRefresh } = useCampaigns();

  // Featured campaigns: open for funding
  const featuredCampaigns = campaigns.filter(
    c => c.status === CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING
  ).slice(0, 2);

  // Promoting & Completed campaigns demonstrating live distribution
  const showcaseCampaigns = campaigns.filter(
    c => c.status === CAMPAIGN_STATUS.PROMOTING || c.status === CAMPAIGN_STATUS.COMPLETED
  ).slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
      
      {/* Top Branding Bar */}
      <View style={styles.topNav}>
        <View style={styles.brandRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="megaphone" size={18} color={colors.textInverse} />
          </View>
          <Text style={styles.brandText}>{APP_NAME}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Explore')}
          style={styles.searchIconButton}
        >
          <Ionicons name="search" size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primaryGreen]}
            tintColor={colors.primaryGreen}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroPill}>
            <Ionicons name="sparkles-outline" size={12} color={colors.softMint} />
            <Text style={styles.heroPillText}>Community-Funded Amplification</Text>
          </View>

          <Text style={styles.heroTitle}>{APP_TAGLINE}</Text>
          <Text style={styles.heroSubtitle}>{APP_SUBTITLE}</Text>

          {/* Illustrative reach estimate counter card */}
          <View style={styles.reachEstimateCard}>
            <View style={styles.reachIconBox}>
              <Ionicons name="trending-up-outline" size={20} color={colors.forestGreen} />
            </View>
            <View style={styles.reachTextBox}>
              <Text style={styles.reachEstimateHeadline}>
                ~15 verified impressions per ₹1 distributed
              </Text>
              <Text style={styles.reachEstimateDisclaimer}>
                *Illustrative estimate based on optimized regional ad inventory.
              </Text>
            </View>
          </View>

          {/* Primary & Secondary Hero CTAs */}
          <View style={styles.heroActionsRow}>
            <Button
              title="Explore Campaigns"
              variant="secondary"
              size="md"
              icon="compass-outline"
              onPress={() => navigation.navigate('Explore')}
              style={styles.heroBtnLeft}
            />
            <Button
              title="Start Campaign"
              variant="outline"
              size="md"
              icon="add-circle-outline"
              textStyle={{ color: colors.textInverse }}
              style={styles.heroBtnRight}
              onPress={() => navigation.navigate('Create')}
            />
          </View>
        </View>

        {/* Non-Donation Disclosure Banner */}
        <View style={styles.bannerContainer}>
          <NoticeBanner />
        </View>

        {/* How It Works (Three Stages) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>TRANSPARENT LIFECYCLE</Text>
            <Text style={styles.sectionTitle}>How Amplification Works</Text>
          </View>

          <View style={styles.stagesRow}>
            {/* Stage 1 */}
            <View style={styles.stageCard}>
              <View style={styles.stageNumberCircle}>
                <Text style={styles.stageNumber}>1</Text>
              </View>
              <Text style={styles.stageName}>CREATE</Text>
              <Text style={styles.stageDesc}>
                Author editorial stories with verifiable primary sources and target audiences.
              </Text>
            </View>

            {/* Stage 2 */}
            <View style={styles.stageCard}>
              <View style={styles.stageNumberCircle}>
                <Text style={styles.stageNumber}>2</Text>
              </View>
              <Text style={styles.stageName}>REVIEW</Text>
              <Text style={styles.stageDesc}>
                Editorial board verifies facts and citations before any funding begins.
              </Text>
            </View>

            {/* Stage 3 */}
            <View style={styles.stageCard}>
              <View style={styles.stageNumberCircle}>
                <Text style={styles.stageNumber}>3</Text>
              </View>
              <Text style={styles.stageName}>AMPLIFY</Text>
              <Text style={styles.stageDesc}>
                Backers fund paid digital ad delivery. Track real-time distribution audits.
              </Text>
            </View>
          </View>
        </View>

        {/* Featured Campaigns Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionEyebrow}>CURATED</Text>
              <Text style={styles.sectionTitle}>Featured Campaigns</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.seeAllText}>See all ({campaigns.length})</Text>
            </TouchableOpacity>
          </View>

          {featuredCampaigns.map(camp => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              featured={true}
              onPress={() => navigation.navigate('CampaignDetail', { campaignId: camp.id })}
              onBackPress={() => navigation.navigate('Contribution', { campaignId: camp.id })}
            />
          ))}
        </View>

        {/* Live Promotion & Verified Audits Section */}
        {showcaseCampaigns.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>MEASURED IMPACT</Text>
              <Text style={styles.sectionTitle}>Live Amplification & Audits</Text>
            </View>

            {showcaseCampaigns.map(camp => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: camp.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
  topNav: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.forestGreen,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  brandText: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 1.2,
  },
  searchIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroPillText: {
    fontSize: typography.sizes.xs,
    color: colors.softMint,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: typography.sizes.hero,
    fontWeight: '800',
    color: colors.textInverse,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textInverseMuted,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  reachEstimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  reachIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reachTextBox: {
    flex: 1,
  },
  reachEstimateHeadline: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  reachEstimateDisclaimer: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  heroBtnLeft: {
    flex: 1,
    marginRight: spacing.xs,
  },
  heroBtnRight: {
    flex: 1,
    marginLeft: spacing.xs,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bannerContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  sectionContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.charcoal,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  stageCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginHorizontal: 3,
    alignItems: 'center',
    ...shadows.card,
  },
  stageNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.softMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stageNumber: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  stageName: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  stageDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
