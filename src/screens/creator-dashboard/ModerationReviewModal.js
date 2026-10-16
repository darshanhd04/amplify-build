/**
 * ModerationReviewModal
 * Interactive Reviewer Desk for testing the editorial fact-checking and approval lifecycle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { CAMPAIGN_STATUS } from '../../constants';
import { useCampaigns } from '../../context/CampaignContext';
import { useNotifications } from '../../context/NotificationContext';

export const ModerationReviewModal = ({ visible, onClose, campaign }) => {
  const { updateCampaignStatus } = useCampaigns();
  const { loadNotifications } = useNotifications();

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!campaign) return null;

  const handleDecision = async (decision) => {
    setSubmitting(true);
    try {
      if (decision === 'approve') {
        await updateCampaignStatus(
          campaign.id,
          CAMPAIGN_STATUS.AVAILABLE_FOR_FUNDING,
          {
            isSimulationOverride: true,
            reviewNotes: {
              status: 'approved',
              approvedAt: new Date().toISOString(),
              reviewerNote: notes || 'All primary sources and citations fact-checked and verified.',
            },
          }
        );
      } else if (decision === 'changes') {
        await updateCampaignStatus(
          campaign.id,
          CAMPAIGN_STATUS.CHANGES_REQUESTED,
          {
            isSimulationOverride: true,
            reviewNotes: {
              status: 'changes_requested',
              reviewerFeedback: notes || 'Please provide verifiable URLs for citations in Section 2.',
              feedbackDate: new Date().toISOString(),
            },
          }
        );
      } else if (decision === 'reject') {
        await updateCampaignStatus(
          campaign.id,
          CAMPAIGN_STATUS.REJECTED,
          {
            isSimulationOverride: true,
            reviewNotes: {
              status: 'rejected',
              reviewerFeedback: notes || 'Claims do not meet factual verification criteria.',
              feedbackDate: new Date().toISOString(),
            },
          }
        );
      }
      await loadNotifications();
      setNotes('');
      onClose();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primaryGreen} />
              <Text style={styles.modalTitle}>Editorial Fact-Check Desk</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.charcoal} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.demoNotice}>
              <Text style={styles.demoNoticeText}>
                DEMO REVIEWER MODE: Simulate editorial board actions on this campaign to test lifecycle transitions.
              </Text>
            </View>

            <Text style={styles.campaignLabel}>Reviewing Campaign:</Text>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
            <Text style={styles.campaignMeta}>Category: {campaign.category} • Current Status: {campaign.status}</Text>

            <View style={styles.sourcesBox}>
              <Text style={styles.sourcesBoxTitle}>Submitted Sources to Verify:</Text>
              {campaign.story?.sources?.map((s, idx) => (
                <Text key={idx} style={styles.sourceLine}>
                  • {s.title} ({s.url})
                </Text>
              )) || <Text style={styles.sourceLine}>No sources attached.</Text>}
            </View>

            <Text style={styles.inputLabel}>Reviewer Feedback / Decision Notes:</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Primary lab report verified against state pollution database."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <View style={styles.decisionActions}>
              <Button
                title="Approve for Funding"
                variant="primary"
                loading={submitting}
                icon="checkmark-circle-outline"
                onPress={() => handleDecision('approve')}
                style={{ marginBottom: spacing.xs }}
              />

              <Button
                title="Request Changes"
                variant="outline"
                loading={submitting}
                icon="alert-circle-outline"
                onPress={() => handleDecision('changes')}
                style={{ marginBottom: spacing.xs }}
              />

              <Button
                title="Reject Campaign"
                variant="danger"
                loading={submitting}
                icon="close-circle-outline"
                onPress={() => handleDecision('reject')}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.forestGreen,
    marginLeft: spacing.xs,
  },
  modalBody: {
    padding: spacing.md,
  },
  demoNotice: {
    backgroundColor: colors.softMint,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  demoNoticeText: {
    fontSize: 11,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  campaignLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  campaignTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.charcoal,
    marginVertical: 2,
  },
  campaignMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sourcesBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  sourcesBoxTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 4,
  },
  sourceLine: {
    fontSize: 11,
    color: colors.primaryGreen,
    marginBottom: 2,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.charcoal,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  decisionActions: {
    paddingBottom: spacing.lg,
  },
});
