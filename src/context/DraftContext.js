/**
 * DraftContext
 * State management for the 5-step Campaign Creation Wizard
 * Handles auto-saving, backward navigation state preservation, and field validation
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DraftRepository, CampaignRepository, NotificationRepository } from '../services/repository';
import { CAMPAIGN_STATUS } from '../constants';
import {
  validateBasicsStep,
  validateStoryStep,
  validateVisualsStep,
  validateReachStep,
  validateSubmitStep,
} from '../utils/validation';

const DraftContext = createContext(null);

const INITIAL_DRAFT_STATE = {
  // Step 1: Basics
  title: '',
  category: 'Environment',
  creatorName: '',
  creatorBio: '',
  summary: '',
  coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',

  // Step 2: Story & Sources
  headline: '',
  introduction: '',
  sections: [
    {
      id: 'sec-init-1',
      type: 'text',
      title: 'Context & Background',
      content: '',
    },
  ],
  sources: [
    {
      id: 'src-init-1',
      title: '',
      url: '',
      verified: false,
    },
  ],
  suggestedActions: [
    'Share this verified report with your local community council.',
  ],

  // Step 3: Campaign & Ad Visuals
  adHeadline: '',
  adDescription: '',
  ctaText: 'Read Verified Story',
  selectedPlacement: 'feed',

  // Step 4: Reach & Distribution Preferences
  targetGeography: 'Karnataka & Bangalore Urban',
  targetAudience: 'Community members 18-65 interested in public welfare',
  durationDays: 30,
  channels: ['Instagram & Meta Ads', 'Regional Digital Media'],

  // Step 5: Submit & Goal Settings
  fundingGoal: 25000, // Explicitly set by creator, not AI
  agreedToPolicies: false,
};

export const DraftProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [draftData, setDraftData] = useState(INITIAL_DRAFT_STATE);
  const [stepErrors, setStepErrors] = useState({});
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if an existing saved draft exists in storage on startup
  useEffect(() => {
    const checkDraft = async () => {
      const saved = await DraftRepository.getDraft();
      if (saved && saved.title) {
        setHasSavedDraft(true);
        setLastSavedTime(saved.savedAt);
      }
    };
    checkDraft();
  }, []);

  // Update a specific field
  const updateDraftField = (fieldName, value) => {
    setDraftData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error for that field if present
    if (stepErrors[fieldName]) {
      setStepErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  // Add a story section
  const addStorySection = () => {
    const newSection = {
      id: `sec-${Date.now()}`,
      type: 'text',
      title: `Story Section ${draftData.sections.length + 1}`,
      content: '',
    };
    setDraftData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  // Remove a story section
  const removeStorySection = (sectionId) => {
    if (draftData.sections.length <= 1) return;
    setDraftData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  };

  // Update a story section
  const updateStorySection = (sectionId, key, value) => {
    setDraftData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, [key]: value } : s),
    }));
  };

  // Add supporting source
  const addSource = () => {
    const newSource = {
      id: `src-${Date.now()}`,
      title: '',
      url: '',
      verified: false,
    };
    setDraftData(prev => ({
      ...prev,
      sources: [...prev.sources, newSource],
    }));
  };

  // Remove supporting source
  const removeSource = (sourceId) => {
    if (draftData.sources.length <= 1) return;
    setDraftData(prev => ({
      ...prev,
      sources: prev.sources.filter(s => s.id !== sourceId),
    }));
  };

  // Update supporting source
  const updateSource = (sourceId, key, value) => {
    setDraftData(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === sourceId ? { ...s, [key]: value } : s),
    }));
  };

  // Toggle channel selection
  const toggleChannel = (channelName) => {
    setDraftData(prev => {
      const exists = prev.channels.includes(channelName);
      const updated = exists
        ? prev.channels.filter(c => c !== channelName)
        : [...prev.channels, channelName];
      return { ...prev, channels: updated };
    });
  };

  // Validate current step
  const validateCurrentStep = (step = currentStep) => {
    let result = { isValid: true, errors: {} };
    if (step === 1) result = validateBasicsStep(draftData);
    if (step === 2) result = validateStoryStep(draftData);
    if (step === 3) result = validateVisualsStep(draftData);
    if (step === 4) result = validateReachStep(draftData);
    if (step === 5) result = validateSubmitStep(draftData);

    setStepErrors(result.errors);
    return result.isValid;
  };

  // Move to next step with validation
  const goToNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
        autoSaveDraft();
      }
    }
  };

  // Move to previous step preserving values
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Explicit Save as Draft
  const saveAsDraft = async () => {
    const saved = await DraftRepository.saveDraft(draftData);
    setHasSavedDraft(true);
    setLastSavedTime(saved.savedAt);
    return saved;
  };

  // Auto-save silently
  const autoSaveDraft = async () => {
    try {
      await DraftRepository.saveDraft(draftData);
      setHasSavedDraft(true);
    } catch (e) {
      // silent
    }
  };

  // Resume existing draft
  const resumeDraft = async () => {
    const saved = await DraftRepository.getDraft();
    if (saved) {
      setDraftData({
        ...INITIAL_DRAFT_STATE,
        ...saved,
      });
      setCurrentStep(1);
      return true;
    }
    return false;
  };

  // Discard draft
  const discardDraft = async () => {
    await DraftRepository.clearDraft();
    setDraftData(INITIAL_DRAFT_STATE);
    setHasSavedDraft(false);
    setCurrentStep(1);
    setStepErrors({});
  };

  // Submit campaign for review
  const submitCampaignForReview = async (onSuccess) => {
    if (!validateCurrentStep(5)) return false;

    setIsSubmitting(true);
    try {
      const newCampaignId = `camp-sub-${Date.now()}`;
      const campaignPayload = {
        id: newCampaignId,
        title: draftData.title.trim(),
        category: draftData.category,
        creatorName: draftData.creatorName.trim(),
        creatorBio: draftData.creatorBio || 'Community message organizer',
        summary: draftData.summary.trim(),
        coverImage: draftData.coverImage,
        status: CAMPAIGN_STATUS.SUBMITTED_FOR_REVIEW,
        fundingGoal: Number(draftData.fundingGoal),
        amountRaised: 0,
        backersCount: 0,
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + draftData.durationDays * 86400000).toISOString(),
        targetGeography: draftData.targetGeography,
        targetAudience: draftData.targetAudience,
        channels: draftData.channels,
        adHeadline: draftData.adHeadline.trim(),
        adDescription: draftData.adDescription.trim(),
        ctaText: draftData.ctaText.trim(),
        story: {
          headline: draftData.headline.trim(),
          introduction: draftData.introduction.trim(),
          sections: draftData.sections,
          sources: draftData.sources,
          suggestedActions: draftData.suggestedActions,
        },
        useOfFunds: {
          platformFeePercent: 5,
          paymentProcessingPercent: 2.5,
          directAdDistributionPercent: 92.5,
          disclaimer: 'This is an ad amplification campaign. Contributions fund verified digital media distribution to expand reach.',
        },
        reviewNotes: {
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          assignedReviewer: 'Editorial Board (Fact-Check Desk)',
          expectedDecisionBy: new Date(Date.now() + 48 * 3600000).toISOString(),
        },
      };

      await CampaignRepository.saveCampaign(campaignPayload);
      await NotificationRepository.addNotification({
        type: 'campaign_submitted',
        title: 'Campaign Submitted for Review',
        message: `“${campaignPayload.title}” has been submitted. Our fact-checking team will review sources within 48 hours.`,
        campaignId: newCampaignId,
      });

      // Clear draft once submitted
      await DraftRepository.clearDraft();
      setHasSavedDraft(false);
      setDraftData(INITIAL_DRAFT_STATE);
      setCurrentStep(1);

      if (onSuccess) {
        onSuccess(campaignPayload);
      }
      return campaignPayload;
    } catch (err) {
      console.error('Submission failed:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate sample deterministic AI suggestions for demo
  const populateAiSuggestions = (presetType = 'water') => {
    if (presetType === 'water') {
      setDraftData(prev => ({
        ...prev,
        title: 'Clean Water Pipeline for 12 Village Panchayats',
        category: 'Environment',
        creatorName: 'Cauvery River Basin Watch',
        summary: 'Amplifying verified water testing laboratory findings to 75,000 rural residents and panchayat representatives to accelerate safe pipeline funding.',
        headline: 'Safe Drinking Water Requires Transparent Public Pipeline Timelines',
        introduction: 'Routine groundwater testing in June revealed contamination in local community wells across 12 villages.',
        adHeadline: 'Check your village water test results. See the Cauvery Basin report.',
        adDescription: 'Laboratory analysis shows fluoride levels exceeding safety limits. Request district filter access today.',
        targetGeography: 'Mandya & Mysore rural taluks',
        fundingGoal: 35000,
      }));
    } else {
      setDraftData(prev => ({
        ...prev,
        title: 'Vernacular Science Kits for Rural Middle Schools',
        category: 'Science',
        creatorName: 'Open STEM India Initiative',
        summary: 'Funding localized video campaigns to distribute 500 low-cost experimental science experiment kits to state schools.',
        headline: 'Hands-On Science Learning in Every District Classroom',
        introduction: 'Curiosity thrives when children hold real lenses, prisms, and magnets instead of only reading textbook diagrams.',
        adHeadline: 'Bring hands-on science lab kits to rural high schools',
        adDescription: 'Open-source experiment kits mapped to state syllabus. Nominate your village school today.',
        targetGeography: 'Rural Maharashtra & Karnataka',
        fundingGoal: 28000,
      }));
    }
  };

  return (
    <DraftContext.Provider
      value={{
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
        validateCurrentStep,
        goToNextStep,
        goToPreviousStep,
        saveAsDraft,
        resumeDraft,
        discardDraft,
        submitCampaignForReview,
        populateAiSuggestions,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (!context) throw new Error('useDraft must be used within DraftProvider');
  return context;
};
