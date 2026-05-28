import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../api/firebase';

const EVENTOS_DUMMY = [
  {
    id: '1',
    title: 'Campaña de Reciclaje Local',
    date: '28 de Mayo, 2026',
    dateISO: '2026-05-28',
    time: '8:00 AM',
    location: 'Parque Central de la Comunidad',
    category: 'Comunidad',
    description: 'Trae tus botellas de plástico, cartón y latas para ayudar a limpiar nuestro entorno.',
  },
  {
    id: '2',
    title: 'Torneo de Fútbol Comunitario',
    date: '30 de Mayo, 2026',
    dateISO: '2026-05-30',
    time: '2:00 PM',
    location: 'Cancha Municipal',
    category: 'Deportes',
    description: 'Inscripciones abiertas para equipos de todas las edades.',
  },
  {
    id: '3',
    title: 'Taller de Huertos Caseros',
    date: '02 de Junio, 2026',
    dateISO: '2026-06-02',
    time: '10:00 AM',
    location: 'Centro Escolar Comunitario',
    category: 'Educación',
    description: 'Aprende a cultivar tus propias verduras y legumbres orgánicas.',
  },
];

const FILTERS = ['Todos', 'Mayo', 'Junio', 'Comunidad', 'Deportes', 'Educación'];

export default function HomeScreen({ navigation }) {
  const [events] = useState(EVENTOS_DUMMY);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = auth.currentUser;

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Usuario';

  const { width } = useWindowDimensions();

  const isMobile = width < 650;
  const columns = width >= 1000 ? 3 : width >= 700 ? 2 : 1;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const text = `${event.title} ${event.location} ${event.category}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      const matchesFilter =
        filter === 'Todos' ||
        event.date.includes(filter) ||
        event.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContainer,
          isMobile && styles.scrollContainerMobile,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.headerTextBox}>
            <Text style={styles.welcomeText}>¡Hola, {userName}!</Text>
            <Text style={styles.subtitleText}>
              Explora los eventos próximos disponibles
            </Text>
          </View>

          <Text style={styles.logoText}>Eventus</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationText}>🔔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.mainCard, isMobile && styles.mainCardMobile]}>
          <View style={[styles.searchRow, isMobile && styles.searchRowMobile]}>
            <View style={[styles.searchBox, isMobile && styles.fullWidth]}>
              <TextInput
                placeholder="Buscar eventos..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
              <Text style={styles.searchIcon}>🔍</Text>
            </View>

            <View style={[styles.filterWrapper, isMobile && styles.fullWidth]}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Text style={styles.filterText}>{filter}</Text>
                <Text style={styles.filterArrow}>⌄</Text>
              </TouchableOpacity>

              {showFilters && (
                <View style={styles.filterMenu}>
                  {FILTERS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.filterOption}
                      onPress={() => {
                        setFilter(option);
                        setShowFilters(false);
                      }}
                    >
                      <Text style={styles.filterOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.eventsGrid}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.eventCard,
                    {
                      width: columns === 1 ? '100%' : `${100 / columns}%`,
                    },
                  ]}
                  onPress={() => navigation.navigate('EventDetail', { event: item })}
                  activeOpacity={0.85}
                >
                  <View style={styles.eventCardInner}>
                    <View style={styles.cardImage}>
                      <Text style={styles.cardIcon}>🎉</Text>
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>

                      <Text style={styles.eventTitle}>{item.title}</Text>

                      <Text style={styles.eventInfo}>📅 {item.date}</Text>
                      <Text style={styles.eventInfo}>⏰ {item.time}</Text>
                      <Text style={styles.eventLocation}>📍 {item.location}</Text>

                      <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => navigation.navigate('EventDetail', { event: item })}
                      >
                        <Text style={styles.detailButtonText}>Ver detalles</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay eventos disponibles.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#f5f7fb',
  },

  scrollView: {
    flex: 1,
    maxHeight: Platform.OS === 'web' ? '100vh' : undefined,
    overflow: Platform.OS === 'web' ? 'scroll' : 'visible',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  scrollContainerMobile: {
    paddingBottom: 60,
  },

  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },

  headerMobile: {
    alignItems: 'flex-start',
  },

  headerTextBox: {
    flexShrink: 1,
  },

  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitleText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 3,
  },

  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563eb',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  notificationText: {
    fontSize: 18,
  },

  logoutButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },

  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  mainCard: {
    margin: 24,
    padding: 22,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    minHeight: 480,
  },

  mainCardMobile: {
    margin: 14,
    padding: 16,
    borderRadius: 22,
  },

  searchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 22,
    zIndex: 20,
  },

  searchRowMobile: {
    flexDirection: 'column',
  },

  searchBox: {
    flex: 1,
    minWidth: 250,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  fullWidth: {
    width: '100%',
    minWidth: '100%',
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    outlineStyle: 'none',
  },

  searchIcon: {
    fontSize: 16,
  },

  filterWrapper: {
    minWidth: 170,
    flexGrow: 1,
    position: 'relative',
    zIndex: 50,
  },

  filterButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },

  filterArrow: {
    fontSize: 22,
    color: '#334155',
    marginTop: -6,
  },

  filterMenu: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    elevation: 6,
    zIndex: 99,
  },

  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  filterOptionText: {
    fontSize: 14,
    color: '#334155',
  },

  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },

  eventCard: {
    paddingHorizontal: 8,
    marginBottom: 18,
  },

  eventCardInner: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  cardImage: {
    height: 120,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIcon: {
    fontSize: 42,
  },

  cardContent: {
    padding: 16,
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginBottom: 10,
  },

  categoryText: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 12,
  },

  eventTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },

  eventInfo: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },

  eventLocation: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
  },

  detailButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },

  detailButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },

  emptyText: {
    width: '100%',
    textAlign: 'center',
    marginTop: 40,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    right: 26,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },

  fabText: {
    color: '#ffffff',
    fontSize: 34,
    marginTop: -3,
  },
});