import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { COLORS, getAll, addItem, deleteItem, updateItem, getItem, formatMoney, formatDate, formatDateOnly, logActivity, addNotification, CURRENCIES, UNITS, CITIES, PRODUCTS } from './lib';
import { Card, Btn, Field, Select, Badge, EmptyState, StatCard, ScreenHeader, ListItem, LoadingScreen } from './ui';

export function DashboardScreen({ navigation }) {
  const [data, setData] = useState({ debts: [], market: [], stocks: [], contracts: [], notifications: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [debts, market, stocks, contracts, notifications] = await Promise.all([
      getAll('debts'), getAll('market'), getAll('stocks'), getAll('contracts'), getAll('notifications'),
    ]);
    setData({ debts, market, stocks, contracts, notifications });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  if (loading) return <LoadingScreen />;

  const totalDebt = data.debts.reduce((s, d) => s + (d.amount - (d.amount_paid || 0)), 0);
  const unreadCount = data.notifications.filter(n => !n.is_read).length;

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <ScreenHeader title="Tableau de bord" subtitle="Vue d'ensemble" />
      <View style={s.statsRow}>
        <StatCard label="Dettes totales" value={formatMoney(totalDebt, 'CDF')} color={COLORS.red} />
      </View>
      <View style={s.statsRow}>
        <StatCard label="Prix marché" value={data.market.length} color={COLORS.blue} />
        <StatCard label="Stocks" value={data.stocks.length} color={COLORS.green} />
      </View>
      <View style={s.statsRow}>
        <StatCard label="Contrats" value={data.contracts.length} color={COLORS.secondary} />
        <StatCard label="Notifications" value={unreadCount} color={COLORS.yellow} />
      </View>
      <View style={s.actions}>
        <Btn title="+ Nouvelle dette" onPress={() => navigation.navigate('DebtForm')} />
        <Btn title="+ Prix marché" onPress={() => navigation.navigate('Market')} variant="outline" />
        <Btn title="+ Stock" onPress={() => navigation.navigate('Stocks')} variant="outline" />
        <Btn title="+ Contrat" onPress={() => navigation.navigate('ContractForm')} variant="outline" />
      </View>
    </ScrollView>
  );
}

export function DebtsScreen({ navigation }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setDebts(await getAll('debts'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  async function handleDelete(id) {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteItem('debts', id); load(); } },
    ]);
  }

  if (loading) return <LoadingScreen />;

  return (
    <View style={s.container}>
      <ScreenHeader title="Dettes" subtitle={debts.length + ' dettes'} />
      <ScrollView>
        {debts.length === 0 ? <EmptyState message="Aucune dette. Appuyez sur + pour en ajouter." /> : null}
        <FlatList data={debts} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
          <ListItem
            title={item.client_name}
            subtitle={formatMoney(item.amount - (item.amount_paid || 0), item.currency) + (item.due_date ? ' • ' + formatDateOnly(item.due_date) : '')}
            right={<Badge label={item.status || 'en_attente'} color={item.status === 'payee' ? COLORS.green : item.status === 'en_retard' ? COLORS.red : COLORS.yellow} />}
            onPress={() => navigation.navigate('DebtDetail', { id: item.id })}
            onDelete={() => handleDelete(item.id)}
          />
        )} />
      </ScrollView>
      <View style={s.fab}>
        <Btn title="+ Nouvelle dette" onPress={() => navigation.navigate('DebtForm')} />
      </View>
    </View>
  );
}

export function DebtFormScreen({ navigation, route }) {
  const id = route?.params?.id;
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('CDF');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) {
      getItem('debts', id).then(d => {
        if (d) {
          setEditing(true);
          setClientName(d.client_name || '');
          setClientPhone(d.client_phone || '');
          setAmount(String(d.amount || ''));
          setCurrency(d.currency || 'CDF');
          setDescription(d.description || '');
          setDueDate(d.due_date || '');
        }
      });
    }
  }, [id]);

  async function handleSave() {
    if (!clientName || !amount) { Alert.alert('Erreur', 'Nom et montant requis'); return; }
    setLoading(true);
    if (editing) {
      await updateItem('debts', id, { client_name: clientName, client_phone: clientPhone, amount: parseFloat(amount), currency, description, due_date: dueDate });
    } else {
      await addItem('debts', { client_name: clientName, client_phone: clientPhone, amount: parseFloat(amount), amount_paid: 0, currency, description, due_date: dueDate, status: 'en_attente' });
      await logActivity('creation', 'dette', 'Dette créée pour ' + clientName);
      await addNotification('Nouvelle dette', 'Dette de ' + formatMoney(parseFloat(amount), currency) + ' pour ' + clientName, 'dette');
    }
    setLoading(false);
    navigation.goBack();
  }

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title={editing ? 'Modifier la dette' : 'Nouvelle dette'} />
      <Card>
        <Field label="Nom du client" value={clientName} onChangeText={setClientName} placeholder="Nom" />
        <Field label="Téléphone" value={clientPhone} onChangeText={setClientPhone} placeholder="+243..." keyboardType="phone-pad" />
        <Field label="Montant" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" />
        <Select label="Devise" value={currency} options={CURRENCIES} onChange={setCurrency} />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Note..." multiline />
        <Field label="Date d'échéance (AAAA-MM-JJ)" value={dueDate} onChangeText={setDueDate} placeholder="2025-12-31" />
        <Btn title="Enregistrer" onPress={handleSave} loading={loading} />
        <Btn title="Annuler" onPress={() => navigation.goBack()} variant="outline" />
      </Card>
    </ScrollView>
  );
}

export function DebtDetailScreen({ navigation, route }) {
  const [debt, setDebt] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const id = route?.params?.id;
    if (id) {
      getItem('debts', id).then(d => setDebt(d));
      getAll('payments').then(ps => setPayments(ps.filter(p => p.debt_id === id)));
    }
  }, [route]);

  async function addPayment() {
    if (!debt) return;
    const amountStr = prompt('Montant du paiement:');
    if (!amountStr) return;
    const amt = parseFloat(amountStr);
    if (isNaN(amt)) return;
    await addItem('payments', { debt_id: debt.id, amount: amt, currency: debt.currency, method: 'cash', status: 'confirmed' });
    const newPaid = (debt.amount_paid || 0) + amt;
    const status = newPaid >= debt.amount ? 'payee' : 'partielle';
    await updateItem('debts', debt.id, { amount_paid: newPaid, status });
    await logActivity('paiement', 'dette', 'Paiement de ' + formatMoney(amt, debt.currency));
    setDebt({ ...debt, amount_paid: newPaid, status });
    setPayments(await getAll('payments').then(ps => ps.filter(p => p.debt_id === debt.id)));
  }

  if (!debt) return <LoadingScreen />;

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title={debt.client_name} />
      <Card>
        <Text style={s.detailLabel}>Montant total</Text>
        <Text style={s.detailValue}>{formatMoney(debt.amount, debt.currency)}</Text>
        <Text style={s.detailLabel}>Montant payé</Text>
        <Text style={s.detailValue}>{formatMoney(debt.amount_paid || 0, debt.currency)}</Text>
        <Text style={s.detailLabel}>Reste à payer</Text>
        <Text style={[s.detailValue, { color: COLORS.red }]}>{formatMoney(debt.amount - (debt.amount_paid || 0), debt.currency)}</Text>
        <Badge label={debt.status} color={debt.status === 'payee' ? COLORS.green : COLORS.yellow} />
        {debt.client_phone ? <Text style={s.detailText}>Tél: {debt.client_phone}</Text> : null}
        {debt.description ? <Text style={s.detailText}>{debt.description}</Text> : null}
        {debt.due_date ? <Text style={s.detailText}>Échéance: {formatDateOnly(debt.due_date)}</Text> : null}
      </Card>
      <Btn title="Enregistrer un paiement" onPress={addPayment} />
      <Btn title="Modifier" onPress={() => navigation.navigate('DebtForm', { id: debt.id })} variant="outline" />
      <Text style={s.sectionTitle}>Paiements ({payments.length})</Text>
      {payments.map(p => (
        <Card key={p.id}>
          <Text style={s.detailValue}>{formatMoney(p.amount, p.currency)}</Text>
          <Text style={s.detailText}>{formatDate(p.created_date)} • {p.method}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

export function MarketScreen({ navigation }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState('');
  const [city, setCity] = useState('');
  const [priceVal, setPriceVal] = useState('');
  const [currency, setCurrency] = useState('CDF');
  const [unit, setUnit] = useState('kg');

  const load = useCallback(async () => {
    setPrices(await getAll('market'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  async function handleAdd() {
    if (!product || !priceVal) { Alert.alert('Erreur', 'Produit et prix requis'); return; }
    await addItem('market', { product, city: city || 'N/A', price: parseFloat(priceVal), currency, unit, status: 'soumis' });
    await logActivity('contribution_prix', 'prix', 'Prix publié: ' + product);
    setProduct(''); setCity(''); setPriceVal(''); setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    await deleteItem('market', id);
    load();
  }

  if (loading) return <LoadingScreen />;

  return (
    <View style={s.container}>
      <ScreenHeader title="Marché" subtitle="Prix du marché" />
      <ScrollView>
        {showForm ? (
          <Card>
            <Select label="Produit" value={product} options={PRODUCTS} onChange={setProduct} />
            <Select label="Ville" value={city} options={CITIES} onChange={setCity} />
            <Field label="Prix" value={priceVal} onChangeText={setPriceVal} keyboardType="numeric" placeholder="0" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Select label="Devise" value={currency} options={CURRENCIES} onChange={setCurrency} /></View>
              <View style={{ flex: 1 }}><Select label="Unité" value={unit} options={UNITS} onChange={setUnit} /></View>
            </View>
            <Btn title="Publier" onPress={handleAdd} />
            <Btn title="Annuler" onPress={() => setShowForm(false)} variant="outline" />
          </Card>
        ) : (
          <Btn title="+ Nouveau prix" onPress={() => setShowForm(true)} />
        )}
        {prices.length === 0 && !showForm ? <EmptyState message="Aucun prix publié" /> : null}
        <FlatList data={prices} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
          <ListItem
            title={item.product}
            subtitle={formatMoney(item.price, item.currency) + ' / ' + item.unit + ' • ' + item.city}
            right={<Badge label={item.status} color={item.status === 'verifie' ? COLORS.green : COLORS.yellow} />}
            onDelete={() => handleDelete(item.id)}
          />
        )} />
      </ScrollView>
    </View>
  );
}

export function StocksScreen({ navigation }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priceVal, setPriceVal] = useState('');
  const [currency, setCurrency] = useState('CDF');
  const [unit, setUnit] = useState('kg');
  const [city, setCity] = useState('');

  const load = useCallback(async () => {
    setStocks(await getAll('stocks'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  async function handleAdd() {
    if (!product || !quantity || !priceVal) { Alert.alert('Erreur', 'Tous les champs sont requis'); return; }
    await addItem('stocks', { product, quantity: parseFloat(quantity), unit, price: parseFloat(priceVal), currency, city: city || 'N/A', is_available: true });
    await logActivity('publication_stock', 'stock', 'Stock publié: ' + product);
    await addNotification('Nouveau stock', product + ' - ' + quantity + unit, 'stock');
    setProduct(''); setQuantity(''); setPriceVal(''); setCity(''); setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    await deleteItem('stocks', id);
    load();
  }

  if (loading) return <LoadingScreen />;

  return (
    <View style={s.container}>
      <ScreenHeader title="Stocks" subtitle="Inventaire" />
      <ScrollView>
        {showForm ? (
          <Card>
            <Select label="Produit" value={product} options={PRODUCTS} onChange={setProduct} />
            <Field label="Quantité" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Select label="Unité" value={unit} options={UNITS} onChange={setUnit} /></View>
              <View style={{ flex: 1 }}><Select label="Devise" value={currency} options={CURRENCIES} onChange={setCurrency} /></View>
            </View>
            <Field label="Prix" value={priceVal} onChangeText={setPriceVal} keyboardType="numeric" placeholder="0" />
            <Select label="Ville" value={city} options={CITIES} onChange={setCity} />
            <Btn title="Publier" onPress={handleAdd} />
            <Btn title="Annuler" onPress={() => setShowForm(false)} variant="outline" />
          </Card>
        ) : (
          <Btn title="+ Nouveau stock" onPress={() => setShowForm(true)} />
        )}
        {stocks.length === 0 && !showForm ? <EmptyState message="Aucun stock" /> : null}
        <FlatList data={stocks} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
          <ListItem
            title={item.product}
            subtitle={item.quantity + ' ' + item.unit + ' • ' + formatMoney(item.price, item.currency) + ' • ' + item.city}
            right={<Badge label={item.is_available ? 'Disponible' : 'Épuisé'} color={item.is_available ? COLORS.green : COLORS.gray} />}
            onDelete={() => handleDelete(item.id)}
          />
        )} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  actions: { padding: 16 },
  fab: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  detailLabel: { fontSize: 12, color: COLORS.gray, marginTop: 8 },
  detailValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  detailText: { fontSize: 14, color: COLORS.gray, marginTop: 8 },
});