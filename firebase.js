import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCAB2VOaaSFZ2T0UN5sMQVxVEkIHaJ81us",
    authDomain: "pushnotidemo-32a04.firebaseapp.com",
    projectId: "pushnotidemo-32a04",
    storageBucket: "pushnotidemo-32a04.appspot.com",
    messagingSenderId: "448249104007",
    appId: "1:448249104007:web:4778e0429e9cf195159a22",
    measurementId: "G-TQ9ZB18709"
  };


export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);