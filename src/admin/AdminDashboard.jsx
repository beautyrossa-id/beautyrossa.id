import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import AdminNav from "./AdminNav.jsx";

const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    penjualanHariIni: 0,
    penjualanBulanIni: 0,
    jumlahPesanan: 0,
    menungguKonfirmasi: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const [todayRes, monthRes, totalRes, pendingRes] = await Promise.all([
        supabase.from("orders").select("total").gte("order_date", startOfToday()),
        supabase.from("orders").select("total").gte("order_date", startOfMonth()),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("order_status", "menunggu_konfirmasi"),
      ]);

      if (!isMounted) return;

      if (todayRes.error || monthRes.error || totalRes.error || pendingRes.error) {
        setError("Gagal memuat ringkasan dashboard. Coba refresh halaman.");
        setLoading(false);
        return;
      }

      const sum = (rows) => (rows || []).reduce((s, r) => s + Number(r.total || 0), 0);

      setStats({
        penjualanHariIni: sum(todayRes.data),
        penjualanBulanIni: sum(monthRes.data),
        jumlahPesanan: totalRes.count || 0,
        menungguKonfirmasi: pendingRes.count || 0,
      });
      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    { label: "Penjualan Hari Ini", value: rupiah(stats.penjualanHariIni) },
    { label: "Penjualan Bulan Ini", value: rupiah(stats.penjualanBulanIni) },
    { label: "Jumlah Pesanan", value: stats.jumlahPesanan },
    { label: "Menunggu Konfirmasi", value: stats.menungguKonfirmasi },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-lg font-semibold text-[#282422] mb-6">Ringkasan</h1>

        {loading && <p className="text-sm text-[#6D6662] py-10 text-center">Memuat data...</p>}

        {!loading && error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="border border-[#E8E1DB] rounded-xl bg-white p-5">
                <div className="text-xs text-[#6D6662] mb-2">{c.label}</div>
                <div className="text-2xl font-semibold text-[#282422]">{c.value}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
