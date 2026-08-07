import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Search, X } from "lucide-react";
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
const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "draft", label: "Draft" },
];

const EMPTY_FORM = {
  id: null,
  sku: "",
  name: "",
  category: "",
  brand: "",
  description: "",
  unit: "pcs",
  size_label: "",
  cost_price: "",
  price: "",
  promo_price: "",
  min_stock: "",
  bpom_number: "",
  bpom_expiry_date: "",
  expiry_date: "",
  status: "active",
};

// Slug wajib diisi & unik di tabel products. Dibuat otomatis dari SKU
// (yang sudah pasti unik) supaya pengguna tidak perlu mengisi manual.
const slugify = (sku) =>
  sku
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // active | inactive | draft | semua

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("products")
      .select(
        "id, sku, name, category, brand, description, unit, size_label, cost_price, price, promo_price, stock, min_stock, bpom_number, bpom_expiry_date, expiry_date, status"
      )
      .order("name", { ascending: true });

    if (fetchError) {
      setError("Gagal memuat data produk. Coba refresh halaman.");
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Daftar kategori yang sudah pernah dipakai, buat saran autocomplete
  // (category di sini teks bebas, bukan tabel kategori terpisah)
  const knownCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== "semua" && p.status !== statusFilter) return false;
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
      category: p.category || "",
      brand: p.brand || "",
      description: p.description || "",
      unit: p.unit || "pcs",
      size_label: p.size_label || "",
      cost_price: p.cost_price ?? "",
      price: p.price ?? "",
      promo_price: p.promo_price ?? "",
      min_stock: p.min_stock ?? "",
      bpom_number: p.bpom_number || "",
      bpom_expiry_date: p.bpom_expiry_date || "",
      expiry_date: p.expiry_date || "",
      status: p.status || "active",
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.sku.trim() || !form.name.trim() || !form.category.trim()) {
      setFormError("SKU, Nama Produk, dan Kategori wajib diisi.");
      return;
    }

    setSaving(true);

    const payload = {
      sku: form.sku.trim(),
      slug: slugify(form.sku.trim()),
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      unit: form.unit,
      size_label: form.size_label.trim() || null,
      cost_price: form.cost_price === "" ? null : Number(form.cost_price),
      price: form.price === "" ? null : Number(form.price),
      promo_price: form.promo_price === "" ? null : Number(form.promo_price),
      min_stock: form.min_stock === "" ? 0 : Number(form.min_stock),
      bpom_number: form.bpom_number.trim() || null,
      bpom_expiry_date: form.bpom_expiry_date || null,
      expiry_date: form.expiry_date || null,
      status: form.status,
    };

    // created_by/updated_by merujuk ke admin_users.id, BUKAN ke ID sesi
    // login (auth.users.id) — jadi perlu dicari dulu baris admin_users
    // milik pengguna yang sedang login.
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
        .insert({ ...payload, stock: 0, created_by: adminUserId, updated_by: adminUserId });
      saveError = insertError;
    }

    setSaving(false);

    if (saveError) {
      if (saveError.code === "23505") {
        setFormError("SKU ini sudah dipakai produk lain. Gunakan SKU yang berbeda.");
      } else if (saveError.code === "42501") {
        setFormError("Akun Anda tidak punya izin untuk menyimpan produk (perlu role owner/warehouse).");
      } else {
        setFormError("Gagal menyimpan produk. Coba lagi.");
      }
      return;
    }

    setFormOpen(false);
    loadData();
  };

  const setStatusValue = async (p, status) => {
    // Soft delete: ubah status, bukan hapus permanen dari database.
    const { error: statusError } = await supabase
      .from("products")
      .update({ status })
      .eq("id", p.id);

    if (!statusError) loadData();
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
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="draft">Draft</option>
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
                  <th className="px-4 py-3 font-medium">Stok</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Expired BPOM</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Expired Produk</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-[#DCE3EC]">
                    <td className="px-4 py-3 font-medium text-[#0F2A4A] whitespace-nowrap">{p.sku}</td>
                    <td className="px-4 py-3 text-[#0F2A4A]">
                      {p.name}
                      {p.brand && <div className="text-xs text-[#7C8A9A]">{p.brand}</div>}
                    </td>
                    <td className="px-4 py-3 text-[#5B6B7F]">{p.category || "-"}</td>
                    <td className="px-4 py-3 text-[#5B6B7F]">
                      {p.unit}
                      {p.size_label ? ` · ${p.size_label}` : ""}
                    </td>
                    <td className="px-4 py-3 text-[#5B6B7F]">{rupiah(p.cost_price)}</td>
                    <td className="px-4 py-3 text-[#0F2A4A]">{rupiah(p.price)}</td>
                    <td className="px-4 py-3 text-[#5B6B7F]">
                      {p.stock}
                      {p.min_stock > 0 && p.stock <= p.min_stock && (
                        <span className="ml-1.5 text-xs text-red-600">(menipis)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.bpom_expiry_date ? (
                        <span className={isNearExpiry(p.bpom_expiry_date) ? "text-red-600 font-medium" : "text-[#5B6B7F]"}>
                          {formatDate(p.bpom_expiry_date)}
                        </span>
                      ) : (
                        <span className="text-[#B8C2CE]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.expiry_date ? (
                        <span className={isNearExpiry(p.expiry_date) ? "text-red-600 font-medium" : "text-[#5B6B7F]"}>
                          {formatDate(p.expiry_date)}
                        </span>
                      ) : (
                        <span className="text-[#B8C2CE]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={(e) => setStatusValue(p, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${
                          p.status === "active"
                            ? "bg-[#EAF4EC] text-[#1E7A34]"
                            : p.status === "draft"
                            ? "bg-[#F0F4F9] text-[#5B6B7F]"
                            : "bg-[#F3E7D8] text-[#8A5A1E]"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditForm(p)}
                        title="Ubah"
                        className="p-1.5 rounded-lg hover:bg-[#F0F4F9] text-[#5B6B7F]"
                      >
                        <Pencil size={15} />
                      </button>
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
                    disabled={!!form.id}
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
                <Field label="Kategori *">
                  <input
                    list="category-suggestions"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input"
                    placeholder="mis. Skincare"
                  />
                  <datalist id="category-suggestions">
                    {knownCategories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
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
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Harga Promo (Rp) — opsional">
                <input
                  type="number"
                  min="0"
                  value={form.promo_price}
                  onChange={(e) => setForm({ ...form, promo_price: e.target.value })}
                  className="input"
                />
              </Field>

              <Field label="No. BPOM">
                <input
                  value={form.bpom_number}
                  onChange={(e) => setForm({ ...form, bpom_number: e.target.value })}
                  className="input"
                  placeholder="mis. NA18211900123"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Expired BPOM">
                  <input
                    type="date"
                    value={form.bpom_expiry_date}
                    onChange={(e) => setForm({ ...form, bpom_expiry_date: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Expired Produk">
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
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
                  {saving ? "Menyimpan..." : "Simpan"}
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
        .input:disabled {
          background: #F5F7FA;
          color: #9AA6B2;
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
