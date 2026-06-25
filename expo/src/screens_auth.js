import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, setAuth, getProfile, saveProfile, saveLanguage, ROLES } from './lib';
import { Btn, Field, Select } from './ui';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Erreur', 'Email et mot de passe requis'); return; }
    setLoading(true);
    await setAuth({ email, logged_in: true, created_date: new Date().toISOString() });
    setLoading(false);
    navigation.replace('Main');
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={s.logo}>
        <Text style={s.logoText}>🌱 KisiAgri</Text>
        <Text style={s.logoSub}>Plateforme agricole numérique</Text>
      </View>
      <View style={s.form}>
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" />
        <Btn title="Se connecter" onPress={handleLogin} loading={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.linkBtn}>
          <Text style={s.linkText}>Pas de compte ? S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('agriculteur');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !phone || !password) { Alert.alert('Erreur', 'Nom, téléphone et mot de passe requis'); return; }
    if (password !== confirm) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    await setAuth({ email: email || phone, logged_in: true, created_date: new Date().toISOString() });
    await saveProfile({ full_name: fullName, phone, email: email || '', role, language: 'fr', country: 'RDC', city: '' });
    await saveLanguage('fr');
    setLoading(false);
    navigation.replace('Main');
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={s.logo}>
        <Text style={s.logoText}>🌱 KisiAgri</Text>
        <Text style={s.logoSub}>Créer un compte</Text>
      </View>
      <View style={s.form}>
        <Field label="Nom complet" value={fullName} onChangeText={setFullName} placeholder="Votre nom" />
        <Field label="Téléphone" value={phone} onChangeText={setPhone} placeholder="+243..." keyboardType="phone-pad" />
        <Field label="Email (optionnel)" value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" />
        <Field label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} placeholder="••••••••" />
        <Select label="Rôle" value={role} options={ROLES} onChange={setRole} />
        <Btn title="Créer mon compte" onPress={handleRegister} loading={loading} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.linkBtn}>
          <Text style={s.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  logo: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  logoSub: { fontSize: 14, color: COLORS.gray, marginTop: 8 },
  form: { padding: 20, paddingBottom: 40 },
  linkBtn: { alignItems: 'center', paddingVertical: 12 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
});