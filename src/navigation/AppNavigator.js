import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import StatsScreen from '../screens/StatsScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { flex: 1, backgroundColor: '#f5f7fb' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={({ route }) => ({
          title: route.params?.event ? 'Editar Evento' : 'Nuevo Evento',
        })} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Detalle del Evento' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estadísticas' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Mi Historial' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
