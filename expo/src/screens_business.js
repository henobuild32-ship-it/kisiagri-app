import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Alert } from 'react-native';
import { COLORS, getAll, addItem, deleteItem, updateItem, getItem, formatMoney, formatDate, formatDateOnly, logActivity, addNotification, CURRENCIES } from './lib';
import { Card, Btn, Field, Select, Badge, EmptyState, ScreenHeader, ListItem, LoadingScreen } from './ui';

const CONTRACT_TYPES = [
  { value: 'vente_agricole', label: 'Vente agricole' },
  { value: 'achat', label: 'Achat' },
  { value: 'fourniture', label: 'Fourniture' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'personnalise', label: 'Personnalisé' },
];

export function ContractsScreen({ navigation }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setContracts(await getAll('contracts'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  async function handleDelete(id) {
    Alert.alert('Supprimer', 'Confirmer ?', [
      { text: 'Annuler' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteItem('contracts', id); load(); } },
    ]);
  }

  if (loading) return <LoadingScreen />;

  return (
    <View style={s.container}>
      <ScreenHeader title="Contrats" subtitle={contracts.length + ' contrats'} />
      <ScrollView>
        {contracts.length === 0 ? <EmptyState message="Aucun contrat" /> : null}
        <FlatList data={contracts} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
          <ListItem
            title={item.title}
            subtitle={item.party_a_name + ' → ' + item.party_b_name + (item.amount ? ' • ' + formatMoney(item.amount, item.currency) : '')}
            right={<Badge label={item.status} color={item.status === 'signe' ? COLORS.green : item.status === 'annule' ? COLORS.red : COLORS.yellow} />}
            onPress={() => navigation.navigate('ContractDetail', { id: item.id })}
            onDelete={() => handleDelete(item.id)}
          />
        )} />
      </ScrollView>
      <View style={s.fab}><Btn title="+ Nouveau contrat" onPress={() => navigation.navigate('ContractForm')} /></View>
    </View>
  );
}

export function ContractFormScreen({ navigation, route }) {
  const id = route?.params?.id;
  const [type, setType] = useState('vente_agricole');
  const [title, setTitle] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [subject, setSubject] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('CDF');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clauses, setClauses] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) {
      getItem('contracts', id).then(c => {
        if (c) {
          setEditing(true);
          setType(c.type || 'vente_agricole'); setTitle(c.title || ''); setPartyA(c.party_a_name || '');
          setPartyB(c.party_b_name || ''); setSubject(c.subject || ''); setAmount(String(c.amount || ''));
          setCurrency(c.currency || 'CDF'); setStartDate(c.start_date || ''); setEndDate(c.end_date || '');
          setClauses(c.clauses || '');
        }
      });
    }
  }, [id]);

  async function handleSave() {
    if (!title || !partyA || !partyB || !subject) { Alert.alert('Erreur', 'Titre, parties et objet requis'); return; }
    setLoading(true);
    const data = { type, title, party_a_name: partyA, party_b_name: partyB, subject, amount: amount ? parseFloat(amount) : 0, currency, start_date: startDate, end_date: endDate, clauses };
    if (editing) {
      await updateItem('contracts', id, data);
    } else {
      await addItem('contracts', { ...data, status: 'brouillon' });
      await logActivity('generation_contrat', 'contrat', 'Contrat créé: ' + title);
      await addNotification('Nouveau contrat', title, 'contrat');
    }
    setLoading(false);
    navigation.goBack();
  }

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title={editing ? 'Modifier le contrat' : 'Nouveau contrat'} />
      <Card>
        <Select label="Type" value={type} options={CONTRACT_TYPES} onChange={setType} />
        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Titre du contrat" />
        <Field label="Partie A (nom)" value={partyA} onChangeText={setPartyA} placeholder="Nom" />
        <Field label="Partie B (nom)" value={partyB} onChangeText={setPartyB} placeholder="Nom" />
        <Field label="Objet" value={subject} onChangeText={setSubject} placeholder="Objet du contrat" multiline />
        <Field label="Montant" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" />
        <Select label="Devise" value={currency} options={CURRENCIES} onChange={setCurrency} />
        <Field label="Date début (AAAA-MM-JJ)" value={startDate} onChangeText={setStartDate} placeholder="2025-01-01" />
        <Field label="Date fin (AAAA-MM-JJ)" value={endDate} onChangeText={setEndDate} placeholder="2025-12-31" />
        <Field label="Clauses" value={clauses} onChangeText={setClauses} placeholder="Clauses..." multiline />
        <Btn title="Enregistrer" onPress={handleSave} loading={loading} />
        <Btn title="Annuler" onPress={() => navigation.goBack()} variant="outline" />
      </Card>
    </ScrollView>
  );
}

export function ContractDetailScreen({ navigation, route }) {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const id = route?.params?.id;
    if (id) getItem('contracts', id).then(c => setContract(c));
  }, [route]);

  async function sign() {
    if (!contract) return;
    const newStatus = contract.status === 'signe' ? 'brouillon' : 'signe';
    await updateItem('contracts', contract.id, { status: newStatus, signed_at_a: newStatus === 'signe' ? new Date().toISOString() : null });
    await logActivity('signature', 'contrat', 'Contrat ' + (newStatus === 'signe' ? 'signé' : 'annulé') + ': ' + contract.title);
    setContract({ ...contract, status: newStatus });
  }

  if (!contract) return <LoadingScreen />;

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title={contract.title} />
      <Card>
        <Badge label={contract.status} color={contract.status === 'signe' ? COLORS.green : COLORS.yellow} />
        <Text style={s.detailLabel}>Type</Text>
        <Text style={s.detailText}>{contract.type}</Text>
        <Text style={s.detailLabel}>Partie A</Text>
        <Text style={s.detailText}>{contract.party_a_name}</Text>
        <Text style={s.detailLabel}>Partie B</Text>
        <Text style={s.detailText}>{contract.party_b_name}</Text>
        <Text style={s.detailLabel}>Objet</Text>
        <Text style={s.detailText}>{contract.subject}</Text>
        {contract.amount ? <><Text style={s.detailLabel}>Montant</Text><Text style={s.detailValue}>{formatMoney(contract.amount, contract.currency)}</Text></> : null}
        {contract.start_date ? <><Text style={s.detailLabel}>Début</Text><Text style={s.detailText}>{formatDateOnly(contract.start_date)}</Text></> : null}
        {contract.end_date ? <><Text style={s.detailLabel}>Fin</Text><Text style={s.detailText}>{formatDateOnly(contract.end_date)}</Text></> : null}
        {contract.clauses ? <><Text style={s.detailLabel}>Clauses</Text><Text style={s.detailText}>{contract.clauses}</Text></> : null}
      </Card>
      <Btn title={contract.status === 'signe' ? 'Annuler la signature' : 'Signer le contrat'} onPress={sign} />
      <Btn title="Modifier" onPress={() => navigation.navigate('ContractForm', { id: contract.id })} variant="outline" />
    </ScrollView>
  );
}

export function PaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setPayments(await getAll('payments'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); const unsub = navigation.addListener('focus', load); return unsub; }, [load, navigation]);

  if (loading) return <LoadingScreen />;

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <ScrollView style={s.container}>
      <ScreenHeader title="Paiements" subtitle={formatMoney(total, 'CDF') + ' au total'} />
      {payments.length === 0 ? <EmptyState message="Aucun paiement" /> : null}
      <FlatList data={payments} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
        <ListItem
          title={formatMoney(item.amount, item.currency)}
          subtitle={formatDate(item.created_date) + ' • ' + (item.method || 'cash')}
          right={<Badge label={item.status} color={item.status === 'confirmed' ? COLORS.green : COLORS.yellow} />}
        />
      )} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  fab: { padding: 16 },
  detailLabel: { fontSize: 12, color: COLORS.gray, marginTop: 8 },
  detailValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  detailText: { fontSize: 14, color: COLORS.dark, marginTop: 4 },
});