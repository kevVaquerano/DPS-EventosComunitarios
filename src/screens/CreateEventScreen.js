import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateEvent = () => {
    if (!title || !date || !time || !location || !description) {
      Alert.alert('Campos incompletos', 'Por favor, llena todos los campos para publicar el evento.');
      return;
    }

    // Aquí se integrará más adelante la lógica de Firebase Firestore
    console.log('Evento a crear:', { title, date, time, location, description });
    
    Alert.alert(
      '¡Éxito!', 
      'El evento ha sido creado correctamente.',
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Nuevo Evento</Text>
      <Text style={styles.subtitle}>Completa la información para tu comunidad</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre del Evento</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ej: Campaña de Limpieza" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Fecha</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="12 Oct, 2024" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Hora</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="09:00 AM" />
          </View>
        </View>

        <Text style={styles.label}>Ubicación</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Ej: Parque Central" />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="¿De qué trata el evento?"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
          <Text style={styles.buttonText}>Publicar Evento</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#fcfcfc' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});