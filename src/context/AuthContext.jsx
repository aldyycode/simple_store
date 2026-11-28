import {createContext, useContext, useEffect, useState} from "react";
import supabase from "../config/supabaseClient";

const AuthContext = createContext(null);
const STORAGE_KEY = "admin_session";

export function AuthProvider({children}) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restore session saat mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id && parsed?.username) {
          setAdmin(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  /* Login: cek username ATAU email */
  const login = async (identifier, password) => {
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId || !password) {
      return {ok: false, error: "Username/email dan password wajib diisi."};
    }

    // Cari berdasarkan username dulu
    let {data, error} = await supabase
      .from("admin")
      .select("id, username, email, password")
      .eq("username", cleanId)
      .maybeSingle();

    if (error) {
      console.error("[AUTH] username query error:", error);
      return {ok: false, error: error.message};
    }

    // Kalau tidak ketemu, cari berdasarkan email
    if (!data) {
      const emailRes = await supabase
        .from("admin")
        .select("id, username, email, password")
        .eq("email", cleanId)
        .maybeSingle();

      if (emailRes.error) {
        console.error("[AUTH] email query error:", emailRes.error);
        return {ok: false, error: emailRes.error.message};
      }
      data = emailRes.data;
    }

    if (!data) {
      return {ok: false, error: "Akun tidak ditemukan."};
    }

    if (String(data.password) !== String(password)) {
      return {ok: false, error: "Password salah."};
    }

    const session = {
      id: data.id,
      username: data.username,
      email: data.email,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setAdmin(session);
    return {ok: true};
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{admin, loading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
};
