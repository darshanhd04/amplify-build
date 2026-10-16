/**
 * Form Validation Utilities for 5-Step Campaign Creation & Contributions
 */

/**
 * Validate URL format (http / https)
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const pattern = /^(https?:\/\/)([\w.-]+)+([/?#].*)?$/i;
  return pattern.test(url.trim());
};

/**
 * Validate Step 1: Basics
 */
export const validateBasicsStep = (data) => {
  const errors = {};
  
  if (!data?.title || !data.title.trim()) {
    errors.title = 'Campaign title is required.';
  } else if (data.title.trim().length > 60) {
    errors.title = 'Title must be 60 characters or fewer.';
  }

  if (!data?.category || data.category === 'All') {
    errors.category = 'Please select a valid campaign category.';
  }

  if (!data?.creatorName || !data.creatorName.trim()) {
    errors.creatorName = 'Creator or organization name is required.';
  }

  if (!data?.summary || !data.summary.trim()) {
    errors.summary = 'A short summary is required to explain the message.';
  } else if (data.summary.trim().length < 20) {
    errors.summary = 'Summary must be at least 20 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 2: Story & Supporting Sources
 */
export const validateStoryStep = (data) => {
  const errors = {};

  if (!data?.headline || !data.headline.trim()) {
    errors.headline = 'Editorial headline is required.';
  }

  if (!Array.isArray(data?.sections) || data.sections.length === 0) {
    errors.sections = 'At least one narrative section is required.';
  } else {
    const emptySections = data.sections.some(s => !s.content || !s.content.trim());
    if (emptySections) {
      errors.sections = 'All story sections must have content.';
    }
  }

  if (!Array.isArray(data?.sources) || data.sources.length === 0) {
    errors.sources = 'At least one verifiable supporting source is required for fact-checking.';
  } else {
    for (let i = 0; i < data.sources.length; i++) {
      const src = data.sources[i];
      if (!src.title || !src.title.trim()) {
        errors.sources = `Source #${i + 1} is missing a title.`;
        break;
      }
      if (!isValidUrl(src.url)) {
        errors.sources = `Source #${i + 1} has an invalid URL (must begin with http:// or https://).`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 3: Campaign & Ad Visuals
 */
export const validateVisualsStep = (data) => {
  const errors = {};

  if (!data?.adHeadline || !data.adHeadline.trim()) {
    errors.adHeadline = 'Advertising headline is required for promoted placements.';
  } else if (data.adHeadline.trim().length > 70) {
    errors.adHeadline = 'Ad headline should be under 70 characters for best delivery.';
  }

  if (!data?.adDescription || !data.adDescription.trim()) {
    errors.adDescription = 'Ad description is required for sponsored cards.';
  }

  if (!data?.ctaText || !data.ctaText.trim()) {
    errors.ctaText = 'Call-to-action text is required (e.g., Read Story, Take Action).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 4: Reach & Distribution Preferences
 */
export const validateReachStep = (data) => {
  const errors = {};

  if (!data?.targetGeography || !data.targetGeography.trim()) {
    errors.targetGeography = 'Target geography / region is required.';
  }

  const duration = Number(data?.durationDays);
  if (!duration || isNaN(duration) || duration < 3 || duration > 90) {
    errors.durationDays = 'Campaign duration must be between 3 and 90 days.';
  }

  if (!Array.isArray(data?.channels) || data.channels.length === 0) {
    errors.channels = 'Select at least one amplification channel.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Step 5: Submit & Goal Settings
 */
export const validateSubmitStep = (data) => {
  const errors = {};

  const goal = Number(data?.fundingGoal);
  if (!goal || isNaN(goal) || goal < 1000) {
    errors.fundingGoal = 'Funding goal must be at least ₹1,000.';
  }

  if (!data?.agreedToPolicies) {
    errors.agreedToPolicies = 'You must acknowledge the fact-checking rules and non-donation amplification policy.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Contribution Amount
 */
export const validateContribution = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Please enter a valid contribution amount.' };
  }
  if (num < 50) {
    return { isValid: false, error: 'Minimum contribution is ₹50 to cover network processing.' };
  }
  if (num > 500000) {
    return { isValid: false, error: 'Maximum single demo contribution is ₹5,00,000.' };
  }
  return { isValid: true, error: null };
};
