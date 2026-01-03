import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useProteinStore } from '../store/proteinStore';
import * as Updates from 'expo-updates';

export default function RootLayout() {
  const loadData = useProteinStore((state) => state.loadData);

  useEffect(() => {
    loadData();
    
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-recipe"
        options={{
          title: 'Create Recipe',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quick-meal"
        options={{
          title: 'Quick Meal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculate-amounts"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
