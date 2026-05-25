import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      navigation.navigate('Home'); 
    } catch (error) {
      Alert.alert('Error de acceso', 'El correo o la contraseña son incorrectos.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../../mockups/Eventus.png')}
          style={styles.logoImage}
        />

        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Correo electrónico" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Contraseña" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  card: { backgroundColor: '#fff', padding: 4 },
  
  // 3. Dale un tamaño adecuado a tu imagen en los estilos
  logoImage: {
    width: 120,          // Ajusta el ancho según el tamaño de tu diseño
    height: 120,         // Ajusta el alto
    alignSelf: 'center', // Centra la imagen en la pantalla
    marginBottom: 20,    // Deja espacio con el título de abajo
    resizeMode: 'contain' // Mantiene la proporción de la imagen sin deformarla
  },

  title: { fontSize: 26, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#1E90FF', marginTop: 15, textAlign: 'center' }
});