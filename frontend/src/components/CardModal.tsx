import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CardModalProps {
    open: boolean;
    title: string;
    amount: string;
    onClose: () => void;
    onPay: (paymentMethodId: string) => void;
}

export default function CardModal({ open, title, amount, onClose, onPay }: CardModalProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        // Create a PaymentMethod from the card details
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement)!,
        });

        if (stripeError) {
            setError(stripeError.message ?? 'Card error');
            setProcessing(false);
            return;
        }

        // Give the PaymentMethod ID back to the parent
        onPay(paymentMethod!.id);
        setProcessing(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{amount}</p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Stripe card input */}
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