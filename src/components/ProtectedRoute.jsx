import {useAuth} from "../context/AuthContext";
import Login from "../pages/Login";

export default function ProtectedRoute({children}) {
  const {admin, loading} = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink dark:border-slate-800 dark:border-t-white" />
          <p className="text-sm text-muted dark:text-slate-400">Memuat…</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Login />;
  return children;
}
