import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Produk" },
  { to: "/admin/inventory/incoming", label: "Barang Masuk" },
  { to: "/admin/orders", label: "Pesanan" },
  { to: "/admin/reports", label: "Laporan" },
];

export default function AdminNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="border-b border-[#E8E1DB] bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <div>
          <div className="text-lg font-semibold text-[#282422]">Beauty Rossa Admin</div>
        </div>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-lg transition ${
                  isActive ? "bg-[#F6F0EA] text-[#282422] font-semibold" : "text-[#6D6662] hover:bg-[#F6F0EA]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm border border-[#E8E1DB] rounded-lg px-4 py-2 hover:bg-[#F6F0EA] transition"
      >
        Keluar
      </button>
    </header>
  );
}
