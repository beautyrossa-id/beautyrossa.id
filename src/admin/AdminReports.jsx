import React, { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import AdminNav from "./AdminNav.jsx";
import { exportOrdersToExcel, exportOrdersToCSV, rupiah } from "../lib/exportUtils.js";

const STATUS_LABEL = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const PERIOD_OPTIONS = [
  { value: "hari_ini", label: "Hari Ini" },
  { value: "minggu_ini", label: "Minggu Ini" },
  { value: "bulan_ini", label: "Bulan Ini" },
  { value: "tahun_ini", label: "Tahun Ini" },
  { value: "semua", label: "Semua" },
  { value: "custom", label: "Rentang Khusus" },
];

function getPeriodRange(period, customFrom, customTo) {
  const now = new Date();
  let from = null;
  let to = null;

  if (period === "hari_ini") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "minggu_ini") {
    const day = now.getDay() === 0 ? 7 : now.getDay(); // Senin = 1
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1));
  } else if (period === "bulan_ini") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "tahun_ini") {
    from = new Date(now.getFullYear(), 0, 1);
  } else if (period === "custom") {
    from = customFrom ? new Date(customFrom) : null;
    to = customTo ? new Date(customTo + "T23:59:59") : null;
  }
  // "semua" -> from & to tetap null

  return { from, to };
}

export default function AdminReports() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("bulan_ini");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [paymentFilter, setPaymentFilter] = useState("semua");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const { from, to } = getPeriodRange(period, customFrom, customTo);

      let query = supabase
        .from("orders")
        .select(
          "id, order_number, order_date, subtotal, discount, shipping_cost, total, payment_method, payment_status, order_status, customers(full_name, whatsapp)"
        )
        .order("order_date", { ascending: false })
        .limit(1000);

      if (from) query = query.gte("order_date", from.toISOString());
      if (to) query = query.lte("order_date", to.toISOString());
      if (statusFilter !== "semua") query = query.eq("order_status", statusFilter);
      if (paymentFilter !== "semua") query = query.eq("payment_method", paymentFilter);

      const { data, error: fetchError } = await query;

      if (!isMounted) return;

      if (fetchError) {
        setError("Gagal memuat laporan. Coba refresh halaman.");
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
  }, [period, customFrom, customTo, statusFilter, paymentFilter]);

  const summary = useMemo(() => {
    const omzetKotor = orders.reduce((s, o) => s + Number(o.subtotal || 0), 0);
    const totalDiskon = orders.reduce((s, o) => s + Number(o.discount || 0), 0);
    const totalOngkir = orders.reduce((s, o) => s + Number(o.shipping_cost || 0), 0);
    const omzetBersih = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const jumlahPesanan = orders.length;
    const rataRata = jumlahPesanan > 0 ? omzetBersih / jumlahPesanan : 0;
    return { omzetKotor, totalDiskon, totalOngkir, omzetBersih, jumlahPesanan, rataRata };
  }, [orders]);

  const periodLabel = useMemo(() => {
    const found = PERIOD_OPTIONS.find((p) => p.value === period);
    if (period === "custom") {
      return `${customFrom || "?"} s/d ${customTo || "?"}`;
    }
    return found?.label || period;
  }, [period, customFrom, customTo]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-sans">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-lg font-semibold text-[#282422]">Laporan Penjualan</h1>
          <div className="flex gap-2">
            <button
              onClick={() => exportOrdersToCSV({ rows: orders, periodLabel })}
              disabled={orders.length === 0}
              className="flex items-center gap-2 text-sm border border-[#E8E1DB] rounded-lg px-4 py-2 hover:bg-[#F6F0EA] transition disabled:opacity-40"
            >
              <Download size={15} /> CSV
            </button>
            <button
              onClick={() =>
                exportOrdersToExcel({ rows: orders, periodLabel, summary: mapSummaryForExport(summary) })
              }
              disabled={orders.length === 0}
              className="flex items-center gap-2 text-sm bg-[#282422] text-white rounded-lg px-4 py-2 hover:opacity-90 transition disabled:opacity-40"
            >
              <FileSpreadsheet size={15} /> Excel
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm border border-[#E8E1DB] rounded-lg px-3 py-2 bg-white"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {period === "custom" && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-sm border border-[#E8E1DB] rounded-lg px-3 py-2 bg-white"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-sm border border-[#E8E1DB] rounded-lg px-3 py-2 bg-white"
              />
            </>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-[#E8E1DB] rounded-lg px-3 py-2 bg-white"
          >
            <option value="semua">Semua Status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-sm border border-[#E8E1DB] rounded-lg px-3 py-2 bg-white"
          >
            <option value="semua">Semua Metode Bayar</option>
            <option value="Transfer Bank">Transfer Bank</option>
            <option value="COD">COD</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        {/* Ringkasan */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              ["Omzet Kotor", rupiah(summary.omzetKotor)],
              ["Diskon", rupiah(summary.totalDiskon)],
              ["Ongkir", rupiah(summary.totalOngkir)],
              ["Omzet Bersih", rupiah(summary.omzetBersih)],
              ["Jumlah Pesanan", summary.jumlahPesanan],
              ["Rata-rata", rupiah(Math.round(summary.rataRata))],
            ].map(([label, value]) => (
              <div key={label} className="border border-[#E8E1DB] rounded-lg bg-white p-3">
                <div className="text-[11px] text-[#6D6662] mb-1">{label}</div>
                <div className="text-sm font-semibold text-[#282422]">{value}</div>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="text-sm text-[#6D6662] py-10 text-center">Memuat laporan...</p>}

        {!loading && error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-[#6D6662] py-16">Tidak ada pesanan pada periode/filter ini.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto border border-[#E8E1DB] rounded-xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F6F0EA]">
                <tr className="text-left text-[#6D6662]">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">No. Pesanan</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Bayar</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[#E8E1DB]">
                    <td className="px-4 py-3 text-[#6D6662]">
                      {new Date(o.order_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#282422]">{o.order_number}</td>
                    <td className="px-4 py-3 text-[#282422]">{o.customers?.full_name || "-"}</td>
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

        {!loading && !error && orders.length >= 1000 && (
          <p className="text-xs text-[#6D6662] mt-3">
            Menampilkan 1000 pesanan pertama pada periode ini. Persempit filter untuk hasil lebih spesifik.
          </p>
        )}
      </main>
    </div>
  );
}

function mapSummaryForExport(summary) {
  return {
    omzetKotor: summary.omzetKotor,
    totalDiskon: summary.totalDiskon,
    totalOngkir: summary.totalOngkir,
    omzetBersih: summary.omzetBersih,
    jumlahPesanan: summary.jumlahPesanan,
  };
}
