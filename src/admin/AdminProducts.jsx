import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Search, X, Ban, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import AdminNav from "./AdminNav.jsx";

const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

// Ditandai kalau kedaluwarsa dalam 90 hari ke depan (sejalan dengan
// rencana notifikasi 90/60/30/7 hari di modul Batch nanti)
const isNearExpiry = (d) => {
  if (!d) return false;
  const diffDays = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
  return diffDays <= 90;
};

const UNIT_OPTIONS = ["pcs", "botol", "box", "tube", "sachet"];

const EMPTY_FORM = {
  id: null,
  sku: "",
  name: "",
  category_id: "",
  brand: "",
  description: "",
  unit: "pcs",
  size_label: "",
  cost_price: "",
  sell_price: "",
  min_stock: "",
  bpom_number: "",
  bpom_expiry_date: "",
  expiry_date: "",
  is_active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("aktif"); // aktif | nonaktif | semua

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, sku, name, brand, unit, size_label, cost_price, sell_price, min_stock, bpom_number, bpom_expiry_date, expiry_date, is_active, category_id, product_categories(name)")
        .order("name", { ascending: true }),
      supabase.from("product_categories").select("id, name").order("name"),
    ]);

    if (productsRes.error || categoriesRes.error) {
      setError("Gagal memuat data produk. Coba refresh halaman.");
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setProducts(productsRes.data || []);
    setCategories(categoriesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter === "aktif" && !p.is_active) return false;
      if (statusFilter === "nonaktif" && p.is_active) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
      );
    });
  }, [products, search, statusFilter]);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (p) => {
    setForm({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category_id: p.category_id || "",
      brand: p.brand || "",
      description: p.description || "",
      unit: p.unit || "pcs",
      size_label: p.size_label || "",
      cost_price: p.cost_price ?? "",
      sell_price: p.sell_price ?? "",
      min_stock: p.min_stock ?? "",
      bpom_number: p.bpom_number || "",
      bpom_expiry_date: p.bpom_expiry_date || "",
      expiry_date: p.expiry_date || "",
      is_active: p.is_active,
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.sku.trim() || !form.name.trim()) {
      setFormError("SKU dan Nama Produk wajib diisi.");
      return;
    }

    setSaving(true);

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      category_id: form.category_id || null,
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      unit: form.unit,
      size_label: form.size_label.trim() || null,
      cost_price: form.cost_price === "" ? 0 : Number(form.cost_price),
      sell_price: form.sell_price === "" ? 0 : Number(form.sell_price),
      min_stock: form.min_stock === "" ? 0 : Number(form.min_stock),
      bpom_number: form.bpom_number.trim() || null,
      bpom_expiry_date: form.bpom_expiry_date || null,
      expiry_date: form.expiry_date || null,
      is_active: form.is_active,
    };

    // Kolom created_by/updated_by merujuk ke admin_users.id, BUKAN ke
    // auth.users.id (ID sesi login). Jadi ID admin_users milik pengguna
    // yang sedang login perlu dicari dulu sebelum insert/update.
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

    let saveError = null;

    if (form.id) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ ...payload, updated_by: adminUserId })
        .eq("id", form.id);
      saveError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert({ ...payload, created_by: adminUserId, updated_by: adminUserId });
      saveError = insertError;
    }

    setSaving(false);

    if (saveError) {
      // SKU unik -> pesan lebih jelas kalau bentrok
      if (saveError.code === "23505") {
        setFormError("SKU ini sudah dipakai produk lain. Gunakan SKU yang berbeda.");
      } else if (saveError.code === "42501") {
        setFormError("Akun Anda tidak punya izin untuk menyimpan produk (perlu role owner/administrator).");
      } else {
        setFormError("Gagal menyimpan produk. Coba lagi.");
      }
      return;
    }

    setFormOpen(false);
    loadData();
  };

  const toggleActive = async (p) => {
    // Soft delete: nonaktifkan, bukan hapus permanen dari database.
    const { error: toggleError } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);

    if (!toggleError) loadData();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-lg font-semibold text-[#0F2A4A]">Produk</h1>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 text-sm bg-[#0F2A4A] text-white rounded-lg px-4 py-2 hover:opacity-90 transition"
          >
            <Plus size={16} /> Tambah Produk
          </button>
        </div>

        {/* Filter & search */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8A9A]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, SKU, atau merek..."
              className="text-sm border border-[#DCE3EC] rounded-lg pl-9 pr-3 py-2 bg-white w-64 focus:outline-none focus:border-[#0F2A4A]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-[#DCE3EC] rounded-lg px-3 py-2 bg-white"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="semua">Semua</option>
          </select>
        </div>

        {loading && <p className="text-sm text-[#5B6B7F] py-10 text-center">Memuat data produk...</p>}

        {!loading && error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-[#5B6B7F]">
            <p className="mb-1">Belum ada produk yang cocok.</p>
            <p className="text-xs">Klik "Tambah Produk" untuk mulai menambahkan.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto border border-[#DCE3EC] rounded-xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F4F9]">
                <tr className="text-left text-[#5B6B7F]">
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Nama Produk</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Satuan</th>
                  <th className="px-4 py-3 font-medium">Harga Modal</th>
                  <th className="px-4 py-3 font-medium">Harga Jual</th>
                  <th className="px-4 py-3 font-medium">Stok Min.</th>
                  <th className="px-4 py-3 font-medium">Kedaluwarsa</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-[#DCE3EC]">
                    <td className="px-4 py-3 font-medium text-[#0F2A4A]">{p.sku}</td>
                    <td className="px-4 py-3 text-[#0F2A4A]">
                      {p.name}
                      {p.brand && <div className="text-xs text-[#7C8A9A]">{p.brand}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#5B6B7F]">{p.product_categories?.name || "-"}</td>
                    <td className="px-4 py-3 text-[#5B6B7F]">
                      {p.unit}
                      {p.size_label ? ` · ${p.size_label}` : ""}
                    </td>
                    <td className="px-4 py-3 text-[#5B6B7F]">{rupiah(p.cost_price)}</td>
                    <td className="px-4 py-3 text-[#0F2A4A]">{rupiah(p.sell_price)}</td>
                    <td className="px-4 py-3 text-[#5B6B7F]">{p.min_stock}</td>
                    <td className="px-4 py-3">
                      {p.expiry_date ? (
                        <span className={isNearExpiry(p.expiry_date) ? "text-red-600 font-medium" : "text-[#5B6B7F]"}>
                          {formatDate(p.expiry_date)}
                        </span>
                      ) : (
                        <span className="text-[#B8C2CE]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                          p.is_active ? "bg-[#EAF4EC] text-[#1E7A34]" : "bg-[#F3E7D8] text-[#8A5A1E]"
                        }`}
                      >
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(p)}
                          title="Ubah"
                          className="p-1.5 rounded-lg hover:bg-[#F0F4F9] text-[#5B6B7F]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          title={p.is_active ? "Nonaktifkan" : "Aktifkan"}
                          className="p-1.5 rounded-lg hover:bg-[#F0F4F9] text-[#5B6B7F]"
                        >
                          {p.is_active ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-20">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#0F2A4A]">
                {form.id ? "Ubah Produk" : "Tambah Produk"}
              </h2>
              <button onClick={closeForm} className="text-[#7C8A9A] hover:text-[#0F2A4A]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="SKU *">
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input"
                    placeholder="BR-001"
                  />
                </Field>
                <Field label="Merek">
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Nama Produk *">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="Deskripsi Singkat">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  rows={2}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Kategori">
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Satuan">
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="input"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Isi / Ukuran">
                  <input
                    value={form.size_label}
                    onChange={(e) => setForm({ ...form, size_label: e.target.value })}
                    className="input"
                    placeholder="mis. 50 ml"
                  />
                </Field>
                <Field label="Stok Minimum">
                  <input
                    type="number"
                    min="0"
                    value={form.min_stock}
                    onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Harga Modal (Rp)">
                  <input
                    type="number"
                    min="0"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Harga Jual (Rp)">
                  <input
                    type="number"
                    min="0"
                    value={form.sell_price}
                    onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="No. BPOM">
                <input
                  value={form.bpom_number}
                  onChange={(e) => setForm({ ...form, bpom_number: e.target.value })}
                  className="input"
                  placeholder="mis. NA18211900123"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Kedaluwarsa BPOM">
                  <input
                    type="date"
                    value={form.bpom_expiry_date}
                    onChange={(e) => setForm({ ...form, bpom_expiry_date: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Kedaluwarsa Produk">
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#0F2A4A]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Produk aktif (tampil untuk dijual)
              </label>

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
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kelas util kecil supaya input konsisten tanpa perlu file CSS terpisah */}
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
