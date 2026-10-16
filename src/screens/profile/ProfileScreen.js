/**
 * ProfileScreen
 * User account, backed campaigns, contribution receipts, impact statistics,
 * and demo evaluator controls (Reviewer Desk toggle & Seed reset).
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useUser } from '../../context/UserContext';
import { useCampaigns } from '../../context/CampaignContext';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatMetric } from '../../utils/calculations';

export const ProfileScreen = ({ navigation }) => {
  const { user, contributions, totalContributed, totalAmplifiedReach, toggleReviewerMode } = useUser();
  const { campaigns, savedIds, resetToSeeds } = useCampaigns();

  const [resetSuccess, setResetSuccess] = useState(false);

  const savedCampaigns = campaigns.filter(c => savedIds.includes(c.id));
  const createdCampaigns = campaigns.filter(c => c.creatorName === user.name || c.id.startsWith('camp-sub-'));

  const handleResetData = async () => {
    await resetToSeeds();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Impact</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>AS</Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userHandle}>{user.handle}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{user.role}</Text>
            </View>
          </View>
        </View>

        {/* Amplification Impact Summary Banner */}
        <View style={styles.impactCard}>
          <Text style={styles.impactEyebrow}>YOUR COMMUNITY AMPLIFICATION FOOTPRINT</Text>
          <View style={styles.impactMetricsRow}>
            <View style={styles.impactMetricCol}>
              <Text style={styles.impactBigNumber}>
                ~{formatMetric(totalAmplifiedReach > 0 ? totalAmplifiedReach : 45000)}
              </Text>
              <Text style={styles.impactSub}>Audience reached</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactMetricCol}>
              <Text style={styles.impactBigNumber}>
                {formatCurrency(totalContributed > 0 ? totalContributed : 1250)}
              </Text>
              <Text style={styles.impactSub}>Ad media funded</Text>
            </View>
          </View>
        </View>

        {/* Quick Nav Shortcut Cards */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Dashboard')}
            style={styles.shortcutCard}
          >
            <Ionicons name="folder-outline" size={22} color={colors.forestGreen} />
            <Text style={styles.shortcutTitle}>Creator Desk</Text>
            <Text style={styles.shortcutSub}>{campaigns.length} total</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Activity')}
            style={styles.shortcutCard}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.forestGreen} />
            <Text style={styles.shortcutTitle}>Activity</Text>
            <Text style={styles.shortcutSub}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Backed Contributions History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contribution Receipts ({contributions.length})</Text>
          {contributions.slice(0, 4).map(contrib => (
            <View key={contrib.id} style={styles.receiptItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.receiptTitle} numberOfLines={1}>{contrib.campaignTitle}</Text>
                <Text style={styles.receiptMeta}>
                  Receipt #{contrib.receiptId} • {new Date(contrib.timestamp).toLocaleDateString('en-IN')}
                </Text>
              </View>
              <Text style={styles.receiptAmount}>{formatCurrency(contrib.amount)}</Text>
            </View>
          ))}
          {contributions.length === 0 && (
            <Text style={styles.emptyNotice}>No contributions recorded yet in this session.</Text>
          )}
        </View>

        {/* Saved Campaigns Bookmarks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bookmarked Campaigns ({savedCampaigns.length})</Text>
          {savedCampaigns.map(camp => (
            <TouchableOpacity
              key={camp.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CampaignDetail', { campaignId: camp.id })}
              style={styles.savedItem}
            >
              <Ionicons name="bookmark" size={16} color={colors.primaryGreen} style={{ marginRight: 8 }} />
              <Text style={styles.savedItemTitle} numberOfLines={1}>{camp.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
          {savedCampaigns.length === 0 && (
            <Text style={styles.emptyNotice}>Tap the bookmark icon on any campaign to save it here.</Text>
          )}
        </View>

        {/* Demo & Evaluation Tooling */}
        <View style={styles.demoToolsCard}>
          <View style={styles.demoToolsHeader}>
            <Ionicons name="construct-outline" size={16} color={colors.forestGreen} />
            <Text style={styles.demoToolsTitle}>Evaluator & QA Controls</Text>
          </View>
          <Text style={styles.demoToolsSub}>
            Test features, reset demo database seeds, or test editorial review actions.
          </Text>

          <Button
            title={resetSuccess ? 'Seeded Data Restored!' : 'Reset Demo Seeds'}
            variant="outline"
            size="sm"
            icon="refresh-outline"
            onPress={handleResetData}
            style={{ marginBottom: spacing.xs }}
          />

          <Button
            title="Open Creator Center"
            variant="secondary"
            size="sm"
            icon="apps-outline"
            onPress={() => navigation.navigate('Dashboard')}
          />
        </View>

        {/* Platform Legal & Non-Donation Disclosure Links */}
        <View style={styles.linksCard}>
          <TouchableOpacity style={styles.linkRow} onPress={() => alert('Contributions fund verified ad distribution to reach audiences beyond existing networks, not direct charity.')}>
            <Ionicons name="megaphone-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.linkText}>Why Amplification Is Not a Donation</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => alert('Fact-checking protocol: All claims must cite government, academic, or verifiable primary sources.')}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.linkText}>Editorial Fact-Checking Standards</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => alert('Privacy policy: Backer identities remain private by default.')}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.linkText}>Backer Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.forestGreen,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarInitials: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textInverse,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
  },
  userHandle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rolePill: {
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  impactCard: {
    backgroundColor: colors.forestGreen,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  impactEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.softMint,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  impactMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  impactMetricCol: {
    alignItems: 'center',
  },
  impactBigNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    color: colors.textInverse,
  },
  impactSub: {
    fontSize: 11,
    color: colors.textInverseMuted,
    marginTop: 2,
  },
  impactDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  shortcutTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 6,
  },
  shortcutSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
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
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  receiptTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
  },
  receiptMeta: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  savedItemTitle: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    fontWeight: '600',
  },
  emptyNotice: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  demoToolsCard: {
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.mintBadge,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  demoToolsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  demoToolsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: colors.forestGreen,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  demoToolsSub: {
    fontSize: 11,
    color: colors.forestGreen,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  linksCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  linkText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.charcoal,
    marginLeft: spacing.sm,
  },
});
