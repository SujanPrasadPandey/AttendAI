// App.tsx
// npx expo start --clear
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

import SignIn from './src/screens/SignIn';
import MarkAttendance from './src/screens/MarkAttendance';
import ManageAttendance from './src/screens/ManageAttendance';
import ProfileScreen from './src/screens/ProfileScreen';

import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#89B5FA',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: { backgroundColor: '#1E1E2E', borderTopColor: '#292E44' },
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';

        if (route.name === 'MarkAttendance') iconName = 'checkbox-outline';
        else if (route.name === 'ManageAttendance') iconName = 'settings-outline';
        else if (route.name === 'Profile') iconName = 'person-circle-outline';

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="MarkAttendance" component={MarkAttendance} />
    <Tab.Screen name="ManageAttendance" component={ManageAttendance} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={Tabs} />
      ) : (
        <Stack.Screen name="SignIn" component={SignIn} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
