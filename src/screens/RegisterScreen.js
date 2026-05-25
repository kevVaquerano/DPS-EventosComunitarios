import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../api/firebase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (email === '' || password === '') {
      Alert.alert('Campos vacíos', 'Por favor, llena todos los campos para continuar.');
      return;
    }
    try {
      // Registrar el usuario en Firebase de forma segura
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('¡Registro Exitoso!', 'Tu cuenta comunitaria ha sido creada.');
      navigation.navigate('Home'); // Redirige a la pantalla principal (Trabajo del Integrante 1)
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar la cuenta.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este correo ya está registrado.';
      if (error.code === 'auth/weak-password') errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      
      Alert.alert('Error de Registro', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../mockups/Eventus.png')} 
        style={styles.logoImage} 
      />

      <Text style={styles.title}>Crear Cuenta Comunitaria</Text>
      
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
        placeholder="Contraseña (mínimo 6 caracteres)" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#1E90FF', marginTop: 15, textAlign: 'center' },
  logoImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain'
  },
});