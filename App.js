import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/api/firebase';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica si hay sesión activa antes de mostrar cualquier pantalla
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F9F4' }}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return <AppNavigator initialRoute={isLoggedIn ? 'Home' : 'Login'} />;
}
