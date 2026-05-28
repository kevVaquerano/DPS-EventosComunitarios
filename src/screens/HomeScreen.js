import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Alert, TextInput, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../api/firebase';
import { useResponsive } from '../utils/responsive';

const CATEGORIES = ['Todos', 'Comunidad', 'Deportes', 'Educación', 'Cultura', 'Voluntariado'];

export default function HomeScreen({ navigation }) {
  const [events, setEvents]       = useState([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading]     = useState(true);

  const { isMobile, isDesktop, columns, hPad, fs, sp } = useResponsive();
  const currentUser = auth.currentUser;
  const now = Date.now();

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try { await signOut(auth); navigation.replace('Login'); }
    catch { Alert.alert('Error', 'No se pudo cerrar la sesión.'); }
  };

  const handleDelete = (event) => {
    Alert.alert('Eliminar Evento', `¿Eliminar "${event.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteDoc(doc(db, 'events', event.id)); }
        catch { Alert.alert('Error', 'No se pudo eliminar el evento.'); }
      }},
    ]);
  };

  const filteredEvents = useMemo(() => {
    const byTab = events.filter((e) => {
      if (!e.dateTimestamp) return activeTab === 'upcoming';
      return activeTab === 'upcoming' ? e.dateTimestamp >= now : e.dateTimestamp < now;
    });
    return byTab.filter((e) => {
      const text = `${e.title} ${e.location} ${e.category}`.toLowerCase();
      return text.includes(search.toLowerCase()) && (filter === 'Todos' || e.category === filter);
    });
  }, [events, search, filter, activeTab]);

  const renderEventItem = ({ item }) => {
    const isOwner      = currentUser && item.createdBy === currentUser.uid;
    const attendeeCount = item.attendees?.length || 0;
    return (
      <TouchableOpacity
        style={[styles.eventCard, columns > 1 && styles.eventCardMulti]}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
        activeOpacity={0.85}
      >
        <View style={styles.cardBanner}>
          <Text style={styles.cardIcon}>🎉</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.categoryPill}>
            <Text style={[styles.categoryText, { fontSize: fs.xs }]}>{item.category}</Text>
          </View>
          <Text style={[styles.eventTitle, { fontSize: fs.md }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.eventMeta, { fontSize: fs.xs }]}>📅 {item.date}</Text>
          <Text style={[styles.eventMeta, { fontSize: fs.xs }]}>⏰ {item.time}</Text>
          <Text style={[styles.eventMeta, { fontSize: fs.xs }]} numberOfLines={1}>📍 {item.location}</Text>
          <Text style={[styles.attendeeCount, { fontSize: fs.xs }]}>
            👥 {attendeeCount} asistente{attendeeCount !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          >
            <Text style={[styles.detailButtonText, { fontSize: fs.sm }]}>Ver detalles</Text>
          </TouchableOpacity>
          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('CreateEvent', { event: item })}>
                <Text style={[styles.editBtnText, { fontSize: fs.xs }]}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={[styles.deleteBtnText, { fontSize: fs.xs }]}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.logoText, { fontSize: isMobile ? 20 : 24 }]}>Eventus</Text>
          {!isMobile && (
            <Text style={[styles.subtitleText, { fontSize: fs.xs }]}>
              Gestiona tus eventos comunitarios
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('History')}>
            <Text style={styles.iconEmoji}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Stats')}>
            <Text style={styles.iconEmoji}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CreateEvent')}>
            <Text style={styles.iconEmoji}>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Text style={[styles.logoutText, { fontSize: fs.xs }]}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content wrapper ── */}
      <View style={[styles.content, { paddingHorizontal: hPad }]}>
        {/* Tabs */}
        <View style={styles.tabsRow}>
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

        {/* Search + filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Buscar eventos..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { fontSize: fs.sm }]}
            />
            <Text>🔍</Text>
          </View>
          <View style={styles.filterWrap}>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
              <Text style={[styles.filterText, { fontSize: fs.sm }]} numberOfLines={1}>{filter}</Text>
              <Text style={styles.filterArrow}>⌄</Text>
            </TouchableOpacity>
            {showFilters && (
              <View style={styles.filterMenu}>
                {CATEGORIES.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.filterOption}
                    onPress={() => { setFilter(opt); setShowFilters(false); }}
                  >
                    <Text style={[styles.filterOptionText, { fontSize: fs.sm }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={[styles.loadingText, { fontSize: fs.sm }]}>Cargando eventos...</Text>
          </View>
        ) : (
          <FlatList
            key={columns}
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? { gap: 16 } : null}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { fontSize: fs.md }]}>
                {activeTab === 'upcoming' ? 'No hay eventos próximos. ¡Crea el primero!' : 'No hay eventos pasados.'}
              </Text>
            }
          />
        )}
      </View>

      {/* FAB solo en mobile */}
      {isMobile && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateEvent')}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb' },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  headerLeft: { flex: 1 },
  logoText: { fontWeight: '900', color: '#2563eb' },
  subtitleText: { color: '#64748b', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  iconEmoji: { fontSize: 16 },
  logoutBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#0f172a' },
  logoutText: { color: '#fff', fontWeight: '700' },
  content: { flex: 1 },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
    marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12, zIndex: 20 },
  searchBox: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: '#0f172a', outlineStyle: 'none' },
  filterWrap: { width: 130, position: 'relative' },
  filterBtn: {
    height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  filterText: { fontWeight: '700', color: '#334155', flex: 1 },
  filterArrow: { fontSize: 18, color: '#334155' },
  filterMenu: {
    position: 'absolute', top: 50, left: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    overflow: 'hidden', elevation: 6, zIndex: 99,
  },
  filterOption: { paddingVertical: 10, paddingHorizontal: 14 },
  filterOptionText: { color: '#334155' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, color: '#94a3b8' },
  eventCard: {
    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
    marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eventCardMulti: { flex: 1 },
  cardBanner: { height: 110, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 38 },
  cardBody: { padding: 14 },
  categoryPill: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, marginBottom: 8 },
  categoryText: { color: '#2563eb', fontWeight: '800' },
  eventTitle: { fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  eventMeta: { color: '#475569', marginBottom: 3 },
  attendeeCount: { color: '#94a3b8', marginBottom: 12 },
  detailButton: { backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  detailButtonText: { color: '#fff', fontWeight: '800' },
  ownerActions: { flexDirection: 'row', gap: 6 },
  editBtn: { flex: 1, backgroundColor: '#f0f9ff', paddingVertical: 7, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bae6fd' },
  editBtnText: { color: '#0284c7', fontWeight: '700' },
  deleteBtn: { flex: 1, backgroundColor: '#fff1f2', paddingVertical: 7, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#fecdd3' },
  deleteBtnText: { color: '#e11d48', fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 60, color: '#94a3b8', fontWeight: '600' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },
});
