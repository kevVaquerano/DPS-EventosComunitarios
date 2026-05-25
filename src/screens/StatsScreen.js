import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';

export default function StatsScreen() {
  // Datos simulados para las estadísticas de la comunidad
  const totalEvents = 24;
  const totalAttendees = 348;
  const activeUsers = 89;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>📊 Estadísticas Comunitarias</Text>
        <Text style={styles.subtitle}>Resumen de impacto de Eventus</Text>

        {/* Contenedor de Tarjetas Principales */}
        <View style={styles.statsGrid}>
          <View style={[styles.card, { borderLeftColor: '#1E90FF' }]}>
            <Text style={styles.cardEmoji}>📅</Text>
            <Text style={styles.cardNumber}>{totalEvents}</Text>
            <Text style={styles.cardLabel}>Eventos Creados</Text>
          </View>

          <View style={[styles.card, { borderLeftColor: '#2ECC71' }]}>
            <Text style={styles.cardEmoji}>👥</Text>
            <Text style={styles.cardNumber}>{totalAttendees}</Text>
            <Text style={styles.cardLabel}>Asistentes Totales</Text>
          </View>
        </View>

        {/* Tarjeta de Usuarios Activos */}
        <View style={styles.longCard}>
          <View style={styles.longCardHeader}>
            <Text style={styles.longCardTitle}>👤 Vecinos Activos hoy</Text>
            <Text style={styles.longCardNumber}>{activeUsers}</Text>
          </View>
          <Text style={styles.longCardDesc}>Usuarios interactuando y registrándose en actividades de la comunidad.</Text>
        </View>

        {/* Sección de Categorías Populares */}
        <Text style={styles.sectionTitle}>Categorías más Populares</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>⚽ Deportes y Recreación</Text>
            <Text style={styles.progressPercent}>45%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '45%', backgroundColor: '#1E90FF' }]} />
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>🎨 Talleres y Cultura</Text>
            <Text style={styles.progressPercent}>35%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '35%', backgroundColor: '#9B59B6' }]} />
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>🧹 Voluntariado / Ecología</Text>
            <Text style={styles.progressPercent}>20%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '20%', backgroundColor: '#2ECC71' }]} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 25 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: '#fff', width: '47%', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ebeeef', borderLeftWidth: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardEmoji: { fontSize: 24, marginBottom: 5 },
  cardNumber: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  cardLabel: { fontSize: 13, color: '#666', marginTop: 2 },
  longCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#ebeeef', marginBottom: 25, elevation: 2 },
  longCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  longCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  longCardNumber: { fontSize: 22, fontWeight: 'bold', color: '#E67E22' },
  longCardDesc: { fontSize: 13, color: '#777', lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  progressContainer: { marginBottom: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 14, color: '#444', fontWeight: '500' },
  progressPercent: { fontSize: 14, color: '#777', fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#ebeeef', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 }
});