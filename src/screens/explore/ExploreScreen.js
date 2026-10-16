/**
 * Explore Screen
 * Campaign search, category filtering chips, sorting options, and real-time results
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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { CATEGORIES } from '../../constants';
import { useCampaigns } from '../../context/CampaignContext';
import { CampaignCard } from '../../components/campaign/CampaignCard';
import { EmptyState } from '../../components/common/EmptyState';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'progress', label: '% Funded' },
  { id: 'newest', label: 'Newest' },
  { id: 'reach', label: 'Largest Goal' },
];

export const ExploreScreen = ({ navigation }) => {
  const {
    filteredCampaigns,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useCampaigns();

  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('featured');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || sortBy !== 'featured';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* Search Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Explore Campaigns</Text>
        
        {/* Search Bar Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by topic, creator, region..."
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Horizontal Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort & Results Count Bar */}
        <View style={styles.metaRow}>
          <Text style={styles.resultsCount}>
            {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
          </Text>

          <View style={styles.sortActionsRow}>
            {hasActiveFilters && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClearFilters}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSortDropdown(!showSortDropdown)}
              style={styles.sortBtn}
            >
              <Ionicons name="swap-vertical" size={14} color={colors.forestGreen} />
              <Text style={styles.sortBtnText}>
                {SORT_OPTIONS.find(s => s.id === sortBy)?.label || 'Sort'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Sort Options Menu */}
        {showSortDropdown && (
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  setSortBy(opt.id);
                  setShowSortDropdown(false);
                }}
                style={[
                  styles.sortMenuItem,
                  sortBy === opt.id && styles.sortMenuItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortMenuItemText,
                    sortBy === opt.id && styles.sortMenuItemTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {sortBy === opt.id && (
                  <Ionicons name="checkmark" size={16} color={colors.primaryGreen} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Campaigns List */}
      <FlatList
        data={filteredCampaigns}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
            onBackPress={() => navigation.navigate('Contribution', { campaignId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Matching Campaigns"
            description="We couldn't find any campaigns matching your active keywords and category filters."
            actionTitle="Clear Filters"
            onAction={handleClearFilters}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  screenTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.charcoal,
    paddingVertical: 0,
  },
  categoryScroll: {
    paddingVertical: spacing.xs,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  categoryPillSelected: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
  },
  categoryPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryPillTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultsCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sortActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetBtn: {
    marginRight: spacing.sm,
  },
  resetBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softMint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sortBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.forestGreen,
    marginLeft: 4,
  },
  sortMenu: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sortMenuItemActive: {
    backgroundColor: colors.softMint,
  },
  sortMenuItemText: {
    fontSize: typography.sizes.sm,
    color: colors.charcoal,
    fontWeight: '500',
  },
  sortMenuItemTextActive: {
    color: colors.forestGreen,
    fontWeight: '700',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.warmIvory,
  },
});
