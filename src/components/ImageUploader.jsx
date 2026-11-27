import {useCallback, useEffect, useRef, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ImageUploader({
  value, // URL gambar saat ini (string)
  onChange, // (fileOrNull) => void — dipanggil saat file dipilih / dihapus
  onUpload, // (file) => Promise<string> — fungsi upload ke Supabase, return URL
  uploading = false, // status upload dari parent
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // Sinkronkan preview dengan value dari parent
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  // Simulasi progress saat uploading (parent yang handle upload asli)
  useEffect(() => {
    if (!uploading) {
      setProgress(0);
      return;
    }
    setProgress(8);
    const id = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + Math.random() * 12));
    }, 250);
    return () => clearInterval(id);
  }, [uploading]);

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      return "Format harus JPG, PNG, atau WEBP.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Ukuran maksimal ${MAX_SIZE_MB} MB.`;
    }
    return "";
  };

  const handleFile = useCallback(
    async (file) => {
      setError("");
      if (!file) return;
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }

      // Preview instan (object URL)
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      onChange?.(file);

      // Kalau parent menyediakan onUpload, panggil (opsional)
      if (onUpload) {
        try {
          await onUpload(file);
        } catch (e) {
          setError(e?.message || "Upload gagal.");
        }
      }
    },
    [onChange, onUpload],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = ""; // reset agar bisa pilih file sama
  };

  const removeImage = () => {
    setPreview(null);
    setError("");
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!preview ? (
          /* ---------- DROPZONE ---------- */
          <motion.div
            key="dropzone"
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.2}}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3
              rounded-2xl border-2 border-dashed p-8 text-center transition-all
              ${
                dragOver
                  ? "border-ink bg-ink/5 scale-[1.01] dark:border-white dark:bg-white/5"
                  : "border-line bg-surface/40 hover:border-ink/40 hover:bg-surface/70 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-500"
              }`}
          >
            {/* Ikon animasi */}
            <motion.div
              animate={dragOver ? {y: [-2, 2, -2]} : {y: 0}}
              transition={
                dragOver
                  ? {repeat: Infinity, duration: 1.2, ease: "easeInOut"}
                  : {}
              }
              className="flex h-14 w-14 items-center justify-center rounded-full
                bg-ink/5 text-ink dark:bg-white/10 dark:text-white"
            >
              <CloudArrowUpIcon className="h-7 w-7" />
            </motion.div>

            <div>
              <p className="text-sm font-medium text-ink dark:text-white">
                {dragOver ? "Lepaskan file di sini" : "Tarik & lepas gambar"}
              </p>
              <p className="mt-1 text-xs text-muted dark:text-slate-400">
                atau{" "}
                <span className="font-semibold text-ink underline underline-offset-2 dark:text-white">
                  klik untuk pilih
                </span>{" "}
                • JPG, PNG, WEBP • maks {MAX_SIZE_MB} MB
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={onPick}
              className="hidden"
            />

            {/* Aksen dekoratif */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent"
              animate={
                dragOver
                  ? {boxShadow: "0 0 0 4px rgba(15,23,42,0.12)"}
                  : {boxShadow: "0 0 0 0 rgba(0,0,0,0)"}
              }
              transition={{duration: 0.2}}
            />
          </motion.div>
        ) : (
          /* ---------- PREVIEW ---------- */
          <motion.div
            key="preview"
            initial={{opacity: 0, scale: 0.97}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.97}}
            transition={{duration: 0.25}}
            className="relative overflow-hidden rounded-2xl border border-line
              bg-white dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface dark:bg-slate-800">
              <motion.img
                src={preview}
                alt="Preview produk"
                initial={{scale: 1.05, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                transition={{duration: 0.4, ease: "easeOut"}}
                className="h-full w-full object-cover"
              />

              {/* Overlay tombol hapus */}
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white
                  backdrop-blur transition hover:bg-black/80 hover:scale-110 active:scale-95"
                title="Hapus gambar"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>

              {/* Badge sukses setelah upload */}
              <AnimatePresence>
                {!uploading && progress === 0 && (
                  <motion.div
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 8}}
                    className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full
                      bg-emerald-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Siap
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: "auto"}}
                  exit={{opacity: 0, height: 0}}
                  className="border-t border-line px-4 py-3 dark:border-slate-800"
                >
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-muted dark:text-slate-400">
                      <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                      Mengunggah…
                    </span>
                    <span className="font-medium text-ink dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line dark:bg-slate-800">
                    <motion.div
                      className="h-full rounded-full bg-ink dark:bg-white"
                      animate={{width: `${progress}%`}}
                      transition={{ease: "easeOut", duration: 0.3}}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ganti gambar */}
            {!uploading && (
              <div className="flex items-center justify-between border-t border-line px-4 py-2.5 dark:border-slate-800">
                <p className="text-xs text-muted dark:text-slate-400">
                  Gambar siap disimpan.
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium
                    text-ink hover:bg-surface dark:text-white dark:hover:bg-slate-800"
                >
                  <PhotoIcon className="h-3.5 w-3.5" />
                  Ganti
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={onPick}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{opacity: 0, y: -4}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -4}}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
