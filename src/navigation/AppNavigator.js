import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';

import 'react-native-gesture-handler';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';


import HomeScreen from '../screens/HomeScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import StatsScreen from '../screens/StatsScreen';

// Componente de respaldo para evitar el error "Invalid Component" si el archivo de un compañero falla
const ScreenPlaceholder = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Pantalla: {name}</Text>
    <Text style={{ color: '#666' }}>Asegúrate de que el archivo tenga "export default"</Text>
  </View>
);

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // desuscribirse al desmontar
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#1E90FF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Eventos Comunitarios' }} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen || (() => <ScreenPlaceholder name="Crear Evento" />)} options={{ title: 'Crear Evento' }} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Detalle del Evento' }} />
            <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas del Proyecto' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión', headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}