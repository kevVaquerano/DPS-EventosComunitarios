import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../api/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home'); 
    } catch (error) {
      Alert.alert('Error de acceso', 'El correo o la contraseña son incorrectos.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Esto abrirá una ventana emergente para seleccionar la cuenta de Google
      await signInWithPopup(auth, provider);
    } catch (error) {
      Alert.alert('Error de Google', 'No se pudo iniciar sesión. Verifica que Google esté habilitado en Firebase Console.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../../mockups/Eventus.png')}
          style={styles.logoImage}
        />

        <Text style={styles.subtitle}>Inicia Sesión:</Text>
        
        <Text style={styles.label}>Correo:</Text>
        <TextInput 
          style={styles.input} 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Contraseña:</Text>
        <TextInput 
          style={styles.input} 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: '#3483FA' }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} style={{ width: 18, height: 18, marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>¿No tienes usuario?</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  card: { backgroundColor: '#fff', padding: 10 },
  logoImage: {
    width: 200,
    height: 80,
    alignSelf: 'center',
    marginBottom: 40,
    resizeMode: 'contain'
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#000' },
  subtitle: { fontSize: 16, color: '#000', textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  input: { backgroundColor: '#E0E0E0', padding: 12, borderRadius: 5, marginBottom: 20 },
  button: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#000', marginTop: 30, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  googleButton: { backgroundColor: '#fff', padding: 10, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  googleButtonText: { color: '#666', fontWeight: '600', fontSize: 14 }
});