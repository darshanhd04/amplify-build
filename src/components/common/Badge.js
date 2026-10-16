/**
 * Status and Category Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../theme';
import { STATUS_METADATA } from '../../constants';

export const Badge = ({
  status,
  label,
  variant = 'status', // status, category, subtle
  size = 'md', // sm, md
  style,
  textStyle,
}) => {
  let bgColor = colors.surfaceSubtle;
  let textColor = colors.charcoal;
  let text = label;

  if (status && STATUS_METADATA[status]) {
    const meta = STATUS_METADATA[status];
    bgColor = meta.badgeBg;
    textColor = meta.textColor;
    text = meta.label;
  } else if (variant === 'category') {
    bgColor = colors.softMint;
    textColor = colors.forestGreen;
  }

  return (
    <View style={[styles.container, size === 'sm' && styles.sizeSm, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: textColor }, textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
  },
});
