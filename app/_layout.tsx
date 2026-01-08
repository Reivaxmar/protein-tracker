import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from 'react-native';
import { useEffect } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { useTagStore } from '../store/tagStore';
import * as Updates from 'expo-updates';

export default function RootLayout() {
  const loadData = useProteinStore((state) => state.loadData);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const loadTags = useTagStore((state) => state.loadTags);
  const translations = useLanguageStore((state) => state.translations);

  useEffect(() => {
    // Disable font scaling to prevent UI layout breakage on devices with
    // very large accessibility font sizes. This ensures consistent UI across
    // all devices regardless of system font size settings.
    try {
      if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
      (Text as any).defaultProps.allowFontScaling = false;

      if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
      (TextInput as any).defaultProps.allowFontScaling = false;
    } catch (e) {
      // Non-critical; continue if platform doesn't support defaultProps assignment
      console.warn('Could not set global text defaults', e);
    }

    loadData();
    loadLanguage();
    loadTags();
    
    // Check for OTA updates on app launch
    async function checkForUpdates() {
      try {
        // Only check for updates in production builds, not in development
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // Reload the app to apply the update
            await Updates.reloadAsync();
          }
        }
      } catch (error) {
        // Log errors for debugging - updates are not critical for app functionality
        console.error('Error checking for updates:', error);
      }
    }
    
    checkForUpdates();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translations.nav.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: translations.nav.meals,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-recipe"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quick-meal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ingredients"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="calculate-amounts"
        options={{
          title: translations.nav.calculator,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translations.nav.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
