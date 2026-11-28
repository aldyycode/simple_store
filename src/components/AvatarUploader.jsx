import {useCallback, useEffect, useRef, useState} from "react";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const MAX_SIZE_MB = 2;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function AvatarUploader({value, onChange, uploading = false}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type))
      return "Format harus JPG, PNG, atau WEBP.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `Ukuran maksimal ${MAX_SIZE_MB} MB.`;
    return "";
  };

  const handleFile = useCallback(
    (file) => {
      setError("");
      if (!file) return;
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setPreview(URL.createObjectURL(file));
      onChange?.(file);
    },
    [onChange],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onPick = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const removePhoto = () => {
    setPreview(null);
    setError("");
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      {/* Avatar bulat */}
      <div className="relative shrink-0">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full
            border-2 transition-all duration-200
            ${
              dragOver
                ? "border-ink bg-ink/5 scale-105 dark:border-white dark:bg-white/5"
                : "border-dashed border-line bg-surface/40 hover:border-ink/40 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-500"
            }`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <span
                className="absolute inset-0 flex items-center justify-center
                bg-black/0 text-white opacity-0 transition
                group-hover:bg-black/40 group-hover:opacity-100"
              >
                <PhotoIcon className="h-5 w-5" />
              </span>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted dark:text-slate-400">
              <CloudArrowUpIcon
                className={`h-6 w-6 ${dragOver ? "animate-bounce" : ""}`}
              />
              <span className="mt-1 text-[10px] font-medium">Upload</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={onPick}
            className="hidden"
          />
        </div>

        {/* Tombol hapus */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -right-1 -top-1 rounded-full bg-rose-500 p-1 text-white
              shadow hover:bg-rose-600 transition"
            title="Hapus foto"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Info & aksi */}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-sm font-medium text-ink dark:text-white">
          Foto Profil
        </p>
        <p className="mt-0.5 text-xs text-muted dark:text-slate-400">
          Klik atau tarik file ke area bulat. JPG/PNG/WEBP, maks {MAX_SIZE_MB}{" "}
          MB.
        </p>

        <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium
              text-ink hover:bg-surface disabled:opacity-50
              dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
          >
            {preview ? "Ganti Foto" : "Pilih Foto"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={removePhoto}
              disabled={uploading}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-rose-600
                hover:bg-rose-50 disabled:opacity-50
                dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              Hapus
            </button>
          )}
        </div>

        {uploading && (
          <p className="mt-2 text-xs text-muted dark:text-slate-400">
            Mengunggah foto…
          </p>
        )}

        {error && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <ExclamationTriangleIcon className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
