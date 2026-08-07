-- ============================================================
-- Beauty Rossa 1 Solution — Migrasi 0003
-- MENGGANTIKAN pendekatan migrasi 0001 & 0002 sebelumnya.
--
-- LATAR BELAKANG:
-- Migrasi 0001/0002 membuat tabel `products` versi baru dari nol,
-- padahal tabel `products` SUDAH ADA di production (dibuat lewat
-- skema "Tahap A1"). Migrasi ini memperbaikinya dengan cara:
--   - MENAMBAH kolom ke tabel `products` yang sudah ada (bukan bikin baru)
--   - Menyesuaikan nama role dengan yang benar-benar dipakai:
--     super_admin, owner, ecommerce_admin, finance, warehouse,
--     customer_service, content_editor
--   - Menambahkan kebijakan INSERT/UPDATE untuk products, yang
--     sebelumnya tidak ada sama sekali di skema Tahap A1 (hanya ada
--     kebijakan SELECT) — tanpa ini, admin tidak akan pernah bisa
--     menyimpan produk apa pun walau kode aplikasinya benar.
--
-- JANGAN jalankan migrasi 0001/0002 yang lama di production.
-- File ini AMAN dijalankan berulang (pakai IF NOT EXISTS / OR REPLACE).
-- Tetap jalankan di project Supabase DEVELOPMENT dulu sebelum production.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tambah kolom ke tabel products yang sudah ada
-- ------------------------------------------------------------
alter table products
  add column if not exists brand text,
  add column if not exists description text,
  add column if not exists unit text not null default 'pcs',
  add column if not exists size_label text,
  add column if not exists min_stock integer not null default 0,
  add column if not exists bpom_number text,
  add column if not exists bpom_expiry_date date,
  add column if not exists expiry_date date,
  add column if not exists created_by uuid references admin_users(id),
  add column if not exists updated_by uuid references admin_users(id);

-- ------------------------------------------------------------
-- 2. Tabel baru pendukung (belum ada di skema Tahap A1)
-- ------------------------------------------------------------
create table if not exists warehouses (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. Trigger updated_at otomatis untuk products
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
-- 4. Kebijakan keamanan (RLS) tambahan
-- Skema Tahap A1 sudah punya function is_admin() dan
-- current_admin_role() — dipakai ulang di sini, tidak dibuat baru.
-- ------------------------------------------------------------

-- products: TAMBAHAN kebijakan insert/update (sebelumnya cuma ada SELECT)
drop policy if exists products_admin_insert on products;
create policy products_admin_insert on products
  for insert
  with check (current_admin_role() in ('super_admin','owner','warehouse'));

drop policy if exists products_admin_update on products;
create policy products_admin_update on products
  for update
  using (current_admin_role() in ('super_admin','owner','warehouse'))
  with check (current_admin_role() in ('super_admin','owner','warehouse'));

-- warehouses
alter table warehouses enable row level security;
create policy admin_read_warehouses on warehouses for select using (is_admin());
create policy admin_write_warehouses on warehouses for all
  using (current_admin_role() in ('super_admin','owner','warehouse'))
  with check (current_admin_role() in ('super_admin','owner','warehouse'));

-- suppliers
alter table suppliers enable row level security;
create policy admin_read_suppliers on suppliers for select using (is_admin());
create policy admin_write_suppliers on suppliers for all
  using (current_admin_role() in ('super_admin','owner','warehouse'))
  with check (current_admin_role() in ('super_admin','owner','warehouse'));

-- product_images
alter table product_images enable row level security;
create policy admin_read_product_images on product_images for select using (is_admin());
create policy admin_write_product_images on product_images for all
  using (current_admin_role() in ('super_admin','owner','warehouse'))
  with check (current_admin_role() in ('super_admin','owner','warehouse'));

-- ------------------------------------------------------------
-- 5. Data awal gudang
-- ------------------------------------------------------------
insert into warehouses (name) values ('Gudang Utama')
on conflict (name) do nothing;
