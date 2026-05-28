import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity,
  View, Alert, Image, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../api/firebase';
import { useResponsive } from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { isMobile, isDesktop, hPad, fs, sp } = useResponsive();

  const showMessage = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
    else Alert.alert(title, msg);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showMessage('Campos incompletos', 'Por favor completa el correo y contraseña.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch {
      showMessage('Error de acceso', 'El correo o contraseña son incorrectos.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigation.navigate('Home');
    } catch {
      showMessage('Error con Google', 'No se pudo iniciar sesión con Google.');
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
        <View style={[styles.card, isDesktop && styles.cardDesktop]}>
          <Image source={require('../images/EventusLogo.png')} style={styles.logo} />

          <Text style={[styles.title, { fontSize: fs.xl }]}>Iniciar Sesión</Text>

          <TextInput
            style={[styles.input, { fontSize: fs.md }]}
            placeholder="Correo electrónico"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={[styles.input, { fontSize: fs.md }]}
            placeholder="Contraseña"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={[styles.buttonText, { fontSize: fs.md }]}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={[styles.separatorText, { fontSize: fs.sm }]}>o inicia sesión con</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Image source={require('../images/GoogleIcon.png')} style={styles.googleIcon} />
            <Text style={[styles.googleButtonText, { fontSize: fs.md }]}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, { fontSize: fs.sm }]}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F9F4' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardDesktop: { maxWidth: 420 },
  logo: { width: 140, height: 80, alignSelf: 'center', marginBottom: 16, resizeMode: 'contain' },
  title: { fontWeight: 'bold', textAlign: 'center', color: '#1E293B', marginBottom: 22 },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCE5DD',
    color: '#1E293B',
  },
  button: { backgroundColor: '#3AA773', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold' },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#DCE5DD' },
  separatorText: { marginHorizontal: 10, color: '#64748B' },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE5DD',
    borderRadius: 12, padding: 14, marginBottom: 6,
  },
  googleIcon: { width: 20, height: 20, marginRight: 10, resizeMode: 'contain' },
  googleButtonText: { color: '#1E293B', fontWeight: '600' },
  linkText: { color: '#2E8B57', marginTop: 16, textAlign: 'center', fontWeight: '600' },
});
