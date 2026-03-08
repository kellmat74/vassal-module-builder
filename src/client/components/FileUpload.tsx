import { useRef, useCallback, useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
}

export function FileUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.vmod')) {
      alert('Please upload a .vmod file');
      return;
    }
    onUpload(file);
  }, [onUpload]);

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`px-3 py-1.5 text-sm rounded font-medium border transition ${
          dragging
            ? 'border-amber-400 bg-amber-900/30 text-amber-300'
            : 'border-gray-600 hover:border-gray-400 text-gray-300'
        }`}
      >
        Upload .vmod
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".vmod,.zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </>
  );
}
