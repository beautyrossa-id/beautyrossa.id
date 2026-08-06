import * as XLSX from "xlsx";

const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

const tanggalIndo = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

/**
 * Export laporan penjualan ke file Excel (.xlsx).
 * Karena keterbatasan library ringan (xlsx/SheetJS versi gratis),
 * beberapa hal dari spesifikasi awal (freeze header, warna sel) belum
 * didukung penuh - yang sudah diterapkan: header info, lebar kolom
 * otomatis, dan baris total di bawah.
 */
export function exportOrdersToExcel({ rows, periodLabel, summary, adminName }) {
  const wb = XLSX.utils.book_new();

  const infoRows = [
    ["Beauty Rossa - Laporan Penjualan"],
    [`Periode: ${periodLabel}`],
    [`Dicetak: ${tanggalIndo(new Date())}${adminName ? " oleh " + adminName : ""}`],
    [],
  ];

  const header = [
    "Tanggal",
    "No. Pesanan",
    "Nama Pelanggan",
    "No. WhatsApp",
    "Subtotal",
    "Diskon",
    "Ongkir",
    "Total",
    "Metode Bayar",
    "Status Bayar",
    "Status Pesanan",
  ];

  const dataRows = rows.map((o) => [
    tanggalIndo(o.order_date),
    o.order_number,
    o.customers?.full_name || "-",
    o.customers?.whatsapp || "-",
    o.subtotal,
    o.discount,
    o.shipping_cost ?? 0,
    o.total,
    o.payment_method,
    o.payment_status,
    o.order_status,
  ]);

  const totalRow = [
    "",
    "",
    "",
    "TOTAL",
    summary.omzetKotor,
    summary.totalDiskon,
    summary.totalOngkir,
    summary.omzetBersih,
    "",
    "",
    `${summary.jumlahPesanan} pesanan`,
  ];

  const sheetData = [...infoRows, header, ...dataRows, [], totalRow];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws["!cols"] = [
    { wch: 14 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

  const filename = `BeautyRossa_Laporan_Penjualan_${new Date().toISOString().slice(0, 7)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export ke CSV (UTF-8 + BOM supaya karakter Rupiah/nama tidak rusak di Excel).
 */
export function exportOrdersToCSV({ rows, periodLabel }) {
  const header = [
    "Tanggal",
    "No. Pesanan",
    "Nama Pelanggan",
    "No. WhatsApp",
    "Subtotal",
    "Diskon",
    "Ongkir",
    "Total",
    "Metode Bayar",
    "Status Bayar",
    "Status Pesanan",
  ];

  const escapeCell = (val) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [header.map(escapeCell).join(",")];
  rows.forEach((o) => {
    lines.push(
      [
        tanggalIndo(o.order_date),
        o.order_number,
        o.customers?.full_name || "-",
        o.customers?.whatsapp || "-",
        o.subtotal,
        o.discount,
        o.shipping_cost ?? 0,
        o.total,
        o.payment_method,
        o.payment_status,
        o.order_status,
      ]
        .map(escapeCell)
        .join(",")
    );
  });

  const csvContent = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BeautyRossa_Laporan_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { rupiah, tanggalIndo };
