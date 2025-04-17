import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

interface NotificationPayload {
  title?: string;
  body?: string;
}

interface NotificationRequest {
  tokens: string[];
  notification: NotificationPayload;
  data?: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const { tokens, notification, data } = await request.json() as NotificationRequest;

    const message = {
      notification,
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    
    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
} 