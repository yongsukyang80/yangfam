import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <h1 className="text-3xl font-bold text-center mb-8">우리집 커뮤니티</h1>
        <LoginForm />
      </div>
    </main>
  );
}
