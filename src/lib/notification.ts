import { ref, get } from 'firebase/database';
import { db } from './firebase';

interface NotificationData {
  title: string;
  body: string;
  type: 'chat' | 'gallery' | 'mission';
  link?: string;
}

export async function sendNotificationToFamily(data: NotificationData) {
  try {
    // 가족 구성원의 FCM 토큰 가져오기
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const users = snapshot.val();
    
    const tokens = Object.values(users)
      .map((user: any) => user.fcmToken)
      .filter(Boolean);

    // FCM 서버로 알림 전송
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens,
        notification: {
          title: data.title,
          body: data.body,
        },
        data: {
          type: data.type,
          link: data.link || '',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('알림 전송 실패');
    }
  } catch (error) {
    console.error('알림 전송 중 오류:', error);
  }
}
