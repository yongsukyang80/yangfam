export async function uploadImage(file: File | Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=ec16e894458d3d9d649feda3e7edbf12`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    const data = await response.json();
    return data.data.display_url; // 직접 접근 가능한 URL 반환
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}
