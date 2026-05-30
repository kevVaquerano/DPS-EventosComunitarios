import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../api/firebase';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.innerHTML = `
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      opacity: 0;
      display: none;
      -webkit-appearance: none;
    }
  `;
  document.head.appendChild(style);
}

const CATEGORIES = [
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

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDateDisplay(iso) {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  const m = parseInt(month, 10);
  if (m < 1 || m > 12) return iso;
  return `${parseInt(day, 10)} de ${MONTHS_ES[m - 1]}, ${year}`;
}

// Soporta tres modos: modal inline, navegación para crear y navegación para editar (route.params.event)
export default function CreateEventScreen({ navigation, route, onClose, onCreated, createdBy: createdByProp }) {
  const editingEvent = route?.params?.event || null;

  const { width } = useWindowDimensions();
  const isMobile = width < 650;

  const today = new Date().toISOString().split('T')[0];
  const currentUser = auth.currentUser;
  const createdBy = createdByProp || currentUser?.displayName || currentUser?.email || 'Usuario';

  const handleClose = () => {
    if (onClose) onClose();
    else if (navigation) navigation.goBack();
  };

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [category, setCategory] = useState(editingEvent?.category || 'Comunidad');
  const [showCategories, setShowCategories] = useState(false);
  const [startDate, setStartDate] = useState(editingEvent?.dateISO || today);
  const [endDate, setEndDate] = useState(editingEvent?.dateISO || today);
  const [time, setTime] = useState(editingEvent?.time || '');
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [loading, setLoading] = useState(false);

  const handleStartDate = (value) => {
    setStartDate(value);
    if (endDate < value) setEndDate(value);
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !category || !startDate || !endDate || !time || !location) {
      Alert.alert('Campos incompletos', 'Por favor, llena todos los campos.');
      return;
    }
    if (startDate < today || endDate < today) {
      Alert.alert('Fecha inválida', 'Las fechas no pueden ser anteriores a la fecha actual.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Fecha inválida', 'La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }

    setLoading(true);
    try {
      const dateTimestamp = new Date(startDate + 'T00:00:00').getTime();
      const dateDisplay = formatDateDisplay(startDate);

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), {
          title, description, category,
          date: dateDisplay, dateISO: startDate, dateTimestamp,
          time, location,
          updatedAt: serverTimestamp(),
        });
        Alert.alert('¡Actualizado!', 'El evento fue actualizado correctamente.', [
          { text: 'Aceptar', onPress: () => navigation?.goBack() },
        ]);
      } else {
        await addDoc(collection(db, 'events'), {
          title, description, category,
          createdBy: createdBy,
          createdByUid: currentUser?.uid || 'anon',
          date: dateDisplay, dateISO: startDate, dateTimestamp,
          time, location,
          attendees: [],
          createdAt: serverTimestamp(),
        });
        if (onCreated) {
          onCreated();
        } else {
          Alert.alert('¡Éxito!', 'El evento ha sido creado correctamente.', [
            { text: 'Aceptar', onPress: () => navigation?.navigate('Home') },
          ]);
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo guardar el evento. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, isMobile && styles.cardMobile]}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{editingEvent ? 'Editar Evento' : 'Crear Evento'}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Text style={styles.label}>Nombre del evento:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Campaña de reciclaje"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Descripción:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe brevemente el evento"
            placeholderTextColor="#94a3b8"
            multiline
          />

        <View 
          style={[
            styles.row, 
            isMobile && styles.rowMobile, 
            // Eleva la fila al primer plano solo cuando el desplegable está abierto
            { zIndex: showCategories ? 1000 : 1, elevation: showCategories ? 5 : 0 }
          ]}
        >
            <View style={styles.field}>
              <Text style={styles.label}>Categoría:</Text>

              <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowCategories(!showCategories)}
                >
                  <Text style={styles.dropdownText}>{category}</Text>
                  <Text style={styles.dropdownArrow}>
                    {showCategories ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showCategories && (
                  <View style={styles.dropdownMenu}>
                    {CATEGORIES.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setCategory(item);
                          setShowCategories(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Creado por:</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={createdBy}
                editable={false}
              />
            </View>
          </View>

          <View style={[styles.row, isMobile && styles.rowMobile]}>
            <View style={styles.field}>
              <Text style={styles.label}>Fecha de inicio:</Text>

              {Platform.OS === 'web' ? (
                <View style={styles.webPickerBox}>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => handleStartDate(e.target.value)}
                    style={webInput}
                  />

                  <View style={styles.webPickerIconBox}>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={handleStartDate}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fecha de fin:</Text>

              {Platform.OS === 'web' ? (
                <View style={styles.webPickerBox}>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={webInput}
                  />

                  <View style={styles.webPickerIconBox}>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
              )}
            </View>
          </View>

          <View style={[styles.row, isMobile && styles.rowMobile]}>
            <View style={styles.field}>
              <Text style={styles.label}>Hora:</Text>

              {Platform.OS === 'web' ? (
                <View style={styles.webPickerBox}>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={webInput}
                  />

                  <View style={styles.webPickerIconBox}>
                    <Text style={{ fontSize: 18 }}>⏰</Text>
                  </View>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="08:00"
                  placeholderTextColor="#94a3b8"
                />
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Lugar:</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Ej: Parque Central"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, isMobile && styles.footerMobile]}>
          <TouchableOpacity
            style={[styles.acceptButton, isMobile && styles.fullButton]}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            <Text style={styles.acceptText}>{loading ? 'Guardando...' : editingEvent ? 'Actualizar' : 'Aceptar'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.cancelButton, isMobile && styles.fullButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const webInput = {
  flex: 1,
  height: 48,
  boxSizing: 'border-box',
  paddingLeft: 14,
  paddingRight: 10,
  fontSize: 14,
  color: '#0f172a',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  webPickerBox: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#307A00',
    backgroundColor: '#F4FEEF',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  webPickerIconBox: {
    width: 50,
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: '#307A00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 720,
    height: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },

  cardMobile: {
    borderRadius: 22,
    height: '95%',
  },

  header: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
  },

  closeButton: {
    position: 'absolute',
    right: 18,
    top: 16,
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 28,
    color: '#94a3b8',
    marginTop: -2,
  },

  body: {
    flex: 1,
  },

  form: {
    padding: 28,
    paddingBottom: 35,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#307A00',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#F4FEEF',
    marginBottom: 18,
    outlineStyle: 'none',
  },

  disabledInput: {
    color: '#64748b',
    backgroundColor: '#D6E7CF',
  },

  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  row: {
    flexDirection: 'row',
    gap: 38,
  },

  rowMobile: {
    flexDirection: 'column',
    gap: 0,
  },

  field: {
    flex: 1,
    minWidth: 0,
  },

  dropdownWrapper: {
    position: 'relative',
    zIndex: 9999,
    marginBottom: 18,
  },

  dropdownButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#307A00',
    backgroundColor: '#F4FEEF',
    paddingLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },

  dropdownArrow: {
    height: 48,
    width: 46,
    textAlign: 'center',
    lineHeight: 48,
    borderLeftWidth: 1,
    borderLeftColor: '#307A00',
    fontSize: 20,
    color: '#307A00',
  },

  dropdownMenu: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#307A00',
    overflow: 'hidden',
    zIndex: 99999,
    elevation: 20,
  },

  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  dropdownOptionText: {
    fontSize: 14,
    color: '#334155',
  },

  footer: {
    minHeight: 88,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: '#ffffff',
  },

  footerMobile: {
    flexDirection: 'column-reverse',
    gap: 12,
    minHeight: 130,
  },

  cancelButton: {
    width: 180,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    width: 180,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2a7326',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullButton: {
    width: '100%',
  },

  cancelText: {
    color: '#334155',
    fontWeight: '800',
  },

  acceptText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});