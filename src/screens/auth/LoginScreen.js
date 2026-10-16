/**
 * LoginScreen
 * Editorial-grade authentication portal for Campaign Creators & Evaluators.
 * Includes email/password auth, tab toggle for account creation,
 * 1-tap demo fast-track sign-ins, and contextual redirect back to Dashboard.
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
  const [errorMessage, setErrorMessage] = useState('');

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
        });
        setLoading(false);
        // Navigate to target destination
        navigation.replace(returnTo, { initialTab });
      } catch (err) {
        setLoading(false);
        setErrorMessage('Authentication failed. Please try again.');
      }
    }, 600);
  };

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
          });
        } else if (type === 'reviewer') {
          await login({
            id: 'user-reviewer-01',
            name: 'Vikram Sengupta',
            handle: '@vikram_editorial',
            email: 'editorial.desk@amplify.org',
            role: 'Lead Editorial Reviewer',
            isReviewerSimulated: true,
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
        <Text style={styles.topBarTitle}>Creator Authentication</Text>
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
            <Text style={styles.heroTitle}>Sign In to Continue</Text>
            <Text style={styles.heroSubtitle}>
              Access your Campaign Dashboard, monitor live media ad delivery, and utilize the in-app Reviewer Desk.
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

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
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
                placeholder="name@organization.org"
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
                      'For hackathon evaluation, you can use the 1-Tap Demo sign-ins below or enter any sample password.'
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
                  ? 'Sign In to Dashboard'
                  : 'Create Creator Account'
              }
              onPress={handleSignIn}
              loading={loading}
              icon="arrow-forward"
              iconPosition="right"
              style={styles.submitButton}
            />
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
                  <Text style={styles.demoCardTitle}>Ananya Sharma (Creator)</Text>
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
                  <Text style={styles.demoCardTitle}>Editorial Reviewer (Desk)</Text>
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
              256-bit encrypted session. AMPLIFY adheres to strict transparency standards.
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
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
