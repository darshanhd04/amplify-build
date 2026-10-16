/**
 * Accessible Funding Progress Bar Component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../theme';

export const ProgressBar = ({
  progress = 0, // 0 to 100
  height = 8,
  color = colors.primaryGreen,
  trackColor = colors.borderSubtle,
  style,
}) => {
  const clamped = Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            height,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
