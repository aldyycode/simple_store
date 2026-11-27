import {useState, useEffect} from "react";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import ImageUploader from "../components/ImageUploader";
import supabase from "../config/supabaseClient";

const BUCKET = "product image"; // sesuaikan nama bucket kamu

export default function ProductEdit({productId, onBack}) {
  const [form, setForm] = useState({name: "", price: "", stock: ""});
  const [imageFile, setImageFile] = useState(null); // file baru (jika diganti)
  const [imageUrl, setImageUrl] = useState(""); // URL lama / preview
  const [original, setOriginal] = useState(null); // data asli dari DB
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDark = () => document.documentElement.classList.contains("dark");

  const swalTheme = {
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#E5E7EB" : "#0F172A",
    customClass: {popup: "rounded-2xl"},
  };

  /* ------------------------- FETCH DATA PRODUK ------------------------- */
  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
      setLoading(true);
      const {data, error} = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!alive) return;

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat produk",
          text: error.message,
          ...swalTheme,
        });
        onBack?.();
      } else {
        setOriginal(data);
        setForm({
          name: data.name ?? "",
          price: data.price ?? "",
          stock: data.stock ?? "",
        });
        setImageUrl(data.image || data.image_url || "");
      }
      setLoading(false);
    };

    if (productId != null) fetchProduct();
    return () => {
      alive = false;
    };
  }, [productId]);

  /* --------------------- HANDLE PILIH FILE BARU ------------------------ */
  const handleFileSelect = (file) => {
    setImageFile(file);
    if (file) {
      setImageUrl(URL.createObjectURL(file)); // preview lokal
    } else {
      // user hapus pilihan → kembalikan ke URL lama
      setImageUrl(original?.image || original?.image_url || "");
    }
  };

  /* ------------------ UPLOAD KE SUPABASE STORAGE ----------------------- */
  const uploadToSupabase = async (file, productName, id) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const safeName = productName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const fileName = `${safeName}-${id}.${ext}`;

      const {error: upErr} = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, {cacheControl: "3600", upsert: true});

      if (upErr) throw upErr;

      const {data} = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------- SUBMIT -------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price === "" || form.stock === "") {
      return Swal.fire({
        icon: "warning",
        title: "Lengkapi data",
        text: "Nama, harga, dan stok wajib diisi.",
        ...swalTheme,
      });
    }

    const confirm = await Swal.fire({
      title: "Simpan perubahan?",
      text: "Data produk akan diperbarui.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0F172A",
      cancelButtonColor: isDark() ? "#334155" : "#E2E8F0",
      ...swalTheme,
    });
    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      let finalImage = original?.image || original?.image_url || "";

      // Jika user ganti gambar → upload file baru
      if (imageFile) {
        finalImage = await uploadToSupabase(imageFile, form.name, productId);

        // (Opsional) hapus file lama di storage agar tidak menumpuk
        const oldUrl = original?.image || original?.image_url;
        if (oldUrl) {
          const oldPath = decodeURIComponent(
            oldUrl
              .split("/storage/v1/object/public/")[1]
              ?.split("/")
              .slice(1)
              .join("/") || "",
          );
          if (oldPath && oldPath !== finalImage.split("/").pop()) {
            await supabase.storage.from(BUCKET).remove([oldPath]);
          }
        }
      }

      // Update baris di tabel products
      const {error: updateError} = await supabase
        .from("products")
        .update({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          image: finalImage,
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Perubahan produk telah disimpan.",
        timer: 1400,
        showConfirmButton: false,
        ...swalTheme,
      });
      onBack?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: err.message,
        ...swalTheme,
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------------- RENDER -------------------------------- */
  if (loading) {
    return (
      <section className="max-w-2xl">
        <div
          className="rounded-2xl border border-line bg-white p-10 text-center
          dark:bg-slate-900 dark:border-slate-800"
        >
          <p className="text-sm text-muted dark:text-slate-400">
            Memuat data produk…
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-md p-2 text-muted hover:bg-line hover:text-ink
            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-white">
            Edit Produk
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Perbarui detail produk #{productId}.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-line bg-white p-6
          dark:bg-slate-900 dark:border-slate-800"
      >
        {/* Nama */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Nama Produk
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
              text-ink focus:outline-none focus:ring-2 focus:ring-ink/20
              dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        {/* Harga & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
              Harga (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
                text-ink focus:outline-none focus:ring-2 focus:ring-ink/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({...form, stock: e.target.value})}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
                text-ink focus:outline-none focus:ring-2 focus:ring-ink/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Upload Gambar */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink dark:text-white">
            Gambar Produk
          </label>
          <ImageUploader
            value={imageUrl}
            uploading={uploading}
            onChange={handleFileSelect}
          />
          {original?.image || original?.image_url ? (
            <p className="mt-2 text-xs text-muted dark:text-slate-400">
              Kosongkan pilihan gambar untuk mempertahankan gambar lama.
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted
              hover:bg-surface dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white
              hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-white dark:text-ink dark:hover:bg-white/90"
          >
            {submitting ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </section>
  );
}
