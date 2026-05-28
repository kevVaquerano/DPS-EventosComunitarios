import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciales del proyecto en Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDXZs8jEyshb8GN744miXAVUaOuPQnJujE",
  authDomain: "dps-eventos.firebaseapp.com",
  projectId: "dps-eventos",
  storageBucket: "dps-eventos.firebasestorage.app",
  messagingSenderId: "338373027964",
  appId: "1:338373027964:web:cb8e0096dc732792ec01f9",
  measurementId: "G-2B8M6J5XVQ"
};

const app = initializeApp(firebaseConfig);

// Se exportan por separado para no importar app completa en cada pantalla
export const auth = getAuth(app);
export const db = getFirestore(app);
