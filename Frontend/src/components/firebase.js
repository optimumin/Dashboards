// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
//import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnX-gWI0Ufuxqca5XRN6f1lUE4kdueDdc",
  authDomain: "login-auth-4126c.firebaseapp.com",
  projectId: "login-auth-4126c",
  storageBucket: "login-auth-4126c.appspot.com",
  messagingSenderId: "552727970854",
  appId: "1:552727970854:web:879c6859b7dc25aaab12e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
//export const db= getFirestore();
export default app;