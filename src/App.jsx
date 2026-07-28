import React, { useState, useMemo } from "react";
import { ShoppingBag, X, Plus, Minus, Sparkles, Check, ChevronRight, Trash2 } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "Rossa Glow Serum", cat: "Skincare", desc: "Vitamin C 15% untuk kulit lebih cerah", price: 185000, blob: "from-amber-100 to-rose-200" },
  { id: 2, name: "Velvet Rose Toner", cat: "Skincare", desc: "Menenangkan & melembapkan kulit sensitif", price: 95000, blob: "from-rose-100 to-orange-100" },
  { id: 3, name: "Gold Radiance Night Cream", cat: "Skincare", desc: "Perawatan malam dengan ekstrak emas 24K", price: 245000, blob: "from-yellow-100 to-amber-200" },
  { id: 4, name: "Petal Soft Cleanser", cat: "Skincare", desc: "Pembersih lembut berbahan dasar mawar", price: 89000, blob: "from-pink-100 to-rose-100" },
  { id: 5, name: "Rossa Matte Lip Velvet", cat: "Makeup", desc: "Shade Mauve Rose, tahan hingga 8 jam", price: 79000, blob: "from-rose-200 to-red-100" },
  { id: 6, name: "Golden Hour Highlighter", cat: "Makeup", desc: "Efek glow keemasan alami", price: 135000, blob: "from-amber-100 to-yellow-100" },
  { id: 7, name: "Silk Foundation SPF30", cat: "Makeup", desc: "Coverage medium, hasil akhir semi-matte", price: 165000, blob: "from-orange-100 to-amber-100" },
  { id: 8, name: "Rose Blush Duo", cat: "Makeup", desc: "Dua warna blush nuansa rose gold", price: 99000, blob: "from-rose-100 to-pink-200" },
];

const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");

export default function BeautyRossaStore() {
  const [category, setCategory] = useState("Semua");
  const [cart, setCart] = useState({}); // id -> qty
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState("cart"); // cart | checkout | success
  const [form, setForm] = useState({ nama: "", hp: "", alamat: "", metode: "Transfer Bank" });
  const [orderNo, setOrderNo] = useState("");

  const filtered = category === "Semua" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === category);

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
    <div className="font-body min-h-screen bg-[#0B0908] text-[#F5EFE6]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0B0908]/90 backdrop-blur border-b border-[#C6A15B]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-display text-2xl tracking-wide shimmer font-semibold">beautyrossa.id</div>
            <div className="h-px w-full gold-line mt-1 opacity-70" />
          </div>
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 border border-[#C6A15B]/50 rounded-full px-4 py-2 text-sm hover:bg-[#C6A15B]/10 transition"
          >
            <ShoppingBag size={16} className="text-[#C6A15B]" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#C6A15B] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="flex items-center gap-2 text-[#C6A15B] text-xs tracking-[0.2em] uppercase mb-4">
            <Sparkles size={14} /> Skincare &amp; Makeup Pilihan
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-6">
            Kilau alami,
            <br />
            <span className="gold-text italic">gaya abadi.</span>
          </h1>
          <p className="text-[#F5EFE6]/70 max-w-md mb-8 leading-relaxed">
            Rangkaian skincare dan makeup dengan sentuhan rose gold — diformulasikan untuk
            kulit yang bercahaya dan tampilan yang percaya diri, setiap hari.
          </p>
          <button
            onClick={() => document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 bg-[#C6A15B] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#EAD59A] transition"
          >
            Lihat Katalog <ChevronRight size={16} />
          </button>
        </div>
        <div className="relative aspect-square rounded-full bg-gradient-to-br from-[#3a2a1f] via-[#C6A15B]/30 to-[#1A1613] flex items-center justify-center border border-[#C6A15B]/30">
          <div className="absolute inset-6 rounded-full border border-[#C6A15B]/20" />
          <Sparkles size={48} className="text-[#EAD59A]" />
        </div>
      </section>

      {/* Katalog */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="font-display text-3xl">Katalog Produk</h2>
          <div className="flex gap-2">
            {["Semua", "Skincare", "Makeup"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  category === c
                    ? "bg-[#C6A15B] text-black border-[#C6A15B] font-semibold"
                    : "border-[#C6A15B]/30 text-[#F5EFE6]/70 hover:border-[#C6A15B]/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group border border-[#C6A15B]/15 rounded-2xl overflow-hidden bg-[#141110] hover:border-[#C6A15B]/50 transition"
            >
              <div className={`aspect-square bg-gradient-to-br ${p.blob} opacity-90`} />
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#C6A15B] mb-1">{p.cat}</div>
                <h3 className="font-display text-lg mb-1">{p.name}</h3>
                <p className="text-xs text-[#F5EFE6]/50 mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#EAD59A]">{rupiah(p.price)}</span>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="text-xs border border-[#C6A15B]/40 rounded-full px-3 py-1.5 hover:bg-[#C6A15B] hover:text-black transition"
                  >
                    + Keranjang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#C6A15B]/15 py-8 text-center text-xs text-[#F5EFE6]/40">
        © 2026 beautyrossa.id — Kilau alami, gaya abadi.
      </footer>

      {/* Cart / Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-[#141110] border-l border-[#C6A15B]/20 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#C6A15B]/15">
              <h3 className="font-display text-xl">
                {step === "cart" && "Keranjang Belanja"}
                {step === "checkout" && "Checkout"}
                {step === "success" && "Pesanan Diterima"}
              </h3>
              <button onClick={() => setCartOpen(false)} className="text-[#F5EFE6]/60 hover:text-[#C6A15B]">
                <X size={20} />
              </button>
            </div>

            {/* CART STEP */}
            {step === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {cartItems.length === 0 && (
                    <p className="text-sm text-[#F5EFE6]/50 mt-10 text-center">
                      Keranjangmu masih kosong. Yuk pilih produk favoritmu.
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center border-b border-[#C6A15B]/10 pb-4">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.blob} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-[#C6A15B]">{rupiah(item.price)}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center border border-[#C6A15B]/30 rounded-full hover:bg-[#C6A15B]/10"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center border border-[#C6A15B]/30 rounded-full hover:bg-[#C6A15B]/10"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[#F5EFE6]/30 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <div className="px-6 py-5 border-t border-[#C6A15B]/15 space-y-3">
                    <div className="flex justify-between text-sm text-[#F5EFE6]/70">
                      <span>Subtotal</span>
                      <span>{rupiah(subtotal)}</span>
                    </div>
                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full bg-[#C6A15B] text-black font-semibold py-3 rounded-full hover:bg-[#EAD59A] transition"
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
                  <label className="text-xs text-[#F5EFE6]/60 block mb-1">Nama Penerima</label>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full bg-[#0B0908] border border-[#C6A15B]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C6A15B]"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#F5EFE6]/60 block mb-1">Nomor HP / WhatsApp</label>
                  <input
                    required
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                    className="w-full bg-[#0B0908] border border-[#C6A15B]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C6A15B]"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#F5EFE6]/60 block mb-1">Alamat Pengiriman</label>
                  <textarea
                    required
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0B0908] border border-[#C6A15B]/25 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C6A15B] resize-none"
                    placeholder="Alamat lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#F5EFE6]/60 block mb-2">Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Transfer Bank", "COD", "QRIS"].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setForm({ ...form, metode: m })}
                        className={`text-xs py-2 rounded-lg border transition ${
                          form.metode === m
                            ? "bg-[#C6A15B] text-black border-[#C6A15B] font-semibold"
                            : "border-[#C6A15B]/25 text-[#F5EFE6]/70"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 border-t border-[#C6A15B]/15 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-[#F5EFE6]/70">
                    <span>Subtotal</span>
                    <span>{rupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#F5EFE6]/70">
                    <span>Ongkos Kirim</span>
                    <span>{rupiah(ongkir)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#EAD59A] text-base pt-1">
                    <span>Total</span>
                    <span>{rupiah(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C6A15B] text-black font-semibold py-3 rounded-full hover:bg-[#EAD59A] transition mt-2"
                >
                  Buat Pesanan
                </button>
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="text-xs text-[#F5EFE6]/50 hover:text-[#C6A15B] text-center"
                >
                  Kembali ke keranjang
                </button>
              </form>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#C6A15B] flex items-center justify-center">
                  <Check size={26} className="text-black" />
                </div>
                <h4 className="font-display text-2xl">Terima kasih, {form.nama.split(" ")[0]}!</h4>
                <p className="text-sm text-[#F5EFE6]/60 max-w-xs">
                  Pesananmu dengan nomor <span className="text-[#EAD59A] font-semibold">{orderNo}</span> telah kami
                  terima. Kami akan menghubungimu via WhatsApp untuk konfirmasi pembayaran ({form.metode}) dan
                  pengiriman.
                </p>
                <div className="text-sm text-[#EAD59A] font-semibold">Total: {rupiah(total)}</div>
                <button
                  onClick={resetAll}
                  className="mt-4 bg-[#C6A15B] text-black font-semibold px-6 py-2.5 rounded-full hover:bg-[#EAD59A] transition"
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
