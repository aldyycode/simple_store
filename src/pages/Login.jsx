import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const {login} = useAuth();
  const [form, setForm] = useState({identifier: "", password: ""});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.identifier.trim() || !form.password) {
      setError("Username/email dan password wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(form.identifier, form.password);
      if (res && !res.ok) {
        setError(res.error || "Login gagal.");
      }
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* KIRI — Branding (desktop) */}
      <div
        className="relative hidden w-1/2 overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between
        dark:bg-slate-900 p-10 text-white"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink text-sm font-bold">
            A
          </div>
          <span className="text-sm font-semibold tracking-wide">
            Admin Panel
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold leading-tight">
            Kelola bisnis Anda
            <br />
            dengan mudah.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Dashboard admin untuk mengelola produk, user, dan data operasional
            lainnya dalam satu tempat.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Admin Panel. All rights reserved.
        </p>
      </div>

      {/* KANAN — Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white text-sm font-semibold dark:bg-white dark:text-ink">
              A
            </div>
            <span className="text-sm font-semibold text-ink dark:text-white">
              Admin Panel
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-ink dark:text-white">
              Masuk ke akun
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-slate-400">
              Gunakan username/email dan password admin Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Identifier */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
                Username atau Email
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-slate-400" />
                <input
                  type="text"
                  autoComplete="username"
                  value={form.identifier}
                  onChange={(e) =>
                    setForm({...form, identifier: e.target.value})
                  }
                  placeholder="admin"
                  className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2.5 text-sm
                    text-ink placeholder:text-muted
                    focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30
                    dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500
                    dark:focus:ring-white/10 dark:focus:border-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink dark:text-white">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-line bg-white pl-9 pr-10 py-2.5 text-sm
                    text-ink placeholder:text-muted
                    focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30
                    dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500
                    dark:focus:ring-white/10 dark:focus:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5
                    text-muted hover:bg-surface dark:text-slate-400 dark:hover:bg-slate-800"
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
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600
                dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg
                bg-ink px-4 py-2.5 text-sm font-medium text-white
                hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed transition
                dark:bg-white dark:text-ink dark:hover:bg-white/90"
            >
              {submitting ? "Memproses…" : "Masuk"}
              {!submitting && (
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted dark:text-slate-500">
            Belum punya akses? Hubungi administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
