import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

/**
 * Membungkus halaman admin. Memastikan:
 * 1. Ada session Supabase Auth aktif.
 * 2. User itu punya baris di admin_users dengan is_active = true.
 * Kalau salah satu gagal, redirect ke /admin/login.
 */
export default function RequireAdmin({ children }) {
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        if (isMounted) setStatus("denied");
        return;
      }

      // RLS "admin_users_select_self" mengizinkan user membaca barisnya sendiri
      const { data: adminRow, error } = await supabase
        .from("admin_users")
        .select("id, role, is_active")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (error || !adminRow || !adminRow.is_active) {
        if (isMounted) setStatus("denied");
        return;
      }

      if (isMounted) setStatus("allowed");
    };

    check();
    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F0EA] font-sans text-sm text-[#6D6662]">
        Memeriksa akses...
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
