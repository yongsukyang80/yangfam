import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { ref, get, set } from 'firebase/database';

const firebaseConfig = {
  // Firebase Console에서 복사한 설정 정보를 여기에 붙여넣기
  apiKey: "AIzaSyBLXVCOxyg7wVh4kRaPaJSvyaaGm0X3U9c",
  authDomain: "yangfam-ecb64.firebaseapp.com",
  projectId: "yangfam-ecb64",
  storageBucket: "yangfam-ecb64.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: "1:525222379650:web:8cd383d67dfbabae68b49b",
  databaseURL: "https://yangfam-ecb64-default-rtdb.firebaseio.com"
};

console.log('Initializing Firebase with config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// FCM 토큰 관리
export async function requestNotificationPermission(userId: string) {
  try {
    if (!messaging) return;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });

      // 토큰을 사용자 정보에 저장
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      await set(userRef, {
        ...userData,
        fcmToken: token
      });
    }
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
  }
}

// 알림 수신 처리
if (typeof window !== 'undefined' && messaging) {
  onMessage(messaging, (payload) => {
    new Notification(payload.notification?.title || '새 알림', {
      body: payload.notification?.body,
      icon: '/icon.png'
    });
  });
}

console.log('Firebase initialized:', !!db);
