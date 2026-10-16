/**
 * AMPLIFY - Campaign Amplification Platform
 * Root Application Component
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Context Providers
import { UserProvider } from './src/context/UserContext';
import { CampaignProvider } from './src/context/CampaignContext';
import { DraftProvider } from './src/context/DraftContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Navigation
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={colors.forestGreen} />
        <UserProvider>
          <CampaignProvider>
            <DraftProvider>
              <NotificationProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </NotificationProvider>
            </DraftProvider>
          </CampaignProvider>
        </UserProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
});
