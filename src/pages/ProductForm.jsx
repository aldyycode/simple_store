import {useState} from "react";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import ImageUploader from "../components/ImageUploader";
import supabase from "../config/supabaseClient";

export default function ProductForm({onBack}) {
  const [form, setForm] = useState({name: "", price: "", stock: ""});
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDark = () => document.documentElement.classList.contains("dark");

  const swalTheme = {
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#E5E7EB" : "#0F172A",
    customClass: {popup: "rounded-2xl"},
  };

  /* ------------------- Handle pilih file (hanya preview) ------------------ */
  const handleFileSelect = (file) => {
    setImageFile(file);
    if (file) {
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageUrl("");
    }
  };

  /* ------------------- Upload ke Supabase Storage ------------------ */
  const uploadToSupabase = async (file, productName, productId) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();

      // Slug nama produk: huruf kecil, spasi → dash, buang karakter non-alphanumeric
      const safeName = productName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Format akhir: {nama-produk}-{id}.{ext}
      const fileName = `${safeName}-${productId}.${ext}`;

      const {error: upErr} = await supabase.storage
        .from("product image") // sesuaikan nama bucket kamu
        .upload(fileName, file, {cacheControl: "3600", upsert: false});

      if (upErr) throw upErr;

      const {data} = supabase.storage
        .from("product image")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  /* ------------------------------- Submit ------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock) {
      return Swal.fire({
        icon: "warning",
        title: "Lengkapi data",
        text: "Nama, harga, dan stok wajib diisi.",
        ...swalTheme,
      });
    }

    if (!imageFile) {
      return Swal.fire({
        icon: "warning",
        title: "Gambar belum ada",
        text: "Silakan unggah gambar produk terlebih dahulu.",
        ...swalTheme,
      });
    }

    setSubmitting(true);
    try {
      // 1. Insert produk dulu untuk dapat ID
      const {data: insertedProduct, error: insertError} = await supabase
        .from("products")
        .insert({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Upload gambar dengan nama: {nama-produk}-{id}.{ext}
      const publicUrl = await uploadToSupabase(
        imageFile,
        form.name,
        insertedProduct.id,
      );

      // 3. Simpan URL gambar ke kolom `image`
      const {error: updateError} = await supabase
        .from("products")
        .update({image: publicUrl})
        .eq("id", insertedProduct.id);

      if (updateError) throw updateError;

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Produk baru telah ditambahkan.",
        timer: 1400,
        showConfirmButton: false,
        ...swalTheme,
      });
      onBack?.();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error.message,
        ...swalTheme,
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------- Render ------------------------------- */
  return (
    <section className="space-y-6 max-w-2xl">
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
            Tambah Produk
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Isi detail produk baru.
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
            {submitting ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </section>
  );
}
