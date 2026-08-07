-- ============================================================
-- Beauty Rossa 1 Solution — Migrasi 0001
-- Modul: Produk, Kategori, Gudang, Supplier, Audit Log
--
-- CATATAN PENTING:
-- - File ini BARU RANCANGAN. Belum dijalankan ke Supabase mana pun.
-- - Jalankan HANYA di project Supabase development dulu, bukan production.
-- - Tidak mengubah/menghapus tabel yang sudah ada (admin_users, orders,
--   customers) dan TIDAK menyentuh fungsi create_order().
-- - Struktur order_items / kolom SKU di tabel products akan disesuaikan
--   lagi setelah skema asli create_order() dikonfirmasi, supaya nyambung
--   dengan format SKU "BR-XXX" yang sudah dipakai di checkout.
-- ============================================================

-- Perlu extension untuk uuid, biasanya sudah aktif di Supabase
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Kategori produk
-- ------------------------------------------------------------
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Gudang / lokasi
-- ------------------------------------------------------------
create table if not exists warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Supplier
-- ------------------------------------------------------------
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Produk (master)
-- SKU dibuat cocok dengan format "BR-XXX" yang sudah dipakai di
-- checkout (lihat src/App.jsx -> submitOrder -> sku: `BR-${id}`)
-- ------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references product_categories(id),
  brand text,
  description text,
  unit text not null default 'pcs',        -- pcs, botol, box, tube, sachet
  size_label text,                          -- contoh: "50 ml", "10 ml"
  cost_price numeric(14,2) not null default 0,
  sell_price numeric(14,2) not null default 0,
  min_stock integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_sku on products (sku);
create index if not exists idx_products_active on products (is_active);

-- Foto produk (boleh lebih dari satu per produk)
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Audit log (dipakai lintas modul, bukan cuma produk)
-- ------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_admin_id uuid references admin_users(id),
  action text not null,          -- contoh: 'product.create', 'product.update'
  entity text not null,          -- contoh: 'products'
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Trigger: auto-update kolom updated_at pada products
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- Semua admin aktif boleh MELIHAT. Hanya role 'owner' dan
-- 'administrator' yang boleh MENAMBAH/UBAH untuk saat ini
-- (role Admin Gudang/Penjualan/dll ditambahkan bertahap sesuai
-- modul masing-masing berjalan).
-- ------------------------------------------------------------
alter table product_categories enable row level security;
alter table warehouses enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table audit_logs enable row level security;

create policy admin_read_categories on product_categories for select
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active));
create policy admin_write_categories on product_categories for all
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')))
  with check (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')));

create policy admin_read_warehouses on warehouses for select
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active));
create policy admin_write_warehouses on warehouses for all
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')))
  with check (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')));

create policy admin_read_suppliers on suppliers for select
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active));
create policy admin_write_suppliers on suppliers for all
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')))
  with check (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')));

create policy admin_read_products on products for select
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active));
create policy admin_write_products on products for all
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')))
  with check (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')));

create policy admin_read_product_images on product_images for select
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active));
create policy admin_write_product_images on product_images for all
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')))
  with check (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role in ('owner','administrator')));

create policy admin_read_audit_logs on audit_logs for select
  using (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active and au.role = 'owner'));
create policy admin_insert_audit_logs on audit_logs for insert
  with check (exists (select 1 from admin_users au where au.auth_user_id = auth.uid() and au.is_active));

-- ------------------------------------------------------------
-- Data awal gudang (silakan sesuaikan nama sebelum dijalankan)
-- ------------------------------------------------------------
insert into warehouses (name) values
  ('Gudang Utama')
on conflict (name) do nothing;
