import {useState, useEffect} from "react";
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
const BUCKET = "users photo";
const COLUMN = "photo";

export default function UserEdit({userId, onBack}) {
  const [form, setForm] = useState({name: "", email: "", password: ""});
  const [photoFile, setPhotoFile] = useState(null); // file baru (jika diganti)
  const [photoPreview, setPhotoPreview] = useState(""); // preview / URL lama
  const [original, setOriginal] = useState(null); // data asli dari DB
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDark = () => document.documentElement.classList.contains("dark");

  const swalTheme = {
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#E5E7EB" : "#0F172A",
    customClass: {popup: "rounded-2xl"},
  };

  /* ------------------------- FETCH DATA USER ------------------------- */
  useEffect(() => {
    let alive = true;

    const fetchUser = async () => {
      setLoading(true);
      const {data, error} = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!alive) return;

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat user",
          text: error.message,
          ...swalTheme,
        });
        onBack?.();
      } else {
        setOriginal(data);
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          password: "", // jangan pre-fill password
        });
        setPhotoPreview(data[COLUMN] || "");
      }
      setLoading(false);
    };

    if (userId != null) fetchUser();
    return () => {
      alive = false;
    };
  }, [userId]);

  /* --------------------- HANDLE PILIH FOTO BARU ---------------------- */
  const handlePhotoSelect = (file) => {
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      // user hapus pilihan → kembalikan ke URL lama
      setPhotoPreview(original?.[COLUMN] || "");
    }
  };

  /* ------------------ UPLOAD KE SUPABASE STORAGE --------------------- */
  const uploadAvatar = async (file, userName, id) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const safeName =
        userName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "user";
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

  /* ------------------ HAPUS FILE LAMA DI STORAGE --------------------- */
  const removeOldFile = async (oldUrl) => {
    if (!oldUrl) return;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = oldUrl.indexOf(marker);
    if (idx === -1) return;
    const oldPath = decodeURIComponent(oldUrl.slice(idx + marker.length));
    if (!oldPath) return;
    try {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    } catch (_) {
      // silent — tidak kritikal
    }
  };

  /* ----------------------------- VALIDASI ---------------------------- */
  const validate = () => {
    if (!form.name.trim()) return "Nama wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Format email tidak valid.";
    if (form.password && form.password.length < 6)
      return "Password minimal 6 karakter.";
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
      title: "Simpan perubahan?",
      text: "Data user akan diperbarui.",
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
      let finalPhoto = original?.[COLUMN] || "";

      // 1. Jika user ganti foto → upload file baru
      if (photoFile) {
        finalPhoto = await uploadAvatar(photoFile, form.name, userId);
      }

      // 2. Susun payload update
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        [COLUMN]: finalPhoto,
      };
      if (form.password) {
        payload.password = form.password; // hanya update jika diisi
      }

      // 3. Update baris di tabel users
      const {error: updateError} = await supabase
        .from("users")
        .update(payload)
        .eq("id", userId);

      if (updateError) throw updateError;

      // 4. Hapus file lama jika foto diganti (opsional, best-effort)
      if (photoFile && original?.[COLUMN]) {
        await removeOldFile(original[COLUMN]);
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Perubahan user telah disimpan.",
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

  /* ------------------------------ RENDER ----------------------------- */
  if (loading) {
    return (
      <section className="max-w-2xl">
        <div
          className="rounded-2xl border border-line bg-white p-10 text-center
          dark:bg-slate-900 dark:border-slate-800"
        >
          <p className="text-sm text-muted dark:text-slate-400">
            Memuat data user…
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
            Edit User
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Perbarui detail user #{userId}.
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
          {original?.[COLUMN] && (
            <p className="mt-2 text-xs text-muted dark:text-slate-400">
              Kosongkan pilihan foto untuk mempertahankan foto lama.
            </p>
          )}
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

        {/* Password (opsional) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
            Password Baru{" "}
            <span className="font-normal text-muted dark:text-slate-400">
              (opsional)
            </span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Kosongkan jika tidak ingin mengganti"
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
            Biarkan kosong jika tidak ingin mengubah password.
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
            {submitting ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </section>
  );
}
