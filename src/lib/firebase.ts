import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Firebase Console에서 복사한 설정 정보를 여기에 붙여넣기
  apiKey: "AIzaSyBLXVCOxyg7wVh4kRaPaJSvyaaGm0X3U9c",
  authDomain: "yangfam-ecb64.firebaseapp.com",
  projectId: "yangfam-ecb64",
  storageBucket: "yangfam-ecb64.firebasestorage.app",
  messagingSenderId: "525222379650",
  appId: "1:525222379650:web:8cd383d67dfbabae68b49b",
  databaseURL: "https://yangfam-ecb64-default-rtdb.firebaseio.com"
};

console.log('Initializing Firebase with config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);

console.log('Firebase initialized:', !!db);
