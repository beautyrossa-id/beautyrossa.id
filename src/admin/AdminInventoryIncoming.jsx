import React, { useEffect, useMemo, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import AdminNav from "./AdminNav.jsx";

const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
const formatDateTime = (d) =>
  new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const EMPTY_LINE = { product_id: "", quantity: "", unit_cost: "", batch_number: "", expiry_date: "" };

export default function AdminInventoryIncoming() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [productsRes, warehousesRes, suppliersRes, historyRes] = await Promise.all([
      supabase.from("products").select("id, sku, name, unit").eq("status", "active").order("name"),
      supabase.from("warehouses").select("id, name").eq("is_active", true).order("name"),
      supabase.from("suppliers").select("id, name").order("name"),
      supabase
        .from("inventory_transactions")
        .select(
          "id, transaction_number, reference_no, notes, created_at, warehouses(name), suppliers(name), inventory_transaction_items(quantity, unit_cost, products(name, sku))"
        )
        .eq("type", "in")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    if (productsRes.error || warehousesRes.error || suppliersRes.error || historyRes.error) {
      setError("Gagal memuat data. Coba refresh halaman.");
      setLoading(false);
      return;
    }

    setProducts(productsRes.data || []);
    setWarehouses(warehousesRes.data || []);
    setSuppliers(suppliersRes.data || []);
    setHistory(historyRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, productSearch]);

  const openForm = () => {
    setWarehouseId(warehouses[0]?.id || "");
    setSupplierId("");
    setReferenceNo("");
    setNotes("");
    setLines([{ ...EMPTY_LINE }]);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const addLine = () => setLines([...lines, { ...EMPTY_LINE }]);
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));
  const updateLine = (idx, field, value) => {
    const next = [...lines];
    next[idx] = { ...next[idx], [field]: value };
    setLines(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!warehouseId) {
      setFormError("Pilih lokasi/gudang penerimaan.");
      return;
    }
    const validLines = lines.filter((l) => l.product_id && l.quantity);
    if (validLines.length === 0) {
      setFormError("Tambahkan minimal 1 produk dengan jumlah masuk.");
      return;
    }
    for (const l of validLines) {
      if (Number(l.quantity) <= 0) {
        setFormError("Jumlah masuk harus lebih dari 0.");
        return;
      }
    }

    setSaving(true);

    // Ambil admin_users.id milik pengguna yang sedang login
    const { data: sessionData } = await supabase.auth.getSession();
    const authUserId = sessionData?.session?.user?.id;
    let adminUserId = null;
    if (authUserId) {
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", authUserId)
        .single();
      adminUserId = adminRow?.id || null;
    }

    // Ambil nomor transaksi otomatis dari database (anti-bentrok)
    const { data: numberData, error: numberError } = await supabase.rpc("next_transaction_number", {
      p_type: "in",
    });

    if (numberError || !numberData) {
      setFormError("Gagal membuat nomor transaksi. Coba lagi.");
      setSaving(false);
      return;
    }

    // Buat header transaksi
    const { data: trxData, error: trxError } = await supabase
      .from("inventory_transactions")
      .insert({
        transaction_number: numberData,
        type: "in",
        warehouse_id: warehouseId,
        supplier_id: supplierId || null,
        reference_no: referenceNo.trim() || null,
        notes: notes.trim() || null,
        created_by: adminUserId,
      })
      .select("id")
      .single();

    if (trxError || !trxData) {
      setFormError(
        trxError?.code === "42501"
          ? "Akun Anda tidak punya izin mencatat barang masuk (perlu role owner/warehouse)."
          : "Gagal menyimpan transaksi. Coba lagi."
      );
      setSaving(false);
      return;
    }

    // Simpan rincian per produk. Trigger di database otomatis
    // menambah stok masing-masing produk saat baris ini tersimpan.
    const itemsPayload = validLines.map((l) => ({
      transaction_id: trxData.id,
      product_id: l.product_id,
      quantity: Number(l.quantity),
      unit_cost: l.unit_cost === "" ? null : Number(l.unit_cost),
      batch_number: l.batch_number.trim() || null,
      expiry_date: l.expiry_date || null,
    }));

    const { error: itemsError } = await supabase.from("inventory_transaction_items").insert(itemsPayload);

    setSaving(false);

    if (itemsError) {
      setFormError("Transaksi dibuat, tapi sebagian item gagal disimpan. Cek riwayat dan hubungi developer.");
      return;
    }

    setFormOpen(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-lg font-semibold text-[#0F2A4A]">Barang Masuk</h1>
          <button
            onClick={openForm}
            className="flex items-center gap-2 text-sm bg-[#0F2A4A] text-white rounded-lg px-4 py-2 hover:opacity-90 transition"
          >
            <Plus size={16} /> Catat Barang Masuk
          </button>
        </div>

        {loading && <p className="text-sm text-[#5B6B7F] py-10 text-center">Memuat data...</p>}

        {!loading && error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="border border-[#DCE3EC] rounded-xl bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DCE3EC] bg-[#F0F4F9] text-sm font-medium text-[#5B6B7F]">
              Riwayat Barang Masuk Terbaru
            </div>

            {history.length === 0 && (
              <div className="text-center py-16 text-[#5B6B7F]">
                <p className="mb-1">Belum ada riwayat barang masuk.</p>
                <p className="text-xs">Klik "Catat Barang Masuk" untuk mulai mencatat.</p>
              </div>
            )}

            {history.map((trx) => (
              <div key={trx.id} className="px-4 py-4 border-b border-[#DCE3EC] last:border-0">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <span className="font-medium text-[#0F2A4A]">{trx.transaction_number}</span>
                    {trx.suppliers?.name && (
                      <span className="text-[#7C8A9A] text-sm"> · dari {trx.suppliers.name}</span>
                    )}
                    {trx.warehouses?.name && (
                      <span className="text-[#7C8A9A] text-sm"> · ke {trx.warehouses.name}</span>
                    )}
                  </div>
                  <span className="text-xs text-[#7C8A9A]">{formatDateTime(trx.created_at)}</span>
                </div>
                {trx.reference_no && (
                  <p className="text-xs text-[#7C8A9A] mb-2">No. Invoice/Surat Jalan: {trx.reference_no}</p>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#5B6B7F]">
                  {(trx.inventory_transaction_items || []).map((item, i) => (
                    <span key={i}>
                      {item.products?.name} ({item.products?.sku}) — {item.quantity} unit
                      {item.unit_cost ? ` @ ${rupiah(item.unit_cost)}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-20">
          <div className="w-full max-w-2xl bg-white rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#0F2A4A]">Catat Barang Masuk</h2>
              <button onClick={closeForm} className="text-[#7C8A9A] hover:text-[#0F2A4A]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lokasi / Gudang Penerimaan *">
                  <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="input">
                    <option value="">Pilih lokasi</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Supplier">
                  <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input">
                    <option value="">Pilih supplier (opsional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="No. Invoice / Surat Jalan">
                <input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="input"
                  placeholder="Opsional"
                />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[#5B6B7F] block">Produk yang Masuk *</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7C8A9A]" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Cari produk untuk baris baru..."
                      className="text-xs border border-[#DCE3EC] rounded-lg pl-7 pr-2 py-1.5 w-52"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {lines.map((line, idx) => (
                    <div key={idx} className="border border-[#DCE3EC] rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <select
                            value={line.product_id}
                            onChange={(e) => updateLine(idx, "product_id", e.target.value)}
                            className="input text-sm"
                          >
                            <option value="">Pilih produk</option>
                            {filteredProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.sku} — {p.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                            placeholder="Jumlah"
                            className="input text-sm"
                          />
                          <input
                            type="number"
                            min="0"
                            value={line.unit_cost}
                            onChange={(e) => updateLine(idx, "unit_cost", e.target.value)}
                            placeholder="Harga modal/unit (opsional)"
                            className="input text-sm"
                          />
                          <input
                            value={line.batch_number}
                            onChange={(e) => updateLine(idx, "batch_number", e.target.value)}
                            placeholder="No. Batch (opsional)"
                            className="input text-sm"
                          />
                          <input
                            type="date"
                            value={line.expiry_date}
                            onChange={(e) => updateLine(idx, "expiry_date", e.target.value)}
                            className="input text-sm col-span-2"
                          />
                        </div>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-[#7C8A9A] hover:text-red-600 mt-1.5"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addLine}
                  className="mt-2 text-xs text-[#0F2A4A] flex items-center gap-1 hover:opacity-70"
                >
                  <Plus size={13} /> Tambah baris produk
                </button>
              </div>

              <Field label="Catatan">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={2} />
              </Field>

              {formError && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-sm border border-[#DCE3EC] rounded-lg px-4 py-2 hover:bg-[#F0F4F9] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="text-sm bg-[#0F2A4A] text-white rounded-lg px-4 py-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan & Tambah Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          font-size: 0.875rem;
          border: 1px solid #DCE3EC;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #0F2A4A;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-[#5B6B7F] block mb-1">{label}</label>
      {children}
    </div>
  );
}
