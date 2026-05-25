import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../api/firebase'; // Corrección de la ruta y nombre del archivo

// Datos de prueba simulados para que la comunidad visualice eventos de inmediato
const EVENTOS_DUMMY = [
  {
    id: '1',
    title: 'Campaña de Reciclaje Local',
    date: '28 de Mayo, 2026',
    time: '8:00 AM',
    location: 'Parque Central de la Comunidad',
    description: 'Trae tus botellas de plástico, cartón y latas para ayudar a limpiar nuestro entorno.'
  },
  {
    id: '2',
    title: 'Torneo de Fútbol Comunitario',
    date: '30 de Mayo, 2026',
    time: '2:00 PM',
    location: 'Cancha Municipal',
    description: 'Inscripciones abiertas para equipos de todas las edades. ¡Premios para los tres primeros lugares!'
  },
  {
    id: '3',
    title: 'Taller de Huertos Caseros',
    date: '02 de Junio, 2026',
    time: '10:00 AM',
    location: 'Centro Escolar Comunitario',
    description: 'Aprende a cultivar tus propias verduras y legumbres orgánicas en el patio de tu casa.'
  }
];

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState(EVENTOS_DUMMY);

  // Función obligatoria para salir de la cuenta de Firebase de forma segura
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  // Renderizador de las tarjetas de los eventos
  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { event: item })} // Conecta con la Persona 3
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDetails}>📅 {item.date} — ⏰ {item.time}</Text>
      <Text style={styles.eventLocation}>📍 {item.location}</Text>
      <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado Principal */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Hola, Comunidad!</Text>
        <Text style={styles.subtitleText}>Explora los eventos próximos disponibles</Text>
      </View>

      {/* Lista de Eventos (Módulo Gestión de Eventos) */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay eventos comunitarios programados.</Text>}
      />

      {/* Botonera de Acciones Rápidas */}
      <View style={styles.footerMenu}>
        <TouchableOpacity 
          style={[styles.footerButton, styles.createButton]} 
          onPress={() => navigation.navigate('CreateEvent')} // Conecta con la Persona 1
        >
          <Text style={styles.buttonText}>➕ Crear Evento</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.footerButton, styles.logoutButton]} 
          onPress={handleSignOut}
        >
          <Text style={styles.buttonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#1E90FF', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, marginBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitleText: { fontSize: 14, color: '#e0f0ff', marginTop: 4 },
  listContainer: { padding: 15 },
  eventCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ebeeef', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  eventDetails: { fontSize: 13, fontWeight: '600', color: '#1E90FF', marginBottom: 4 },
  eventLocation: { fontSize: 13, color: '#666', fontWeight: '500', marginBottom: 8 },
  eventDescription: { fontSize: 14, color: '#777', lineHeight: 20 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
  footerMenu: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', justifyContent: 'space-between' },
  footerButton: { flex: 0.48, padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  createButton: { backgroundColor: '#2ecc71' },
  logoutButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});