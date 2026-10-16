/**
 * ActivityScreen
 * In-app notification center tracking campaign review decisions, funding milestones,
 * and distribution report publications.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useNotifications } from '../../context/NotificationContext';
import { EmptyState } from '../../components/common/EmptyState';

export const ActivityScreen = ({ navigation }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'campaign_approved':
        return { name: 'checkmark-circle', color: colors.primaryGreen };
      case 'changes_requested':
        return { name: 'alert-circle', color: colors.warning };
      case 'campaign_submitted':
        return { name: 'time', color: colors.info };
      case 'contribution_success':
        return { name: 'cash', color: colors.primaryGreen };
      case 'milestone_reached':
      case 'goal_reached':
        return { name: 'trophy', color: '#D97706' };
      case 'report_available':
        return { name: 'document-text', color: colors.forestGreen };
      default:
        return { name: 'notifications', color: colors.primaryGreen };
    }
  };

  const handleNotificationPress = async (notif) => {
    await markAsRead(notif.id);
    if (notif.campaignId) {
      navigation.navigate('CampaignDetail', { campaignId: notif.campaignId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>ACTIVITY LOG</Text>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={markAllAsRead}
            style={styles.markAllBtn}
          >
            <Text style={styles.markAllBtnText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setFilterUnreadOnly(false)}
          style={[styles.filterTab, !filterUnreadOnly && styles.filterTabActive]}
        >
          <Text style={[styles.filterTabText, !filterUnreadOnly && styles.filterTabTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setFilterUnreadOnly(true)}
          style={[styles.filterTab, filterUnreadOnly && styles.filterTabActive]}
        >
          <Text style={[styles.filterTabText, filterUnreadOnly && styles.filterTabTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Feed */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {displayedNotifications.map(item => {
          const iconMeta = getNotificationIcon(item.type);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => handleNotificationPress(item)}
              style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.softMint }]}>
                <Ionicons name={iconMeta.name} size={20} color={iconMeta.color} />
              </View>

              <View style={styles.contentCol}>
                <View style={styles.topRow}>
                  <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.message}</Text>
                
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {displayedNotifications.length === 0 && (
          <EmptyState
            icon="notifications-off-outline"
            title="No Activity Yet"
            description={
              filterUnreadOnly
                ? 'You have caught up with all activity notifications.'
                : 'Updates regarding submissions, funding milestones, and reports will appear here.'
            }
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.forestGreen,
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
  markAllBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  markAllBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textInverse,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.softMint,
  },
  filterTabText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  notificationCardUnread: {
    borderColor: colors.borderFocus,
    backgroundColor: '#F9FDFB',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: colors.forestGreen,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryGreen,
    marginLeft: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textTertiary,
  },
});
