import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(40),
  role: z.enum(['ROLE_USER', 'ROLE_OWNER']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const registerUser = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.username, data.email, data.password, data.role);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96 p-6 border rounded">
        <h1 className="text-2xl font-bold">Register</h1>
        <input {...register('username')} placeholder="Username" className="w-full p-2 border rounded" />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        <input {...register('email')} placeholder="Email" className="w-full p-2 border rounded" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input {...register('password')} type="password" placeholder="Password" className="w-full p-2 border rounded" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <select {...register('role')} className="w-full p-2 border rounded">
          <option value="ROLE_USER">User</option>
          <option value="ROLE_OWNER">Restaurant Owner</option>
        </select>
        {errors.role && <p className="text-red-500">{errors.role.message}</p>}
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Register</button>
      </form>
    </div>
  );
}