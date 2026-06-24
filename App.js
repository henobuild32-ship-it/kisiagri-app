import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, FlatList, SafeAreaView, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kisiagri_data';
const GREEN = '#16a34a';
const DARK = '#1f2937';
const GRAY = '#6b7280';

async function loadData() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { debts: [], market: [], stocks: [] };
}

async function saveData(data) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatMoney(amount, currency) {
  return (amount || 0).toLocaleString('fr-FR') + ' ' + (currency || 'CDF');
}

function DashboardScreen({ data, setScreen }) {
  const totalDebt = data.debts.reduce((s, d) => s + (d.amount - (d.amount_paid || 0)), 0);
  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Tableau de bord</Text>
      <View style={s.card}>
        <Text style={s.cardLabel}>Dettes totales</Text>
        <Text style={s.cardValue}>{formatMoney(totalDebt, 'CDF')}</Text>
      </View>
      <View style={s.row}>
        <View style={s.cardHalf}>
          <Text style={s.cardLabel}>Prix marche</Text>
          <Text style={s.cardValue}>{data.market.length}</Text>
        </View>
        <View style={s.cardHalf}>
          <Text style={s.cardLabel}>Stocks</Text>
          <Text style={s.cardValue}>{data.stocks.length}</Text>
        </View>
      </View>
      <TouchableOpacity style={s.btn} onPress={() => setScreen('debts')}>
        <Text style={s.btnText}>Voir les dettes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DebtsScreen({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  async function addDebt() {
    if (!name || !amount) { Alert.alert('Erreur', 'Nom et montant requis'); return; }
    const newDebt = { id: Date.now().toString(), client_name: name, client_phone: phone, amount: parseFloat(amount), amount_paid: 0, currency: 'CDF', status: 'en_attente', created_date: new Date().toISOString() };
    const newData = { ...data, debts: [...data.debts, newDebt] };
    setData(newData); await saveData(newData);
    setName(''); setPhone(''); setAmount(''); setShowForm(false);
  }

  async function deleteDebt(id) {
    const newData = { ...data, debts: data.debts.filter(d => d.id !== id) };
    setData(newData); await saveData(newData);
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Dettes</Text>
      {showForm ? (
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Nom du client" value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder="Telephone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={s.input} placeholder="Montant" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <TouchableOpacity style={s.btn} onPress={addDebt}><Text style={s.btnText}>Enregistrer</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={() => setShowForm(false)}><Text style={s.btnOutlineText}>Annuler</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.btn} onPress={() => setShowForm(true)}><Text style={s.btnText}>+ Nouvelle dette</Text></TouchableOpacity>
      )}
      <FlatList data={data.debts} keyExtractor={item => item.id} scrollEnabled={false} renderItem={({ item }) => (
        <View style={s.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{item.client_name}</Text>
            <Text style={s.listSub}>{formatMoney(item.amount - (item.amount_paid || 0), item.currency)}</Text>
            {item.client_phone ? <Text style={s.listSub}>{item.client_phone}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => deleteDebt(item.id)}><Text style={s.deleteBtn}>X</Text></TouchableOpacity>
        </View>
      )} />
    </ScrollView>
  );
}

function MarketScreen({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');

  async function addPrice() {
    if (!product || !price) { Alert.alert('Erreur', 'Produit et prix requis'); return; }
    const newPrice = { id: Date.now().toString(), product, city: city || 'N/A', price: parseFloat(price), currency: 'CDF', unit: 'kg', created_date: new Date().toISOString() };
    const newData = { ...data, market: [...data.market, newPrice] };
    setData(newData); await saveData(newData);
    setProduct(''); setCity(''); setPrice(''); setShowForm(false);
  }

  async function deletePrice(id) {
    const newData = { ...data, market: data.market.filter(m => m.id !== id) };
    setData(newData); await saveData(newData);
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Prix du marche</Text>
      {showForm ? (
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Produit" value={product} onChangeText={setProduct} />
          <TextInput style={s.input} placeholder="Ville" value={city} onChangeText={setCity} />
          <TextInput style={s.input} placeholder="Prix" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TouchableOpacity style={s.btn} onPress={addPrice}><Text style={s.btnText}>Publier</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={() => setShowForm(false)}><Text style={s.btnOutlineText}>Annuler</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.btn} onPress={() => setShowForm(true)}><Text style={s.btnText}>+ Nouveau prix</Text></TouchableOpacity>
      )}
      <FlatList data={data.market} keyExtractor={item => item.id} scrollEnabled={false} renderItem={({ item }) => (
        <View style={s.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{item.product}</Text>
            <Text style={s.listSub}>{formatMoney(item.price, item.currency)} / {item.unit}</Text>
            <Text style={s.listSub}>{item.city}</Text>
          </View>
          <TouchableOpacity onPress={() => deletePrice(item.id)}><Text style={s.deleteBtn}>X</Text></TouchableOpacity>
        </View>
      )} />
    </ScrollView>
  );
}

function StocksScreen({ data, setData }) {
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  async function addStock() {
    if (!product || !quantity || !price) { Alert.alert('Erreur', 'Tous les champs sont requis'); return; }
    const newStock = { id: Date.now().toString(), product, quantity: parseFloat(quantity), unit: 'kg', price: parseFloat(price), currency: 'CDF', is_available: true, created_date: new Date().toISOString() };
    const newData = { ...data, stocks: [...data.stocks, newStock] };
    setData(newData); await saveData(newData);
    setProduct(''); setQuantity(''); setPrice(''); setShowForm(false);
  }

  async function deleteStock(id) {
    const newData = { ...data, stocks: data.stocks.filter(st => st.id !== id) };
    setData(newData); await saveData(newData);
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Stocks</Text>
      {showForm ? (
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Produit" value={product} onChangeText={setProduct} />
          <TextInput style={s.input} placeholder="Quantite" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
          <TextInput style={s.input} placeholder="Prix" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TouchableOpacity style={s.btn} onPress={addStock}><Text style={s.btnText}>Publier</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnOutline} onPress={() => setShowForm(false)}><Text style={s.btnOutlineText}>Annuler</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.btn} onPress={() => setShowForm(true)}><Text style={s.btnText}>+ Nouveau stock</Text></TouchableOpacity>
      )}
      <FlatList data={data.stocks} keyExtractor={item => item.id} scrollEnabled={false} renderItem={({ item }) => (
        <View style={s.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{item.product}</Text>
            <Text style={s.listSub}>{item.quantity} {item.unit} - {formatMoney(item.price, item.currency)}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteStock(item.id)}><Text style={s.deleteBtn}>X</Text></TouchableOpacity>
        </View>
      )} />
    </ScrollView>
  );
}

function SettingsScreen() {
  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Parametres</Text>
      <View style={s.card}>
        <Text style={s.cardLabel}>KisiAgri v1.0.0</Text>
        <Text style={s.listSub}>Plateforme agricole numerique</Text>
        <Text style={s.listSub}>Donnees stockees en AsyncStorage</Text>
        <Text style={s.listSub}>Aucune dependance Base44</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardLabel}>Cree par</Text>
        <Text style={s.listSub}>HenoBuild Entreprise</Text>
        <Text style={s.listSub}>Fondateur: Henock Aduma</Text>
      </View>
    </ScrollView>
  );
}

const TABS = [
  { key: 'dashboard', label: 'Accueil', icon: 'H' },
  { key: 'debts', label: 'Dettes', icon: 'D' },
  { key: 'market', label: 'Marche', icon: 'M' },
  { key: 'stocks', label: 'Stocks', icon: 'S' },
  { key: 'settings', label: 'Reglages', icon: 'G' },
];

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [data, setData] = useState({ debts: [], market: [], stocks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <View style={s.loading}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: GREEN }}>KisiAgri</Text>
        <Text style={{ color: GRAY, marginTop: 8 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.app}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />
      <View style={s.header}>
        <Text style={s.headerTitle}>KisiAgri</Text>
      </View>
      <View style={s.content}>
        {screen === 'dashboard' && <DashboardScreen data={data} setScreen={setScreen} />}
        {screen === 'debts' && <DebtsScreen data={data} setData={setData} />}
        {screen === 'market' && <MarketScreen data={data} setData={setData} />}
        {screen === 'stocks' && <StocksScreen data={data} setData={setData} />}
        {screen === 'settings' && <SettingsScreen />}
      </View>
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={s.tab} onPress={() => setScreen(tab.key)}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: screen === tab.key ? GREEN : GRAY }}>{tab.icon}</Text>
            <Text style={[s.tabLabel, screen === tab.key && s.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f9fafb' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: GREEN, paddingVertical: 16, paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: DARK, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardLabel: { fontSize: 12, color: GRAY, marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: DARK },
  row: { flexDirection: 'row', gap: 12 },
  cardHalf: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  btn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnOutline: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  btnOutlineText: { color: GRAY, fontWeight: '600', fontSize: 15 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 12 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  listTitle: { fontSize: 16, fontWeight: '600', color: DARK, marginBottom: 4 },
  listSub: { fontSize: 13, color: GRAY, marginBottom: 2 },
  deleteBtn: { color: '#ef4444', fontSize: 18, paddingHorizontal: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabLabel: { fontSize: 10, color: GRAY, marginTop: 2 },
  tabLabelActive: { color: GREEN, fontWeight: '600' },
});
