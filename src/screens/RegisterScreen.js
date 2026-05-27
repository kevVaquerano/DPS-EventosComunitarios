import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../api/firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name || password !== confirmPassword) {
      Alert.alert('Error', 'Por favor verifica que los campos obligatorios estén llenos y las contraseñas coincidan.');
      return;
    }
    try {
      setLoading(true);
      // Registrar el usuario en Firebase de forma segura
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('¡Registro Exitoso!', 'Tu cuenta comunitaria ha sido creada.');
      navigation.replace('Home'); 
    } catch (error) {
      let errorMessage = 'Ocurrió un error al registrar la cuenta.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este correo ya está registrado.';
      if (error.code === 'auth/weak-password') errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      
      Alert.alert('Error de Registro', errorMessage);
    } finally {
      setLoading(false);
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
        placeholder="Nombre completo" 
        value={name}
        onChangeText={setName}
      />

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
      <TextInput 
        style={styles.input} 
        placeholder="Confirmar contraseña" 
        secureTextEntry 
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando cuenta...' : 'Registrarse'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#000' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#1E90FF', marginTop: 20, textAlign: 'center', fontWeight: '600' },
  logoImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain'
  },
});