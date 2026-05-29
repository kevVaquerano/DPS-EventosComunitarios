import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Image,
  Pressable,
  Animated,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../api/firebase';
import { useRoute } from '@react-navigation/native';
import CreateEventScreen from './CreateEventScreen';

const EVENTOS_DUMMY = [
  {
    id: '1',
    title: 'Campaña de Reciclaje Local',
    date: '28 de Mayo, 2026',
    dateISO: '2026-05-28',
    time: '8:00 AM',
    location: 'Parque Central de la Comunidad',
    category: 'Comunidad',
    createdBy: 'María López',
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
    createdBy: 'Luis Padilla',
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
    createdBy: 'Carliz Castillo',
    description: 'Aprende a cultivar tus propias verduras y legumbres orgánicas.',
  },
];

const TIME_FILTERS = [
  'Todos',
  'Esta semana',
  'Semana anterior',
  'Este mes',
  'Hace seis meses',
  'Un año',
  'Tiempo atrás',
];

const CATEGORY_EMOJIS = {
  Comunidad: '🤝',
  Deportes: '⚽',
  Educación: '📚',
  Salud: '🏥',
  Cultura: '🎭',
  Música: '🎵',
  MedioAmbiente: '🌱',
  Tecnología: '💻',
  Emprendimiento: '💼',
  Voluntariado: '🙋',
};

const CATEGORY_FILTERS = [
  'Todas',
  'Comunidad',
  'Deportes',
  'Educación',
  'Salud',
  'Cultura',
  'Música',
  'MedioAmbiente',
  'Tecnología',
  'Emprendimiento',
  'Voluntariado',
];

export default function HomeScreen({ navigation }) {
  const [events] = useState(EVENTOS_DUMMY);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [showTimeFilters, setShowTimeFilters] = useState(false);
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

      const matchesCategory =
        categoryFilter === 'Todas' || event.category === categoryFilter;

      const matchesTime =
        timeFilter === 'Todos' ||
        event.date.includes('Mayo') ||
        event.date.includes('Junio');

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [events, search, categoryFilter, timeFilter]);

  const AnimatedPressable = ({ children, style, hoverStyle, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        style,
        hovered && hoverStyle,
        pressed && styles.buttonPressed,
      ]}
    >
      {children}
    </Pressable>
  );

  const route = useRoute();
  const [showSuccess, setShowSuccess] = useState(false);

  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (route.params?.eventCreated) {
      setShowSuccess(true);

      Animated.parallel([
        Animated.spring(popupScale, {
          toValue: 1,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(popupScale, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(popupOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccess(false);
          navigation.setParams({ eventCreated: false });
        });
      }, 2200);
    }
  }, [route.params?.eventCreated]);

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
          {isMobile ? (
            <>
              <View style={styles.headerTopMobile}>
                <View style={styles.headerTextBoxMobile}>
                  <Text style={styles.welcomeText}>¡Hola, {userName}!</Text>
                  <Text style={styles.subtitleText}>
                    Explora los eventos próximos disponibles
                  </Text>
                </View>

                <Image
                  source={require('../images/EventusLogo.png')}
                  style={styles.logoImageMobile}
                />
              </View>

              <View style={styles.headerActionsMobile}>
                <AnimatedPressable
                  style={styles.notificationButton}
                  hoverStyle={styles.buttonHover}
                >
                  <Text style={styles.notificationText}>🔔</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.logoutButton}
                  hoverStyle={styles.darkButtonHover}
                  onPress={handleSignOut}
                >
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </AnimatedPressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.headerTextBox}>
                <Text style={styles.welcomeText}>¡Hola, {userName}!</Text>
                <Text style={styles.subtitleText}>
                  Explora los eventos próximos disponibles
                </Text>
              </View>

              <Image
                source={require('../images/EventusLogo.png')}
                style={styles.logoImage}
              />

              <View style={styles.headerActions}>
                <AnimatedPressable
                  style={styles.notificationButton}
                  hoverStyle={styles.buttonHover}
                >
                  <Text style={styles.notificationText}>🔔</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.logoutButton}
                  hoverStyle={styles.darkButtonHover}
                  onPress={handleSignOut}
                >
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </AnimatedPressable>
              </View>
            </>
          )}
        </View>

        <View style={[styles.mainCard, isMobile && styles.mainCardMobile]}>
          <View style={[styles.searchRow, isMobile && styles.searchRowMobile]}>
            <View style={[styles.searchBox, isMobile && styles.searchBoxMobile]}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                placeholder="Buscar eventos, lugares..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

           <View
              style={[
                styles.filterWrapper,
                styles.timeFilterBox,
                isMobile && styles.fullWidth,
                showTimeFilters && styles.dropdownOnTop,
              ]}
            >
              <View style={[styles.filterButton, isMobile && styles.filterButtonMobile]}>
                <Text style={styles.filterText}>{timeFilter}</Text>

                <Pressable
                  style={[styles.filterArrow, isMobile && styles.filterArrowMobile]}
                  onPress={() => {
                    setShowTimeFilters(!showTimeFilters);
                    setShowCategoryFilters(false);
                  }}
                >
                  <Text style={styles.filterArrowText}>
                    {showTimeFilters ? '▲' : '▼'}
                  </Text>
                </Pressable>
              </View>

              {showTimeFilters && (
                <View style={styles.filterMenu}>
                  {TIME_FILTERS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.filterOption}
                      onPress={() => {
                        setTimeFilter(option);
                        setShowTimeFilters(false);
                      }}
                    >
                      <Text style={styles.filterOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View
              style={[
                styles.filterWrapper,
                styles.categoryFilterBox,
                isMobile && styles.fullWidth,
                isMobile && styles.categoryFilterMobile,
                showCategoryFilters && styles.dropdownOnTop,
              ]}
            >
              <View style={[styles.filterButton, isMobile && styles.filterButtonMobile]}>
                <Text style={styles.filterText}>{categoryFilter}</Text>

                <Pressable
                  style={[styles.filterArrow, isMobile && styles.filterArrowMobile]}
                  onPress={() => {
                    setShowCategoryFilters(!showCategoryFilters);
                    setShowTimeFilters(false);
                  }}
                >
                  <Text style={styles.filterArrowText}>
                    {showCategoryFilters ? '▲' : '▼'}
                  </Text>
                </Pressable>
              </View>

              {showCategoryFilters && (
                <View style={styles.filterMenu}>
                  {CATEGORY_FILTERS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.filterOption}
                      onPress={() => {
                        setCategoryFilter(option);
                        setShowCategoryFilters(false);
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
                <View
                  key={item.id}
                  style={[
                    styles.eventCard,
                    {
                      width: columns === 1 ? '100%' : `${100 / columns}%`,
                    },
                  ]}
                >
                  <View style={styles.eventCardInner}>
                    <View style={styles.cardImage}>
                      <Text style={styles.cardIcon}>
                        {CATEGORY_EMOJIS[item.category] || '🎉'}
                      </Text>
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.cardTopInfo}>
                        <View style={styles.creatorPill}>
                          <Text style={styles.creatorText}>
                            <Text style={styles.creatorBold}>Creado por:</Text> {item.createdBy || 'Usuario'}
                          </Text>
                        </View>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                      </View>

                      <Text style={styles.eventTitle}>{item.title}</Text>

                      <Text style={styles.eventInfo}>📅 {item.date}</Text>
                      <Text style={styles.eventInfo}>⏰ {item.time}</Text>
                      <Text style={styles.eventLocation}>📍 {item.location}</Text>

                      <AnimatedPressable
                        style={styles.detailButton}
                        hoverStyle={styles.darkButtonHover}
                        onPress={() => navigation.navigate('EventDetail', { event: item })}
                      >
                        <Text style={styles.detailButtonText}>Ver detalles</Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay eventos disponibles.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {showSuccess && (
        <Animated.View
          style={[
            styles.successPopup,
            {
              opacity: popupOpacity,
              transform: [{ scale: popupScale }],
            },
          ]}
        >
          <Text style={styles.successPopupText}>✅ Evento creado exitosamente</Text>
        </Animated.View>
      )}

      {showCreateForm && (
        <View style={styles.modalOverlay}>
          <CreateEventScreen
            createdBy={userName}
            onClose={() => setShowCreateForm(false)}
            onCreated={() => {
              setShowCreateForm(false);
              setShowSuccess(true);
            }}
          />
        </View>
      )}

      <AnimatedPressable
        style={styles.fab}
        hoverStyle={styles.fabHover}
        onPress={() => setShowCreateForm(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </AnimatedPressable>
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
    paddingVertical: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTopMobile: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },

  headerTextBoxMobile: {
    flexShrink: 1,
    maxWidth: 230,
  },

  logoImageMobile: {
    width: 135,
    height: 75,
    resizeMode: 'contain',
  },

  headerActionsMobile: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
    marginTop: 16,
  },

  headerTextBox: {
    flexShrink: 1,
    justifyContent: 'center',
  },

  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#06402B',
    marginTop: 0,
  },

  subtitleText: {
    fontSize: 14,
    color: '#006400',
    marginTop: 8,
  },

  logoImage: {
    width: 145,
    height: 75,
    resizeMode: 'contain',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },

  notificationButton: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#CEFCBA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#307A00',
  },

  notificationText: {
    fontSize: 22,
  },

  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#2a7326',
  },

  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
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
    overflow: 'visible',
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
    zIndex: 999,
  },

  searchRowMobile: {
    flexDirection: 'column',
    gap: 16,
  },

  searchBox: {
    flex: 1.7,
    minWidth: 350,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#307A00',
    backgroundColor: '#F4FEEF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  searchBoxMobile: {
    width: '100%',
    minWidth: 0,
    height: 48,
    paddingRight: 0,
  },

  fullWidth: {
    width: '100%',
    minWidth: 0,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    outlineStyle: 'none',
  },

  searchIcon: {
    fontSize: 24,
    color: '#307A00',
  },

  searchIconBox: {
    height: 48,
    width: 46,
    marginRight: -14,
    borderLeftWidth: 1,
    borderLeftColor: '#307A00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchIconBoxMobile: {
    marginRight: 0,
    height: '100%',
  },

  filterWrapper: {
    position: 'relative',
    zIndex: 50,
  },

  timeFilterBox: {
    flex: 0.6,
    minWidth: 190,
  },

  categoryFilterBox: {
    flex: 0.6,
    minWidth: 190,
    paddingBottom: 16,
  },

  filterButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#307A00',
    backgroundColor: '#F4FEEF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterButtonMobile: {
    width: '100%',
    paddingRight: 0,
  },

  categoryFilterMobile: {
    marginTop: 18,
  },

  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },

  filterArrow: {
    height: 48,
    width: 46,
    marginRight: -14,
    borderLeftWidth: 1,
    borderLeftColor: '#307A00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterArrowText: {
    textAlign: 'center',
    lineHeight: 48,
    fontSize: 22,
    color: '#307A00',
  },

  filterArrowMobile: {
    marginRight: 0,
    height: '100%',
  },

  filterMenu: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#307A00',
    overflow: 'hidden',
    elevation: 20,
    zIndex: 999,
  },

  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  filterOptionText: {
    fontSize: 14,
    color: '#334155',
  },

  dropdownOnTop: {
    zIndex: 9999,
    elevation: 9999,
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
    backgroundColor: '#E9FDE0',
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
    backgroundColor: '#E9FDE0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  categoryText: {
    color: '#004800',
    fontWeight: '800',
    fontSize: 12,
  },

  cardTopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },

  creatorPill: {
    backgroundColor: '#E9FDE0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexShrink: 1,
  },

  creatorText: {
    color: '#004800',
    fontSize: 12,
  },

  creatorBold: {
    fontWeight: '800',
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
    backgroundColor: '#2a7326',
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

  successPopup: {
    position: 'absolute',
    right: 82,
    bottom: 72,
    maxWidth: 240,
    backgroundColor: '#2a7326',
    borderWidth: 2,
    borderColor: '#CEFCBA',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 25,
    zIndex: 9999,
  },

  successPopupText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },

  buttonPressed: {
  transform: [{ scale: 0.9 }],
  opacity: 0.7,
},

  buttonHover: {
    transform: [{ scale: 1.04 }],
    backgroundColor: '#DDFCD1',
  },

  darkButtonHover: {
    transform: [{ scale: 1.04 }],
    backgroundColor: '#1f5f1d',
  },

  fabHover: {
    transform: [{ scale: 1.08 }],
    backgroundColor: '#16a34a',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 99999,
  },
});