import { useState } from 'react';
import axios from '../lib/api';

interface BagFormData {
    name: string;
    originalPrice: number;
    discountedPrice?: number;
    quantity: number;
    // Additional fields for creation (edit won't include them unless present)
    description?: string;
    pickupTime?: string;
    latitude?: number;
    longitude?: number;
}

interface BagFormProps {
    restaurantId: number;
    initialData?: Partial<BagFormData> & { id?: number };
    onSave: () => void;
    onCancel: () => void;
}

export default function BagForm({ restaurantId, initialData, onSave, onCancel }: BagFormProps) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice?.toString() ?? '');
    const [discountedPrice, setDiscountedPrice] = useState(initialData?.discountedPrice?.toString() ?? '');
    const [quantity, setQuantity] = useState(initialData?.quantity?.toString() ?? '1');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [pickupTime, setPickupTime] = useState(initialData?.pickupTime?.slice(0, 16) ?? '');
    const [latitude, setLatitude] = useState(initialData?.latitude?.toString() ?? '60.1695');
    const [longitude, setLongitude] = useState(initialData?.longitude?.toString() ?? '24.9354');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!initialData?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        // Build payload – for edit, we only include fields that were actually passed in initialData
        const payload: any = {};
        if (name !== (initialData?.name ?? '')) payload.name = name;
        if (originalPrice !== (initialData?.originalPrice?.toString() ?? ''))
            payload.originalPrice = parseFloat(originalPrice);
        if (discountedPrice !== (initialData?.discountedPrice?.toString() ?? ''))
            payload.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : null;
        if (quantity !== (initialData?.quantity?.toString() ?? '1'))
            payload.quantity = parseInt(quantity);

        // For create, send all required fields
        if (!isEdit) {
            payload.name = name;
            payload.originalPrice = parseFloat(originalPrice);
            payload.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : null;
            payload.quantity = parseInt(quantity);
            payload.description = description || undefined;
            payload.pickupTime = pickupTime ? new Date(pickupTime).toISOString() : undefined;
            payload.latitude = parseFloat(latitude);
            payload.longitude = parseFloat(longitude);
        }

        try {
            if (isEdit) {
                await axios.put(`/api/restaurants/${restaurantId}/bags/${initialData.id}`, payload);
            } else {
                await axios.post(`/api/restaurants/${restaurantId}/bags`, payload);
            }
            onSave();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to save bag');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{isEdit ? 'Edit Bag' : 'New Bag'}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                <input value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} type="number" step="0.01" placeholder="Original Price" required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                <input value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} type="number" step="0.01" placeholder="Discounted Price" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                <input value={quantity} onChange={e => setQuantity(e.target.value)} type="number" placeholder="Quantity" required className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                {!isEdit && (
                    <>
                        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                        <input value={pickupTime} onChange={e => setPickupTime(e.target.value)} type="datetime-local" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                        <input value={latitude} onChange={e => setLatitude(e.target.value)} type="number" step="any" placeholder="Latitude" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                        <input value={longitude} onChange={e => setLongitude(e.target.value)} type="number" step="any" placeholder="Longitude" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
                    </>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}