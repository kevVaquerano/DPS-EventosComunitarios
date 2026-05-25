import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';



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
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#1E90FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Tus pantallas de Autenticación */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
        
        {/* Pantallas de tus compañeros */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Eventos Comunitarios', headerLeft: null }} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen || (() => <ScreenPlaceholder name="Crear Evento" />)} options={{ title: 'Crear Evento' }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Detalle del Evento' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas del Proyecto' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}