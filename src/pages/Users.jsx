import {useState, useEffect, useMemo} from "react";
import supabase from "../config/supabaseClient";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import UserDetailDrawer from "../components/UserDetailDrawer";

const PAGE_SIZE = 10;

export default function Users({onAdd, onEdit}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Drawer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const isDark = () => document.documentElement.classList.contains("dark");

  const swalTheme = {
    background: isDark() ? "#0f172a" : "#ffffff",
    color: isDark() ? "#E5E7EB" : "#0F172A",
    customClass: {popup: "rounded-2xl"},
  };

  /* ----------------------------- FETCH ----------------------------- */
  const fetchUsers = async () => {
    setLoading(true);
    const {data, error} = await supabase
      .from("users")
      .select("*")
      .order("id", {ascending: true});

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: error.message,
        ...swalTheme,
      });
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ----------------------------- HELPERS ----------------------------- */
  const getPhoto = (u) => u.photo || u.photo_url || u.avatar || "";
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  /* ----------------------------- SEARCH ----------------------------- */
  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q),
    );
  }, [users, search]);

  /* --------------------------- PAGINATION --------------------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ----------------------------- ACTIONS ----------------------------- */
  const handleAdd = () => {
    if (onAdd) onAdd();
    else
      Swal.fire({
        icon: "info",
        title: "Tambah User",
        text: "Navigasi ke halaman tambah user.",
        ...swalTheme,
      });
  };

  const handleDetail = (user) => {
    setSelected(user);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setSelected(null), 300);
  };

  const handleEdit = (user) => {
    closeDetail();
    if (onEdit) onEdit(user);
    else
      Swal.fire({
        icon: "info",
        title: "Edit User",
        text: `Edit: ${user.name}`,
        confirmButtonColor: "#0F172A",
        ...swalTheme,
      });
  };

  const handleDelete = async (user) => {
    closeDetail();
    const res = await Swal.fire({
      title: "Hapus user?",
      text: `"${user.name}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: isDark() ? "#334155" : "#E2E8F0",
      ...swalTheme,
    });
    if (!res.isConfirmed) return;

    const {error} = await supabase.from("users").delete().eq("id", user.id);
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: error.message,
        ...swalTheme,
      });
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    Swal.fire({
      icon: "success",
      title: "Terhapus",
      timer: 1200,
      showConfirmButton: false,
      ...swalTheme,
    });
  };

  /* ------------------------ ZOOM FOTO PROFIL ------------------------ */
  const handleZoom = (user) => {
    const url = getPhoto(user);
    Swal.fire({
      imageUrl: url || undefined,
      imageAlt: user.name,
      title: user.name,
      html: url
        ? ""
        : `<div class="flex flex-col items-center justify-center py-8">
            <div style="width:120px;height:120px;border-radius:9999px;background:#0F172A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:600;margin:0 auto;">
              ${getInitials(user.name)}
            </div>
            <p style="margin-top:12px;color:#64748B;font-size:13px;">Belum ada foto profil</p>
          </div>`,
      width: "min(92vw, 480px)",
      showConfirmButton: false,
      showCloseButton: true,
      padding: "1rem",
      backdrop: "rgba(0,0,0,.75)",
      customClass: {
        image: "rounded-full",
        popup: "rounded-2xl",
      },
      ...swalTheme,
    });
  };

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-white">
            Users
          </h2>
          <p className="text-sm text-muted dark:text-slate-400">
            Kelola data user: {filtered.length} item
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg
            bg-ink px-4 py-2.5 text-sm font-medium text-white
            hover:bg-ink/90 transition
            dark:bg-white dark:text-ink dark:hover:bg-white/90"
        >
          <PlusIcon className="h-4 w-4" />
          Tambah User
        </button>
      </div>

      {/* TOOLBAR: Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2 text-sm
              text-ink placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30
              dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500
              dark:focus:ring-white/10 dark:focus:border-slate-600"
          />
        </div>
      </div>

      {/* TABEL */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-left dark:bg-slate-900/60 dark:border-slate-800">
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400">
                  User
                </th>
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400">
                  Password
                </th>
                <th className="px-4 py-3 font-medium text-muted dark:text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-slate-800">
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted dark:text-slate-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              )}

              {!loading && paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted dark:text-slate-400"
                  >
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}

              {!loading &&
                paginated.map((u) => {
                  const photo = getPhoto(u);
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-surface/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* PHOTO + NAME */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleZoom(u)}
                            title="Lihat foto"
                            className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-full
                              border border-line dark:border-slate-800
                              focus:outline-none focus:ring-2 focus:ring-ink/20
                              bg-ink/5 dark:bg-slate-800"
                          >
                            {photo ? (
                              <img
                                src={photo}
                                alt={u.name}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-ink dark:text-white">
                                {getInitials(u.name)}
                              </span>
                            )}
                            <span
                              className="absolute inset-0 flex items-center justify-center
                              bg-black/0 text-white opacity-0 transition
                              group-hover:bg-black/40 group-hover:opacity-100"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                            </span>
                          </button>

                          <div className="min-w-0">
                            <p className="font-medium text-ink dark:text-white truncate">
                              {u.name || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-3 text-ink dark:text-white whitespace-nowrap">
                        {u.email || "-"}
                      </td>

                      {/* PASSWORD (masked) */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-md bg-surface px-2 py-0.5 text-xs font-mono text-muted dark:bg-slate-800 dark:text-slate-300">
                          ••••••••
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDetail(u)}
                            title="Detail"
                            className="rounded-md p-2 text-muted hover:bg-surface hover:text-ink transition
                              dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(u)}
                            title="Edit"
                            className="rounded-md p-2 text-muted hover:bg-sky-50 hover:text-sky-600 transition
                              dark:text-slate-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-400"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            title="Delete"
                            className="rounded-md p-2 text-muted hover:bg-rose-50 hover:text-rose-600 transition
                              dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between
          border-t border-line px-4 py-3 text-xs text-muted
          dark:border-slate-800 dark:text-slate-400"
        >
          <span>
            Menampilkan{" "}
            <b className="text-ink dark:text-white">
              {filtered.length === 0 ? 0 : startIdx + 1}–
              {Math.min(startIdx + PAGE_SIZE, filtered.length)}
            </b>{" "}
            dari <b className="text-ink dark:text-white">{filtered.length}</b>{" "}
            user
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1 || loading}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1
                hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed
                dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Prev
            </button>

            {Array.from({length: totalPages}).map((_, i) => {
              const n = i + 1;
              const visible =
                totalPages <= 5 ||
                n === 1 ||
                n === totalPages ||
                Math.abs(n - safePage) <= 1;
              if (!visible) {
                if (n === 2 && safePage > 3)
                  return (
                    <span key={`l-${n}`} className="px-1">
                      …
                    </span>
                  );
                if (n === totalPages - 1 && safePage < totalPages - 2)
                  return (
                    <span key={`r-${n}`} className="px-1">
                      …
                    </span>
                  );
                return null;
              }
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md border px-2.5 py-1 transition
                    ${
                      n === safePage
                        ? "border-line bg-surface text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        : "border-line hover:bg-surface dark:border-slate-800 dark:hover:bg-slate-800"
                    }`}
                >
                  {n}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || loading}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1
                hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed
                dark:border-slate-800 dark:hover:bg-slate-800"
            >
              Next
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DRAWER DETAIL */}
      <UserDetailDrawer
        open={detailOpen}
        user={selected}
        onClose={closeDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onZoom={handleZoom}
        getPhoto={getPhoto}
        getInitials={getInitials}
      />
    </section>
  );
}
