import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // 파일 확장자 추출
    const extension = file.name.split('.').pop();
    // 고유한 파일명 생성
    const fileName = `${Date.now()}.${extension}`;
    // Storage 경로 설정
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file);
    // 다운로드 URL 획득
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
