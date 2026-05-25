// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Analytics de Web no es compatible con React Native
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXZs8jEyshb8GN744miXAVUaOuPQnJujE",
  authDomain: "dps-eventos.firebaseapp.com",
  projectId: "dps-eventos",
  storageBucket: "dps-eventos.firebasestorage.app",
  messagingSenderId: "338373027964",
  appId: "1:338373027964:web:cb8e0096dc732792ec01f9",
  measurementId: "G-2B8M6J5XVQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); 
export const auth = getAuth(app);