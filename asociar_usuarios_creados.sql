-- ==============================================================
-- ASOCIAR PERFILES Y CARGAR DATOS DE PRUEBA MULTI-TENANT
-- ==============================================================
-- INSTRUCCIONES:
-- 1. Crea los usuarios 'carlos@agrotoledo.es' y 'manuel@dehesa.es' en Auth -> Users del panel de Supabase.
-- 2. Copia sus IDs (UUID) de la columna "User ID" y pégalos en las variables de abajo antes de ejecutar este script.

-- Limpiar tablas
DELETE FROM public.tratamientos_fitosanitarios;
DELETE FROM public.movimientos;
DELETE FROM public.animales;
DELETE FROM public.parcelas;
DELETE FROM public.explotaciones;
DELETE FROM public.perfiles;

-- =======================================================
-- CONFIGURACIÓN DE LOS PERFILES CON TUS USER_IDS REALES
-- =======================================================

INSERT INTO public.perfiles (id, user_id, nombre, rol, tenant_id)
VALUES
-- Reemplaza 'ID_CARLOS_AQUÍ' con el UUID real de carlos@agrotoledo.es
(
  uuid_generate_v4(),
  'ID_CARLOS_AQUÍ', 
  'Carlos Administrador',
  'admin',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8'
),
-- Reemplaza 'ID_MANUEL_AQUÍ' con el UUID real de manuel@dehesa.es
(
  uuid_generate_v4(),
  'ID_MANUEL_AQUÍ',
  'Manuel Pastor',
  'admin',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9'
);

-- ==========================================
-- DATOS PARA EL TENANT A (Carlos - Agrícola)
-- ==========================================

-- Explotación (ID válido usando solo hexadecimal)
INSERT INTO public.explotaciones (id, tenant_id, nombre, rega, tipo, provincia, municipio)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
  'Finca Los Olivos',
  'ES450010000293',
  'agricola',
  'Toledo',
  'Alcaudete de la Jara'
);

-- Parcelas (IDs válidos usando solo hexadecimal)
INSERT INTO public.parcelas (id, explotacion_id, tenant_id, sigpac_poligono, sigpac_recinto, sigpac_uso, alias, superficie_cultivada, especie, variedad, regimen)
VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
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
  'b0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
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

-- Tratamiento Fitosanitario
INSERT INTO public.tratamientos_fitosanitarios (id, parcela_id, tenant_id, producto, num_registro_oficial, dosis, unidad_medida, superficie_tratada, aplicador_nombre, fecha_aplicacion, eficacia, problema_fitosanitario)
VALUES (
  uuid_generate_v4(),
  'b0000000-0000-0000-0000-000000000001',
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
-- DATOS PARA EL TENANT B (Manuel - Ganadero)
-- ==========================================

-- Explotación (ID válido usando solo hexadecimal)
INSERT INTO public.explotaciones (id, tenant_id, nombre, rega, tipo, provincia, municipio)
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9',
  'Dehesa El Roble',
  'ES100010000550',
  'ganadera',
  'Cáceres',
  'Trujillo'
);

-- Animales (IDs válidos usando solo hexadecimal)
INSERT INTO public.animales (id, explotacion_id, tenant_id, crotal, dib, chip, fecha_nacimiento, fecha_alta, sexo, raza, madre_crotal, padre_crotal, clasificacion, activo)
VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
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
  'd0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
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

-- Movimiento REGA
INSERT INTO public.movimientos (id, animal_id, tenant_id, tipo, fecha_evento, guia_transporte, transportista, importe, peso, causa_baja)
VALUES (
  uuid_generate_v4(),
  'd0000000-0000-0000-0000-000000000001',
  'e8c84590-19b9-5d9e-9fe1-d6e4f649f2b9',
  'compra',
  '2026-01-02',
  'G-2026-001',
  'Subasta Ganadera Cáceres',
  1200.00,
  550.00,
  NULL
);
