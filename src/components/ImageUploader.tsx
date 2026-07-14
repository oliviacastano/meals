import { useRef, useState } from 'react';
import { setRecipeImage } from '../lib/recipeStore';
import { resizeImageFile } from '../lib/image';

export default function ImageUploader({
  recipeId,
  image,
  onChange,
}: {
  recipeId: string;
  image: string | null;
  onChange: (image: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Bitte eine Bilddatei auswählen.');
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file);
      setRecipeImage(recipeId, dataUrl);
      onChange(dataUrl);
      setError('');
    } catch {
      setError('Bild konnte nicht verarbeitet werden.');
    }
  }

  function handleRemove() {
    setRecipeImage(recipeId, null);
    onChange(null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm px-3 py-1.5 rounded-full bg-white shadow-sm hover:bg-stone-100 text-stone-600"
        >
          {image ? 'Foto ändern' : '📷 Foto hinzufügen'}
        </button>
        {image && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm px-3 py-1.5 rounded-full bg-white shadow-sm hover:bg-stone-100 text-stone-600"
          >
            Entfernen
          </button>
        )}
      </div>
      {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
