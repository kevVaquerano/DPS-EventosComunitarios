import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert, Share, Platform,
} from 'react-native';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../api/firebase';
import { useResponsive } from '../utils/responsive';

// setNotificationHandler no existe en web; se limita a plataformas nativas
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
  });
}

async function scheduleEventNotification(event) {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    // Si el evento es en más de un día, notifica 24h antes; si no, notifica en 5s (demo)
    let seconds = 5;
    if (event.dateTimestamp) {
      const msUntil = event.dateTimestamp - Date.now();
      if (msUntil > 86400000) seconds = Math.floor((msUntil - 86400000) / 1000);
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Recordatorio de Evento',
        body: `"${event.title}" es el ${event.date} a las ${event.time} en ${event.location}.`,
        data: { eventId: event.id },
      },
      trigger: { seconds },
    });
  } catch { /* falla silenciosamente para no interrumpir el flujo del usuario */ }
}

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params || {
    event: { title: 'Evento', date: '', time: '', location: '', description: '', attendees: [] },
  };
  const { isMobile, hPad, fs } = useResponsive();

  const [rating, setRating]             = useState(0);
  const [comment, setComment]           = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [attendees, setAttendees]       = useState(event.attendees || []);
  const [submitting, setSubmitting]     = useState(false);

  const currentUser = auth.currentUser;
  const isAttending = currentUser && attendees.includes(currentUser.uid);
  const eventRef    = doc(db, 'events', event.id);

  useEffect(() => {
    if (!event.id) return;
    // Los comentarios se guardan en subcolección para no cargar el documento del evento completo
    const q = query(collection(db, 'events', event.id, 'comments'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setCommentsList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [event.id]);

  useEffect(() => {
    if (!event.id) return;
    // Se escucha el documento en tiempo real para reflejar cambios de asistencia de otros usuarios
    return onSnapshot(eventRef, (snap) => {
      if (snap.exists()) setAttendees(snap.data().attendees || []);
    });
  }, [event.id]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    if (!currentUser) { Alert.alert('Inicia sesión', 'Debes iniciar sesión para comentar.'); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'events', event.id, 'comments'), {
        user: currentUser.displayName || currentUser.email || 'Usuario',
        userId: currentUser.uid, // se guarda para poder verificar autoría al mostrar el botón de eliminar
        text: comment.trim(),
        rating,
        createdAt: serverTimestamp(),
      });
      setComment('');
      setRating(0);
    } catch {
      Alert.alert('Error', 'No se pudo enviar el comentario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Eliminar', '¿Eliminar tu comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteDoc(doc(db, 'events', event.id, 'comments', commentId)); }
        catch { Alert.alert('Error', 'No se pudo eliminar el comentario.'); }
      }},
    ]);
  };

  const handleRSVP = async () => {
    if (!currentUser) { Alert.alert('Inicia sesión', 'Debes iniciar sesión para confirmar asistencia.'); return; }
    try {
      if (isAttending) {
        // arrayRemove es atómico en Firestore, evita condiciones de carrera en escrituras concurrentes
        await updateDoc(eventRef, { attendees: arrayRemove(currentUser.uid) });
        Alert.alert('Cancelado', 'Has cancelado tu asistencia.');
      } else {
        await updateDoc(eventRef, { attendees: arrayUnion(currentUser.uid) });
        await scheduleEventNotification(event);
        Alert.alert(
          '¡Asistencia confirmada! 🎉',
          `Registrado en "${event.title}".\n📅 ${event.date} — ⏰ ${event.time}\n📍 ${event.location}\n\n¡Recibirás un recordatorio!`
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo actualizar tu asistencia.');
    }
  };

  const handleShare = async () => {
    const message = `🎉 ${event.title}\n📅 ${event.date} — ⏰ ${event.time}\n📍 ${event.location}\n\n${event.description}`;
    try {
      if (Platform.OS === 'web') {
        // navigator.share requiere HTTPS; en desarrollo se usa el portapapeles como alternativa
        if (navigator.share) await navigator.share({ title: event.title, text: message });
        else {
          await navigator.clipboard.writeText(message);
          Alert.alert('Copiado', 'Información del evento copiada al portapapeles.');
        }
      } else {
        await Share.share({ message });
      }
    } catch { /* el usuario canceló el diálogo de compartir */ }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad, paddingVertical: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>

          <View style={styles.card}>
            <Text style={[styles.title, { fontSize: fs.lg }]}>{event.title}</Text>
            {[
              ['📅 Fecha',      event.date],
              ['⏰ Hora',       event.time],
              ['📍 Lugar',      event.location],
              ['🏷 Categoría',  event.category],
              ['👥 Asistentes', `${attendees.length} confirmados`],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { fontSize: fs.sm }]}>{label}</Text>
                <Text style={[styles.infoValue, { fontSize: fs.sm }]}>{value}</Text>
              </View>
            ))}
            <Text style={[styles.descTitle, { fontSize: fs.sm }]}>Descripción:</Text>
            <Text style={[styles.descText, { fontSize: fs.sm }]}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: fs.md }]}>Confirmación de Asistencia</Text>
            <TouchableOpacity
              style={[styles.rsvpBtn, isAttending && styles.rsvpBtnActive]}
              onPress={handleRSVP}
            >
              <Text style={[styles.rsvpBtnText, { fontSize: fs.sm }]}>
                {isAttending ? '✅ Asistencia confirmada — Cancelar' : '📋 Confirmar mi asistencia'}
              </Text>
            </TouchableOpacity>
            {!isAttending && (
              <Text style={[styles.rsvpHint, { fontSize: fs.xs }]}>
                Al confirmar recibirás un recordatorio antes del evento.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: fs.md }]}>Compartir Evento</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={[styles.shareBtnText, { fontSize: fs.sm }]}>📤 Compartir este evento</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: fs.md }]}>Dejar un Comentario</Text>
            <Text style={[styles.ratingLabel, { fontSize: fs.xs }]}>Calificación:</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.star, rating >= star && styles.starActive]}>
                    {rating >= star ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.commentInput, { fontSize: fs.sm }]}
                placeholder="Escribe un comentario..."
                value={comment}
                onChangeText={setComment}
              />
              <TouchableOpacity
                style={[styles.sendBtn, submitting && styles.sendBtnDisabled]}
                onPress={handleAddComment}
                disabled={submitting}
              >
                <Text style={[styles.sendBtnText, { fontSize: fs.xs }]}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: fs.md }]}>Comentarios de la Comunidad</Text>
            {commentsList.length === 0 ? (
              <Text style={[styles.emptyComments, { fontSize: fs.sm }]}>Sé el primero en comentar.</Text>
            ) : commentsList.map((item) => {
              const isOwn = currentUser && item.userId === currentUser.uid;
              return (
                <View key={item.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentMeta}>
                      <Text style={[styles.commentUser, { fontSize: fs.sm }]}>{item.user}</Text>
                      {item.rating > 0 && (
                        <Text style={styles.commentRating}>{'★'.repeat(item.rating)}</Text>
                      )}
                    </View>
                    {/* El ícono de eliminar solo aparece para el autor del comentario */}
                    {isOwn && (
                      <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[styles.commentText, { fontSize: fs.sm }]}>{item.text}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { fontSize: fs.sm }]}>⬅️ Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f7fb', minHeight: Platform.OS === 'web' ? '100vh' : undefined },
  scrollView: { flex: 1, maxHeight: Platform.OS === 'web' ? '100vh' : undefined, overflow: Platform.OS === 'web' ? 'scroll' : 'visible' },
  scroll: { flexGrow: 1, alignItems: 'center' },
  innerContent: { width: '100%', maxWidth: 720 },
  card: {
    backgroundColor: '#fff', padding: 20, borderRadius: 16,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  title: { fontWeight: 'bold', color: '#1E90FF', marginBottom: 16, textAlign: 'center' },
  infoRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  infoLabel: { fontWeight: 'bold', color: '#333', width: 110 },
  infoValue: { color: '#555', flex: 1 },
  descTitle: { fontWeight: 'bold', color: '#333', marginTop: 14, marginBottom: 6 },
  descText: { color: '#666', lineHeight: 22 },
  section: {
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 14,
  },
  sectionTitle: { fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  rsvpBtn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  rsvpBtnActive: { backgroundColor: '#16a34a' },
  rsvpBtnText: { color: '#fff', fontWeight: 'bold' },
  rsvpHint: { marginTop: 8, color: '#94a3b8', textAlign: 'center' },
  shareBtn: { backgroundColor: '#f0f9ff', padding: 13, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#bae6fd' },
  shareBtnText: { color: '#0284c7', fontWeight: 'bold' },
  ratingLabel: { color: '#555', marginBottom: 8 },
  starsRow: { flexDirection: 'row', marginBottom: 12 },
  star: { fontSize: 30, color: '#ccc', marginHorizontal: 4 },
  starActive: { color: '#FFD700' },
  commentInputRow: { flexDirection: 'row', gap: 8 },
  commentInput: { flex: 1, backgroundColor: '#f1f3f5', borderRadius: 10, padding: 10, color: '#0f172a' },
  sendBtn: { backgroundColor: '#1E90FF', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#93c5fd' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyComments: { color: '#94a3b8', textAlign: 'center', paddingVertical: 10 },
  commentItem: { borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingVertical: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentUser: { fontWeight: 'bold', color: '#1E90FF' },
  commentRating: { color: '#FFD700' },
  deleteIcon: { fontSize: 16, paddingHorizontal: 4 },
  commentText: { color: '#555' },
  backBtn: { backgroundColor: '#1E90FF', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
});
