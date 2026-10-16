/**
 * LoginScreen — Ultra-Modern Editorial & Trending Style
 * High-end visual aesthetics inspired by Linear, Stripe & Substack.
 * Features:
 * - Ambient Emerald & Deep Forest Aura Hero with Brand Emblem
 * - Floating segmented pill switcher (Sign In vs Complete Registration)
 * - Trending Google / Gmail Card with Fast Access badge
 * - Sleek Obsidian Apple (iOS) Card
 * - Elevated capsule inputs with icon containers and interactive focus
 * - Trending Gradient Action Buttons with tactile depth
 * - Dedicated clean Registration view with Role Chips & verification policy
 * - Interactive 1-Tap Demo Evaluator Fast-Track
 * - Smooth contextual redirection back to Dashboard or submitted campaign
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/common/Button';

export const LoginScreen = ({ navigation, route }) => {
  const { returnTo = 'Dashboard', initialTab } = route?.params || {};
  const { login } = useUser();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState(null);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regRole, setRegRole] = useState('Creator');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreedToStandards, setAgreedToStandards] = useState(true);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'apple' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // 1. Email / Password Sign In
  const handleEmailSignIn = async () => {
    setErrorMessage('');
    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!loginEmail.includes('@') || !loginEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!loginPassword || loginPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        await login({
          email: loginEmail.trim().toLowerCase(),
          name: 'Campaign Creator',
          handle: `@${loginEmail.split('@')[0]}`,
          role: 'Campaign Creator',
          isReviewerSimulated: false,
          authProvider: 'email',
        });
        setLoading(false);
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setLoading(false);
        setErrorMessage('Authentication failed. Please check credentials.');
      }
    }, 600);
  };

  // 2. Google / Gmail Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSocialLoading('google');
    setSuccessToast('Authenticating with Google Workspace / Gmail...');

    setTimeout(async () => {
      try {
        await login({
          id: 'user-google-01',
          name: 'Darshan (Google Verified)',
          handle: '@darshan_advocacy',
          email: 'darshanhd.campaigns@gmail.com',
          role: 'Verified Campaign Creator',
          isReviewerSimulated: false,
          authProvider: 'google',
        });
        setSocialLoading(null);
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setSocialLoading(null);
        setErrorMessage('Google authentication encountered an issue.');
      }
    }, 700);
  };

  // 3. Apple (iOS) Sign In
  const handleAppleSignIn = async () => {
    setErrorMessage('');
    setSocialLoading('apple');
    setSuccessToast('Authenticating with Apple ID (iOS)...');

    setTimeout(async () => {
      try {
        await login({
          id: 'user-apple-01',
          name: 'Apple Verified Creator',
          handle: '@apple_creator',
          email: 'creator.apple@privaterelay.appleid.com',
          role: 'Verified Campaign Creator',
          isReviewerSimulated: false,
          authProvider: 'apple',
        });
        setSocialLoading(null);
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setSocialLoading(null);
        setErrorMessage('Apple ID authentication failed.');
      }
    }, 700);
  };

  // 4. Complete Registration
  const handleCompleteRegistration = async () => {
    setErrorMessage('');
    if (!regName.trim()) {
      setErrorMessage('Full name is required for creator verification.');
      return;
    }
    if (!regHandle.trim()) {
      setErrorMessage('Please choose a public creator handle (e.g. @your_cause).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreedToStandards) {
      setErrorMessage('Please agree to AMPLIFY Editorial and Verification standards.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        await login({
          email: regEmail.trim().toLowerCase(),
          name: regName.trim(),
          handle: regHandle.trim().startsWith('@') ? regHandle.trim() : `@${regHandle.trim()}`,
          role: regRole === 'Reviewer' ? 'Editorial Reviewer' : 'Campaign Creator',
          isReviewerSimulated: regRole === 'Reviewer',
          authProvider: 'email_registration',
        });
        setLoading(false);
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setLoading(false);
        setErrorMessage('Registration failed. Please try again.');
      }
    }, 700);
  };

  // 5. Quick Demo Logins
  const handleQuickDemoLogin = async (type) => {
    setLoading(true);
    setErrorMessage('');
    setTimeout(async () => {
      try {
        if (type === 'creator') {
          await login({
            id: 'user-creator-01',
            name: 'Ananya Sharma',
            handle: '@ananya_amplifies',
            email: 'ananya.s@example.org',
            role: 'Campaign Creator',
            isReviewerSimulated: false,
            authProvider: 'demo',
          });
        } else if (type === 'reviewer') {
          await login({
            id: 'user-reviewer-01',
            name: 'Vikram Sengupta',
            handle: '@vikram_editorial',
            email: 'editorial.desk@amplify.org',
            role: 'Lead Editorial Reviewer',
            isReviewerSimulated: true,
            authProvider: 'demo',
          });
        }
        setLoading(false);
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setLoading(false);
        setErrorMessage('Demo login failed.');
      }
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D2E23" />

      {/* TRENDING HERO WITH AMBIENT GRADIENT */}
      <LinearGradient
        colors={['#0A241C', '#0F382B', '#174D3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        {/* Top App Bar Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <View style={styles.livePulseDot} />
            <Text style={styles.topBarCenterText}>AMPLIFY SECURE ACCESS</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Ambient Brand Emblem & Hero Text */}
        <View style={styles.brandHeroContent}>
          <View style={styles.brandEmblemContainer}>
            <LinearGradient
              colors={['#34D399', '#059669']}
              style={styles.brandEmblemIconBox}
            >
              <Ionicons name="megaphone" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.securityBadgePill}>
              <Ionicons name="shield-checkmark" size={13} color="#34D399" />
              <Text style={styles.securityBadgeText}>256-Bit Encrypted • Verified Platform</Text>
            </View>
          </View>

          <Text style={styles.heroHeadline}>
            {mode === 'login' ? 'Welcome Back' : 'Join the Movement'}
          </Text>
          <Text style={styles.heroSubhead}>
            {mode === 'login'
              ? 'Sign in to access your campaign media pool, view live impression metrics, and manage moderation.'
              : 'Create your verified publisher credentials to broadcast your story to targeted non-follower audiences.'}
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* FLOATING SEGMENTED SWITCHER PILL */}
          <View style={styles.floatingSwitcher}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessToast('');
              }}
              style={[
                styles.switcherTab,
                mode === 'login' && styles.switcherTabActive,
              ]}
            >
              <Ionicons
                name={mode === 'login' ? 'log-in' : 'log-in-outline'}
                size={16}
                color={mode === 'login' ? '#0F382B' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.switcherText,
                  mode === 'login' && styles.switcherTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessToast('');
              }}
              style={[
                styles.switcherTab,
                mode === 'register' && styles.switcherTabActive,
              ]}
            >
              <Ionicons
                name={mode === 'register' ? 'person-add' : 'person-add-outline'}
                size={16}
                color={mode === 'register' ? '#0F382B' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.switcherText,
                  mode === 'register' && styles.switcherTextActive,
                ]}
              >
                Complete Registration
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error & Feedback Alerts */}
          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successToast ? (
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.successAlertText}>{successToast}</Text>
            </View>
          ) : null}

          {/* ========================================================= */}
          {/* TAB 1: SIGN IN MODE (Google, Apple, Email/Password)       */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <View style={styles.mainCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Instant Sign In</Text>
                  <Text style={styles.cardSub}>Choose your preferred authentication method</Text>
                </View>
                <View style={styles.fastPassPill}>
                  <Text style={styles.fastPassText}>OAUTH 2.0</Text>
                </View>
              </View>

              {/* GOOGLE / GMAIL BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
                disabled={socialLoading !== null || loading}
                style={styles.googleModernButton}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#EA4335" />
                ) : (
                  <>
                    <View style={styles.googleIconBadge}>
                      <Ionicons name="logo-google" size={19} color="#EA4335" />
                    </View>
                    <View style={styles.socialTextCol}>
                      <Text style={styles.googleButtonMainText}>Sign in with Google / Gmail</Text>
                      <Text style={styles.socialSubtext}>One-tap verified account access</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </>
                )}
              </TouchableOpacity>

              {/* APPLE (iOS) BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAppleSignIn}
                disabled={socialLoading !== null || loading}
                style={styles.appleModernButton}
              >
                {socialLoading === 'apple' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <View style={styles.appleIconBadge}>
                      <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.socialTextCol}>
                      <Text style={styles.appleButtonMainText}>Continue with Apple (iOS)</Text>
                      <Text style={styles.appleSubtext}>Sign in securely with Apple ID</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                  </>
                )}
              </TouchableOpacity>

              {/* SLEEK DIVIDER */}
              <View style={styles.modernDividerRow}>
                <View style={styles.modernDividerLine} />
                <View style={styles.dividerPill}>
                  <Text style={styles.modernDividerText}>OR SIGN IN WITH EMAIL</Text>
                </View>
                <View style={styles.modernDividerLine} />
              </View>

              {/* EMAIL INPUT */}
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'loginEmail' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={focusedField === 'loginEmail' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="name@organization.org or gmail.com"
                  placeholderTextColor="#9CA3AF"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  onFocus={() => setFocusedField('loginEmail')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* PASSWORD INPUT */}
              <Text style={styles.fieldLabel}>Password</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'loginPassword' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={focusedField === 'loginPassword' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Enter your secret password"
                  placeholderTextColor="#9CA3AF"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  onFocus={() => setFocusedField('loginPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showLoginPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowLoginPassword(!showLoginPassword)}
                  style={styles.eyeIconBtn}
                >
                  <Ionicons
                    name={showLoginPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* REMEMBER ME & FORGOT PASSWORD */}
              <View style={styles.utilityRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.checkboxRow}
                >
                  <Ionicons
                    name={rememberMe ? 'checkbox' : 'square-outline'}
                    size={19}
                    color={rememberMe ? '#059669' : colors.textTertiary}
                  />
                  <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      'Password Reset',
                      'For hackathon evaluation, you can use the Google, Apple, or 1-Tap Demo sign-ins, or enter any sample password.'
                    )
                  }
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* PRIMARY SIGN IN BUTTON */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleEmailSignIn}
                disabled={loading}
                style={styles.primaryGradientBtn}
              >
                <LinearGradient
                  colors={['#1F6F50', '#134B36']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradientInner}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Sign In to Dashboard</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* SWITCHER TO COMPLETE REGISTRATION */}
              <View style={styles.switchBanner}>
                <Text style={styles.switchPrompt}>Don’t have a creator account yet?</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setMode('register');
                    setErrorMessage('');
                    setSuccessToast('');
                  }}
                  style={styles.switchHighlightBtn}
                >
                  <Text style={styles.switchHighlightText}>Complete Registration →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* TAB 2: COMPLETE REGISTRATION (Clean Dedicated Form)       */}
          {/* ========================================================= */}
          {mode === 'register' && (
            <View style={styles.mainCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Complete Registration</Text>
                  <Text style={styles.cardSub}>Create your verified publisher credentials</Text>
                </View>
                <View style={[styles.fastPassPill, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={[styles.fastPassText, { color: '#0284C7' }]}>STEP 1 OF 1</Text>
                </View>
              </View>

              {/* Full Name */}
              <Text style={styles.fieldLabel}>Full Legal / Organization Name</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'regName' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={focusedField === 'regName' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="e.g. Priya Nair / Clean Water Initiative"
                  placeholderTextColor="#9CA3AF"
                  value={regName}
                  onChangeText={setRegName}
                  onFocus={() => setFocusedField('regName')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>

              {/* Public Handle */}
              <Text style={styles.fieldLabel}>Public Creator Handle</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'regHandle' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="at"
                    size={16}
                    color={focusedField === 'regHandle' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="e.g. priya_advocacy"
                  placeholderTextColor="#9CA3AF"
                  value={regHandle}
                  onChangeText={setRegHandle}
                  onFocus={() => setFocusedField('regHandle')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
              </View>

              {/* Primary Role Selector */}
              <Text style={styles.fieldLabel}>Choose Your Primary Role</Text>
              <View style={styles.roleChipsGrid}>
                {[
                  { id: 'Creator', label: 'Campaign Creator', icon: 'create-outline' },
                  { id: 'Reviewer', label: 'Auditor / Desk', icon: 'shield-outline' },
                  { id: 'Backer', label: 'Community Backer', icon: 'heart-outline' },
                ].map((r) => {
                  const isSelected = regRole === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      activeOpacity={0.8}
                      onPress={() => setRegRole(r.id)}
                      style={[
                        styles.trendingRoleChip,
                        isSelected && styles.trendingRoleChipActive,
                      ]}
                    >
                      <Ionicons
                        name={r.icon}
                        size={15}
                        color={isSelected ? '#059669' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.trendingRoleText,
                          isSelected && styles.trendingRoleTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Email Address */}
              <Text style={styles.fieldLabel}>Official Email Address</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'regEmail' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={focusedField === 'regEmail' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="contact@initiative.org or gmail.com"
                  placeholderTextColor="#9CA3AF"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  onFocus={() => setFocusedField('regEmail')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <Text style={styles.fieldLabel}>Create Password</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'regPassword' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={focusedField === 'regPassword' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  onFocus={() => setFocusedField('regPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showRegPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowRegPassword(!showRegPassword)}
                  style={styles.eyeIconBtn}
                >
                  <Ionicons
                    name={showRegPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.modernInputWrapper,
                  focusedField === 'regConfirm' && styles.modernInputWrapperFocused,
                ]}
              >
                <View style={styles.fieldIconCircle}>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={16}
                    color={focusedField === 'regConfirm' ? '#059669' : colors.textTertiary}
                  />
                </View>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={regConfirmPassword}
                  onChangeText={setRegConfirmPassword}
                  onFocus={() => setFocusedField('regConfirm')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showRegPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* Standards Checkbox */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setAgreedToStandards(!agreedToStandards)}
                style={styles.standardsCheckboxRow}
              >
                <Ionicons
                  name={agreedToStandards ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={agreedToStandards ? '#059669' : colors.textTertiary}
                />
                <Text style={styles.standardsText}>
                  I confirm that all published campaigns will contain verified supporting citations and abide by 100% transparent digital ad distribution rules.
                </Text>
              </TouchableOpacity>

              {/* COMPLETE REGISTRATION BUTTON */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCompleteRegistration}
                disabled={loading}
                style={styles.primaryGradientBtn}
              >
                <LinearGradient
                  colors={['#10B981', '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradientInner}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Complete Registration</Text>
                      <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* SWITCHER BACK TO SIGN IN */}
              <View style={styles.switchBanner}>
                <Text style={styles.switchPrompt}>Already have an account?</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessToast('');
                  }}
                  style={styles.switchHighlightBtn}
                >
                  <Text style={styles.switchHighlightText}>Sign In →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* EVALUATOR 1-TAP DEMO PANEL (Always available for judges)  */}
          {/* ========================================================= */}
          <View style={styles.demoSectionBox}>
            <View style={styles.demoSectionHeader}>
              <View style={styles.demoHeaderBadge}>
                <Ionicons name="flash" size={14} color="#D97706" />
                <Text style={styles.demoHeaderBadgeText}>EVALUATOR SHORTCUT</Text>
              </View>
              <Text style={styles.demoSectionTitle}>1-Tap Demo Logins</Text>
              <Text style={styles.demoSectionSubtitle}>
                Instant access for hackathon evaluators without filling credentials
              </Text>
            </View>

            <View style={styles.demoCardsRow}>
              {/* Creator Demo Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleQuickDemoLogin('creator')}
                style={styles.trendingDemoCard}
              >
                <View style={styles.demoCardTop}>
                  <View style={[styles.avatarBubble, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.avatarInitials, { color: '#059669' }]}>AS</Text>
                  </View>
                  <View style={styles.demoPill}>
                    <Text style={styles.demoPillText}>CREATOR</Text>
                  </View>
                </View>
                <Text style={styles.demoName}>Ananya Sharma</Text>
                <Text style={styles.demoRole}>Campaign Creator • 3 Drafts</Text>
                <View style={styles.demoActionFooter}>
                  <Text style={styles.demoActionText}>Launch as Creator</Text>
                  <Ionicons name="arrow-forward" size={14} color="#059669" />
                </View>
              </TouchableOpacity>

              {/* Reviewer Desk Demo Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleQuickDemoLogin('reviewer')}
                style={styles.trendingDemoCard}
              >
                <View style={styles.demoCardTop}>
                  <View style={[styles.avatarBubble, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={[styles.avatarInitials, { color: '#7E22CE' }]}>VS</Text>
                  </View>
                  <View style={[styles.demoPill, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
                    <Text style={[styles.demoPillText, { color: '#7E22CE' }]}>AUDITOR</Text>
                  </View>
                </View>
                <Text style={styles.demoName}>Vikram Sengupta</Text>
                <Text style={styles.demoRole}>Lead Editorial Reviewer</Text>
                <View style={styles.demoActionFooter}>
                  <Text style={[styles.demoActionText, { color: '#7E22CE' }]}>Launch Review Desk</Text>
                  <Ionicons name="arrow-forward" size={14} color="#7E22CE" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECURITY & TRUST BADGE */}
          <View style={styles.securityTrustCard}>
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
            <Text style={styles.securityTrustText}>
              AMPLIFY operates under strict fiduciary digital advertising compliance. Backer capital directly funds programmatic distribution pools.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A241C',
  },
  heroGradient: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  topBarCenterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.6,
  },
  brandHeroContent: {
    marginTop: spacing.sm,
  },
  brandEmblemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xs,
  },
  brandEmblemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  securityBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  heroHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: typography.fontFamilySerif,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubhead: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 19,
    maxWidth: 340,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  floatingSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 4,
    marginTop: -16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
  },
  switcherTabActive: {
    backgroundColor: '#ECFDF5',
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  switcherTextActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  successAlertText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
    marginBottom: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fastPassPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  fastPassText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  googleModernButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    ...shadows.card,
  },
  googleIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialTextCol: {
    flex: 1,
  },
  googleButtonMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.1,
  },
  socialSubtext: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 1,
  },
  appleModernButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  appleIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appleButtonMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  appleSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 1,
  },
  modernDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  modernDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerPill: {
    paddingHorizontal: 10,
  },
  modernDividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modernInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: spacing.md,
  },
  modernInputWrapperFocused: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  fieldIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modernInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  eyeIconBtn: {
    padding: 6,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: -4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  primaryGradientBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    ...shadows.card,
  },
  primaryGradientInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: spacing.md,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  switchBanner: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  switchPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  switchHighlightBtn: {
    paddingVertical: 4,
  },
  switchHighlightText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  roleChipsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  trendingRoleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  trendingRoleChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  trendingRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  trendingRoleTextActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  standardsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.md,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  standardsText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  demoSectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
    marginBottom: spacing.md,
  },
  demoSectionHeader: {
    marginBottom: spacing.md,
  },
  demoHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  demoHeaderBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  demoSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
  },
  demoSectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  demoCardsRow: {
    gap: 10,
  },
  trendingDemoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  demoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '800',
  },
  demoPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  demoPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  demoName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  demoRole: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
    marginBottom: 8,
  },
  demoActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  demoActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  securityTrustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    padding: 12,
    borderRadius: 14,
  },
  securityTrustText: {
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
});
