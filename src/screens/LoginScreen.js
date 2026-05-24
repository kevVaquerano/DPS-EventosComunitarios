import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
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
        {/* Títulos principales del diseño */}
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        
        {/* Input de Correo */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput 
          style={styles.input} 
          placeholder="tu@email.com" 
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Input de Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••" 
          placeholderTextColor="#aaa"
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        {/* Enlace de contraseña olvidada */}
        <TouchableOpacity onPress={() => Alert.alert('Recuperación', 'Función de recuperación en desarrollo.')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Botón Iniciar Sesión (Negro elegante como tu Figma) */}
        <TouchableOpacity style={styles.buttonMain} onPress={handleLogin}>
          <Text style={styles.buttonMainText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>O continuar con</Text>

        {/* Botón de Google (Requisito de la guía) */}
        <TouchableOpacity style={styles.buttonSocial} onPress={() => Alert.alert('Google', 'Conectando con Google...')}>
          <Text style={styles.buttonSocialText}> Letra ɢ  Continuar con Google</Text>
        </TouchableOpacity>

        {/* Botón de Facebook (Requisito de la guía) */}
        <TouchableOpacity style={styles.buttonSocial} onPress={() => Alert.alert('Facebook', 'Conectando con Facebook...')}>
          <Text style={styles.buttonSocialText}> Letra ғ  Continuar con Facebook</Text>
        </TouchableOpacity>

        {/* Enlace a Registro */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos que replican exactamente las tarjetas y propiedades de  Figma 
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    padding: 24 
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 4 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#000', 
    textAlign: 'center', 
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 32 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#000', 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: '#f0f0f4', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 20, 
    fontSize: 15, 
    color: '#000' 
  },
  forgotText: { 
    textAlign: 'right', 
    color: '#000', 
    fontSize: 13, 
    marginBottom: 24, 
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  buttonMain: { 
    backgroundColor: '#02020a', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 16 
  },
  buttonMainText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  orText: { 
    textAlign: 'center', 
    color: '#aaa', 
    fontSize: 13, 
    marginVertical: 12 
  },
  buttonSocial: { 
    backgroundColor: '#fff', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    marginTop: 12 
  },
  buttonSocialText: { 
    color: '#000', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  registerText: { 
    textAlign: 'center', 
    marginTop: 32, 
    color: '#666', 
    fontSize: 14 
  },
  registerBold: { 
    fontWeight: 'bold', 
    color: '#000',
    textDecorationLine: 'underline'
  }
});