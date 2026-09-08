import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import axios from '../lib/api';
export function ImageUpload({ restaurantId, bagId, onUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const hiddenFileInput = useRef(null);
    // When the user clicks our styled button, we programmatically click the hidden real input
    const handleClick = () => {
        hiddenFileInput.current?.click();
    };
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`/api/restaurants/${restaurantId}/bags/${bagId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploaded(res.data.imageUrl);
        }
        catch (err) {
            setError(err?.response?.data?.message || 'Upload failed');
        }
        finally {
            setUploading(false);
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "file", accept: "image/*", ref: hiddenFileInput, onChange: handleFileChange, style: { display: 'none' } }), _jsx("button", { type: "button", onClick: handleClick, disabled: uploading, className: "px-3 py-1.5 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: uploading ? 'Uploading…' : 'Upload Image' }), error && _jsx("span", { className: "text-sm text-red-500", children: error })] }));
}
