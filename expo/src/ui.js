import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS } from './lib';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Btn({ title, onPress, variant, loading, disabled, style }) {
  const bg = variant === 'outline' ? COLORS.white : variant === 'danger' ? COLORS.red : COLORS.primary;
  const color = variant === 'outline' ? COLORS.dark : COLORS.white;
  const border = variant === 'outline' ? 1 : 0;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[styles.btn, { backgroundColor: bg, borderWidth: border, borderColor: COLORS.border }, style]}
    >
      {loading ? <ActivityIndicator color={color} size="small" /> : <Text style={[styles.btnText, { color }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

export function Select({ label, value, options, onChange }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.selectRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value || opt}
            onPress={() => onChange(opt.value || opt)}
            style={[styles.selectItem, value === (opt.value || opt) && styles.selectItemActive]}
          >
            <Text style={[styles.selectItemText, value === (opt.value || opt) && styles.selectItemTextActive]}>
              {opt.label || opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function Badge({ label, color }) {
  const bg = color || COLORS.lightGray;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: color === COLORS.yellow || color === COLORS.lightGray ? COLORS.dark : COLORS.white }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ message }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message || 'Aucune donnée'}</Text>
    </View>
  );
}

export function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color || COLORS.primary, borderTopWidth: 3 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function ScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
    </View>
  );
}

export function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingTitle}>KisiAgri</Text>
      <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 16 }} />
    </View>
  );
}

export function ListItem({ title, subtitle, right, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} disabled={!onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text style={styles.listSub}>{subtitle}</Text> : null}
      </View>
      {right}
      {onDelete ? (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  btnText: { fontWeight: '600', fontSize: 15 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.dark, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, backgroundColor: COLORS.white, color: COLORS.dark },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, marginBottom: 4 },
  selectItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectItemText: { fontSize: 13, color: COLORS.dark },
  selectItemTextActive: { color: COLORS.white, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.gray, fontSize: 14 },
  statCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8, flex: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  headerSub: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  listTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 4 },
  listSub: { fontSize: 13, color: COLORS.gray },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  deleteBtnText: { color: COLORS.red, fontSize: 18 },
});