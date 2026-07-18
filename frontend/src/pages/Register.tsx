import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(40),
  role: z.enum(['ROLE_USER', 'ROLE_OWNER']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });
  const registerUser = useAuthStore((state) => state.register);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      await registerUser(data.username, data.email, data.password, data.role);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setServerError(err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Join the food rescue community today.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
        >
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="username"
              {...register('username')}
              placeholder="e.g. johndoe"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.username ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
              I am a
            </label>
            <select
              id="role"
              {...register('role')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ROLE_USER">Customer</option>
              <option value="ROLE_OWNER">Restaurant Owner</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}