import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

const EventDetailScreen = ({ route, navigation }) => {
  // Recibe los datos del evento de forma segura o usa unos por defecto si no vienen
  const { event } = route.params || {
    event: {
      title: 'Detalle del Evento',
      date: 'Fecha no especificada',
      time: 'Hora no especificada',
      location: 'Lugar no especificado',
      description: 'No hay descripción disponible para este evento actualmente.'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>📅 Fecha:</Text>
          <Text style={styles.value}>{event.date}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>⏰ Hora:</Text>
          <Text style={styles.value}>{event.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📍 Lugar:</Text>
          <Text style={styles.value}>{event.location}</Text>
        </View>

        <Text style={styles.descriptionTitle}>Descripción del Evento:</Text>
        <Text style={styles.descriptionText}>{event.description}</Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>⬅️ Volver a Inicio</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#ebeeef', elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E90FF', marginBottom: 20, textAlign: 'center' },
  infoRow: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingBottom: 6 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#333', width: 80 },
  value: { fontSize: 15, color: '#555', flex: 1 },
  descriptionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 6 },
  descriptionText: { fontSize: 15, color: '#666', lineHeight: 22 },
  backButton: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});