import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete", }) {
    if (!open)
        return null;
    const isDestructive = confirmLabel === "Delete";
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-800", children: title }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: message }), _jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [_jsx("button", { onClick: onCancel, className: "rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors", children: "Cancel" }), _jsx("button", { onClick: onConfirm, className: `rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${isDestructive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"}`, children: confirmLabel })] })] }) }));
}
