import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useResponsive } from '../utils/responsive';

const CATEGORY_COLORS = {
  Comunidad:   '#1E90FF',
  Deportes:    '#2ECC71',
  Educación:   '#9B59B6',
  Cultura:     '#E67E22',
  Voluntariado:'#E74C3C',
};

export default function StatsScreen() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, hPad, fs } = useResponsive();

  useEffect(() => {
    return onSnapshot(collection(db, 'events'), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const totalEvents    = events.length;
  const totalAttendees = events.reduce((s, e) => s + (e.attendees?.length || 0), 0);
  const uniqueUsers    = new Set(events.flatMap((e) => e.attendees || [])).size;

  const categoryCounts = events.reduce((acc, e) => {
    const cat = e.category || 'Otro';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const sortedCats = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name, count,
      percent: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
      color: CATEGORY_COLORS[name] || '#95a5a6',
    }));

  const statCards = [
    { emoji: '📅', value: totalEvents,    label: 'Eventos Creados',    color: '#1E90FF' },
    { emoji: '👥', value: totalAttendees, label: 'Confirmaciones',      color: '#2ECC71' },
    { emoji: '👤', value: uniqueUsers,    label: 'Usuarios Únicos',     color: '#E67E22' },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad, paddingVertical: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>
          <Text style={[styles.headerTitle, { fontSize: fs.xl }]}>📊 Estadísticas Comunitarias</Text>
          <Text style={[styles.subtitle, { fontSize: fs.sm }]}>Resumen de impacto de Eventus</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1E90FF" />
              <Text style={[styles.loadingText, { fontSize: fs.sm }]}>Cargando estadísticas...</Text>
            </View>
          ) : (
            <>
              {/* Cards grid */}
              <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
                {statCards.map(({ emoji, value, label, color }) => (
                  <View key={label} style={[styles.statCard, { borderLeftColor: color }, isMobile && styles.statCardMobile]}>
                    <Text style={styles.statEmoji}>{emoji}</Text>
                    <Text style={[styles.statValue, { fontSize: fs.xl }]}>{value}</Text>
                    <Text style={[styles.statLabel, { fontSize: fs.xs }]}>{label}</Text>
                  </View>
                ))}
              </View>

              {/* Categorías */}
              {sortedCats.length > 0 && (
                <View style={styles.catSection}>
                  <Text style={[styles.sectionTitle, { fontSize: fs.md }]}>Categorías más Populares</Text>
                  {sortedCats.map(({ name, percent, color }) => (
                    <View key={name} style={styles.progressItem}>
                      <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { fontSize: fs.sm }]}>{name}</Text>
                        <Text style={[styles.progressPct, { fontSize: fs.sm }]}>{percent}%</Text>
                      </View>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {totalEvents === 0 && (
                <Text style={[styles.emptyText, { fontSize: fs.md }]}>
                  Aún no hay eventos. ¡Crea el primero!
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb' },
  scroll: { flexGrow: 1, alignItems: 'center' },
  innerContent: { width: '100%', maxWidth: 800 },
  headerTitle: { fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { color: '#64748b', marginBottom: 24 },
  loadingBox: { alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, color: '#94a3b8' },
  statsGrid: { flexDirection: 'row', gap: 14, marginBottom: 24, flexWrap: 'wrap' },
  statsGridMobile: { flexDirection: 'column' },
  statCard: {
    flex: 1, minWidth: 140, backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 5,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  statCardMobile: { flex: undefined, width: '100%' },
  statEmoji: { fontSize: 26, marginBottom: 6 },
  statValue: { fontWeight: 'bold', color: '#0f172a' },
  statLabel: { color: '#64748b', marginTop: 2 },
  catSection: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  progressItem: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: '#475569', fontWeight: '600' },
  progressPct: { color: '#64748b', fontWeight: 'bold' },
  progressBg: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
});
