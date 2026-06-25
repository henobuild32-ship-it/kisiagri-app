import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Alert, Share } from 'react-native';
import { COLORS, getAll, updateItem, getProfile, saveProfile, getLanguage, setLanguage, clearAuth, formatMoney, formatDate, ROLES } from './lib';
import { Card, Btn, Field, Select, Badge, EmptyState, StatCard, ScreenHeader, ListItem, LoadingScreen } from './ui';

export function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setNotifications(await getAll('notifications'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  async function markRead(id) {
    await updateItem('notifications', id, { is_read: true });
    load();
  }

  async function markAllRead() {
    const items = await getAll('notifications');
    for (const n of items.filter(i => !i.is_read)) {
      await updateItem('notifications', n.id, { is_read: true });
    }
    load();
  }

  if (loading) return <LoadingScreen />;

  return (
    <View style={s.container}>
      <ScreenHeader title="Notifications" subtitle={notifications.filter(n => !n.is_read).length + ' non lues'} />
      <ScrollView>
        {notifications.length > 0 ? <Btn title="Tout marquer comme lu" onPress={markAllRead} variant="outline" /> : null}
        {notifications.length === 0 ? <EmptyState message="Aucune notification" /> : null}
        <FlatList data={notifications} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
          <ListItem
            title={item.title}
            subtitle={item.message + ' • ' + formatDate(item.created_date)}
            right={<Badge label={item.type} color={COLORS.blue} />}
            onPress={() => markRead(item.id)}
          />
        )} />
      </ScrollView>
    </View>
  );
}

export function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ debts: 0, contracts: 0, stocks: 0, market: 0 });

  useEffect(() => {
    (async () => {
      setProfile(await getProfile());
      const [debts, contracts, stocks, market] = await Promise.all([
        getAll('debts'), getAll('contracts'), getAll('stocks'), getAll('market'),
      ]);
      setCounts({ debts: debts.length, contracts: contracts.length, stocks: stocks.length, market: market.length });
    })();
    const unsub = navigation.addListener('focus', async () => setProfile(await getProfile()));
    return unsub;
  }, [navigation]);

  if (!profile) return <LoadingScreen />;

  return (
    <ScrollView style={s.container}>
      <View style={s.profileHeader}>
        <View style={s.avatar}><Text style={s.avatarText}>{(profile.full_name || '?')[0].toUpperCase()}</Text></View>
        <Text style={s.profileName}>{profile.full_name || 'Utilisateur'}</Text>
        <Badge label={profile.role || 'agriculteur'} color={COLORS.primary} />
      </View>
      <View style={s.statsRow}>
        <StatCard label="Dettes" value={counts.debts} color={COLORS.red} />
        <StatCard label="Contrats" value={counts.contracts} color={COLORS.secondary} />
      </View>
      <View style={s.statsRow}>
        <StatCard label="Stocks" value={counts.stocks} color={COLORS.green} />
        <StatCard label="Prix" value={counts.market} color={COLORS.blue} />
      </View>
      <Card>
        <Text style={s.detailLabel}>Téléphone</Text>
        <Text style={s.detailText}>{profile.phone || '—'}</Text>
        <Text style={s.detailLabel}>Email</Text>
        <Text style={s.detailText}>{profile.email || '—'}</Text>
        <Text style={s.detailLabel}>Pays</Text>
        <Text style={s.detailText}>{profile.country || 'RDC'}</Text>
        <Text style={s.detailLabel}>Ville</Text>
        <Text style={s.detailText}>{profile.city || '—'}</Text>
      </Card>
      <Btn title="Modifier le profil" onPress={() => navigation.navigate('Settings')} />
    </ScrollView>
  );
}

export function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [lang, setLang] = useState('fr');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setProfile(await getProfile());
      setLang(await getLanguage());
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    await saveProfile(profile);
    await setLanguage(lang);
    setSaving(false);
    Alert.alert('Succès', 'Profil enregistré');
  }

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Se déconnecter ?', [
      { text: 'Annuler' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => {
        await clearAuth();
        navigation.replace('Login');
      }},
    ]);
  }

  if (!profile) return <LoadingScreen />;

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title="Paramètres" />
      <Card>
        <Field label="Nom complet" value={profile.full_name} onChangeText={v => setProfile({ ...profile, full_name: v })} />
        <Field label="Téléphone" value={profile.phone} onChangeText={v => setProfile({ ...profile, phone: v })} keyboardType="phone-pad" />
        <Field label="Email" value={profile.email} onChangeText={v => setProfile({ ...profile, email: v })} keyboardType="email-address" />
        <Select label="Rôle" value={profile.role} options={ROLES} onChange={v => setProfile({ ...profile, role: v })} />
        <Select label="Langue" value={lang} options={[{ value: 'fr', label: 'Français' }, { value: 'ln', label: 'Lingala' }, { value: 'sw', label: 'Swahili' }]} onChange={setLang} />
        <Field label="Ville" value={profile.city} onChangeText={v => setProfile({ ...profile, city: v })} />
        <Btn title="Enregistrer" onPress={handleSave} loading={saving} />
      </Card>
      <Card>
        <Text style={s.aboutTitle}>KisiAgri v1.0.0</Text>
        <Text style={s.aboutText}>Plateforme agricole numérique</Text>
        <Text style={s.aboutText}>Données stockées en AsyncStorage</Text>
        <Text style={s.aboutText}>Aucune dépendance Base44</Text>
        <Text style={s.aboutText}>Fondateur: Henock Aduma</Text>
        <Text style={s.aboutText}>HenoBuild Entreprise</Text>
      </Card>
      <Btn title="Se déconnecter" onPress={handleLogout} variant="outline" style={{ borderColor: COLORS.red }} />
    </ScrollView>
  );
}

export function AuditLogScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLogs(await getAll('activity'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title="Journal d'activité" subtitle={logs.length + ' actions'} />
      {logs.length === 0 ? <EmptyState message="Aucune activité" /> : null}
      <FlatList data={logs} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
        <ListItem
          title={item.description}
          subtitle={formatDate(item.created_date) + ' • ' + item.action}
          right={<Badge label={item.action} color={COLORS.gray} />}
        />
      )} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  profileName: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, marginTop: 12 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  detailLabel: { fontSize: 12, color: COLORS.gray, marginTop: 8 },
  detailText: { fontSize: 15, color: COLORS.dark, marginTop: 2 },
  aboutTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8 },
  aboutText: { fontSize: 13, color: COLORS.gray, marginBottom: 4 },
});