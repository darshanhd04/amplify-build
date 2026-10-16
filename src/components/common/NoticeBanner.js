/**
 * NoticeBanner Component
 * Explicit disclosure for message amplification vs direct charitable donations
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '../../theme';

export const NoticeBanner = ({
  variant = 'amplification', // amplification, warning, info
  title = 'Message Amplification Notice',
  message,
  style,
}) => {
  const isAmp = variant === 'amplification';
  const defaultText = isAmp
    ? 'Contributions fund verified digital ad distribution to reach targeted audiences beyond existing networks. AMPLIFY does not operate as a direct charitable donation service.'
    : message;

  return (
    <View
      style={[
        styles.container,
        isAmp ? styles.containerAmp : styles.containerInfo,
        style,
      ]}
    >
      <Ionicons
        name={isAmp ? 'megaphone-outline' : 'information-circle-outline'}
        size={20}
        color={isAmp ? colors.forestGreen : colors.info}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        {title && <Text style={[styles.title, isAmp && styles.titleAmp]}>{title}</Text>}
        <Text style={[styles.message, isAmp && styles.messageAmp]}>
          {message || defaultText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  containerAmp: {
    backgroundColor: colors.softMint,
    borderColor: colors.mintBadge,
  },
  containerInfo: {
    backgroundColor: colors.infoLight,
    borderColor: colors.infoBorder,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.info,
    marginBottom: 2,
  },
  titleAmp: {
    color: colors.forestGreen,
  },
  message: {
    fontSize: typography.sizes.xs,
    color: colors.charcoal,
    lineHeight: 18,
  },
  messageAmp: {
    color: colors.forestGreen,
  },
});
