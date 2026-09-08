import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const onSubmit = async (data) => {
        setServerError('');
        try {
            await login(data.username, data.password);
            navigate('/');
        }
        catch (err) {
            setServerError(err?.message || 'Login failed. Please check your credentials.');
        }
    };
    return (_jsx("div", { className: "flex min-h-[80vh] items-center justify-center px-4", children: _jsxs("div", { className: "w-full max-w-md space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-800", children: "Welcome back" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Log in to rescue meals and track your impact." })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-slate-700 mb-1", children: "Username" }), _jsx("input", { id: "username", ...register('username'), placeholder: "e.g. johndoe", className: `w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.username ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}` }), errors.username && (_jsx("p", { className: "mt-1 text-xs text-red-500", children: errors.username.message }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-slate-700 mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", ...register('password'), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: `w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'}` }), errors.password && (_jsx("p", { className: "mt-1 text-xs text-red-500", children: errors.password.message }))] }), serverError && (_jsx("div", { className: "rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700", children: serverError })), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? 'Signing in…' : 'Sign in' })] }), _jsxs("p", { className: "text-center text-sm text-slate-500", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "font-medium text-green-700 hover:underline", children: "Create one" })] })] }) }));
}
