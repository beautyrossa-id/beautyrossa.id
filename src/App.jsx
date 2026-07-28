import React, { useState, useMemo } from "react";
import { ShoppingBag, X, Plus, Minus, Sparkles, Check, ChevronRight, Trash2, MessageCircle } from "lucide-react";

const WA_NUMBER = "62895392141015";
const WA_DISPLAY = "+62 895-3921-41015";

const PRODUCTS = [
  { id: 1, name: "24K Gold Peptide Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100" },
  { id: 2, name: "Acne Care Lightening Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 300000, blob: "from-emerald-100 to-teal-100" },
  { id: 3, name: "Alpha Collagen Whitening Serum 10 ML", cat: "Serum", desc: "Deskripsi menyusul", price: 241000, blob: "from-emerald-100 to-teal-100" },
  { id: 4, name: "Anti Acne Lightening Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 263000, blob: "from-emerald-100 to-teal-100" },
  { id: 5, name: "Aqua Collagen Brightening Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 260000, blob: "from-amber-100 to-yellow-100" },
  { id: 6, name: "Aquabright Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100" },
  { id: 7, name: "Aromatherapy Moist Cleansing Milk", cat: "Cleansing", desc: "Deskripsi menyusul", price: 125400, blob: "from-rose-100 to-orange-100" },
  { id: 8, name: "Bebe Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 289000, blob: "from-amber-100 to-yellow-100" },
  { id: 9, name: "Blue Jelly", cat: "Serum", desc: "Deskripsi menyusul", price: 241000, blob: "from-emerald-100 to-teal-100" },
  { id: 10, name: "Brightening Shower Gel", cat: "Sabun", desc: "Deskripsi menyusul", price: 331000, blob: "from-sky-100 to-blue-100" },
  { id: 11, name: "Chamo Gentle Milk Cleanser Beauty", cat: "Cleansing", desc: "Deskripsi menyusul", price: 81400, blob: "from-rose-100 to-orange-100" },
  { id: 12, name: "Clearskin Lotion 2", cat: "Lotion", desc: "Deskripsi menyusul", price: 236000, blob: "from-purple-100 to-pink-100" },
  { id: 13, name: "Collagenix Firming Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 236000, blob: "from-amber-100 to-yellow-100" },
  { id: 14, name: "Cream Malam", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100" },
  { id: 15, name: "Cream Pagi A", cat: "Cream", desc: "Deskripsi menyusul", price: 121000, blob: "from-amber-100 to-yellow-100" },
  { id: 16, name: "Cream Pagi Platinum", cat: "Cream", desc: "Deskripsi menyusul", price: 210000, blob: "from-amber-100 to-yellow-100" },
  { id: 17, name: "Cream Pagi Seri II", cat: "Cream", desc: "Deskripsi menyusul", price: 168000, blob: "from-amber-100 to-yellow-100" },
  { id: 18, name: "Day Cream 3", cat: "Cream", desc: "Deskripsi menyusul", price: 132000, blob: "from-amber-100 to-yellow-100" },
  { id: 19, name: "Day Cream Luxury", cat: "Cream", desc: "Deskripsi menyusul", price: 169400, blob: "from-amber-100 to-yellow-100" },
  { id: 20, name: "Day Cream Luxury 2 With Niacinamide & UV Filter", cat: "Cream", desc: "Deskripsi menyusul", price: 176000, blob: "from-amber-100 to-yellow-100" },
  { id: 21, name: "Day Cream Octadecenedioic Acid", cat: "Cream", desc: "Deskripsi menyusul", price: 168000, blob: "from-amber-100 to-yellow-100" },
  { id: 22, name: "Day Cream Stearyl Glycrrhetinate", cat: "Cream", desc: "Deskripsi menyusul", price: 210000, blob: "from-amber-100 to-yellow-100" },
  { id: 23, name: "Diamond Jelly", cat: "Serum", desc: "Deskripsi menyusul", price: 460000, blob: "from-emerald-100 to-teal-100" },
  { id: 24, name: "Dry Skin Face Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 84000, blob: "from-sky-100 to-blue-100" },
  { id: 25, name: "Easy Foundation", cat: "Cream", desc: "Deskripsi menyusul", price: 171000, blob: "from-amber-100 to-yellow-100" },
  { id: 26, name: "Ectoin & Soothing Lotion", cat: "Serum", desc: "Deskripsi menyusul", price: 188000, blob: "from-emerald-100 to-teal-100" },
  { id: 27, name: "Eye Cream Peptide", cat: "Cream", desc: "Deskripsi menyusul", price: 200000, blob: "from-amber-100 to-yellow-100" },
  { id: 28, name: "Facial Foam Brightening Tube", cat: "Sabun", desc: "Deskripsi menyusul", price: 176000, blob: "from-sky-100 to-blue-100" },
  { id: 29, name: "Facial Wash 200 ML", cat: "Sabun", desc: "Deskripsi menyusul", price: 99000, blob: "from-sky-100 to-blue-100" },
  { id: 30, name: "Facial Wash Grape Seed 200 ML", cat: "Sabun", desc: "Deskripsi menyusul", price: 176000, blob: "from-sky-100 to-blue-100" },
  { id: 31, name: "Glutathione Lightening Body Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 394000, blob: "from-amber-100 to-yellow-100" },
  { id: 32, name: "Green Jelly", cat: "Serum", desc: "Deskripsi menyusul", price: 220000, blob: "from-emerald-100 to-teal-100" },
  { id: 33, name: "Hyal-c Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 300000, blob: "from-emerald-100 to-teal-100" },
  { id: 34, name: "Hydrating & Calming Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 425000, blob: "from-emerald-100 to-teal-100" },
  { id: 35, name: "Instant Bright Body Lotion", cat: "Lotion", desc: "Deskripsi menyusul", price: 264000, blob: "from-purple-100 to-pink-100" },
  { id: 36, name: "Luxury Acne Face Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 92400, blob: "from-sky-100 to-blue-100" },
  { id: 37, name: "Luxury All Skin Facial Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 92400, blob: "from-sky-100 to-blue-100" },
  { id: 38, name: "Luxury Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 176000, blob: "from-amber-100 to-yellow-100" },
  { id: 39, name: "Maintenance & Conditioning Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 158000, blob: "from-amber-100 to-yellow-100" },
  { id: 40, name: "Milky Bright BB Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100" },
  { id: 41, name: "Mulberry Soothing Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 97900, blob: "from-cyan-100 to-sky-100" },
  { id: 42, name: "Oily Bar Soap", cat: "Sabun", desc: "Deskripsi menyusul", price: 60000, blob: "from-sky-100 to-blue-100" },
  { id: 43, name: "Orange Oil Facial Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 142000, blob: "from-sky-100 to-blue-100" },
  { id: 44, name: "Radiant Day Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 121000, blob: "from-amber-100 to-yellow-100" },
  { id: 45, name: "Resveratrol Retinol Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100" },
  { id: 46, name: "Sea Fern & Peptide Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100" },
  { id: 47, name: "Sea Fern & Retinol Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 315000, blob: "from-amber-100 to-yellow-100" },
  { id: 48, name: "Serum Acne", cat: "Serum", desc: "Deskripsi menyusul", price: 138600, blob: "from-emerald-100 to-teal-100" },
  { id: 49, name: "Serum Radiant Whitening", cat: "Serum", desc: "Deskripsi menyusul", price: 138600, blob: "from-emerald-100 to-teal-100" },
  { id: 50, name: "Serum Spot", cat: "Serum", desc: "Deskripsi menyusul", price: 212300, blob: "from-emerald-100 to-teal-100" },
  { id: 51, name: "Serum Vit C", cat: "Serum", desc: "Deskripsi menyusul", price: 212300, blob: "from-emerald-100 to-teal-100" },
  { id: 52, name: "Serum Whitening Mulberry", cat: "Serum", desc: "Deskripsi menyusul", price: 399000, blob: "from-emerald-100 to-teal-100" },
  { id: 53, name: "Sparkling Brightening Shower Gel", cat: "Sabun", desc: "Deskripsi menyusul", price: 161700, blob: "from-sky-100 to-blue-100" },
  { id: 54, name: "Sunscreen Foundation", cat: "Cream", desc: "Deskripsi menyusul", price: 150000, blob: "from-amber-100 to-yellow-100" },
  { id: 55, name: "Teatree Soothing Acne Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 115500, blob: "from-cyan-100 to-sky-100" },
  { id: 56, name: "Toner Anti Acne + AHA & BHA 200 ML", cat: "Toner", desc: "Deskripsi menyusul", price: 484000, blob: "from-cyan-100 to-sky-100" },
  { id: 57, name: "Toner Anti Aging Acetyl Hexapeptide 200 ML", cat: "Toner", desc: "Deskripsi menyusul", price: 484000, blob: "from-cyan-100 to-sky-100" },
  { id: 58, name: "Toner Tranexamide Acid 200 ML", cat: "Toner", desc: "Deskripsi menyusul", price: 528000, blob: "from-cyan-100 to-sky-100" },
  { id: 59, name: "Ultra Mild Bird's Nest Face Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 84000, blob: "from-sky-100 to-blue-100" },
  { id: 60, name: "Vitamin C Moisturizer Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 121000, blob: "from-amber-100 to-yellow-100" },
  { id: 61, name: "Vitamin C & Collagen Shower Gel", cat: "Sabun", desc: "Deskripsi menyusul", price: 172900, blob: "from-sky-100 to-blue-100" },
  { id: 62, name: "Vitamin C Booster Serum With Ferulic Acid & Vitamin E", cat: "Serum", desc: "Deskripsi menyusul", price: 460000, blob: "from-emerald-100 to-teal-100" },
  { id: 63, name: "Vitamin C Calming Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 788000, blob: "from-emerald-100 to-teal-100" },
  { id: 64, name: "Whitening Night Cream With AHA", cat: "Cream", desc: "Deskripsi menyusul", price: 210000, blob: "from-amber-100 to-yellow-100" },
  { id: 65, name: "Zinc Day Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100" },
  { id: 66, name: "Easy Sunscreen", cat: "Cream", desc: "Deskripsi menyusul", price: 150000, blob: "from-amber-100 to-yellow-100" },
  { id: 67, name: "Vitamin C Brightening Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 788000, blob: "from-emerald-100 to-teal-100" },
  { id: 68, name: "Hydrating & Calming Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 425000, blob: "from-emerald-100 to-teal-100" },
  { id: 69, name: "Milky Day Cream- Ivory", cat: "Cream", desc: "Deskripsi menyusul", price: 0, blob: "from-amber-100 to-yellow-100" },
  { id: 70, name: "Make Up Remover Balm", cat: "Cream", desc: "Deskripsi menyusul", price: 0, blob: "from-amber-100 to-yellow-100" },
  { id: 71, name: "Hyaluronic Acid + Caviar Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 425000, blob: "from-emerald-100 to-teal-100" },
  { id: 72, name: "Luxury All Skin Facial Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 92400, blob: "from-sky-100 to-blue-100" },
  { id: 73, name: "Mulberry Soothing Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 97900, blob: "from-cyan-100 to-sky-100" },
  { id: 74, name: "Night Cream Luxury", cat: "Cream", desc: "Deskripsi menyusul", price: 176000, blob: "from-amber-100 to-yellow-100" },
  { id: 75, name: "Facial Cleanser Brightening", cat: "Cleansing", desc: "Deskripsi menyusul", price: 0, blob: "from-rose-100 to-orange-100" },
  { id: 76, name: "AHA BHA Acne Brightening Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 0, blob: "from-cyan-100 to-sky-100" },
  { id: 77, name: "Antiaging & Dark Spot Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 0, blob: "from-cyan-100 to-sky-100" },
  { id: 78, name: "Tranexamic Acid 3% Brightening Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 0, blob: "from-cyan-100 to-sky-100" },
  { id: 79, name: "Triple Active Whitening Body Lotion", cat: "Lotion", desc: "Deskripsi menyusul", price: 413000, blob: "from-purple-100 to-pink-100" },
  { id: 80, name: "Night Cream 2", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100" },
  { id: 81, name: "Acnezone Mattifying Gel", cat: "Gel", desc: "Deskripsi menyusul", price: 220000, blob: "from-lime-100 to-emerald-100" },
  { id: 82, name: "Grape Seed Oil Cleansing Milk", cat: "Cleansing", desc: "Deskripsi menyusul", price: 0, blob: "from-rose-100 to-orange-100" },
];

const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");

export default function BeautyRossaStore() {
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({}); // id -> qty
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState("cart"); // cart | checkout | success
  const [form, setForm] = useState({ nama: "", hp: "", alamat: "", metode: "Transfer Bank" });
  const [orderNo, setOrderNo] = useState("");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = category === "Semua" || p.cat === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === Number(id)), qty }));
  }, [cart]);

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);
  const ongkir = subtotal > 0 ? 15000 : 0;
  const total = subtotal + ongkir;

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const changeQty = (id, delta) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] || 0) + delta);
      return { ...c, [id]: next };
    });
  const removeItem = (id) => setCart((c) => ({ ...c, [id]: 0 }));

  const openCart = () => {
    setStep("cart");
    setCartOpen(true);
  };

  const submitOrder = (e) => {
    e.preventDefault();
    const no = "BR" + Math.floor(100000 + Math.random() * 900000);
    setOrderNo(no);
    setStep("success");
  };

  const resetAll = () => {
    setCart({});
    setCartOpen(false);
    setStep("cart");
    setForm({ nama: "", hp: "", alamat: "", metode: "Transfer Bank" });
  };

  return (
    <div className="font-body min-h-screen bg-[#FFFFFF] text-[#1F2937]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur border-b border-[#2FA8E0]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.jpg" alt="Beauty Rossa" className="h-14 w-14 rounded-full object-cover" />
            <div className="font-display text-3xl font-semibold text-[#2FA8E0] italic">Beauty Rossa</div>
          </div>
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 border border-[#2FA8E0]/50 rounded-full px-4 py-2 text-sm hover:bg-[#2FA8E0]/10 transition"
          >
            <ShoppingBag size={16} className="text-[#2FA8E0]" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#2FA8E0] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="flex items-center gap-2 text-[#2FA8E0] text-xs tracking-[0.2em] uppercase mb-4">
            <Sparkles size={14} /> Rangkaian Skincare Pilihan
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-6 text-[#1F2937]">
            Kilau alami,
            <br />
            <span className="gold-text italic">gaya abadi.</span>
          </h1>
          <p className="text-[#1F2937]/70 max-w-md mb-8 leading-relaxed">
            Rangkaian skincare Beauty Rossa — diformulasikan untuk kulit yang
            bercahaya dan tampilan yang percaya diri, setiap hari.
          </p>
          <button
            onClick={() => document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 bg-[#2FA8E0] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#6FBF3F] transition"
          >
            Lihat Katalog <ChevronRight size={16} />
          </button>
        </div>
        <div className="relative aspect-square rounded-full bg-gradient-to-br from-[#DFF3D8] via-[#2FA8E0]/20 to-[#EAF6FD] flex items-center justify-center border border-[#2FA8E0]/30">
          <div className="absolute inset-6 rounded-full border border-[#2FA8E0]/20" />
          <img src="/images/logo.jpg" alt="Beauty Rossa" className="w-2/3 h-2/3 object-contain drop-shadow-lg" />
        </div>
      </section>

      {/* Katalog */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk, misal: serum, cream malam..."
            className="w-full md:w-96 bg-[#F4FAFD] border border-[#2FA8E0]/25 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-[#2FA8E0] placeholder:text-[#1F2937]/30"
          />
        </div>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="font-display text-3xl">Katalog Produk</h2>
          <div className="flex gap-2">
            {["Semua", "Cream", "Serum", "Toner", "Sabun", "Lotion", "Cleansing", "Gel"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  category === c
                    ? "bg-[#2FA8E0] text-white border-[#2FA8E0] font-semibold"
                    : "border-[#2FA8E0]/30 text-[#1F2937]/70 hover:border-[#2FA8E0]/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[#1F2937]/40 py-16">
            Produk tidak ditemukan. Coba kata kunci atau kategori lain.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group border border-[#2FA8E0]/15 rounded-2xl overflow-hidden bg-[#F4FAFD] hover:border-[#2FA8E0]/50 transition"
            >
              <div className={`relative aspect-square bg-gradient-to-br ${p.blob} opacity-90`}>
                <img
                  src={`/images/${p.id}.jpg`}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#2FA8E0] mb-1">{p.cat}</div>
                <h3 className="font-display text-lg mb-1">{p.name}</h3>
                <p className="text-xs text-[#1F2937]/50 mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between">
                  {p.price > 0 ? (
                    <>
                      <span className="font-semibold text-[#6FBF3F]">{rupiah(p.price)}</span>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="text-xs border border-[#2FA8E0]/40 rounded-full px-3 py-1.5 hover:bg-[#2FA8E0] hover:text-white transition"
                      >
                        + Keranjang
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-[#1F2937]/40 text-sm">Hubungi Kami</span>
                      <span className="text-xs border border-[#2FA8E0]/15 text-[#1F2937]/30 rounded-full px-3 py-1.5">
                        Segera Hadir
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#2FA8E0]/15 bg-[#F4FAFD] pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/logo.jpg" alt="Beauty Rossa" className="h-8 w-8 rounded-full object-cover" />
              <span className="font-display text-lg font-semibold text-[#2FA8E0] italic">Beauty Rossa</span>
            </div>
            <p className="text-xs text-[#1F2937]/50 leading-relaxed">
              Rangkaian skincare untuk kulit yang bercahaya dan tampilan yang percaya diri, setiap hari.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#1F2937]/40 mb-3">Kontak</h4>
            <ul className="text-sm text-[#1F2937]/70 space-y-1.5">
              <li>WhatsApp: {WA_DISPLAY}</li>
              <li>beautyrossa.id</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#1F2937]/40 mb-3">Kebijakan</h4>
            <ul className="text-sm text-[#1F2937]/70 space-y-1.5">
              <li>Pengiriman ke seluruh Indonesia</li>
              <li>Pembayaran via Transfer Bank / COD / QRIS</li>
              <li>Hubungi kami untuk pertanyaan produk</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-[#1F2937]/40 border-t border-[#2FA8E0]/10 pt-6">
          © 2026 beautyrossa.id — Kilau alami, gaya abadi.
        </p>
      </footer>

      {/* Tombol WhatsApp Mengambang */}
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transition"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline text-sm font-semibold pr-1">Chat Kami</span>
      </a>

      {/* Cart / Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-[#F4FAFD] border-l border-[#2FA8E0]/20 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2FA8E0]/15">
              <h3 className="font-display text-xl">
                {step === "cart" && "Keranjang Belanja"}
                {step === "checkout" && "Checkout"}
                {step === "success" && "Pesanan Diterima"}
              </h3>
              <button onClick={() => setCartOpen(false)} className="text-[#1F2937]/60 hover:text-[#2FA8E0]">
                <X size={20} />
              </button>
            </div>

            {/* CART STEP */}
            {step === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {cartItems.length === 0 && (
                    <p className="text-sm text-[#1F2937]/50 mt-10 text-center">
                      Keranjangmu masih kosong. Yuk pilih produk favoritmu.
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center border-b border-[#2FA8E0]/10 pb-4">
                      <div className={`relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br ${item.blob} flex-shrink-0`}>
                        <img
                          src={`/images/${item.id}.jpg`}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-[#2FA8E0]">{rupiah(item.price)}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center border border-[#2FA8E0]/30 rounded-full hover:bg-[#2FA8E0]/10"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center border border-[#2FA8E0]/30 rounded-full hover:bg-[#2FA8E0]/10"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[#1F2937]/30 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <div className="px-6 py-5 border-t border-[#2FA8E0]/15 space-y-3">
                    <div className="flex justify-between text-sm text-[#1F2937]/70">
                      <span>Subtotal</span>
                      <span>{rupiah(subtotal)}</span>
                    </div>
                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full bg-[#2FA8E0] text-white font-semibold py-3 rounded-full hover:bg-[#6FBF3F] transition"
                    >
                      Lanjut ke Checkout
                    </button>
                  </div>
                )}
              </>
            )}

            {/* CHECKOUT STEP */}
            {step === "checkout" && (
              <form onSubmit={submitOrder} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#1F2937]/60 block mb-1">Nama Penerima</label>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#2FA8E0]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2FA8E0]"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#1F2937]/60 block mb-1">Nomor HP / WhatsApp</label>
                  <input
                    required
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#2FA8E0]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2FA8E0]"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#1F2937]/60 block mb-1">Alamat Pengiriman</label>
                  <textarea
                    required
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    rows={3}
                    className="w-full bg-[#FFFFFF] border border-[#2FA8E0]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2FA8E0] resize-none"
                    placeholder="Alamat lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#1F2937]/60 block mb-2">Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Transfer Bank", "COD", "QRIS"].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setForm({ ...form, metode: m })}
                        className={`text-xs py-2 rounded-lg border transition ${
                          form.metode === m
                            ? "bg-[#2FA8E0] text-white border-[#2FA8E0] font-semibold"
                            : "border-[#2FA8E0]/25 text-[#1F2937]/70"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 border-t border-[#2FA8E0]/15 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-[#1F2937]/70">
                    <span>Subtotal</span>
                    <span>{rupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#1F2937]/70">
                    <span>Ongkos Kirim</span>
                    <span>{rupiah(ongkir)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#6FBF3F] text-base pt-1">
                    <span>Total</span>
                    <span>{rupiah(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2FA8E0] text-white font-semibold py-3 rounded-full hover:bg-[#6FBF3F] transition mt-2"
                >
                  Buat Pesanan
                </button>
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="text-xs text-[#1F2937]/50 hover:text-[#2FA8E0] text-center"
                >
                  Kembali ke keranjang
                </button>
              </form>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2FA8E0] flex items-center justify-center">
                  <Check size={26} className="text-white" />
                </div>
                <h4 className="font-display text-2xl">Terima kasih, {form.nama.split(" ")[0]}!</h4>
                <p className="text-sm text-[#1F2937]/60 max-w-xs">
                  Pesananmu dengan nomor <span className="text-[#6FBF3F] font-semibold">{orderNo}</span> telah kami
                  terima. Kami akan menghubungimu via WhatsApp untuk konfirmasi pembayaran ({form.metode}) dan
                  pengiriman.
                </p>
                <div className="text-sm text-[#6FBF3F] font-semibold">Total: {rupiah(total)}</div>
                <button
                  onClick={resetAll}
                  className="mt-4 bg-[#2FA8E0] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#6FBF3F] transition"
                >
                  Belanja Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
