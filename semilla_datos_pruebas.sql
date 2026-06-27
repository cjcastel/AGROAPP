-- ==============================================================
-- SCRIPT DE SEMILLA (SEED) DE DATOS DE PRUEBA MULTI-TENANT
-- AGROAPP - SUPABASE
-- ==============================================================
-- Este script inserta:
-- 1. Dos Tenants/Organizaciones diferentes.
-- 2. Dos usuarios en auth.users con contraseña desencriptable 'password123'.
-- 3. Perfiles de usuario asignados a sus respectivos tenants.
-- 4. Explotaciones, parcelas, animales y tratamientos segregados.
--
-- INSTRUCCIONES: Ejecutar en el "SQL Editor" de Supabase.

-- Limpiar datos de prueba previos si existen (orden de dependencias)
DELETE FROM public.tratamientos_fitosanitarios;
DELETE FROM public.movimientos;
DELETE FROM public.animales;
DELETE FROM public.parcelas;
DELETE FROM public.explotaciones;
DELETE FROM public.perfiles;
DELETE FROM auth.users WHERE email IN ('carlos@agrotoledo.es', 'manuel@dehesa.es');

-- ==========================================
-- 1. CREACIÓN DE USUARIOS EN AUTH.USERS (Contraseña: 'password123')
-- ==========================================
-- Hash bcrypt oficial de Supabase para 'password123':
-- $2a$10$7EqJtDQsSy.K.H/XQ.6mOOZ.FfPujgEw24w6w4gS7e/G6e1uY9K1G

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
)
VALUES
-- Usuario Carlos (Tenant A - Agrícola)
(
  'c0a80101-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'carlos@agrotoledo.es',
  '$2a$10$7EqJtDQsSy.K.H/XQ.6mOOZ.FfPujgEw24w6w4gS7e/G6e1uY9K1G',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Carlos Toledo"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
),
-- Usuario Manuel (Tenant B - Ganadero)
(
  'c0a80101-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'manuel@dehesa.es',
  '$2a$10$7EqJtDQsSy.K.H/XQ.6mOOZ.FfPujgEw24w6w4gS7e/G6e1uY9K1G',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Manuel Extremadura"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  ''
);

-- ==========================================
-- 2. ASOCIACIÓN DE PERFILES Y TENANTS (public.perfiles)
-- ==========================================

INSERT INTO public.perfiles (id, user_id, nombre, rol, tenant_id)
VALUES
-- Carlos ➔ Tenant A (Agropecuaria Toledo S.L.)
(
  uuid_generate_v4(),
  'c0a80101-0000-0000-0000-000000000001',
  'Carlos Administrador',
  'admin',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8'
),
-- Manuel ➔ Tenant B (Dehesa Extremeña S.A.)
(
  uuid_generate_v4(),
  'c0a80101-0000-0000-0000-000000000002',
  'Manuel Pastor',
  'admin',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9'
);

-- ==========================================
-- 3. EXPLOTACIONES (public.explotaciones)
-- ==========================================

INSERT INTO public.explotaciones (id, tenant_id, nombre, rega, tipo, provincia, municipio)
VALUES
-- Explotación Agrícola de Carlos
(
  'f0000000-0000-0000-0000-000000000001',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
  'Finca Los Olivos',
  'ES450010000293',
  'agricola',
  'Toledo',
  'Alcaudete de la Jara'
),
-- Explotación Ganadera de Manuel
(
  'f0000000-0000-0000-0000-000000000002',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9',
  'Dehesa El Roble',
  'ES100010000550',
  'ganadera',
  'Cáceres',
  'Trujillo'
);

-- ==========================================
-- 4. PARCELAS SIGPAC (Tenant A - Carlos)
-- ==========================================

INSERT INTO public.parcelas (id, explotacion_id, tenant_id, sigpac_poligono, sigpac_recinto, sigpac_uso, alias, superficie_cultivada, especie, variedad, regimen)
VALUES
(
  'p0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000001',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
  11,
  37,
  'TA',
  'Parcela Los Olivos (Secano)',
  12.5000,
  'Cebada',
  'Planet R-2',
  'secano'
),
(
  'p0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000001',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
  11,
  41,
  'TA',
  'P-11-41 (Barbecho)',
  4.2000,
  'Barbecho',
  '',
  'secano'
);

-- ==========================================
-- 5. TRATAMIENTOS FITOSANITARIOS (Tenant A - Carlos)
-- ==========================================

INSERT INTO public.tratamientos_fitosanitarios (id, parcela_id, tenant_id, producto, num_registro_oficial, dosis, unidad_medida, superficie_tratada, aplicador_nombre, fecha_aplicacion, eficacia, problema_fitosanitario)
VALUES
(
  uuid_generate_v4(),
  'p0000000-0000-0000-0000-000000000001',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
  'ROUNDUP ULTRA PLUS',
  'ES-00123',
  2.00,
  'L/ha',
  12.5000,
  'Luis M. Rodríguez',
  '2025-10-15',
  'Alta',
  'Malas hierbas antes siembra'
);

-- ==========================================
-- 6. ANIMALES (Tenant B - Manuel)
-- ==========================================

INSERT INTO public.animales (id, explotacion_id, tenant_id, crotal, dib, chip, fecha_nacimiento, fecha_alta, sexo, raza, madre_crotal, padre_crotal, clasificacion, activo)
VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9',
  'ES000002874561',
  'DIB-4561',
  '985112000014561',
  '2021-02-12',
  '2021-02-12',
  'H',
  'Limusín',
  'ES000001004021',
  '',
  'Preñada',
  TRUE
),
(
  'a0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000002',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9',
  'ES000002874562',
  'DIB-4562',
  '985112000014562',
  '2021-03-01',
  '2021-03-01',
  'H',
  'Limusín',
  'ES000001004022',
  '',
  'Vacía',
  TRUE
);

-- ==========================================
-- 7. MOVIMIENTOS REGA (Tenant B - Manuel)
-- ==========================================

INSERT INTO public.movimientos (id, animal_id, tenant_id, tipo, fecha_evento, guia_transporte, transportista, importe, peso, causa_baja)
VALUES
(
  uuid_generate_v4(),
  'a0000000-0000-0000-0000-000000000001',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9',
  'compra',
  '2026-01-02',
  'G-2026-001',
  'Subasta Ganadera Cáceres',
  1200.00,
  550.00,
  NULL
);
