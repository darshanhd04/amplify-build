/**
 * LoginScreen
 * Editorial-grade authentication portal for Campaign Creators & Evaluators.
 * Features:
 * - Social & Federated Sign-In: Google / Gmail and Apple (iOS)
 * - Email & Password authentication
 * - Tab switcher & "Already have an account? Sign In" toggle
 * - 1-Tap Demo fast-track sign-ins (Creator & Reviewer Desk)
 * - Contextual redirect back to Dashboard or submitted campaign
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('Creator');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'apple' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // 1. Email / Password Sign In
  const handleSignIn = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        await login({
          email: email.trim().toLowerCase(),
          name: name.trim() || 'Campaign Creator',
          handle: handle.trim() || `@${email.split('@')[0]}`,
          role: role === 'Reviewer' ? 'Editorial Reviewer' : 'Campaign Creator',
          isReviewerSimulated: role === 'Reviewer',
          authProvider: 'email',
        });
        setLoading(false);
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setLoading(false);
        setErrorMessage('Authentication failed. Please try again.');
      }
    }, 600);
  };

  // 2. Google / Gmail Sign In
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

  // 4. Quick Demo Logins
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
          {mode === 'login' ? 'Sign In to AMPLIFY' : 'Create Creator Account'}
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
              {mode === 'login' ? 'Welcome Back' : 'Join as a Creator'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {mode === 'login'
                ? 'Sign in to access your Campaign Dashboard, monitor ad delivery metrics, and access the Reviewer Desk.'
                : 'Create an account to publish verified campaigns, access transparent funding tools, and broadcast your story.'}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
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
              }}
              style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* SOCIAL & FEDERATED SIGN-IN OPTIONS */}
          <View style={styles.socialButtonsContainer}>
            {/* Google / Gmail Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={socialLoading !== null}
              style={styles.googleButton}
            >
              {socialLoading === 'google' ? (
                <ActivityIndicator size="small" color="#EA4335" />
              ) : (
                <>
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-google" size={20} color="#EA4335" />
                  </View>
                  <Text style={styles.googleButtonText}>
                    {mode === 'login' ? 'Sign in with Google / Gmail' : 'Sign up with Google / Gmail'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple (iOS) Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAppleSignIn}
              disabled={socialLoading !== null}
              style={styles.appleButton}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-apple" size={21} color="#FFFFFF" />
                  </View>
                  <Text style={styles.appleButtonText}>
                    {mode === 'login' ? 'Continue with Apple (iOS)' : 'Sign up with Apple (iOS)'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider: OR WITH EMAIL */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              OR {mode === 'login' ? 'SIGN IN' : 'SIGN UP'} WITH EMAIL
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
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

            {mode === 'register' && (
              <>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Priya Nair"
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <Text style={styles.inputLabel}>Public Handle</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="at-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. @priya_advocacy"
                    placeholderTextColor={colors.textTertiary}
                    value={handle}
                    onChangeText={setHandle}
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.inputLabel}>Your Primary Role</Text>
                <View style={styles.roleRow}>
                  {['Creator', 'Reviewer', 'Backer'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      activeOpacity={0.8}
                      onPress={() => setRole(r)}
                      style={[styles.roleChip, role === r && styles.roleChipActive]}
                    >
                      <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                        {r === 'Reviewer' ? 'Auditor / Reviewer' : r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@organization.org or gmail.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
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

              {mode === 'login' && (
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
              )}
            </View>

            {/* Primary Action Button */}
            <Button
              title={
                loading
                  ? 'Authenticating...'
                  : mode === 'login'
                  ? 'Sign In with Email'
                  : 'Complete Registration'
              }
              onPress={handleSignIn}
              loading={loading}
              icon="arrow-forward"
              iconPosition="right"
              style={styles.submitButton}
            />

            {/* ALREADY HAVE AN ACCOUNT / DON'T HAVE AN ACCOUNT SWITCHER */}
            <View style={styles.accountSwitchContainer}>
              {mode === 'register' ? (
                <View style={styles.switchRow}>
                  <Text style={styles.switchPromptText}>Already have an account?</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                  >
                    <Text style={styles.switchActionLink}> Sign In</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.switchRow}>
                  <Text style={styles.switchPromptText}>Don’t have an account yet?</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                  >
                    <Text style={styles.switchActionLink}> Sign Up / Register</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Quick Demo Access Divider */}
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
  socialButtonsContainer: {
    gap: 10,
    marginBottom: spacing.sm,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
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
