/**
 * RootNavigator
 * 5-Destination Bottom Navigation + Nested Stack Navigator
 * With unread activity badge and accessible theme styling
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../theme';
import { useNotifications } from '../context/NotificationContext';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { CreateCampaignWizard } from '../screens/create-campaign/CreateCampaignWizard';
import { ActivityScreen } from '../screens/activity/ActivityScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { CampaignDetailScreen } from '../screens/campaign-detail/CampaignDetailScreen';
import { ContributionScreen } from '../screens/contribution/ContributionScreen';
import { ConfirmationScreen } from '../screens/contribution/ConfirmationScreen';
import { CreatorDashboardScreen } from '../screens/creator-dashboard/CreatorDashboardScreen';
import { DistributionReportScreen } from '../screens/reports/DistributionReportScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabNavigator = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forestGreen,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ExploreTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'CreateTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            return (
              <View style={styles.createIconCircle}>
                <Ionicons name="add" size={26} color={colors.textInverse} />
              </View>
            );
          } else if (route.name === 'ActivityTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateCampaignWizard}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen name="Contribution" component={ContributionScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={CreatorDashboardScreen} />
      <Stack.Screen name="DistributionReport" component={DistributionReportScreen} />
      <Stack.Screen name="Create" component={CreateCampaignWizard} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 86 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...shadows.bottomBar,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeStyle: {
    backgroundColor: colors.primaryGreen,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  createIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    ...shadows.card,
  },
});
