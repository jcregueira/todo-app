import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  if (token) navigate('/', { replace: true });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">📋 Todo App</h1>
        <h2 className="text-lg text-gray-600 text-center mb-6">Crear cuenta</h2>
        <AuthForm onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}
