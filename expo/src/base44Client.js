/* eslint-disable no-undef */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Polyfills pour le SDK Base44 (prévu pour navigateur) ──
const localStoragePolyfill = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, String(value)),
  removeItem: (key) => AsyncStorage.removeItem(key),
  clear: () => AsyncStorage.clear(),
};

if (!global.localStorage) {
  global.localStorage = localStoragePolyfill;
}

if (!global.window) {
  global.window = {
    localStorage: localStoragePolyfill,
    location: { href: '', search: '', pathname: '', hash: '' },
    history: { replaceState: () => {} },
  };
}

// Import du SDK après les polyfills (require = non-hoisted)
const { createClient } = require('@base44/sdk');

const appId = process.env.EXPO_PUBLIC_BASE44_APP_ID || '';
const functionsVersion = process.env.EXPO_PUBLIC_BASE44_FUNCTIONS_VERSION || '';
const appBaseUrl = process.env.EXPO_PUBLIC_BASE44_APP_BASE_URL || '';

export const base44 = createClient({
  appId,
  token: null,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
});

export const isBase44Configured = !!appId;