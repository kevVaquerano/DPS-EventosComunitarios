import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';

const EventDetailScreen = ({ route, navigation }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: '1', user: 'Ana M.', text: '¡Qué buena iniciativa! Allí estaré.' },
    { id: '2', user: 'Juan P.', text: '¿Hay que llevar herramientas propias?' }
  ]);

  const handleAddComment = () => {
    if (comment.trim() === '') return;

    const newComment = {
      id: Date.now().toString(),
      user: 'Tú (Vecino)',
      text: comment
    };

    setCommentsList([...commentsList, newComment]);
    setComment('');
  };

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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
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

          <Text style={styles.descriptionTitle}>Descripción del Evento:</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        {/* Sección de Puntuación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Puntuar este evento</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.star, rating >= star && styles.starActive]}>
                  {rating >= star ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sección de Comentarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentarios de la Comunidad</Text>
          
          <View style={styles.commentInputRow}>
            <TextInput 
              style={styles.input} 
              placeholder="Escribe un comentario..." 
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>

          {commentsList.map((item) => (
            <View key={item.id} style={styles.commentItem}>
              <Text style={styles.commentUser}>{item.user}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botón inferior fijo */}
      <View style={{ padding: 20 }}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>⬅️ Volver a Inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#ebeeef', elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E90FF', marginBottom: 20, textAlign: 'center' },
  infoRow: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingBottom: 6 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#333', width: 80 },
  value: { fontSize: 15, color: '#555', flex: 1 },
  descriptionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 6 },
  descriptionText: { fontSize: 15, color: '#666', lineHeight: 22 },
  section: { marginTop: 25, backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ebeeef' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  starsRow: { flexDirection: 'row', justifyContent: 'center' },
  star: { fontSize: 35, color: '#ccc', marginHorizontal: 5 },
  starActive: { color: '#FFD700' },
  commentInputRow: { flexDirection: 'row', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#f1f3f5', borderRadius: 8, padding: 10, marginRight: 10 },
  sendButton: { backgroundColor: '#1E90FF', borderRadius: 8, padding: 10, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  commentItem: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingVertical: 10 },
  commentUser: { fontWeight: 'bold', color: '#1E90FF', fontSize: 14 },
  commentText: { color: '#555', marginTop: 2 },
  backButton: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});