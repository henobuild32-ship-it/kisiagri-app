import AsyncStorage from '@react-native-async-storage/async-storage';

export const COLORS = {
  primary: '#16a34a',
  primaryDark: '#15803d',
  secondary: '#f97316',
  dark: '#1f2937',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  light: '#f9fafb',
  border: '#e5e7eb',
  white: '#ffffff',
  red: '#ef4444',
  yellow: '#eab308',
  blue: '#3b82f6',
  green: '#22c55e',
};

const KEYS = {
  debts: 'kisiagri_debts',
  inventory: 'kisiagri_inventory',
  market: 'kisiagri_market',
  contracts: 'kisiagri_contracts',
  notifications: 'kisiagri_notifications',
  activity: 'kisiagri_activity',
  payments: 'kisiagri_payments',
  profile: 'kisiagri_profile',
  auth: 'kisiagri_auth',
  language: 'kisiagri_lang',
};

export async function getAll(key) {
  const raw = await AsyncStorage.getItem(KEYS[key] || key);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAll(key, items) {
  await AsyncStorage.setItem(KEYS[key] || key, JSON.stringify(items));
}

export async function addItem(key, item) {
  const items = await getAll(key);
  const newItem = { ...item, id: Date.now().toString(), created_date: new Date().toISOString() };
  items.unshift(newItem);
  await saveAll(key, items);
  return newItem;
}

export async function updateItem(key, id, updates) {
  const items = await getAll(key);
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates, updated_date: new Date().toISOString() };
    await saveAll(key, items);
    return items[idx];
  }
  return null;
}

export async function deleteItem(key, id) {
  const items = await getAll(key);
  await saveAll(key, items.filter(i => i.id !== id));
}

export async function getItem(key, id) {
  const items = await getAll(key);
  return items.find(i => i.id === id);
}

export async function getAuth() {
  const raw = await AsyncStorage.getItem(KEYS.auth);
  return raw ? JSON.parse(raw) : null;
}

export async function setAuth(auth) {
  await AsyncStorage.setItem(KEYS.auth, JSON.stringify(auth));
}

export async function clearAuth() {
  await AsyncStorage.removeItem(KEYS.auth);
}

export async function getProfile() {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : { full_name: '', phone: '', email: '', role: 'agriculteur', language: 'fr', country: 'RDC', city: '' };
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export async function getLanguage() {
  return await AsyncStorage.getItem(KEYS.language) || 'fr';
}

export async function setLanguage(lang) {
  await AsyncStorage.setItem(KEYS.language, lang);
}

export async function logActivity(action, entityType, description) {
  await addItem('activity', { action, entity_type: entityType, description });
}

export async function addNotification(title, message, type) {
  await addItem('notifications', { title, message, type: type || 'systeme', is_read: false });
}

export function formatMoney(amount, currency) {
  return (Number(amount || 0)).toLocaleString('fr-FR') + ' ' + (currency || 'CDF');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

const translations = {
  fr: {
    dashboard: 'Tableau de bord', debts: 'Dettes', market: 'Marché', stocks: 'Stocks',
    contracts: 'Contrats', payments: 'Paiements', notifications: 'Notifications',
    profile: 'Profil', settings: 'Paramètres', audit: 'Journal d\'activité',
    login: 'Connexion', register: 'Inscription', logout: 'Déconnexion',
    add: 'Ajouter', edit: 'Modifier', delete: 'Supprimer', save: 'Enregistrer',
    cancel: 'Annuler', search: 'Rechercher', loading: 'Chargement...', no_data: 'Aucune donnée',
    welcome: 'Bienvenue', total_debts: 'Dettes totales', market_prices: 'Prix du marché',
    my_stocks: 'Mes stocks', active_contracts: 'Contrats actifs', unread: 'Non lues',
    new_debt: 'Nouvelle dette', new_price: 'Nouveau prix', new_stock: 'Nouveau stock',
    new_contract: 'Nouveau contrat', client_name: 'Nom du client', phone: 'Téléphone',
    amount: 'Montant', description: 'Description', due_date: 'Date d\'échéance',
    product: 'Produit', city: 'Ville', price: 'Prix', quantity: 'Quantité', unit: 'Unité',
    title: 'Titre', subject: 'Objet', start_date: 'Date de début', end_date: 'Date de fin',
    full_name: 'Nom complet', email: 'Email', role: 'Rôle', language: 'Langue',
    country: 'Pays', mark_read: 'Marquer comme lu', mark_all_read: 'Tout marquer comme lu',
    password: 'Mot de passe', confirm_password: 'Confirmer le mot de passe',
    create_account: 'Créer un compte', already_account: 'Déjà un compte ?',
    no_account: 'Pas de compte ?', app_name: 'KisiAgri', app_tagline: 'Plateforme agricole numérique',
  },
  ln: {
    dashboard: 'Ebandelo', debts: 'Mabola', market: 'Sika', stocks: 'Biloko',
    contracts: 'Mikanda', payments: 'Bofuti', notifications: 'Bangozi',
    profile: 'Profil', settings: 'Bipai', audit: 'Makomi',
    login: 'Kokota', register: 'Kokomisa', logout: 'Bima',
    add: 'Bakisa', edit: 'Senga', delete: 'Fula', save: 'Bomba',
    cancel: 'Tika', search: 'Luka', loading: 'Ezali...', no_data: 'Ezali te',
    welcome: 'Boyei', total_debts: 'Mabola nyonso', market_prices: 'Mituya ya sika',
    my_stocks: 'Biloko na ngai', active_contracts: 'Mikanda ezali', unread: 'Ezali kotanga te',
    new_debt: 'Mabola mwa sika', new_price: 'Mituya mwa sika', new_stock: 'Biloko mwa sika',
    new_contract: 'Mukanda mwa sika', client_name: 'Nkombo ya mokeli', phone: 'Nimero',
    amount: 'Montant', description: 'Makomi', due_date: 'Mokolo ya suka',
    product: 'Produit', city: 'Ville', price: 'Mituya', quantity: 'Motuya', unit: 'Unité',
    title: 'Nkombo', subject: 'Makomi', start_date: 'Mokolo ya ebandeli', end_date: 'Mokolo ya suka',
    full_name: 'Nkombo nyonso', email: 'Email', role: 'Rôle', language: 'Lokota',
    country: 'Ekolo', mark_read: 'Tanga', mark_all_read: 'Tanga nyonso',
    password: 'Mot ya kobomba', confirm_password: 'Komisa mot',
    create_account: 'Kokomisa compte', already_account: 'Ozali na compte?',
    no_account: 'Ozali na compte te?', app_name: 'KisiAgri', app_tagline: 'Plateforme ya biblia',
  },
  sw: {
    dashboard: 'Ibanzo', debts: 'Madeni', market: 'Soko', stocks: 'Bidhaa',
    contracts: 'Mikataba', payments: 'Malipo', notifications: 'Taarifa',
    profile: 'Wasifu', settings: 'Mipangilio', audit: 'Kumbukumbu',
    login: 'Ingia', register: 'Jiandikishe', logout: 'Toka',
    add: 'Ongeza', edit: 'Hariri', delete: 'Futa', save: 'Hifadhi',
    cancel: 'Ghairi', search: 'Tafuta', loading: 'Inapakia...', no_data: 'Hakuna data',
    welcome: 'Karibu', total_debts: 'Madeni yote', market_prices: 'Bei ya soko',
    my_stocks: 'Bidhaa zangu', active_contracts: 'Mikataba inayoendelea', unread: 'Haijasomwa',
    new_debt: 'Deni jipya', new_price: 'Bei mpya', new_stock: 'Bidhaa mpya',
    new_contract: 'Mkataba mpya', client_name: 'Jina la mteja', phone: 'Simu',
    amount: 'Kiasi', description: 'Maelezo', due_date: 'Tarehe ya mwisho',
    product: 'Bidhaa', city: 'Jiji', price: 'Bei', quantity: 'Kiasi', unit: 'Kitengo',
    title: 'Kichwa', subject: 'Mada', start_date: 'Tarehe ya kuanza', end_date: 'Tarehe ya mwisho',
    full_name: 'Jina kamili', email: 'Barua pepe', role: 'Jukumu', language: 'Lugha',
    country: 'Nchi', mark_read: 'Soma', mark_all_read: 'Soma zote',
    password: 'Nenosiri', confirm_password: 'Thibitisha nenosiri',
    create_account: 'Fungua akaunti', already_account: 'Una akaunti tayari?',
    no_account: 'Huna akaunti?', app_name: 'KisiAgri', app_tagline: 'Jukwaa la kilimo',
  },
};

export function t(key, lang) {
  const l = lang || 'fr';
  return (translations[l] && translations[l][key]) || translations.fr[key] || key;
}

export const ROLES = [
  { value: 'agriculteur', label: 'Agriculteur' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'grossiste', label: 'Grossiste' },
  { value: 'commercant', label: 'Commerçant' },
  { value: 'boutiquier', label: 'Boutiquier' },
  { value: 'revendeur', label: 'Revendeur' },
  { value: 'marchand', label: 'Marchand' },
  { value: 'acheteur', label: 'Acheteur' },
];

export const CURRENCIES = ['CDF', 'USD'];
export const UNITS = ['kg', 'sac', 'tonne', 'litre', 'botte'];
export const CITIES = ['Kinshasa', 'Lubumbashi', 'Goma', 'Bukavu', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Bunia', 'Matadi', 'Boma'];
export const PRODUCTS = ['Manioc', 'Maïs', 'Riz', 'Arachide', 'Haricot', 'Soja', 'Banane', 'Patate douce', 'Igname', 'Café', 'Cacao', 'Palmier', 'Tomate', 'Oignon', 'Chou'];