import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CardModalProps {
    open: boolean;
    title: string;
    amount: string;
    bagName: string;
    restaurantName?: string;
    imageUrl?: string | null;
    onClose: () => void;
    onPay: (paymentMethodId: string) => void;
}

export default function CardModal({
    open,
    title,
    amount,
    bagName,
    restaurantName,
    imageUrl,
    onClose,
    onPay,
}: CardModalProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement)!,
        });

        if (stripeError) {
            setError(stripeError.message ?? 'Card error');
            setProcessing(false);
            return;
        }

        onPay(paymentMethod!.id);
        setProcessing(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                {/* Bag summary */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {imageUrl ? (
                            <img src={imageUrl} alt={bagName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-300 text-2xl">No Image</div>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">{bagName}</p>
                        {restaurantName && (
                            <p className="text-xs text-slate-500">{restaurantName}</p>
                        )}
                        <p className="text-sm font-bold text-green-700 mt-0.5">{amount}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg border border-slate-300 p-3">
                        <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!stripe || processing}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Processing…' : 'Pay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}