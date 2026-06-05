import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96 p-6 border rounded">
        <h1 className="text-2xl font-bold">Login</h1>
        <input {...register('username')} placeholder="Username" className="w-full p-2 border rounded" />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        <input {...register('password')} type="password" placeholder="Password" className="w-full p-2 border rounded" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}