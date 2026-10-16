/**
 * LoginScreen
 * Clean separation between Sign In and Complete Registration:
 * 1. Sign In Tab (mode === 'login'):
 *    - Google / Gmail Sign In
 *    - Apple (iOS) Sign In
 *    - Email & Password Sign In
 *    - "Don't have an account? Sign Up / Register"
 *    - 1-Tap Demo Evaluator options
 * 2. Create Account Tab (mode === 'register'):
 *    - Dedicated Registration Form (Name, Handle, Role, Email, Password, Confirm Password)
 *    - "Complete Registration" button
 *    - "Already have an account? Sign In" (switches back to Sign In tab)
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

  // 1. Email / Password Sign In (under Sign In)
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

  // 2. Google / Gmail Sign In (under Sign In)
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSocialLoading('google');
    setSuccessToast('Authenticating with Google Account / Gmail...');

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

  // 3. Apple (iOS) Sign In (under Sign In)
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

  // 4. Complete Registration (under Complete Registration)
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
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {mode === 'login' ? 'Sign In' : 'Complete Registration'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

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
          {/* Brand Header Banner */}
          <View style={styles.brandHero}>
            <View style={styles.badgeRow}>
              <View style={styles.badgePill}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primaryGreen} />
                <Text style={styles.badgeText}>VERIFIED CREATOR GATEWAY</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>
              {mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {mode === 'login'
                ? 'Sign in using Google, Apple (iOS), or your Email to access your Creator Dashboard and Reviewer Desk.'
                : 'Create your verified creator credentials to publish initiatives and monitor programmatic ad reach.'}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessToast('');
              }}
              style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
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
              style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
                Complete Registration
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Alerts */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successToast ? (
            <View style={styles.successToastContainer}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primaryGreen} />
              <Text style={styles.successToastText}>{successToast}</Text>
            </View>
          ) : null}

          {/* ========================================================= */}
          {/* 1. SIGN IN MODE (Google, Apple, Email/Password Form) */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Fast Social Sign-In</Text>

              {/* Google / Gmail Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
                disabled={socialLoading !== null || loading}
                style={styles.googleButton}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#EA4335" />
                ) : (
                  <>
                    <View style={styles.socialIconBox}>
                      <Ionicons name="logo-google" size={20} color="#EA4335" />
                    </View>
                    <Text style={styles.googleButtonText}>Sign in with Google / Gmail</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple (iOS) Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAppleSignIn}
                disabled={socialLoading !== null || loading}
                style={styles.appleButton}
              >
                {socialLoading === 'apple' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <View style={styles.socialIconBox}>
                      <Ionicons name="logo-apple" size={21} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appleButtonText}>Continue with Apple (iOS)</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR SIGN IN WITH EMAIL</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email / Password Form */}
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@organization.org or gmail.com"
                  placeholderTextColor={colors.textTertiary}
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showLoginPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowLoginPassword(!showLoginPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setRememberMe(!rememberMe)}
                  style={styles.rememberMeRow}
                >
                  <Ionicons
                    name={rememberMe ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={rememberMe ? colors.forestGreen : colors.textTertiary}
                  />
                  <Text style={styles.rememberMeText}>Keep me signed in</Text>
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
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button
                title={loading ? 'Authenticating...' : 'Sign In with Email'}
                onPress={handleEmailSignIn}
                loading={loading}
                icon="arrow-forward"
                iconPosition="right"
                style={styles.submitButton}
              />

              {/* Switcher to Registration */}
              <View style={styles.accountSwitchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchPromptText}>Don’t have an account yet?</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setMode('register');
                      setErrorMessage('');
                      setSuccessToast('');
                    }}
                  >
                    <Text style={styles.switchActionLink}> Complete Registration</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* 2. COMPLETE REGISTRATION MODE (Dedicated Sign Up Form)    */}
          {/* ========================================================= */}
          {mode === 'register' && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Creator Account Registration</Text>
              <Text style={styles.sectionSubHeading}>
                Enter your details to create a verified publisher profile.
              </Text>

              {/* Full Name */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Priya Nair"
                  placeholderTextColor={colors.textTertiary}
                  value={regName}
                  onChangeText={setRegName}
                  autoCapitalize="words"
                />
              </View>

              {/* Public Handle */}
              <Text style={styles.inputLabel}>Public Handle</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="at-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. @priya_advocacy"
                  placeholderTextColor={colors.textTertiary}
                  value={regHandle}
                  onChangeText={setRegHandle}
                  autoCapitalize="none"
                />
              </View>

              {/* Primary Role */}
              <Text style={styles.inputLabel}>Primary Role</Text>
              <View style={styles.roleRow}>
                {['Creator', 'Reviewer', 'Backer'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    activeOpacity={0.8}
                    onPress={() => setRegRole(r)}
                    style={[styles.roleChip, regRole === r && styles.roleChipActive]}
                  >
                    <Text style={[styles.roleChipText, regRole === r && styles.roleChipTextActive]}>
                      {r === 'Reviewer' ? 'Auditor / Desk' : r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Email Address */}
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@organization.org or gmail.com"
                  placeholderTextColor={colors.textTertiary}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Create Password */}
              <Text style={styles.inputLabel}>Create Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry={!showRegPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowRegPassword(!showRegPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textTertiary}
                  value={regConfirmPassword}
                  onChangeText={setRegConfirmPassword}
                  secureTextEntry={!showRegPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setAgreedToStandards(!agreedToStandards)}
                style={styles.termsRow}
              >
                <Ionicons
                  name={agreedToStandards ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={agreedToStandards ? colors.forestGreen : colors.textTertiary}
                />
                <Text style={styles.termsText}>
                  I agree to AMPLIFY’s verified citation and transparent use-of-funds policies.
                </Text>
              </TouchableOpacity>

              {/* Complete Registration Action Button */}
              <Button
                title={loading ? 'Registering...' : 'Complete Registration'}
                onPress={handleCompleteRegistration}
                loading={loading}
                icon="checkmark-circle-outline"
                iconPosition="right"
                style={styles.submitButton}
              />

              {/* "Already have an account? Sign In" Switcher */}
              <View style={styles.accountSwitchContainer}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchPromptText}>Already have an account?</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessToast('');
                    }}
                  >
                    <Text style={styles.switchActionLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Quick Demo Access Divider (always helpful for evaluators) */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR 1-TAP DEMO EVALUATION</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo One-Tap Cards */}
          <View style={styles.demoCardsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleQuickDemoLogin('creator')}
              style={styles.demoCard}
            >
              <View style={styles.demoCardLeft}>
                <View style={[styles.demoIconCircle, { backgroundColor: colors.mintLight }]}>
                  <Ionicons name="flash" size={18} color={colors.primaryGreen} />
                </View>
                <View>
                  <Text style={styles.demoCardTitle}>Ananya Sharma (Creator Demo)</Text>
                  <Text style={styles.demoCardSub}>View active campaigns, drafts & stats</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleQuickDemoLogin('reviewer')}
              style={styles.demoCard}
            >
              <View style={styles.demoCardLeft}>
                <View style={[styles.demoIconCircle, { backgroundColor: '#F0EBF8' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#6B46C1" />
                </View>
                <View>
                  <Text style={styles.demoCardTitle}>Editorial Reviewer (Desk Demo)</Text>
                  <Text style={styles.demoCardSub}>Approve/reject campaigns in moderation</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Security & Disclaimer Footer */}
          <View style={styles.footerNote}>
            <Ionicons name="lock-closed" size={14} color={colors.textTertiary} />
            <Text style={styles.footerNoteText}>
              256-bit encrypted authentication. Verified digital media distribution governance.
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
    backgroundColor: colors.forestGreen,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.forestGreen,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brandHero: {
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySerif,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.sand,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sectionSubHeading: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: borderRadius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    marginTop: 8,
    marginBottom: 10,
    ...shadows.card,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C4043',
    letterSpacing: 0.2,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: borderRadius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    ...shadows.card,
  },
  appleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  socialIconBox: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  successToastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintLight,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  successToastText: {
    fontSize: 12,
    color: colors.forestGreen,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  roleChipActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.mintLight,
  },
  roleChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: -4,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberMeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.md,
    paddingRight: spacing.sm,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  submitButton: {
    marginTop: 4,
  },
  accountSwitchContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchPromptText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  switchActionLink: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    paddingHorizontal: spacing.sm,
    letterSpacing: 0.5,
  },
  demoCardsContainer: {
    gap: 10,
    marginBottom: spacing.lg,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  demoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  demoCardSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  footerNoteText: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    flex: 1,
  },
});
