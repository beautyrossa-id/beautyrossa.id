import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import AdminNav from "./AdminNav.jsx";

const rupiah = (n) => (n == null ? "-" : "Rp" + Number(n).toLocaleString("id-ID"));

const STATUS_LABEL = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
          "id, order_number, order_date, total, payment_method, payment_status, order_status, customers(full_name, whatsapp)"
        )
        .order("order_date", { ascending: false })
        .limit(50);

      if (!isMounted) return;

      if (fetchError) {
        setError("Gagal memuat data pesanan. Coba refresh halaman.");
        setOrders([]);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-lg font-semibold text-[#282422] mb-6">Daftar Pesanan</h1>

        {loading && <p className="text-sm text-[#6D6662] py-10 text-center">Memuat data pesanan...</p>}

        {!loading && error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 text-[#6D6662]">
            <p className="mb-1">Belum ada pesanan masuk.</p>
            <p className="text-xs">Pesanan dari website publik akan muncul di sini secara otomatis.</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto border border-[#E8E1DB] rounded-xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F6F0EA]">
                <tr className="text-left text-[#6D6662]">
                  <th className="px-4 py-3 font-medium">No. Pesanan</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Pembayaran</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[#E8E1DB]">
                    <td className="px-4 py-3 font-medium text-[#282422]">{o.order_number}</td>
                    <td className="px-4 py-3 text-[#6D6662]">
                      {new Date(o.order_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[#282422]">{o.customers?.full_name || "-"}</div>
                      <div className="text-xs text-[#6D6662]">{o.customers?.whatsapp || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-[#282422]">{rupiah(o.total)}</td>
                    <td className="px-4 py-3 text-[#6D6662]">{o.payment_method}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F6F0EA] text-[#282422] px-2.5 py-1 rounded-full whitespace-nowrap">
                        {STATUS_LABEL[o.order_status] || o.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
