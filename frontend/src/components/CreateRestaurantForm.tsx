import { useState } from 'react';
import axios from '../lib/api';

interface Props {
  onCreated: () => void; // callback to refresh the restaurant list
}

export default function CreateRestaurantForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        + Create Restaurant
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">New Restaurant</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant name" required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
          {submitting ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}