import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../api/firebase';
import { useResponsive } from '../utils/responsive';

export default function HistoryScreen({ navigation }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { isMobile, hPad, fs } = useResponsive();
  const currentUser = auth.currentUser;
  const now = Date.now();

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    // array-contains permite filtrar directamente en Firestore sin traer todos los eventos
    const q = query(
      collection(db, 'events'),
      where('attendees', 'array-contains', currentUser.uid)
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Se ordena en cliente porque Firestore no permite orderBy junto con array-contains sin índice compuesto
      data.sort((a, b) => (b.dateTimestamp || 0) - (a.dateTimestamp || 0));
      setEvents(data);
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    if (!e.dateTimestamp) return activeTab === 'upcoming';
    return activeTab === 'upcoming' ? e.dateTimestamp >= now : e.dateTimestamp < now;
  });

  const renderItem = ({ item }) => {
    const isPast = item.dateTimestamp && item.dateTimestamp < now;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
        activeOpacity={0.85}
      >
        {/* Barra de color lateral: verde para próximos, gris para pasados */}
        <View style={[styles.cardAccent, isPast ? styles.accentPast : styles.accentUpcoming]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={styles.categoryPill}>
              <Text style={[styles.categoryText, { fontSize: fs.xs }]}>{item.category}</Text>
            </View>
            <Text style={[styles.rsvpBadge, { fontSize: fs.xs }]}>✅ Confirmado</Text>
          </View>
          <Text style={[styles.eventTitle, { fontSize: fs.md }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.eventMeta, { fontSize: fs.xs }]}>📅 {item.date}  ⏰ {item.time}</Text>
          <Text style={[styles.eventMeta, { fontSize: fs.xs }]} numberOfLines={1}>📍 {item.location}</Text>
          <Text style={[styles.attendeeText, { fontSize: fs.xs }]}>
            👥 {item.attendees?.length || 0} asistentes confirmados
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <Text style={[styles.headerTitle, { fontSize: fs.xl }]}>📋 Mi Historial</Text>
        <Text style={[styles.subtitle, { fontSize: fs.sm }]}>
          Eventos en los que confirmaste asistencia
        </Text>
      </View>

      <View style={[styles.tabsRow, { marginHorizontal: hPad }]}>
        {['upcoming', 'past'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { fontSize: fs.sm }, activeTab === tab && styles.tabTextActive]}>
              {tab === 'upcoming' ? '🗓 Próximos' : '🕐 Pasados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={[styles.loadingText, { fontSize: fs.sm }]}>Cargando tu historial...</Text>
        </View>
      ) : !currentUser ? (
        <Text style={[styles.emptyText, { fontSize: fs.md }]}>Inicia sesión para ver tu historial.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingHorizontal: hPad }]}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>{activeTab === 'upcoming' ? '🗓' : '🕐'}</Text>
              <Text style={[styles.emptyText, { fontSize: fs.md }]}>
                {activeTab === 'upcoming'
                  ? 'No tienes eventos próximos confirmados.'
                  : 'No tienes eventos pasados en tu historial.'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
                  <Text style={[styles.exploreBtnText, { fontSize: fs.sm }]}>Explorar eventos</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { paddingTop: 20, paddingBottom: 8 },
  headerTitle: { fontWeight: '900', color: '#0f172a' },
  subtitle: { color: '#64748b', marginTop: 4 },
  tabsRow: {
    flexDirection: 'row', backgroundColor: '#e2e8f0',
    borderRadius: 14, padding: 4, marginTop: 14, marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#94a3b8' },
  list: { paddingTop: 4, paddingBottom: 40 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardAccent: { width: 6 },
  accentUpcoming: { backgroundColor: '#22c55e' },
  accentPast: { backgroundColor: '#94a3b8' },
  cardBody: { flex: 1, padding: 14 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryPill: { backgroundColor: '#eff6ff', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
  categoryText: { color: '#2563eb', fontWeight: '800' },
  rsvpBadge: { color: '#16a34a', fontWeight: '700' },
  eventTitle: { fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  eventMeta: { color: '#475569', marginBottom: 2 },
  attendeeText: { color: '#94a3b8', marginTop: 4 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { color: '#94a3b8', fontWeight: '600', textAlign: 'center' },
  exploreBtn: { marginTop: 20, backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  exploreBtnText: { color: '#fff', fontWeight: '800' },
});
