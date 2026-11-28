import {useState} from "react";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import AvatarUploader from "../components/AvatarUploader";
import supabase from "../config/supabaseClient";

/* ============================================================
   KONFIGURASI
   - BUCKET  : nama bucket di Supabase Storage (file gambar)
   - COLUMN  : nama kolom di tabel users (URL gambar)
   ============================================================ */
const BUCKET = "users photo"; // ✅ FIX: pakai "s" + spasi, sesuai dashboard
const COLUMN = "photo"; // kolom tempat menyimpan URL

export default function UserForm({onBack}) {
  const [form, setForm] = useState({name: "", email: "", password: ""});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDark = () => document.documentElement.classList.contains("dark");

  const swalTheme = {
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#E5E7EB" : "#0F172A",
    customClass: {popup: "rounded-2xl"},
  };

  /* --------------------------- HANDLE FOTO --------------------------- */
  const handlePhotoSelect = (file) => {
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview("");
    }
  };

  /* --------------------- UPLOAD KE SUPABASE STORAGE ------------------ */
  const uploadAvatar = async (file, userName, userId) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const safeName =
        userName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "user";
      const fileName = `${safeName}-${userId}.${ext}`;

      const {error: upErr} = await supabase.storage
        .from(BUCKET) // ✅ pakai konstanta
        .upload(fileName, file, {cacheControl: "3600", upsert: true});

      if (upErr) throw upErr;

      const {data} = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------------- VALIDASI ---------------------------- */
  const validate = () => {
    if (!form.name.trim()) return "Nama wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Format email tidak valid.";
    if (!form.password) return "Password wajib diisi.";
    if (form.password.length < 6) return "Password minimal 6 karakter.";
    return null;
  };

  /* ----------------------------- SUBMIT ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      return Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: err,
        ...swalTheme,
      });
    }

    const confirm = await Swal.fire({
      title: "Simpan user baru?",
      text: "Data akan ditambahkan ke database.",
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
    let insertedId = null; // untuk rollback jika perlu

    try {
      // 1. Insert user dulu untuk dapat ID
      const {data: inserted, error: insertError} = await supabase
        .from("users")
        .insert({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          [COLUMN]: "", // kolom photo sementara kosong
        })
        .select()
        .single();

      if (insertError) throw insertError;
      insertedId = inserted.id;

      // 2. Upload foto jika ada
      if (photoFile) {
        const photoUrl = await uploadAvatar(photoFile, form.name, inserted.id);

        const {error: updateError} = await supabase
          .from("users")
          .update({[COLUMN]: photoUrl}) // ✅ FIX: pakai photoUrl, bukan `photo`
          .eq("id", inserted.id);

        if (updateError) throw updateError;
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "User baru telah ditambahkan.",
        timer: 1400,
        showConfirmButton: false,
        ...swalTheme,
      });
      onBack?.();
    } catch (error) {
      // Rollback: hapus user yang sudah ter-insert jika proses berikutnya gagal
      if (insertedId) {
        try {
          await supabase.from("users").delete().eq("id", insertedId);
        } catch (_) {}
      }
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

  /* ------------------------------ RENDER ----------------------------- */
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
            Tambah User
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Isi detail user baru.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-line bg-white p-6
          dark:bg-slate-900 dark:border-slate-800"
      >
        {/* Foto Profil */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink dark:text-white">
            Foto Profil
          </label>
          <AvatarUploader
            value={photoPreview}
            uploading={uploading}
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Nama */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Misal: Budi Santoso"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
              text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20
              dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="user@mail.com"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm
              text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20
              dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-lg border border-line bg-white px-3 pr-10 py-2 text-sm
                text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5
                text-muted hover:bg-surface dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted dark:text-slate-500">
            Password akan disimpan di kolom <code>password</code> tabel{" "}
            <code>users</code>.
          </p>
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
