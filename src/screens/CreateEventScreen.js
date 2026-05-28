import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity,
  View, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../api/firebase';
import { useResponsive } from '../utils/responsive';

const CATEGORIES = ['Comunidad', 'Deportes', 'Educación', 'Cultura', 'Voluntariado'];

const MONTHS_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
];

// Convierte "2026-06-15" a "15 de junio, 2026" para mostrarlo al usuario
function formatDateDisplay(iso) {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  const m = parseInt(month, 10);
  if (m < 1 || m > 12) return iso;
  return `${parseInt(day, 10)} de ${MONTHS_ES[m - 1]}, ${year}`;
}

// Se guarda como timestamp Unix (ms) para poder ordenar y filtrar en Firestore
function parseDateTimestamp(iso) {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d.getTime();
}

export default function CreateEventScreen({ navigation, route }) {
  // Si se pasa un evento por params, es modo edición
  const editingEvent = route.params?.event || null;
  const { isMobile, hPad, fs, sp } = useResponsive();

  const [title, setTitle]             = useState(editingEvent?.title || '');
  const [dateISO, setDateISO]         = useState(editingEvent?.dateISO || '');
  const [time, setTime]               = useState(editingEvent?.time || '');
  const [location, setLocation]       = useState(editingEvent?.location || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [category, setCategory]       = useState(editingEvent?.category || 'Comunidad');
  const [loading, setLoading]         = useState(false);

  const validateDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);

  const handleSave = async () => {
    if (!title || !dateISO || !time || !location || !description) {
      Alert.alert('Campos incompletos', 'Por favor, llena todos los campos.');
      return;
    }
    if (!validateDate(dateISO)) {
      Alert.alert('Fecha inválida', 'Usa el formato AAAA-MM-DD. Ejemplo: 2026-06-15');
      return;
    }

    const dateTimestamp = parseDateTimestamp(dateISO);
    const dateDisplay   = formatDateDisplay(dateISO);

    setLoading(true);
    try {
      if (editingEvent) {
        // En edición se actualiza solo los campos editables; createdBy y attendees se mantienen
        await updateDoc(doc(db, 'events', editingEvent.id), {
          title, date: dateDisplay, dateISO, dateTimestamp, time, location, description, category,
          updatedAt: serverTimestamp(),
        });
        Alert.alert('¡Actualizado!', 'El evento fue actualizado correctamente.', [
          { text: 'Aceptar', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addDoc(collection(db, 'events'), {
          title, date: dateDisplay, dateISO, dateTimestamp, time, location, description, category,
          createdBy: auth.currentUser?.uid || 'anon',
          attendees: [],
          createdAt: serverTimestamp(),
        });
        Alert.alert('¡Éxito!', 'El evento ha sido creado correctamente.', [
          { text: 'Aceptar', onPress: () => navigation.navigate('Home') },
        ]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo guardar el evento. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad, paddingVertical: sp.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={[styles.headerTitle, { fontSize: fs.xl }]}>
            {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
          </Text>
          <Text style={[styles.subtitle, { fontSize: fs.sm }]}>
            Completa la información para tu comunidad
          </Text>

          <Text style={[styles.label, { fontSize: fs.sm }]}>Nombre del Evento</Text>
          <TextInput
            style={[styles.input, { fontSize: fs.md }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Campaña de Limpieza"
          />

          {/* En mobile los campos de fecha y hora se apilan para no quedar muy angostos */}
          <View style={[styles.row, isMobile && styles.rowMobile]}>
            <View style={[styles.rowItem, !isMobile && { marginRight: 12 }]}>
              <Text style={[styles.label, { fontSize: fs.sm }]}>Fecha (AAAA-MM-DD)</Text>
              <TextInput
                style={[styles.input, { fontSize: fs.md }]}
                value={dateISO}
                onChangeText={setDateISO}
                placeholder="2026-06-15"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={[styles.label, { fontSize: fs.sm }]}>Hora</Text>
              <TextInput
                style={[styles.input, { fontSize: fs.md }]}
                value={time}
                onChangeText={setTime}
                placeholder="09:00 AM"
              />
            </View>
          </View>

          {/* Vista previa de la fecha en formato legible mientras el usuario escribe */}
          {dateISO.length === 10 && validateDate(dateISO) && (
            <Text style={[styles.datePreview, { fontSize: fs.xs }]}>
              📅 {formatDateDisplay(dateISO)}
            </Text>
          )}

          <Text style={[styles.label, { fontSize: fs.sm }]}>Ubicación</Text>
          <TextInput
            style={[styles.input, { fontSize: fs.md }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Ej: Parque Central"
          />

          <Text style={[styles.label, { fontSize: fs.sm }]}>Categoría</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, { fontSize: fs.xs }, category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { fontSize: fs.sm }]}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea, { fontSize: fs.md }]}
            value={description}
            onChangeText={setDescription}
            placeholder="¿De qué trata el evento?"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={[styles.saveBtnText, { fontSize: fs.md }]}>
              {loading ? 'Guardando...' : editingEvent ? 'Actualizar Evento' : 'Publicar Evento'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb' },
  scroll: { flexGrow: 1, alignItems: 'center' },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 640,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerTitle: { fontWeight: 'bold', color: '#0f172a' },
  subtitle: { color: '#64748b', marginBottom: 24, marginTop: 4 },
  label: { fontWeight: '600', color: '#444', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, marginBottom: 18, backgroundColor: '#fcfcfc', color: '#0f172a',
  },
  row: { flexDirection: 'row' },
  rowMobile: { flexDirection: 'column' },
  rowItem: { flex: 1 },
  datePreview: { color: '#2E8B57', fontWeight: '600', marginBottom: 14, marginTop: -10 },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f8f9fa' },
  chipActive: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  chipText: { color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { backgroundColor: '#a0d8b3' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
