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
// Importaciones clave de Firestore para consultar y escuchar colecciones reactivamente
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../api/firebase';
import { useRoute } from '@react-navigation/native';
import CreateEventScreen from './CreateEventScreen'; // Pantalla interna reutilizada como Modal contextual

// Filtros estáticos para la clasificación cronológica de las actividades
const TIME_FILTERS = [
  'Todos',
  'Esta semana',
  'Semana anterior',
  'Este mes',
  'Hace seis meses',
  'Un año',
  'Tiempo atrás',
];

// Diccionario de emojis asignados por clave-valor a cada categoría comunitaria
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

// Catálogo estático para el filtrado por categorías de la interfaz
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
  // Inicialización de estados locales para la lista, búsquedas, filtros y visibilidad de modales
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [showTimeFilters, setShowTimeFilters] = useState(false);
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentUser = auth.currentUser;

  // Parsea la autoría del usuario firmado: Nombre completo -> Prefijo del Email -> Fallback seguro
  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Usuario';

  // Sistema reactivo para capturar las dimensiones del viewport actual (Web / Mobile)
  const { width } = useWindowDimensions();

  // Variables de diseño lógico: Determina layouts móviles y el número de columnas para el Grid responsivo
  const isMobile = width < 650;
  const columns = width >= 1000 ? 3 : width >= 700 ? 2 : 1;

  /**
   * Cierra de forma segura la sesión activa en el proveedor Firebase Auth
   */
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // Destruye el historial de rutas y redirige al Login
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  /**
   * MEMOIZED FILTER: Filtra los eventos en memoria local de forma ultra optimizada.
   * Evita re-cálculos costosos si los estados de búsqueda o filtros no han cambiado.
   */
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    return events.filter((event) => {
      // 1. Filtrado por barra de búsqueda por coincidencia de texto en minúsculas
      const text = `${event.title} ${event.location} ${event.category}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      // 2. Filtrado lógico por categorías
      const matchesCategory =
        categoryFilter === 'Todas' || event.category === categoryFilter;

      // 3. Filtrado temporal real basado en el timestamp del evento
      const ts = event.dateTimestamp || 0;
      let matchesTime = true;

      if (timeFilter === 'Esta semana') {
        // Eventos desde hoy hasta 7 días en el futuro
        matchesTime = ts >= startOfToday && ts <= startOfToday + oneWeekMs;
      } else if (timeFilter === 'Semana anterior') {
        // Eventos que ocurrieron en los últimos 7 días
        matchesTime = ts >= startOfToday - oneWeekMs && ts < startOfToday;
      } else if (timeFilter === 'Este mes') {
        // Eventos dentro del mes calendario actual
        const eventDate = new Date(ts);
        matchesTime = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'Hace seis meses') {
        // Eventos pasados en los últimos 6 meses
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        matchesTime = ts >= sixMonthsAgo.getTime() && ts < startOfToday;
      } else if (timeFilter === 'Un año') {
        // Eventos pasados en el último año
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        matchesTime = ts >= oneYearAgo.getTime() && ts < startOfToday;
      } else if (timeFilter === 'Tiempo atrás') {
        // Eventos con más de un año de antigüedad
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        matchesTime = ts < oneYearAgo.getTime();
      }

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [events, search, categoryFilter, timeFilter]);

  /**
   * Componente UI Interno Reutilizable: Botón interactivo con estados de Hover (Web) y Pressed (Móvil)
   */
  const AnimatedPressable = ({ children, style, hoverStyle, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        style,
        hoverStyle && hovered && hoverStyle,
        pressed && styles.buttonPressed, // Efecto nativo de escala al presionar
      ]}
    >
      {children}
    </Pressable>
  );

  // EFFECT: Suscripción en tiempo real a toda la colección de 'events' ordenada por fecha de creación
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const route = useRoute();
  const [showSuccess, setShowSuccess] = useState(false);

  // Referencias mutables para el motor de animaciones nativas de React Native
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  // EFFECT: Dispara una coreografía de animaciones tipo "Toast Popup" si se detecta un evento creado exitosamente
  useEffect(() => {
    if (route.params?.eventCreated) {
      setShowSuccess(true);

      // Animación en paralelo: Escala el tamaño con efecto resorte (Spring) y realiza el desvanecimiento (FadeIn)
      Animated.parallel([
        Animated.spring(popupScale, {
          toValue: 1,
          friction: 4,
          tension: 90,
          useNativeDriver: true, // Optimización nativa por hardware
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      // Temporizador automático de desvanecimiento tras 2.2 segundos en pantalla
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
          navigation.setParams({ eventCreated: false }); // Limpia los parámetros de navegación de forma segura
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
        {/* ENCABEZADO MULTIPLATAFORMA (Renderiza Layout Mobile o Desktop según el viewport) */}
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          {isMobile ? (
            <>
              {/* Layout para Dispositivos Móviles */}
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

              {/* Botones de navegación interna para la barra móvil */}
              <View style={styles.headerActionsMobile}>
                <AnimatedPressable
                  style={styles.notificationButton}
                  hoverStyle={styles.buttonHover}
                  onPress={() => navigation.navigate('History')}
                >
                  <Text style={styles.notificationText}>📋</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.notificationButton}
                  hoverStyle={styles.buttonHover}
                  onPress={() => navigation.navigate('Stats')}
                >
                  <Text style={styles.notificationText}>📊</Text>
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
              {/* Layout para Navegadores de Escritorio (Desktop) */}
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
                  onPress={() => navigation.navigate('History')}
                >
                  <Text style={styles.notificationText}>📋</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.notificationButton}
                  hoverStyle={styles.buttonHover}
                  onPress={() => navigation.navigate('Stats')}
                >
                  <Text style={styles.notificationText}>📊</Text>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.logoutButton}
                  hoverStyle={styles.darkButtonHover}
                  onSignOut={handleSignOut}
                  onPress={handleSignOut}
                >
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </AnimatedPressable>
              </View>
            </>
          )}
        </View>

        {/* TARJETA CONTENEDORA PRINCIPAL */}
        <View style={[styles.mainCard, isMobile && styles.mainCardMobile]}>
          
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
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

            {/* Selector Desplegable: Filtro por Tiempo */}
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
                    setShowCategoryFilters(false); // Cierre de seguridad del menú hermano
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

            {/* Selector Desplegable: Filtro por Categorías */}
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
                    setShowTimeFilters(false); // Cierre de seguridad del menú hermano
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

          {/* GRID RESPONSIVO DE EVENTOS COMUNITARIOS */}
          <View style={styles.eventsGrid}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.eventCard,
                    {
                      width: columns === 1 ? '100%' : `${100 / columns}%`, // Calcula el ancho de la tarjeta según la pantalla
                    },
                  ]}
                >
                  <View style={styles.eventCardInner}>
                    {/* Baner de Identidad Visual del Card basado en Emojis */}
                    <View style={styles.cardImage}>
                      <Text style={styles.cardIcon}>
                        {CATEGORY_EMOJIS[item.category] || '🎉'}
                      </Text>
                    </View>

                    {/* Contenido Descriptivo e Informativo */}
                    <View style={styles.cardContent}>
                      <View style={styles.cardTopInfo}>
                        <View style={styles.creatorPill}>
                          <Text style={styles.creatorText}>
                            <Text style={styles.creatorBold}>Creado por:</Text> {(() => {
                              const cb = item.createdBy;
                              if (!cb || cb === 'anon') return 'Usuario';
                              const isUid = cb.length > 20 && !cb.includes(' ') && !cb.includes('@');
                              if (isUid) {
                                if (currentUser && (cb === currentUser.uid || item.createdByUid === currentUser.uid)) {
                                  return currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario';
                                }
                                return 'Usuario';
                              }
                              return cb;
                            })()}
                          </Text>
                        </View>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryText}>{CATEGORY_EMOJIS[item.category] || '🏷'} {item.category}</Text>
                        </View>
                      </View>

                      <Text style={styles.eventTitle}>{item.title}</Text>

                      <Text style={styles.eventInfo}>📅 {item.date}</Text>
                      <Text style={styles.eventInfo}>⏰ {item.time}</Text>
                      <Text style={styles.eventLocation}>📍 {item.location}</Text>

                      {/* Botón de Enlace para redirección al detalle específico */}
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
              // Mensaje Alternativo por si no hay coincidencias lógicas de filtrado
              <Text style={styles.emptyText}>No hay eventos disponibles.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* POPUP FLOTANTE DE ACCIÓN EXITOSA (ANIMADO) */}
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

      {/* OVERLAY DEL FORMULARIO DE CREACIÓN (MODAL CONTEXTUAL CON DESENFOQUE) */}
      {showCreateForm && (
        <View style={styles.modalOverlay}>
          <CreateEventScreen
            createdBy={userName}
            onClose={() => setShowCreateForm(false)}
            onCreated={() => {
              setShowCreateForm(false);
              setShowSuccess(true); // Despierta el efecto de guardado
            }}
          />
        </View>
      )}

      {/* BOTÓN FLOTANTE DE ACCIÓN RÁPIDA (FAB) PARA LA APERTURA DEL FORMULARIO */}
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

// Hoja de estilos premium optimizada con paleta institucional verde, z-indexings controlados y sombras fluidas
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