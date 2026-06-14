// Firebase Configuration - FastAds Admin
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyApa-6wSGsdXIvcZxg7l4wkmrM1bVx1Xyc",
    authDomain: "fastads-f9fb5.firebaseapp.com",
    projectId: "fastads-f9fb5",
    storageBucket: "fastads-f9fb5.firebasestorage.app",
    messagingSenderId: "755333782841",
    appId: "1:755333782841:web:6a88e8d716d2653848dce8",
    measurementId: "G-V3M3LQE2N3"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
