/**
 * Common Button Component
 * Editorial, accessible touch target (>= 48px), loading state, and variants
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '../../theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, danger, text
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getContainerStyles = () => {
    const list = [styles.base];
    if (size === 'sm') list.push(styles.sizeSm);
    if (size === 'lg') list.push(styles.sizeLg);
    
    if (variant === 'primary') list.push(styles.variantPrimary);
    else if (variant === 'secondary') list.push(styles.variantSecondary);
    else if (variant === 'outline') list.push(styles.variantOutline);
    else if (variant === 'danger') list.push(styles.variantDanger);
    else if (variant === 'text') list.push(styles.variantText);

    if (disabled || loading) list.push(styles.disabled);
    if (style) list.push(style);
    return list;
  };

  const getTextColor = () => {
    if (disabled) return colors.textTertiary;
    if (variant === 'primary' || variant === 'danger') return colors.textInverse;
    if (variant === 'secondary') return colors.forestGreen;
    if (variant === 'outline') return colors.primaryGreen;
    return colors.forestGreen;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyles()}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={getTextColor()} style={styles.leftIcon} />
          )}
          <Text style={[styles.text, { color: getTextColor() }, size === 'sm' && styles.textSm, size === 'lg' && styles.textLg, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={getTextColor()} style={styles.rightIcon} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sizeSm: {
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  sizeLg: {
    height: 54,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: typography.sizes.sm,
  },
  textLg: {
    fontSize: typography.sizes.lg,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  variantPrimary: {
    backgroundColor: colors.primaryGreen,
  },
  variantSecondary: {
    backgroundColor: colors.softMint,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
  },
  variantDanger: {
    backgroundColor: colors.error,
  },
  variantText: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xs,
    height: 'auto',
  },
  disabled: {
    opacity: 0.5,
  },
});
