import { useState, useRef } from 'react';
import axios from '../lib/api';

interface ImageUploadProps {
  restaurantId: number;
  bagId: number;
  onUploaded: (imageUrl: string) => void;
}

export function ImageUpload({ restaurantId, bagId, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  // When the user clicks our styled button, we programmatically click the hidden real input
  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(
        `/api/restaurants/${restaurantId}/bags/${bagId}/image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      onUploaded(res.data.imageUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* The real file input – hidden, but still functional */}
      <input
        type="file"
        accept="image/*"
        ref={hiddenFileInput}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Styled button that replaces the ugly default input */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading…' : 'Upload Image'}
      </button>

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}