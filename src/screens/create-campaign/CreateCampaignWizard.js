/**
 * CreateCampaignWizard
 * 5-Step Campaign Creation: Basics -> Story -> Visuals -> Reach -> Submit
 * Includes draft auto-saving, resumption, step validation, and live preview modal
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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { CATEGORIES, DISTRIBUTION_CHANNELS, AD_PLACEMENTS } from '../../constants';
import { useDraft } from '../../context/DraftContext';
import { useUser } from '../../context/UserContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { NoticeBanner } from '../../components/common/NoticeBanner';
import { formatCurrency, formatMetric, calculateGoalEstimates } from '../../utils/calculations';

const STEP_TITLES = [
  'Basics',
  'Story & Sources',
  'Ad Creatives',
  'Reach Plan',
  'Review & Submit',
];

export const CreateCampaignWizard = ({ navigation }) => {
  const { isLoggedIn } = useUser();
  const {
    currentStep,
    setCurrentStep,
    draftData,
    updateDraftField,
    stepErrors,
    hasSavedDraft,
    lastSavedTime,
    isSubmitting,
    addStorySection,
    removeStorySection,
    updateStorySection,
    addSource,
    removeSource,
    updateSource,
    toggleChannel,
    goToNextStep,
    goToPreviousStep,
    saveAsDraft,
    resumeDraft,
    discardDraft,
    submitCampaignForReview,
    populateAiSuggestions,
  } = useDraft();

  const [saveToast, setSaveToast] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleExplicitSave = async () => {
    await saveAsDraft();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSubmit = async () => {
    const created = await submitCampaignForReview(newCamp => {
      if (!isLoggedIn) {
        navigation.navigate('Login', { returnTo: 'Dashboard', initialTab: 'review' });
      } else {
        navigation.navigate('Dashboard', { initialTab: 'review' });
      }
    });
  };

  const goalEstimates = calculateGoalEstimates(draftData.fundingGoal);

  // Render Step 1: Basics
  const renderStep1Basics = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeaderRow}>
        <Text style={styles.stepHeading}>Step 1: Campaign Basics</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => populateAiSuggestions('water')}
          style={styles.aiDemoBtn}
        >
          <Ionicons name="sparkles" size={13} color={colors.forestGreen} />
          <Text style={styles.aiDemoBtnText}>Fill Demo Topic</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stepSubtext}>
        Define your primary message and responsible creator identity. The title may also serve as an advertising headline.
      </Text>

      <Input
        label="Campaign Title"
        value={draftData.title}
        onChangeText={text => updateDraftField('title', text)}
        placeholder="e.g., Protect Local Drinking Wells from Runoff"
        maxLength={60}
        required
        error={stepErrors.title}
        helperText="Keep within 60 characters for high-performing mobile ad placements."
      />

      <View style={styles.categoryPickerSection}>
        <Text style={styles.fieldLabel}>
          Category <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.filter(c => c !== 'All').map(cat => {
            const isSelected = draftData.category === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => updateDraftField('category', cat)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {stepErrors.category && <Text style={styles.fieldErrorText}>{stepErrors.category}</Text>}
      </View>

      <Input
        label="Creator or Organization Name"
        value={draftData.creatorName}
        onChangeText={text => updateDraftField('creatorName', text)}
        placeholder="e.g., Clean Waters Coalition Karnataka"
        required
        error={stepErrors.creatorName}
        helperText="Backers and reviewers see this verified identity on every ad card."
      />

      <Input
        label="Creator Bio / Background"
        value={draftData.creatorBio}
        onChangeText={text => updateDraftField('creatorBio', text)}
        placeholder="e.g., Hydrologists & local farmers advocating for freshwater safety."
        multiline
        numberOfLines={2}
      />

      <Input
        label="Short Message Summary"
        value={draftData.summary}
        onChangeText={text => updateDraftField('summary', text)}
        placeholder="Explain the urgent issue and why wider public awareness is needed..."
        multiline
        numberOfLines={3}
        required
        error={stepErrors.summary}
        helperText="Displayed prominently in discovery feeds and preview snippets."
      />
    </View>
  );

  // Render Step 2: Story & Sources
  const renderStep2Story = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepHeading}>Step 2: Editorial Story & Sources</Text>
      <Text style={styles.stepSubtext}>
        Build an authoritative, story-driven explanation. Visible supporting sources are required for fact-checking approval.
      </Text>

      <Input
        label="Story Headline"
        value={draftData.headline}
        onChangeText={text => updateDraftField('headline', text)}
        placeholder="e.g., Groundwater Contamination Is Invisible Until Public Awareness Forces Action"
        required
        error={stepErrors.headline}
      />

      <Input
        label="Introduction Narrative"
        value={draftData.introduction}
        onChangeText={text => updateDraftField('introduction', text)}
        placeholder="Provide the opening context that introduces the core problem..."
        multiline
        numberOfLines={3}
      />

      {/* Story Sections */}
      <View style={styles.subsectionHeaderRow}>
        <Text style={styles.subsectionHeading}>Story Narrative Sections</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={addStorySection}
          style={styles.addMiniBtn}
        >
          <Ionicons name="add" size={14} color={colors.forestGreen} />
          <Text style={styles.addMiniBtnText}>Add Section</Text>
        </TouchableOpacity>
      </View>

      {draftData.sections.map((section, idx) => (
        <View key={section.id} style={styles.dynamicCard}>
          <View style={styles.dynamicCardHeader}>
            <Text style={styles.dynamicCardIndex}>Section #{idx + 1}</Text>
            {draftData.sections.length > 1 && (
              <TouchableOpacity
                onPress={() => removeStorySection(section.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
          <Input
            label="Section Title"
            value={section.title}
            onChangeText={val => updateStorySection(section.id, 'title', val)}
            placeholder="e.g., The Data Behind The Crisis"
          />
          <Input
            label="Section Narrative"
            value={section.content}
            onChangeText={val => updateStorySection(section.id, 'content', val)}
            placeholder="Write detailed factual context..."
            multiline
            numberOfLines={4}
          />
        </View>
      ))}
      {stepErrors.sections && <Text style={styles.fieldErrorText}>{stepErrors.sections}</Text>}

      {/* Supporting Sources (CRITICAL REQUIREMENT) */}
      <View style={[styles.subsectionHeaderRow, { marginTop: spacing.md }]}>
        <View>
          <Text style={styles.subsectionHeading}>
            Supporting Sources <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <Text style={styles.subsectionSubtext}>
            Government audits, university research, RTI documents, or lab reports.
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={addSource}
          style={styles.addMiniBtn}
        >
          <Ionicons name="add" size={14} color={colors.forestGreen} />
          <Text style={styles.addMiniBtnText}>Add Source</Text>
        </TouchableOpacity>
      </View>

      {draftData.sources.map((src, idx) => (
        <View key={src.id} style={styles.dynamicCard}>
          <View style={styles.dynamicCardHeader}>
            <Text style={styles.dynamicCardIndex}>Citation Source #{idx + 1}</Text>
            {draftData.sources.length > 1 && (
              <TouchableOpacity
                onPress={() => removeSource(src.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
          <Input
            label="Source Document Title"
            value={src.title}
            onChangeText={val => updateSource(src.id, 'title', val)}
            placeholder="e.g., State Pollution Control Board 2026 Water Bulletin"
            required
          />
          <Input
            label="Verifiable Public URL"
            value={src.url}
            onChangeText={val => updateSource(src.id, 'url', val)}
            placeholder="https://..."
            required
            helperText="Must start with http:// or https://"
          />
        </View>
      ))}
      {stepErrors.sources && <Text style={styles.fieldErrorText}>{stepErrors.sources}</Text>}
    </View>
  );

  // Render Step 3: Campaign & Ad Visuals
  const renderStep3Visuals = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepHeading}>Step 3: Campaign & Ad Visuals</Text>
      <Text style={styles.stepSubtext}>
        Configure the advertising creatives that will appear across sponsored channels when your message is amplified.
      </Text>

      <Input
        label="Ad Headline"
        value={draftData.adHeadline}
        onChangeText={text => updateDraftField('adHeadline', text)}
        placeholder="e.g., Is your village drinking water safe? Inspect local test reports."
        maxLength={70}
        required
        error={stepErrors.adHeadline}
        helperText="Catchy, factual headline shown on sponsored cards."
      />

      <Input
        label="Ad Primary Description"
        value={draftData.adDescription}
        onChangeText={text => updateDraftField('adDescription', text)}
        placeholder="e.g., Lab tests indicate arsenic spikes in 14 taluks. Learn your rights."
        multiline
        numberOfLines={3}
        required
        error={stepErrors.adDescription}
      />

      <Input
        label="Call-To-Action (CTA) Text"
        value={draftData.ctaText}
        onChangeText={text => updateDraftField('ctaText', text)}
        placeholder="e.g., Inspect Water Map"
        required
        error={stepErrors.ctaText}
      />

      {/* Ad Placement Previews */}
      <Text style={styles.subsectionHeading}>Preview Placements</Text>
      <View style={styles.placementsRow}>
        {AD_PLACEMENTS.map(plc => {
          const isSelected = draftData.selectedPlacement === plc.id;
          return (
            <TouchableOpacity
              key={plc.id}
              activeOpacity={0.8}
              onPress={() => updateDraftField('selectedPlacement', plc.id)}
              style={[
                styles.placementCard,
                isSelected && styles.placementCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.placementTitle,
                  isSelected && styles.placementTitleSelected,
                ]}
              >
                {plc.name}
              </Text>
              <Text style={styles.placementDesc}>{plc.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Live Preview Box */}
      <View style={styles.adPreviewBox}>
        <View style={styles.adPreviewHeader}>
          <Ionicons name="megaphone-outline" size={14} color={colors.primaryGreen} />
          <Text style={styles.adPreviewTag}>SPONSORED MESSAGE PREVIEW</Text>
        </View>
        <Text style={styles.adPreviewHeadline}>
          {draftData.adHeadline || 'Your Ad Headline Will Appear Here'}
        </Text>
        <Text style={styles.adPreviewDescription}>
          {draftData.adDescription || 'Your primary sponsored description will render here with verified organization badge.'}
        </Text>
        <View style={styles.adPreviewBtn}>
          <Text style={styles.adPreviewBtnText}>{draftData.ctaText || 'Read Story'}</Text>
        </View>
      </View>
    </View>
  );

  // Render Step 4: Reach & Distribution Preferences
  const renderStep4Reach = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepHeading}>Step 4: Reach & Targeting Plan</Text>
      <Text style={styles.stepSubtext}>
        Specify where and how your message should be distributed once funded. Our transparent model estimates expected impressions.
      </Text>

      <Input
        label="Target Geography / Region"
        value={draftData.targetGeography}
        onChangeText={text => updateDraftField('targetGeography', text)}
        placeholder="e.g., Karnataka & Bellary Basin, India"
        required
        error={stepErrors.targetGeography}
        helperText="Hyper-local, district-level, or regional targeting zone."
      />

      <Input
        label="Audience Demographic Characteristics"
        value={draftData.targetAudience}
        onChangeText={text => updateDraftField('targetAudience', text)}
        placeholder="e.g., Adults 21+, panchayat representatives, local voters"
        multiline
        numberOfLines={2}
      />

      <Input
        label="Campaign Duration (Days)"
        value={String(draftData.durationDays)}
        onChangeText={text => updateDraftField('durationDays', text.replace(/[^0-9]/g, ''))}
        placeholder="30"
        keyboardType="numeric"
        required
        error={stepErrors.durationDays}
        helperText="Recommended 14 to 45 days for optimal funding and media scheduling."
      />

      {/* Amplification Channels Selector */}
      <Text style={styles.subsectionHeading}>
        Selected Channels <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <View style={styles.channelsGrid}>
        {DISTRIBUTION_CHANNELS.map(ch => {
          const isSelected = draftData.channels.includes(ch.name);
          return (
            <TouchableOpacity
              key={ch.id}
              activeOpacity={0.8}
              onPress={() => toggleChannel(ch.name)}
              style={[
                styles.channelCard,
                isSelected && styles.channelCardSelected,
              ]}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={18}
                color={isSelected ? colors.forestGreen : colors.textTertiary}
              />
              <Text
                style={[
                  styles.channelName,
                  isSelected && styles.channelNameSelected,
                ]}
              >
                {ch.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {stepErrors.channels && <Text style={styles.fieldErrorText}>{stepErrors.channels}</Text>}
    </View>
  );

  // Render Step 5: Submit & Goal Settings
  const renderStep5Submit = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepHeading}>Step 5: Review & Funding Goal</Text>
      <Text style={styles.stepSubtext}>
        Set your distribution funding goal. Review all details before submitting for editorial review.
      </Text>

      {/* Explicit Creator-Defined Goal Input (CRITICAL RULE) */}
      <View style={styles.goalInputCard}>
        <Text style={styles.goalInputLabel}>
          Set Distribution Funding Goal (₹) <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <Text style={styles.goalInputHelper}>
          The creator sets this goal explicitly. It is never automatically modified by AI.
        </Text>
        <Input
          value={String(draftData.fundingGoal)}
          onChangeText={text => updateDraftField('fundingGoal', text.replace(/[^0-9]/g, ''))}
          placeholder="25000"
          keyboardType="numeric"
          required
          error={stepErrors.fundingGoal}
          inputStyle={{ fontSize: typography.sizes.xl, fontWeight: '800', color: colors.forestGreen }}
        />

        {/* Calculated Financial & Reach Breakdown */}
        <View style={styles.estimatesCard}>
          <Text style={styles.estimatesTitle}>Estimated Campaign Reach Breakdown</Text>
          
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Direct Ad Spend Budget (92.5%):</Text>
            <Text style={styles.estimateValue}>{formatCurrency(goalEstimates.netAdBudget)}</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Platform Curation & Clicks (5%):</Text>
            <Text style={styles.estimateValue}>{formatCurrency(goalEstimates.platformFee)}</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Processing & Banking Gateway (2.5%):</Text>
            <Text style={styles.estimateValue}>{formatCurrency(goalEstimates.paymentFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabelBold}>Est. Verified Audience Reach:</Text>
            <Text style={styles.estimateReachHighlight}>
              ~{formatMetric(goalEstimates.estimatedTotalReach)} people
            </Text>
          </View>
          <Text style={styles.estimateDisclaimer}>
            *Illustrative reach based on ~15 impressions per ₹1 net ad spend. Delivery depends on live ad auctions.
          </Text>
        </View>
      </View>

      {/* Summary Review Overview */}
      <View style={styles.reviewOverviewCard}>
        <Text style={styles.reviewCardTitle}>Submission Summary</Text>
        <Text style={styles.reviewItem}>
          <Text style={styles.boldText}>Title: </Text>{draftData.title}
        </Text>
        <Text style={styles.reviewItem}>
          <Text style={styles.boldText}>Category: </Text>{draftData.category}
        </Text>
        <Text style={styles.reviewItem}>
          <Text style={styles.boldText}>Creator: </Text>{draftData.creatorName}
        </Text>
        <Text style={styles.reviewItem}>
          <Text style={styles.boldText}>Targeting: </Text>{draftData.targetGeography} ({draftData.durationDays} days)
        </Text>
        <Text style={styles.reviewItem}>
          <Text style={styles.boldText}>Citations: </Text>{draftData.sources.length} verifiable source(s)
        </Text>

        <Button
          title="Preview Full Campaign"
          variant="outline"
          size="sm"
          icon="eye-outline"
          onPress={() => setShowPreviewModal(true)}
          style={{ marginTop: spacing.sm }}
        />
      </View>

      {/* Policy Agreement Checkbox */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => updateDraftField('agreedToPolicies', !draftData.agreedToPolicies)}
        style={styles.policyRow}
      >
        <Ionicons
          name={draftData.agreedToPolicies ? 'checkbox' : 'square-outline'}
          size={24}
          color={draftData.agreedToPolicies ? colors.forestGreen : colors.textTertiary}
          style={{ marginRight: spacing.sm, marginTop: 2 }}
        />
        <Text style={styles.policyText}>
          I confirm that all statements and sources are truthful, and I understand that contributions exclusively fund message distribution and do not constitute direct donations.
        </Text>
      </TouchableOpacity>
      {stepErrors.agreedToPolicies && (
        <Text style={[styles.fieldErrorText, { marginBottom: spacing.md }]}>
          {stepErrors.agreedToPolicies}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
          style={styles.headerCloseBtn}
        >
          <Ionicons name="close" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Campaign</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleExplicitSave}
          style={styles.saveDraftBtn}
        >
          <Text style={styles.saveDraftBtnText}>Save Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Resume Draft Banner if available */}
      {hasSavedDraft && currentStep === 1 && !draftData.title && (
        <View style={styles.resumeBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeTitle}>Unfinished draft detected</Text>
            <Text style={styles.resumeSub}>Saved {lastSavedTime ? new Date(lastSavedTime).toLocaleDateString() : 'locally'}</Text>
          </View>
          <TouchableOpacity onPress={resumeDraft} style={styles.resumeBtn}>
            <Text style={styles.resumeBtnText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={discardDraft} style={styles.discardBtn}>
            <Text style={styles.discardBtnText}>Discard</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5-Step Persistent Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.stepIndicatorsRow}>
          {[1, 2, 3, 4, 5].map(stepNum => {
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <View key={stepNum} style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                  ) : (
                    <Text
                      style={[
                        styles.stepCircleText,
                        isCurrent && styles.stepCircleTextCurrent,
                      ]}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                  numberOfLines={1}
                >
                  {STEP_TITLES[stepNum - 1]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Save Draft Notification Toast */}
      {saveToast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primaryGreen} />
          <Text style={styles.toastText}>Draft saved to local storage.</Text>
        </View>
      )}

      {/* Wizard Step ScrollView */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1Basics()}
        {currentStep === 2 && renderStep2Story()}
        {currentStep === 3 && renderStep3Visuals()}
        {currentStep === 4 && renderStep4Reach()}
        {currentStep === 5 && renderStep5Submit()}
      </ScrollView>

      {/* Bottom Sticky Action Controls */}
      <View style={styles.wizardBottomBar}>
        {currentStep > 1 ? (
          <Button
            title="Back"
            variant="outline"
            onPress={goToPreviousStep}
            style={styles.wizardBackBtn}
          />
        ) : (
          <View style={styles.wizardBackBtn} />
        )}

        {currentStep < 5 ? (
          <Button
            title="Continue"
            variant="primary"
            onPress={goToNextStep}
            style={styles.wizardNextBtn}
            icon="arrow-forward-outline"
            iconPosition="right"
          />
        ) : (
          <Button
            title="Submit for Review"
            variant="primary"
            loading={isSubmitting}
            onPress={handleSubmit}
            style={styles.wizardNextBtn}
            icon="send-outline"
          />
        )}
      </View>

      {/* Live Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.warmIvory }}>
          <View style={styles.previewModalHeader}>
            <Text style={styles.previewModalTitle}>Campaign Preview</Text>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
              <Ionicons name="close" size={24} color={colors.charcoal} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.md }}>
            <Text style={styles.previewCat}>{draftData.category}</Text>
            <Text style={styles.previewHead}>{draftData.title}</Text>
            <Text style={styles.previewCreator}>By {draftData.creatorName}</Text>
            <Text style={styles.previewSummary}>{draftData.summary}</Text>
            <View style={styles.divider} />
            <Text style={styles.previewStoryHead}>{draftData.headline}</Text>
            <Text style={styles.previewStoryIntro}>{draftData.introduction}</Text>
            {draftData.sections.map((s, idx) => (
              <View key={idx} style={{ marginBottom: spacing.sm }}>
                <Text style={{ fontWeight: '700', color: colors.forestGreen }}>{s.title}</Text>
                <Text style={{ color: colors.charcoal, lineHeight: 20 }}>{s.content}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <Text style={{ fontWeight: '700', marginBottom: 4 }}>Supporting Sources:</Text>
            {draftData.sources.map((s, idx) => (
              <Text key={idx} style={{ fontSize: 12, color: colors.primaryGreen, marginBottom: 4 }}>
                • {s.title} ({s.url})
              </Text>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerCloseBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.charcoal,
  },
  saveDraftBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.softMint,
  },
  saveDraftBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.mintBadge,
  },
  resumeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
  },
  resumeSub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  resumeBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  resumeBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.textInverse,
    fontWeight: '700',
  },
  discardBtn: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  discardBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
  },
  progressContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepIndicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 60,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleCurrent: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.softMint,
  },
  stepCircleCompleted: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepCircleTextCurrent: {
    color: colors.forestGreen,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  stepLabelCurrent: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 99,
    ...shadows.cardHover,
  },
  toastText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.charcoal,
    marginLeft: spacing.xs,
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmIvory,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  stepContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.charcoal,
  },
  aiDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  aiDemoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forestGreen,
    marginLeft: 3,
  },
  stepSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  categoryPickerSection: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  requiredAsterisk: {
    color: colors.error,
  },
  categoryRow: {
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  categoryChipSelected: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  categoryChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  fieldErrorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
    marginTop: 4,
  },
  subsectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
  },
  subsectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
  },
  subsectionSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  addMiniBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
    marginLeft: 2,
  },
  dynamicCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  dynamicCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dynamicCardIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  placementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  placementCard: {
    width: '48%',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  placementCardSelected: {
    backgroundColor: colors.softMint,
    borderColor: colors.forestGreen,
    borderWidth: 1.5,
  },
  placementTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 2,
  },
  placementTitleSelected: {
    color: colors.forestGreen,
  },
  placementDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  adPreviewBox: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.card,
  },
  adPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adPreviewTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryGreen,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  adPreviewHeadline: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: 4,
  },
  adPreviewDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  adPreviewBtn: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  adPreviewBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textInverse,
  },
  channelsGrid: {
    gap: 8,
    marginTop: spacing.xs,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  channelCardSelected: {
    backgroundColor: colors.softMint,
    borderColor: colors.forestGreen,
  },
  channelName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.charcoal,
    marginLeft: spacing.sm,
  },
  channelNameSelected: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  goalInputCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goalInputLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.charcoal,
  },
  goalInputHelper: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  estimatesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  estimatesTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  estimateLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  estimateValue: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.charcoal,
  },
  estimateLabelBold: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.charcoal,
  },
  estimateReachHighlight: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  estimateDisclaimer: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  reviewOverviewCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  reviewItem: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
  },
  policyText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    lineHeight: 18,
  },
  wizardBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  wizardBackBtn: {
    width: 100,
  },
  wizardNextBtn: {
    width: 200,
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  previewModalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.charcoal,
  },
  previewCat: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryGreen,
    textTransform: 'uppercase',
  },
  previewHead: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.charcoal,
    marginVertical: 4,
  },
  previewCreator: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  previewSummary: {
    fontSize: typography.sizes.sm,
    color: colors.charcoal,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  previewStoryHead: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 4,
  },
  previewStoryIntro: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
