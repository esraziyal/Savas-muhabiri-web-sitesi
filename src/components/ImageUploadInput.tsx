import { useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { uploadImage } from '../lib/storage';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
}

export function ImageUploadInput({
  value,
  onChange,
  label,
  required = false,
}: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const url = await uploadImage(file);

    if (url) {
      onChange(url);
    } else {
      setError('Görsel yüklenemedi. Lütfen tekrar deneyin.');
    }

    setUploading(false);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label} {required && '*'}
      </label>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          {value ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Preview"
                className="max-w-xs max-h-48 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-700 rounded cursor-pointer hover:border-red-600 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  {uploading ? 'Yükleniyor...' : 'Görsel seçin veya sürükleyin'}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {uploading && (
          <div className="flex items-center justify-center">
            <Loader className="w-6 h-6 text-red-600 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
