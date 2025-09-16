import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDQwiSCDsNeBo8c3itDU2_0SF_hyne2Dpg",
  authDomain: "paivasburguers-fa626.firebaseapp.com",
  projectId: "paivasburguers-fa626",
  storageBucket: "paivasburguers-fa626.appspot.com", // corrigido
  messagingSenderId: "449901950745",
  appId: "1:449901950745:web:a31e08aef1fbd07074b788",
  measurementId: "G-VTHC4BQ54G"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
