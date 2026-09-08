import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import axios from '../lib/api';
export default function CreateRestaurantForm({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await axios.post('/api/restaurants', {
                name,
                address,
                phone,
                email,
            });
            setName('');
            setAddress('');
            setPhone('');
            setEmail('');
            setOpen(false);
            onCreated();
        }
        catch (err) {
            setError(err?.response?.data?.message || 'Failed to create restaurant');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (!open) {
        return (_jsx("button", { onClick: () => setOpen(true), className: "rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors", children: "+ Create Restaurant" }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold", children: "New Restaurant" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Restaurant name", required: true, className: "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" }), _jsx("input", { value: address, onChange: (e) => setAddress(e.target.value), placeholder: "Address", required: true, className: "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" }), _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "Phone (optional)", className: "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Email (optional)", className: "w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" }), error && _jsx("p", { className: "text-sm text-red-500", children: error }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: submitting, className: "rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50", children: submitting ? 'Creating…' : 'Create' }), _jsx("button", { type: "button", onClick: () => setOpen(false), className: "rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50", children: "Cancel" })] })] }));
}
