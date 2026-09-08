import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
export default function CardModal({ open, title, amount, bagName, restaurantName, imageUrl, onClose, onPay, }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements)
            return;
        setProcessing(true);
        setError(null);
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });
        if (stripeError) {
            setError(stripeError.message ?? 'Card error');
            setProcessing(false);
            return;
        }
        onPay(paymentMethod.id);
        setProcessing(false);
    };
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-5", children: [_jsx("div", { className: "w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0", children: imageUrl ? (_jsx("img", { src: imageUrl, alt: bagName, className: "h-full w-full object-cover" })) : (_jsx("div", { className: "flex h-full items-center justify-center text-slate-300 text-2xl", children: "No Image" })) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-800", children: bagName }), restaurantName && (_jsx("p", { className: "text-xs text-slate-500", children: restaurantName })), _jsx("p", { className: "text-sm font-bold text-green-700 mt-0.5", children: amount })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx("div", { className: "rounded-lg border border-slate-300 p-3", children: _jsx(CardElement, { options: { style: { base: { fontSize: '14px' } } } }) }), error && _jsx("p", { className: "text-sm text-red-500", children: error }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: onClose, disabled: processing, className: "rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: !stripe || processing, className: "rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors", children: processing ? 'Processing…' : 'Pay' })] })] })] }) }));
}
