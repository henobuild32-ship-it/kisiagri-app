import React, { useState, useEffect } from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, getAuth } from './src/lib';
import { LoadingScreen } from './src/ui';
import { LoginScreen, RegisterScreen } from './src/screens_auth';
import { DashboardScreen, DebtsScreen, DebtFormScreen, DebtDetailScreen, MarketScreen, StocksScreen } from './src/screens_main';
import { ContractsScreen, ContractFormScreen, ContractDetailScreen, PaymentsScreen } from './src/screens_business';
import { NotificationsScreen, ProfileScreen, SettingsScreen, AuditLogScreen } from './src/screens_misc';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { paddingBottom: 4, height: 56 },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Accueil', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tab.Screen name="Debts" component={DebtsStack} options={{ tabBarLabel: 'Dettes', tabBarIcon: () => <Text>💰</Text> }} />
      <Tab.Screen name="Market" component={MarketScreen} options={{ tabBarLabel: 'Marché', tabBarIcon: () => <Text>📊</Text> }} />
      <Tab.Screen name="Stocks" component={StocksScreen} options={{ tabBarLabel: 'Stocks', tabBarIcon: () => <Text>📦</Text> }} />
      <Tab.Screen name="Contracts" component={ContractsStack} options={{ tabBarLabel: 'Contrats', tabBarIcon: () => <Text>📄</Text> }} />
      <Tab.Screen name="Payments" component={PaymentsScreen} options={{ tabBarLabel: 'Paiements', tabBarIcon: () => <Text>💳</Text> }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: 'Notif.', tabBarIcon: () => <Text>🔔</Text> }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'Profil', tabBarIcon: () => <Text>👤</Text> }} />
    </Tab.Navigator>
  );
}

function DebtsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DebtsList" component={DebtsScreen} />
      <Stack.Screen name="DebtForm" component={DebtFormScreen} />
      <Stack.Screen name="DebtDetail" component={DebtDetailScreen} />
    </Stack.Navigator>
  );
}

function ContractsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContractsList" component={ContractsScreen} />
      <Stack.Screen name="ContractForm" component={ContractFormScreen} />
      <Stack.Screen name="ContractDetail" component={ContractDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AuditLog" component={AuditLogScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    getAuth().then(a => setAuthed(!!a));
  }, []);

  if (authed === null) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!authed ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}