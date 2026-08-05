import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Sparkles,
  Check,
  ChevronRight,
  Trash2,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Truck,
  MapPin,
  Menu,
  Search,
  Droplet,
  Sun,
  Moon,
  Sparkle,
  CircleDot,
  Wind,
  Flower2,
} from "lucide-react";

/* ============================================================
   KONSTANTA BRAND
   ============================================================ */
const WA_NUMBER = "62895392141015";
const WA_DISPLAY = "+62 895-3921-41015";
const DOCTOR_WA_NUMBER = "6285337352283";
const DOCTOR_WA_DISPLAY = "+62 853-3735-2283";

const NAV_LINKS = [
  { label: "Produk", href: "#produk" },
  { label: "Solusi Kulit", href: "#solusi-kulit" },
  { label: "Klinik", href: "#klinik" },
  { label: "Treatment", href: "#klinik" },
  { label: "Tentang Kami", href: "#tentang" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Produk Original" },
  { icon: Sparkle, label: "Produk Berizin BPOM" },
  {
    icon: Stethoscope,
    label: "Konsultasi Beauty Advisor",
    link: `https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
      "Halo Beauty Rossa,\nSaya ingin melakukan konsultasi mengenai kondisi kulit saya. Mohon dibantu informasi konsultasi dan prosedurnya.\nTerima kasih."
    )}`,
  },
  { icon: Truck, label: "Pengiriman Seluruh Indonesia" },
];

/* Kategori kebutuhan kulit -> keyword pencocokan ke nama/kategori produk yang ada */
const SKIN_CONCERNS = [
  { label: "Jerawat", icon: CircleDot, keywords: ["acne"] },
  { label: "Kulit Kusam", icon: Sun, keywords: ["brightening", "bright", "radiant"] },
  { label: "Flek & Noda Hitam", icon: Sparkle, keywords: ["whitening", "spot", "dark spot", "tranexamic"] },
  { label: "Kulit Kering", icon: Droplet, keywords: ["hydrating", "moisturizer", "hyaluronic"] },
  { label: "Kulit Berminyak", icon: Wind, keywords: ["oily", "mattifying", "gel"] },
  { label: "Kulit Sensitif", icon: Flower2, keywords: ["calming", "soothing", "sensitive", "ectoin"] },
  { label: "Pori-Pori", icon: CircleDot, keywords: ["pore", "clearskin"] },
  { label: "Anti-Aging", icon: Moon, keywords: ["collagen", "peptide", "retinol", "anti aging", "antiaging", "firming"] },
];

const CLINIC_SERVICES = [
  {
    title: "Konsultasi Kulit",
    desc: "Diskusi kebutuhan dan kondisi kulit bersama tim Beauty Rossa sebelum menentukan produk atau treatment.",
  },
  {
    title: "Facial Treatment",
    desc: "Perawatan wajah dasar untuk membersihkan dan menyegarkan kulit secara menyeluruh.",
  },
  {
    title: "Perawatan Jerawat",
    desc: "Penanganan kulit berjerawat disesuaikan dengan tingkat dan jenis kondisi kulit.",
  },
  {
    title: "Perawatan Brightening",
    desc: "Treatment untuk membantu kulit tampak lebih cerah dan merata.",
  },
];

/* Filter katalog premium - label sesuai brief, dipetakan ke kategori data asli
   (Sabun = Facial Wash, Cream = Moisturizer, Lotion = Body Care).
   "Sunscreen" tidak punya kategori tersendiri di data, jadi dicocokkan lewat nama produk. */
const CATALOG_FILTERS = [
  { label: "Semua", match: () => true },
  { label: "Serum", match: (p) => p.cat === "Serum" },
  { label: "Facial Wash", match: (p) => p.cat === "Sabun" },
  { label: "Toner", match: (p) => p.cat === "Toner" },
  { label: "Moisturizer", match: (p) => p.cat === "Cream" },
  { label: "Sunscreen", match: (p) => p.name.toLowerCase().includes("sunscreen") },
  { label: "Body Care", match: (p) => p.cat === "Lotion" },
];

const CATALOG_PAGE_SIZE = 12;

const ABOUT_VALUES = [
  { title: "Personal", desc: "Rekomendasi disesuaikan dengan kebutuhan pelanggan." },
  { title: "Terpercaya", desc: "Informasi produk dan layanan disampaikan secara transparan." },
  { title: "Terintegrasi", desc: "Produk, konsultasi, dan layanan klinik berada dalam satu ekosistem." },
];

const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");

const BADGE_STYLES = {
  "Best Seller": "bg-[#B9897D] text-white",
  New: "bg-[#282422] text-white",
  Promo: "bg-[#E24B4A] text-white",
  Limited: "bg-[#C4A46B] text-[#282422]",
  BPOM: "bg-white text-[#282422] border border-[#E8E1DB]",
};

const ProductCard = React.memo(function ProductCard({ product: p, onView, onAdd }) {
  return (
    <div className="group relative border border-[#E8E1DB] rounded-2xl overflow-hidden bg-white hover:border-[#B9897D]/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative aspect-square bg-gradient-to-br from-[#F6F0EA] to-[#EED9D6] overflow-hidden">
        {p.badges && p.badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
            {p.badges.map((b) => (
              <span
                key={b}
                className={`text-[10px] font-semibold px-2 py-1 rounded-full ${BADGE_STYLES[b] || "bg-[#F6F0EA] text-[#282422]"}`}
              >
                {b}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => onView(p)}
          aria-label={`Lihat detail ${p.name}`}
          className="absolute inset-0 w-full h-full cursor-pointer"
        >
          <img
            src={`/images/${p.image}`}
            alt={p.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </button>
        {/* Tombol muncul halus saat hover (desktop) */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out gap-2 p-2.5 bg-gradient-to-t from-black/40 to-transparent">
          <button
            onClick={() => onView(p)}
            className="flex-1 text-xs font-semibold bg-white/95 text-[#282422] rounded-full py-2 hover:bg-white transition"
          >
            Detail
          </button>
          {p.price > 0 && (
            <button
              onClick={() => onAdd(p.id)}
              aria-label={`Tambah ${p.name} ke keranjang`}
              className="flex-1 text-xs font-semibold bg-[#B9897D] text-white rounded-full py-2 hover:bg-[#C4A46B] transition"
            >
              + Keranjang
            </button>
          )}
        </div>
      </div>

      <button onClick={() => onView(p)} className="block w-full text-left px-4 pt-3.5" aria-label={`Lihat detail ${p.name}`}>
        <div className="text-[10px] uppercase tracking-wider text-[#B9897D] mb-1">{p.cat}</div>
        <h3 className="font-display text-base mb-1 group-hover:text-[#B9897D] transition line-clamp-1">
          {p.name}
        </h3>
      </button>

      <div className="px-4 pb-4 pt-1 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[#282422] text-sm">
            {p.price > 0 ? rupiah(p.price) : "Hubungi Kami"}
          </span>
          {/* Tombol selalu tampil di mobile (tidak ada hover di layar sentuh) */}
          <button
            onClick={() => (p.price > 0 ? onAdd(p.id) : onView(p))}
            aria-label={p.price > 0 ? `Tambah ${p.name} ke keranjang` : `Lihat detail ${p.name}`}
            className="sm:hidden text-xs border border-[#B9897D]/40 rounded-full px-3 py-1.5 hover:bg-[#B9897D] hover:text-white transition whitespace-nowrap"
          >
            {p.price > 0 ? "+ Keranjang" : "Detail"}
          </button>
        </div>
      </div>
    </div>
  );
});

const PRODUCTS = [
  { id: 1, name: "24K Gold Peptide Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100", image: "1.jpg" , hasPhoto: false },
  { id: 2, name: "Acne Care Lightening Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 300000, blob: "from-emerald-100 to-teal-100", image: "2.jpg" , hasPhoto: false },
  { id: 3, name: "Alpha Collagen Whitening Serum 10 ML", cat: "Serum", desc: "Deskripsi menyusul", price: 241000, blob: "from-emerald-100 to-teal-100", image: "3.jpg" , hasPhoto: false },
  { id: 4, name: "Anti Acne Lightening Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 263000, blob: "from-emerald-100 to-teal-100", image: "4.jpg" , hasPhoto: false },
  { id: 5, name: "Aqua Collagen Brightening Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 260000, blob: "from-amber-100 to-yellow-100", image: "5.jpg" , hasPhoto: false },
  { id: 6, name: "Aquabright Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100", image: "6.jpg" , hasPhoto: false },
  { id: 7, name: "Aromatherapy Moist Cleansing Milk", cat: "Cleansing", desc: "Deskripsi menyusul", price: 125400, blob: "from-rose-100 to-orange-100", image: "7.jpg" , hasPhoto: false },
  { id: 8, name: "Bebe Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 289000, blob: "from-amber-100 to-yellow-100", image: "8.jpg" , hasPhoto: false },
  { id: 9, name: "Blue Jelly", cat: "Serum", desc: "Deskripsi menyusul", price: 241000, blob: "from-emerald-100 to-teal-100", image: "9.jpg" , hasPhoto: false },
  { id: 10, name: "Brightening Shower Gel", cat: "Sabun", desc: "Deskripsi menyusul", price: 331000, blob: "from-sky-100 to-blue-100", image: "10_BRIGHTENING_SHOWER_GEL_500_ml_.png" , hasPhoto: true },
  { id: 11, name: "Chamo Gentle Milk Cleanser Beauty", cat: "Cleansing", desc: "Deskripsi menyusul", price: 81400, blob: "from-rose-100 to-orange-100", image: "11.jpg" , hasPhoto: false },
  { id: 12, name: "Clearskin Lotion 2", cat: "Lotion", desc: "Deskripsi menyusul", price: 236000, blob: "from-purple-100 to-pink-100", image: "12.jpg" , hasPhoto: false },
  { id: 13, name: "Collagenix Firming Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 236000, blob: "from-amber-100 to-yellow-100", image: "13.jpg" , hasPhoto: false },
  { id: 14, name: "Cream Malam", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100", image: "14.jpg" , hasPhoto: false },
  { id: 15, name: "Cream Pagi A", cat: "Cream", desc: "Deskripsi menyusul", price: 121000, blob: "from-amber-100 to-yellow-100", image: "15.jpg" , hasPhoto: false },
  { id: 16, name: "Cream Pagi Platinum", cat: "Cream", desc: "Deskripsi menyusul", price: 210000, blob: "from-amber-100 to-yellow-100", image: "16.jpg" , hasPhoto: false },
  { id: 17, name: "Cream Pagi Seri II", cat: "Cream", desc: "Deskripsi menyusul", price: 168000, blob: "from-amber-100 to-yellow-100", image: "17.jpg" , hasPhoto: false },
  { id: 18, name: "Day Cream 3", cat: "Cream", desc: "Deskripsi menyusul", price: 132000, blob: "from-amber-100 to-yellow-100", image: "18.jpg" , hasPhoto: false },
  { id: 19, name: "Day Cream Luxury", cat: "Cream", desc: "Deskripsi menyusul", price: 169400, blob: "from-amber-100 to-yellow-100", image: "19.jpg" , hasPhoto: false },
  { id: 20, name: "Day Cream Luxury 2 With Niacinamide & UV Filter", cat: "Cream", desc: "Deskripsi menyusul", price: 176000, blob: "from-amber-100 to-yellow-100", image: "20.jpg" , hasPhoto: false },
  { id: 21, name: "Day Cream Octadecenedioic Acid", cat: "Cream", desc: "Deskripsi menyusul", price: 168000, blob: "from-amber-100 to-yellow-100", image: "21.jpg" , hasPhoto: false },
  { id: 22, name: "Day Cream Stearyl Glycrrhetinate", cat: "Cream", desc: "Deskripsi menyusul", price: 210000, blob: "from-amber-100 to-yellow-100", image: "22.jpg" , hasPhoto: false },
  { id: 23, name: "Diamond Jelly", cat: "Serum", desc: "Deskripsi menyusul", price: 460000, blob: "from-emerald-100 to-teal-100", image: "23.jpg" , hasPhoto: false },
  { id: 24, name: "Dry Skin Face Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 84000, blob: "from-sky-100 to-blue-100", image: "24.jpg" , hasPhoto: false },
  { id: 25, name: "Easy Foundation", cat: "Cream", desc: "Deskripsi menyusul", price: 171000, blob: "from-amber-100 to-yellow-100", image: "25.jpg" , hasPhoto: false },
  { id: 26, name: "Ectoin & Soothing Lotion", cat: "Serum", desc: "Deskripsi menyusul", price: 188000, blob: "from-emerald-100 to-teal-100", image: "26.jpg" , hasPhoto: false },
  { id: 27, name: "Eye Cream Peptide", cat: "Cream", desc: "Deskripsi menyusul", price: 200000, blob: "from-amber-100 to-yellow-100", image: "27.jpg" , hasPhoto: false },
  { id: 28, name: "Facial Foam Brightening Tube", cat: "Sabun", desc: "Deskripsi menyusul", price: 176000, blob: "from-sky-100 to-blue-100", image: "28.jpg" , hasPhoto: false },
  { id: 29, name: "Facial Wash 200 ML", cat: "Sabun", desc: "Deskripsi menyusul", price: 99000, blob: "from-sky-100 to-blue-100", image: "29__FACIAL_WASH_200_ML_.png" , hasPhoto: true },
  { id: 30, name: "Facial Wash Grape Seed 200 ML", cat: "Sabun", desc: "Deskripsi menyusul", price: 176000, blob: "from-sky-100 to-blue-100", image: "30.jpg" , hasPhoto: false },
  { id: 31, name: "Glutathione Lightening Body Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 394000, blob: "from-amber-100 to-yellow-100", image: "31.jpg" , hasPhoto: false },
  { id: 32, name: "Green Jelly", cat: "Serum", desc: "Deskripsi menyusul", price: 220000, blob: "from-emerald-100 to-teal-100", image: "32.jpg" , hasPhoto: false },
  { id: 33, name: "Hyal-c Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 300000, blob: "from-emerald-100 to-teal-100", image: "33.jpg" , hasPhoto: false },
  { id: 34, name: "Hydrating & Calming Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 425000, blob: "from-emerald-100 to-teal-100", image: "34.jpg" , hasPhoto: false },
  { id: 35, name: "Instant Bright Body Lotion", cat: "Lotion", desc: "Deskripsi menyusul", price: 264000, blob: "from-purple-100 to-pink-100", image: "35.jpg" , hasPhoto: false },
  { id: 36, name: "Luxury Acne Face Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 92400, blob: "from-sky-100 to-blue-100", image: "36.jpg" , hasPhoto: false },
  { id: 37, name: "Luxury All Skin Facial Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 92400, blob: "from-sky-100 to-blue-100", image: "37.jpg" , hasPhoto: false },
  { id: 38, name: "Luxury Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 176000, blob: "from-amber-100 to-yellow-100", image: "38.jpg" , hasPhoto: false },
  { id: 39, name: "Maintenance & Conditioning Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 158000, blob: "from-amber-100 to-yellow-100", image: "39.jpg" , hasPhoto: false },
  { id: 40, name: "Milky Bright BB Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100", image: "40.jpg" , hasPhoto: false },
  { id: 41, name: "Mulberry Soothing Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 97900, blob: "from-cyan-100 to-sky-100", image: "41.jpg" , hasPhoto: false },
  { id: 42, name: "Oily Bar Soap", cat: "Sabun", desc: "Deskripsi menyusul", price: 60000, blob: "from-sky-100 to-blue-100", image: "42.jpg" , hasPhoto: false },
  { id: 43, name: "Orange Oil Facial Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 142000, blob: "from-sky-100 to-blue-100", image: "43.jpg" , hasPhoto: false },
  { id: 44, name: "Radiant Day Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 121000, blob: "from-amber-100 to-yellow-100", image: "44.jpg" , hasPhoto: false },
  { id: 45, name: "Resveratrol Retinol Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100", image: "45.jpg" , hasPhoto: false },
  { id: 46, name: "Sea Fern & Peptide Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100", image: "46.jpg" , hasPhoto: false },
  { id: 47, name: "Sea Fern & Retinol Night Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 315000, blob: "from-amber-100 to-yellow-100", image: "47.jpg" , hasPhoto: false },
  { id: 48, name: "Serum Acne", cat: "Serum", desc: "Deskripsi menyusul", price: 138600, blob: "from-emerald-100 to-teal-100", image: "48.jpg" , hasPhoto: false },
  { id: 49, name: "Serum Radiant Whitening", cat: "Serum", desc: "Deskripsi menyusul", price: 138600, blob: "from-emerald-100 to-teal-100", image: "49.jpg" , hasPhoto: false },
  { id: 50, name: "Serum Spot", cat: "Serum", desc: "Deskripsi menyusul", price: 212300, blob: "from-emerald-100 to-teal-100", image: "50.jpg" , hasPhoto: false },
  { id: 51, name: "Serum Vit C", cat: "Serum", desc: "Deskripsi menyusul", price: 212300, blob: "from-emerald-100 to-teal-100", image: "51.jpg" , hasPhoto: false },
  { id: 52, name: "Serum Whitening Mulberry", cat: "Serum", desc: "Deskripsi menyusul", price: 399000, blob: "from-emerald-100 to-teal-100", image: "52.jpg" , hasPhoto: false },
  { id: 53, name: "Sparkling Brightening Shower Gel", cat: "Sabun", desc: "Deskripsi menyusul", price: 161700, blob: "from-sky-100 to-blue-100", image: "53.jpg" , hasPhoto: false },
  { id: 54, name: "Sunscreen Foundation", cat: "Cream", desc: "Deskripsi menyusul", price: 150000, blob: "from-amber-100 to-yellow-100", image: "54.jpg" , hasPhoto: false },
  { id: 55, name: "Teatree Soothing Acne Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 115500, blob: "from-cyan-100 to-sky-100", image: "55.jpg" , hasPhoto: false },
  { id: 56, name: "Toner Anti Acne + AHA & BHA 200 ML", cat: "Toner", desc: "Deskripsi menyusul", price: 484000, blob: "from-cyan-100 to-sky-100", image: "56.jpg" , hasPhoto: false },
  { id: 57, name: "Toner Anti Aging Acetyl Hexapeptide 200 ML", cat: "Toner", desc: "Deskripsi menyusul", price: 484000, blob: "from-cyan-100 to-sky-100", image: "57.jpg" , hasPhoto: false },
  { id: 58, name: "Toner Tranexamide Acid 200 ML", cat: "Toner", desc: "Deskripsi menyusul", price: 528000, blob: "from-cyan-100 to-sky-100", image: "58.jpg" , hasPhoto: false },
  { id: 59, name: "Ultra Mild Bird's Nest Face Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 84000, blob: "from-sky-100 to-blue-100", image: "59.jpg" , hasPhoto: false },
  { id: 60, name: "Vitamin C Moisturizer Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 121000, blob: "from-amber-100 to-yellow-100", image: "60.jpg" , hasPhoto: false },
  { id: 61, name: "Vitamin C & Collagen Shower Gel", cat: "Sabun", desc: "Deskripsi menyusul", price: 172900, blob: "from-sky-100 to-blue-100", image: "61.jpg" , hasPhoto: false },
  { id: 62, name: "Vitamin C Booster Serum With Ferulic Acid & Vitamin E", cat: "Serum", desc: "Deskripsi menyusul", price: 460000, blob: "from-emerald-100 to-teal-100", image: "62.jpg" , hasPhoto: false },
  { id: 63, name: "Vitamin C Calming Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 788000, blob: "from-emerald-100 to-teal-100", image: "63.jpg" , hasPhoto: false },
  { id: 64, name: "Whitening Night Cream With AHA", cat: "Cream", desc: "Deskripsi menyusul", price: 210000, blob: "from-amber-100 to-yellow-100", image: "64.jpg" , hasPhoto: false },
  { id: 65, name: "Zinc Day Cream", cat: "Cream", desc: "Deskripsi menyusul", price: 127600, blob: "from-amber-100 to-yellow-100", image: "65.jpg" , hasPhoto: false },
  { id: 66, name: "Easy Sunscreen", cat: "Cream", desc: "Deskripsi menyusul", price: 150000, blob: "from-amber-100 to-yellow-100", image: "66.jpg" , hasPhoto: false },
  { id: 67, name: "Vitamin C Brightening Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 788000, blob: "from-emerald-100 to-teal-100", image: "67.jpg" , hasPhoto: false },
  { id: 68, name: "Hydrating & Calming Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 425000, blob: "from-emerald-100 to-teal-100", image: "68.jpg" , hasPhoto: false },
  { id: 69, name: "Milky Day Cream- Ivory", cat: "Cream", desc: "Deskripsi menyusul", price: 0, blob: "from-amber-100 to-yellow-100", image: "69.jpg" , hasPhoto: false },
  { id: 70, name: "Make Up Remover Balm", cat: "Cream", desc: "Deskripsi menyusul", price: 0, blob: "from-amber-100 to-yellow-100", image: "70.jpg" , hasPhoto: false },
  { id: 71, name: "Hyaluronic Acid + Caviar Serum", cat: "Serum", desc: "Deskripsi menyusul", price: 425000, blob: "from-emerald-100 to-teal-100", image: "71.jpg" , hasPhoto: false },
  { id: 72, name: "Luxury All Skin Facial Wash", cat: "Sabun", desc: "Deskripsi menyusul", price: 92400, blob: "from-sky-100 to-blue-100", image: "72.jpg" , hasPhoto: false },
  { id: 73, name: "Mulberry Soothing Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 97900, blob: "from-cyan-100 to-sky-100", image: "73.jpg" , hasPhoto: false },
  { id: 74, name: "Night Cream Luxury", cat: "Cream", desc: "Deskripsi menyusul", price: 176000, blob: "from-amber-100 to-yellow-100", image: "74.jpg" , hasPhoto: false },
  { id: 75, name: "Facial Cleanser Brightening", cat: "Cleansing", desc: "Deskripsi menyusul", price: 0, blob: "from-rose-100 to-orange-100", image: "75.jpg" , hasPhoto: false },
  { id: 76, name: "AHA BHA Acne Brightening Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 0, blob: "from-cyan-100 to-sky-100", image: "76.jpg" , hasPhoto: false },
  { id: 77, name: "Antiaging & Dark Spot Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 0, blob: "from-cyan-100 to-sky-100", image: "77.jpg" , hasPhoto: false },
  { id: 78, name: "Tranexamic Acid 3% Brightening Toner", cat: "Toner", desc: "Deskripsi menyusul", price: 0, blob: "from-cyan-100 to-sky-100", image: "78.jpg" , hasPhoto: false },
  { id: 79, name: "Triple Active Whitening Body Lotion", cat: "Lotion", desc: "Deskripsi menyusul", price: 413000, blob: "from-purple-100 to-pink-100", image: "79.jpg" , hasPhoto: false },
  { id: 80, name: "Night Cream 2", cat: "Cream", desc: "Deskripsi menyusul", price: 220000, blob: "from-amber-100 to-yellow-100", image: "80.jpg" , hasPhoto: false },
  { id: 81, name: "Acnezone Mattifying Gel", cat: "Gel", desc: "Deskripsi menyusul", price: 220000, blob: "from-lime-100 to-emerald-100", image: "81.jpg" , hasPhoto: false },
  { id: 82, name: "Grape Seed Oil Cleansing Milk", cat: "Cleansing", desc: "Deskripsi menyusul", price: 0, blob: "from-rose-100 to-orange-100", image: "82.jpg" , hasPhoto: false },
];

export default function BeautyRossaStore() {
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const [cart, setCart] = useState({}); // id -> qty
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState("cart"); // cart | checkout | success
  const [form, setForm] = useState({ nama: "", hp: "", alamat: "", metode: "Transfer Bank", catatan: "" });
  const [orderNo, setOrderNo] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);

  const featuredProducts = useMemo(
    () => PRODUCTS.filter((p) => p.hasPhoto && p.price > 0).slice(0, 8),
    []
  );

  const activeFilter = CATALOG_FILTERS.find((f) => f.label === category) || CATALOG_FILTERS[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchCat = activeFilter.match(p);
      if (!matchCat) return false;
      if (!q) return true;
      // Cari di nama produk, kategori asli, dan label filter (mis. "facial wash" -> Sabun)
      const haystack = `${p.name} ${p.cat}`.toLowerCase();
      if (haystack.includes(q)) return true;
      const matchingFilterLabel = CATALOG_FILTERS.find((f) => f.label !== "Semua" && f.match(p) && f.label.toLowerCase().includes(q));
      return Boolean(matchingFilterLabel);
    });
  }, [search, activeFilter]);

  const visibleProducts = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(CATALOG_PAGE_SIZE);
  }, [category, search]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === Number(id)), qty }));
  }, [cart]);

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = useCallback((id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })), []);
  const changeQty = (id, delta) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] || 0) + delta);
      return { ...c, [id]: next };
    });
  const removeItem = (id) => setCart((c) => ({ ...c, [id]: 0 }));

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setFloatingMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openCart = () => {
    setStep("cart");
    setCartOpen(true);
  };

  const goToConcern = (concern) => {
    const kw = concern.keywords.find((k) =>
      PRODUCTS.some((p) => p.name.toLowerCase().includes(k))
    );
    if (!kw) {
      const msg = `Halo Beauty Rossa,\nSaya ingin rekomendasi produk untuk kebutuhan kulit: ${concern.label}.\nMohon bantuannya.\nTerima kasih.`;
      window.open(`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      return;
    }
    setSearch(kw);
    setCategory("Semua");
    document.getElementById("semua-produk")?.scrollIntoView({ behavior: "smooth" });
  };

  const submitOrder = (e) => {
    e.preventDefault();
    const no = "BR" + Math.floor(100000 + Math.random() * 900000);
    setOrderNo(no);

    const itemLines = cartItems
      .map((item) => `- ${item.name} x${item.qty} = ${rupiah(item.qty * item.price)}`)
      .join("\n");

    const message =
      `Halo Beauty Rossa, ada pesanan baru masuk lewat website:\n\n` +
      `No. Pesanan: ${no}\n` +
      `Nama: ${form.nama}\n` +
      `No. HP: ${form.hp}\n` +
      `Alamat: ${form.alamat}\n` +
      `Metode Bayar: ${form.metode}\n` +
      `Catatan: ${form.catatan || "-"}\n\n` +
      `Rincian Produk:\n${itemLines}\n\n` +
      `Subtotal: ${rupiah(subtotal)}\n` +
      `Ongkos Kirim: akan dikonfirmasi oleh admin`;

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    setStep("success");
  };

  const resetAll = () => {
    setCart({});
    setCartOpen(false);
    setStep("cart");
    setForm({ nama: "", hp: "", alamat: "", metode: "Transfer Bank", catatan: "" });
  };

  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchValue, setHeaderSearchValue] = useState("");

  const submitHeaderSearch = (e) => {
    e.preventDefault();
    setSearch(headerSearchValue);
    setCategory("Semua");
    setMobileMenuOpen(false);
    setHeaderSearchOpen(false);
    document.getElementById("semua-produk")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="font-body min-h-screen bg-[#FFFDF9] text-[#282422]">
      {/* Promo Bar */}
      <div className="bg-[#282422] text-[#FFFDF9] text-center text-xs sm:text-sm py-2 px-4 tracking-wide">
        Konsultasi Beauty Advisor Gratis &middot; Pengiriman Seluruh Indonesia
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur border-b border-[#E8E1DB] transition-shadow">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 -ml-2 text-[#282422]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <a href="#" className="flex items-center">
              <img
                src="/images/beauty-rossa-logo-header.png"
                alt="Beauty Rossa"
                className="w-[105px] sm:w-[135px] lg:w-[155px] h-auto object-contain"
              />
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#282422]/80 hover:text-[#B9897D] transition rounded-sm"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                "Halo Beauty Rossa,\nSaya ingin melakukan konsultasi mengenai kondisi kulit saya. Mohon dibantu informasi konsultasi dan prosedurnya.\nTerima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#282422]/80 hover:text-[#B9897D] transition rounded-sm"
            >
              Konsultasi
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHeaderSearchOpen((s) => !s)}
              aria-label="Cari produk"
              className="p-2 rounded-full hover:bg-[#F6F0EA] transition text-[#282422]"
            >
              <Search size={19} />
            </button>
            <button
              onClick={openCart}
              aria-label="Buka keranjang"
              className="relative flex items-center gap-2 border border-[#B9897D]/50 rounded-full px-4 py-2 text-sm hover:bg-[#B9897D]/10 transition"
            >
              <ShoppingBag size={16} className="text-[#B9897D]" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#B9897D] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {headerSearchOpen && (
          <form onSubmit={submitHeaderSearch} className="border-t border-[#E8E1DB] px-6 py-3 max-w-6xl mx-auto">
            <input
              autoFocus
              type="text"
              value={headerSearchValue}
              onChange={(e) => setHeaderSearchValue(e.target.value)}
              placeholder="Cari produk, misal: serum, cream malam..."
              className="w-full bg-[#F6F0EA] border border-[#E8E1DB] rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-[#B9897D] placeholder:text-[#6D6662]/60"
            />
          </form>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-[#FFFDF9] shadow-xl p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-xl italic text-[#B9897D]">Beauty Rossa</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu" className="p-2">
                <X size={20} />
              </button>
            </div>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-base text-[#282422] border-b border-[#E8E1DB]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                "Halo Beauty Rossa,\nSaya ingin melakukan konsultasi mengenai kondisi kulit saya. Mohon dibantu informasi konsultasi dan prosedurnya.\nTerima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-base text-[#B9897D] font-semibold"
            >
              Konsultasi
            </a>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-8 sm:pt-10 pb-10 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <div>
          <div className="text-xs tracking-[0.25em] uppercase text-[#B9897D] mb-3 font-semibold">
            Skincare &amp; Klinik Kecantikan
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] mb-4 text-[#282422]">
            Perawatan Kulit yang Lebih Personal untuk Kecantikan Anda
          </h1>
          <p className="text-[#6D6662] max-w-md mb-6 leading-relaxed">
            Temukan skincare Beauty Rossa, konsultasi Beauty Advisor, dan perawatan klinik yang
            disesuaikan dengan kebutuhan kulit Anda.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <a
              href="#produk"
              className="inline-flex items-center gap-2 bg-[#B9897D] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#C4A46B] transition"
            >
              Belanja Produk <ChevronRight size={16} />
            </a>
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                "Halo Beauty Rossa,\nSaya ingin konsultasi gratis mengenai kondisi kulit saya.\nTerima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#282422]/20 text-[#282422] font-semibold px-6 py-3 rounded-full hover:bg-[#F6F0EA] transition"
            >
              Konsultasi Gratis
            </a>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-x-5 gap-y-2.5 text-xs text-[#6D6662]">
            {["Produk berizin BPOM", "Konsultasi personal", "Pengiriman seluruh Indonesia", "Klinik Beauty Rossa"].map(
              (item, i, arr) => (
                <React.Fragment key={item}>
                  <span className="flex items-center gap-1.5">
                    <Check size={13} className="text-[#B9897D] flex-shrink-0" />
                    {item}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="hidden sm:inline text-[#E8E1DB]" aria-hidden="true">
                      &middot;
                    </span>
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>

        {/* Komposisi visual hero: foto produk asli + logo pendukung + gradient */}
        <div className="relative aspect-[4/3] lg:aspect-square max-h-[380px] mx-auto w-full">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#F6F0EA] via-[#EED9D6] to-[#F6F0EA] border border-[#E8E1DB]" />
          <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-[#EED9D6]/60 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-[#C4A46B]/20 blur-2xl" />

          <div className="absolute left-[12%] bottom-[10%] w-[42%] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-[-4deg]">
            <img
              src="/images/10_BRIGHTENING_SHOWER_GEL_500_ml_.png"
              alt="Brightening Shower Gel Beauty Rossa"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute right-[10%] top-[12%] w-[38%] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-[5deg]">
            <img
              src="/images/29__FACIAL_WASH_200_ML_.png"
              alt="Facial Wash Beauty Rossa"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center p-2">
            <img src="/images/logo.png" alt="Beauty Rossa" className="w-full h-full object-contain" />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-[#E8E1DB] py-5">
          {TRUST_BADGES.map((b, i) =>
            b.link ? (
              <a
                key={i}
                href={b.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#F6F0EA] flex items-center justify-center flex-shrink-0 group-hover:bg-[#B9897D]/10 transition">
                  <b.icon size={16} className="text-[#B9897D]" />
                </div>
                <span className="text-xs text-[#282422]/75 leading-tight group-hover:text-[#B9897D] transition">
                  {b.label}
                </span>
              </a>
            ) : (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F6F0EA] flex items-center justify-center flex-shrink-0">
                  <b.icon size={16} className="text-[#B9897D]" />
                </div>
                <span className="text-xs text-[#282422]/75 leading-tight">{b.label}</span>
              </div>
            )
          )}
        </div>
      </section>

      {/* Solusi Kulit */}
      <section id="solusi-kulit" className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display text-3xl mb-3">Temukan Perawatan Berdasarkan Kebutuhan Kulit</h2>
          <p className="text-[#6D6662] text-sm leading-relaxed">
            Pilih kebutuhan utama kulit Anda untuk menemukan produk atau mendapatkan rekomendasi yang
            lebih personal.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SKIN_CONCERNS.map((concern) => (
            <button
              key={concern.label}
              onClick={() => goToConcern(concern)}
              className="flex flex-col items-center gap-3 border border-[#E8E1DB] rounded-2xl py-6 px-3 bg-white hover:border-[#B9897D]/50 hover:shadow-md transition text-center"
            >
              <div className="w-11 h-11 rounded-full bg-[#F6F0EA] flex items-center justify-center">
                <concern.icon size={19} className="text-[#B9897D]" />
              </div>
              <span className="text-sm font-medium text-[#282422]">{concern.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Produk Unggulan */}
      <section id="produk" className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display text-3xl mb-3">Produk Pilihan Beauty Rossa</h2>
          <p className="text-[#6D6662] text-sm leading-relaxed">
            Pilihan skincare untuk melengkapi rutinitas perawatan kulit Anda.
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onView={setDetailProduct} onAdd={addToCart} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#6D6662] text-sm mb-10">
            Foto produk sedang dilengkapi. Lihat katalog lengkap di bawah untuk sementara.
          </p>
        )}

        <div className="text-center">
          <a
            href="#semua-produk"
            className="inline-flex items-center gap-2 border border-[#282422]/20 text-[#282422] font-semibold px-6 py-3 rounded-full hover:bg-[#F6F0EA] transition"
          >
            Lihat Semua Produk <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* Beauty Advisor */}
      <section className="bg-[#F6F0EA] py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl mb-4">Bingung Memilih Skincare yang Tepat?</h2>
          <p className="text-[#6D6662] leading-relaxed mb-2 max-w-2xl mx-auto">
            Beauty Advisor Beauty Rossa siap membantu memahami kebutuhan kulit Anda dan memberikan
            rekomendasi produk berdasarkan informasi yang Anda sampaikan.
          </p>
          <p className="text-xs text-[#6D6662]/70 mb-8">
            Beauty Advisor memberikan informasi dan rekomendasi penggunaan produk, bukan diagnosis medis.
          </p>
          <a
            href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
              "Halo Beauty Rossa,\nSaya ingin melakukan konsultasi mengenai kondisi kulit saya. Mohon dibantu informasi konsultasi dan prosedurnya.\nTerima kasih."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#B9897D] text-white font-semibold px-7 py-3 rounded-full hover:bg-[#C4A46B] transition"
          >
            <MessageCircle size={17} /> Chat Beauty Advisor
          </a>
        </div>
      </section>

      {/* Tentang Beauty Rossa */}
      <section id="tentang" className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl mb-4">Kecantikan yang Berawal dari Perawatan yang Tepat</h2>
          <p className="text-[#6D6662] leading-relaxed">
            Beauty Rossa menghadirkan produk skincare dan layanan kecantikan yang berfokus pada
            kebutuhan setiap pelanggan. Kami menggabungkan pengalaman klinik, konsultasi yang lebih
            personal, dan pilihan produk untuk membantu pelanggan membangun rutinitas perawatan kulit
            yang lebih terarah.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {ABOUT_VALUES.map((v) => (
            <div key={v.title} className="text-center border border-[#E8E1DB] rounded-2xl p-8 bg-white">
              <h3 className="font-display text-xl mb-2 text-[#B9897D]">{v.title}</h3>
              <p className="text-sm text-[#6D6662] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Klinik & Treatment */}
      <section id="klinik" className="bg-[#282422] text-[#FFFDF9] py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl mb-4">Perawatan Profesional di Klinik Beauty Rossa</h2>
            <p className="text-[#FFFDF9]/70 leading-relaxed">
              Temukan layanan konsultasi dan treatment kecantikan bersama tim Beauty Rossa sesuai
              kebutuhan pelanggan.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {CLINIC_SERVICES.map((s) => (
              <div key={s.title} className="border border-[#FFFDF9]/15 rounded-2xl p-6">
                <h3 className="font-display text-lg mb-2 text-[#C4A46B]">{s.title}</h3>
                <p className="text-sm text-[#FFFDF9]/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                "Halo Beauty Rossa,\nSaya ingin melakukan booking treatment di klinik.\nMohon informasi jadwal yang tersedia.\nTerima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C4A46B] text-[#282422] font-semibold px-7 py-3 rounded-full hover:opacity-90 transition"
            >
              Booking Treatment <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Katalog Lengkap */}
      <section id="semua-produk" className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="font-display text-3xl mb-2">Produk Pilihan Beauty Rossa</h2>
          <p className="text-[#6D6662] text-sm leading-relaxed">
            Temukan rangkaian skincare pilihan untuk membantu kebutuhan kulit Anda.
          </p>
        </div>

        <div className="mb-5 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6D6662]/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, kategori, atau kebutuhan kulit..."
              aria-label="Cari produk"
              className="w-full bg-[#F6F0EA] border border-[#E8E1DB] rounded-full pl-10 pr-5 py-2.5 text-sm focus:outline-none focus:border-[#B9897D] placeholder:text-[#6D6662]/60"
            />
          </div>
        </div>

        {/* Filter bar premium: horizontal scroll di mobile, wrap di desktop */}
        <div className="mb-8 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 no-scrollbar">
            {CATALOG_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setCategory(f.label)}
                aria-pressed={category === f.label}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                  category === f.label
                    ? "bg-[#B9897D] text-white border-[#B9897D] font-semibold shadow-sm"
                    : "border-[#E8E1DB] text-[#282422]/70 hover:border-[#B9897D]/60 hover:text-[#B9897D]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6D6662] mb-5">Tidak menemukan produk.</p>
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                `Halo Beauty Rossa,\nSaya mencari produk terkait "${search || category}" tapi tidak menemukannya di website. Mohon rekomendasinya.\nTerima kasih.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#B9897D] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#C4A46B] transition"
            >
              <MessageCircle size={16} /> Konsultasi Beauty Advisor
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {visibleProducts.map((p) => (
                <ProductCard key={p.id} product={p} onView={setDetailProduct} onAdd={addToCart} />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + CATALOG_PAGE_SIZE)}
                  className="inline-flex items-center gap-2 border border-[#282422]/20 text-[#282422] font-semibold px-7 py-3 rounded-full hover:bg-[#F6F0EA] transition"
                >
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E1DB] bg-[#F6F0EA] pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-1">
            <img src="/images/logo.png" alt="Beauty Rossa" className="h-12 w-auto object-contain mb-3" />
            <p className="text-xs text-[#6D6662] leading-relaxed">
              Skincare dan layanan kecantikan yang disesuaikan dengan kebutuhan kulit Anda.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#6D6662] mb-3 font-semibold">Belanja</h4>
            <ul className="text-sm text-[#282422]/80 space-y-2">
              <li><a href="#produk" className="hover:text-[#B9897D] transition">Produk</a></li>
              <li><span className="text-[#6D6662]/60">Promo - Segera hadir</span></li>
              <li><button onClick={openCart} className="hover:text-[#B9897D] transition">Keranjang</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#6D6662] mb-3 font-semibold">Layanan</h4>
            <ul className="text-sm text-[#282422]/80 space-y-2">
              <li>
                <a
                  href={`https://wa.me/${DOCTOR_WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B9897D] transition"
                >
                  Konsultasi
                </a>
              </li>
              <li><a href="#klinik" className="hover:text-[#B9897D] transition">Klinik</a></li>
              <li><a href="#klinik" className="hover:text-[#B9897D] transition">Treatment</a></li>
              <li><a href="#klinik" className="hover:text-[#B9897D] transition">Booking</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#6D6662] mb-3 font-semibold">Informasi</h4>
            <ul className="text-sm text-[#282422]/80 space-y-2">
              <li><a href="#tentang" className="hover:text-[#B9897D] transition">Tentang Kami</a></li>
              <li><span className="text-[#6D6662]/60">FAQ - Segera hadir</span></li>
              <li><span className="text-[#6D6662]/60">Pengiriman - Segera hadir</span></li>
              <li>
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B9897D] transition"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#6D6662] mb-3 font-semibold">Kebijakan</h4>
            <ul className="text-sm text-[#282422]/80 space-y-2">
              <li><span className="text-[#6D6662]/60">Kebijakan Privasi - Segera hadir</span></li>
              <li><span className="text-[#6D6662]/60">Syarat &amp; Ketentuan - Segera hadir</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-[#E8E1DB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#6D6662]">&copy; 2026 Beauty Rossa. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-xs text-[#282422]/80">
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#B9897D] transition"
            >
              WhatsApp Admin
            </a>
            <span className="text-[#E8E1DB]">|</span>
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#B9897D] transition"
            >
              WhatsApp Beauty Advisor
            </a>
          </div>
        </div>
      </footer>

      {/* Tombol WhatsApp Mengambang - satu tombol utama + submenu */}
      {floatingMenuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setFloatingMenuOpen(false)} />
      )}
      <div className="fixed bottom-5 right-5 z-30">
        {floatingMenuOpen && (
          <div className="absolute bottom-14 right-0 w-60 bg-white rounded-xl shadow-xl border border-[#E8E1DB] p-2 mb-2">
            <a
              href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                "Halo Beauty Rossa,\nSaya ingin melakukan konsultasi mengenai kondisi kulit saya. Mohon dibantu informasi konsultasi dan prosedurnya.\nTerima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#F6F0EA] transition text-sm text-[#282422]"
            >
              <Stethoscope size={16} className="text-[#B9897D]" /> Beauty Rossa Advisor
            </a>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                "Halo Beauty Rossa,\nSaya ingin mendapatkan informasi mengenai produk dan layanan Beauty Rossa.\nMohon bantuannya.\nTerima kasih."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#F6F0EA] transition text-sm text-[#282422]"
            >
              <MessageCircle size={16} className="text-[#25D366]" /> Chat Admin
            </a>
          </div>
        )}
        <button
          onClick={() => setFloatingMenuOpen((s) => !s)}
          aria-label="Buka pilihan chat WhatsApp"
          aria-expanded={floatingMenuOpen}
          className="flex items-center gap-2 bg-[#B9897D] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-[#C4A46B] transition"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-semibold">Chat Beauty Advisor</span>
        </button>
      </div>

      {/* Cart / Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white border-l border-[#E8E1DB] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E1DB]">
              <h3 className="font-display text-xl">
                {step === "cart" && "Keranjang Belanja"}
                {step === "checkout" && "Checkout"}
                {step === "success" && "Pesanan Disiapkan"}
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Tutup keranjang"
                className="text-[#6D6662] hover:text-[#B9897D]"
              >
                <X size={20} />
              </button>
            </div>

            {step === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {cartItems.length === 0 && (
                    <p className="text-sm text-[#6D6662] mt-10 text-center">
                      Keranjangmu masih kosong. Yuk pilih produk favoritmu.
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center border-b border-[#E8E1DB] pb-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#F6F0EA] to-[#EED9D6] flex-shrink-0">
                        <img
                          src={`/images/${item.image}`}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-[#B9897D]">{rupiah(item.price)}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            aria-label="Kurangi jumlah"
                            className="w-6 h-6 flex items-center justify-center border border-[#E8E1DB] rounded-full hover:bg-[#F6F0EA]"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            aria-label="Tambah jumlah"
                            className="w-6 h-6 flex items-center justify-center border border-[#E8E1DB] rounded-full hover:bg-[#F6F0EA]"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Hapus ${item.name}`}
                        className="text-[#6D6662]/50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <div className="px-6 py-5 border-t border-[#E8E1DB] space-y-3">
                    <div className="flex justify-between text-sm text-[#282422]/80">
                      <span>Subtotal</span>
                      <span>{rupiah(subtotal)}</span>
                    </div>
                    <p className="text-xs text-[#6D6662]">Ongkos kirim akan dikonfirmasi oleh admin.</p>
                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full bg-[#B9897D] text-white font-semibold py-3 rounded-full hover:bg-[#C4A46B] transition"
                    >
                      Lanjut ke Checkout
                    </button>
                  </div>
                )}
              </>
            )}

            {step === "checkout" && (
              <form onSubmit={submitOrder} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#6D6662] block mb-1">Nama Penerima</label>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full bg-[#FFFDF9] border border-[#E8E1DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B9897D]"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6D6662] block mb-1">Nomor HP / WhatsApp</label>
                  <input
                    required
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                    className="w-full bg-[#FFFDF9] border border-[#E8E1DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B9897D]"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6D6662] block mb-1">Alamat Pengiriman</label>
                  <textarea
                    required
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    rows={3}
                    className="w-full bg-[#FFFDF9] border border-[#E8E1DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B9897D] resize-none"
                    placeholder="Alamat lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6D6662] block mb-1">Catatan (opsional)</label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    rows={2}
                    className="w-full bg-[#FFFDF9] border border-[#E8E1DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B9897D] resize-none"
                    placeholder="Contoh: warna, ukuran, permintaan khusus"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6D6662] block mb-2">Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Transfer Bank", "COD", "QRIS"].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setForm({ ...form, metode: m })}
                        className={`text-xs py-2 rounded-lg border transition ${
                          form.metode === m
                            ? "bg-[#B9897D] text-white border-[#B9897D] font-semibold"
                            : "border-[#E8E1DB] text-[#282422]/70"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#6D6662] mt-2">
                    Pembayaran dikonfirmasi manual melalui WhatsApp admin, belum terintegrasi otomatis.
                  </p>
                </div>

                <div className="mt-2 border-t border-[#E8E1DB] pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-[#282422]/80">
                    <span>Subtotal</span>
                    <span>{rupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6D6662]">
                    <span>Ongkos Kirim</span>
                    <span>Dikonfirmasi admin</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B9897D] text-white font-semibold py-3 rounded-full hover:bg-[#C4A46B] transition mt-2"
                >
                  Buat Pesanan
                </button>
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="text-xs text-[#6D6662] hover:text-[#B9897D] text-center"
                >
                  Kembali ke keranjang
                </button>
              </form>
            )}

            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#B9897D] flex items-center justify-center">
                  <Check size={26} className="text-white" />
                </div>
                <h4 className="font-display text-2xl">Terima kasih, {form.nama.split(" ")[0]}!</h4>
                <p className="text-sm text-[#6D6662] max-w-xs">
                  Pesananmu dengan nomor <span className="text-[#B9897D] font-semibold">{orderNo}</span>{" "}
                  sudah disiapkan. Tab WhatsApp seharusnya sudah terbuka dengan rincian pesananmu &mdash;
                  tinggal klik <strong>Kirim</strong> di WhatsApp untuk menyelesaikan pemesanan. Pesanan
                  baru dianggap berhasil setelah pesan WhatsApp terkirim.
                </p>
                <div className="text-xs text-[#6D6662]">
                  Kalau WhatsApp tidak otomatis terbuka, klik tombol di bawah ini:
                </div>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                    `Halo Beauty Rossa, ada pesanan baru masuk lewat website:\n\nNo. Pesanan: ${orderNo}\nNama: ${form.nama}\nNo. HP: ${form.hp}\nAlamat: ${form.alamat}\nMetode Bayar: ${form.metode}\nCatatan: ${form.catatan || "-"}\n\nRincian Produk:\n${cartItems
                      .map((item) => `- ${item.name} x${item.qty} = ${rupiah(item.qty * item.price)}`)
                      .join("\n")}\n\nSubtotal: ${rupiah(subtotal)}\nOngkos Kirim: akan dikonfirmasi oleh admin`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition"
                >
                  <MessageCircle size={16} /> Kirim via WhatsApp
                </a>
                <div className="text-sm text-[#282422] font-semibold">Subtotal: {rupiah(subtotal)}</div>
                <button
                  onClick={resetAll}
                  className="mt-4 bg-[#B9897D] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#C4A46B] transition"
                >
                  Belanja Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Detail Produk */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailProduct(null)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[#E8E1DB]">
            <button
              onClick={() => setDetailProduct(null)}
              aria-label="Tutup detail produk"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 border border-[#E8E1DB] flex items-center justify-center hover:bg-[#F6F0EA]"
            >
              <X size={18} />
            </button>
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square bg-gradient-to-br from-[#F6F0EA] to-[#EED9D6]">
                <img
                  src={`/images/${detailProduct.image}`}
                  alt={detailProduct.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-wider text-[#B9897D] mb-2">
                  {detailProduct.cat}
                </div>
                <h3 className="font-display text-2xl mb-3">{detailProduct.name}</h3>
                {detailProduct.price > 0 ? (
                  <div className="text-xl font-semibold text-[#282422] mb-4">
                    {rupiah(detailProduct.price)}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-[#6D6662] mb-4">Hubungi Kami - Segera Hadir</div>
                )}

                {detailProduct.desc && detailProduct.desc !== "Deskripsi menyusul" && (
                  <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-[#6D6662] mb-1">Deskripsi</h4>
                    <p className="text-sm text-[#282422]/80 leading-relaxed">{detailProduct.desc}</p>
                  </div>
                )}

                {detailProduct.price > 0 ? (
                  <button
                    onClick={() => {
                      addToCart(detailProduct.id);
                      setDetailProduct(null);
                      openCart();
                    }}
                    className="w-full bg-[#B9897D] text-white font-semibold py-3 rounded-full hover:bg-[#C4A46B] transition"
                  >
                    + Tambah ke Keranjang
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                      `Halo, saya ingin tanya harga produk ${detailProduct.name}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full bg-[#25D366] text-white font-semibold py-3 rounded-full hover:opacity-90 transition"
                  >
                    Tanya via WhatsApp
                  </a>
                )}
                <a
                  href={`https://wa.me/${DOCTOR_WA_NUMBER}?text=${encodeURIComponent(
                    `Halo Beauty Rossa,\nSaya ingin tanya ke Beauty Advisor mengenai produk ${detailProduct.name}.\nTerima kasih.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full mt-2 border border-[#E8E1DB] text-[#282422] text-sm font-medium py-2.5 rounded-full hover:bg-[#F6F0EA] transition"
                >
                  Tanya Beauty Advisor
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
