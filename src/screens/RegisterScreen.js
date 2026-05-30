import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../api/firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      showMessage('Nombre requerido', 'Por favor, escribe tu nombre completo.');
      return;
    }

    if (!email.trim()) {
      showMessage('Correo requerido', 'Por favor, escribe tu correo electrónico.');
      return;
    }

    if (!emailRegex.test(email)) {
      showMessage('Correo inválido', 'Escribe un correo válido. Ejemplo: usuario@gmail.com');
      return;
    }

    if (!password.trim()) {
      showMessage('Contraseña requerida', 'Por favor, escribe una contraseña.');
      return;
    }

    if (password.length < 6) {
      showMessage('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showMessage('¡Registro Exitoso!', 'Tu cuenta comunitaria ha sido creada.');
      navigation.navigate('Home');
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar la cuenta.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado.';
      }

      if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      }

      if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }

      showMessage('Error de Registro', errorMessage);
    }
  };

  const handleGoogleRegister = async () => {
    if (Platform.OS !== 'web') {
      showMessage('No disponible', 'El inicio con Google vía Popup solo funciona en la web.');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      showMessage('¡Registro exitoso!', 'Ingresaste con Google correctamente.');
      navigation.navigate('Home');
    } catch (error) {
      showMessage('Error con Google', 'No se pudo iniciar sesión con Google.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Image
            source={require('../images/EventusLogo.png')}
            style={styles.logoImage}
          />

          <Text style={styles.title}>Crear Cuenta</Text>

          <View style={styles.formContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña (mínimo 6 caracteres)"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>o regístrate con</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
              <Image
                source={require('../images/GoogleIcon.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9F4',
  },

  formContent: {
    width: '100%',
    maxWidth: 1050,
    alignSelf: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }
    }),
    elevation: 5,
  },

  logoImage: {
    width: 160,
    height: 90,
    alignSelf: 'center',
    marginBottom: 14,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 22,
  },

  input: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCE5DD',
    fontSize: 15,
    color: '#1E293B',
  },

  button: {
    backgroundColor: '#3AA773',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },

  linkText: {
    color: '#2E8B57',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },

  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DCE5DD',
  },

  separatorText: {
    marginHorizontal: 10,
    color: '#64748B',
    fontSize: 14,
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5DD',
    borderRadius: 14,
    padding: 15,
  },

  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },

  googleButtonText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 16,
  },
});