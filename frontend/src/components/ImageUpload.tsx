import { useState } from 'react';
import axios from '../lib/api';

interface ImageUploadProps {
  restaurantId: number;
  bagId: number;
  onUploaded: (imageUrl: string) => void;  // callback to update parent UI
}

export function ImageUpload({ restaurantId, bagId, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span className="text-sm text-gray-500">Uploading…</span>}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}