import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Kalau sudah login (session aktif), langsung ke daftar order
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin/orders", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError("Email atau password salah, atau akun belum terdaftar sebagai admin.");
      setLoading(false);
      return;
    }

    navigate("/admin/orders", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F6F0EA] flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-sm bg-white border border-[#E8E1DB] rounded-xl p-8">
        <h1 className="text-xl font-semibold text-[#282422] mb-1">Beauty Rossa Admin</h1>
        <p className="text-sm text-[#6D6662] mb-6">Masuk untuk mengelola pesanan.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#6D6662] block mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#E8E1DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B9897D]"
            />
          </div>
          <div>
            <label className="text-xs text-[#6D6662] block mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E8E1DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B9897D]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#282422] text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
