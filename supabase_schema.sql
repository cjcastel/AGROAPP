-- ==========================================
-- AGROAPP - ESQUEMA DE BASE DE DATOS SUPABASE
-- ==========================================
-- Ref: Project ID clozlsswwytenzmniqjr
-- Normativa CUE/SIEX 2026

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES (Vinculada a Auth.Users)
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    rol TEXT CHECK (rol IN ('admin', 'editor', 'lector')) DEFAULT 'lector',
    tenant_id UUID NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE EXPLOTACIONES
CREATE TABLE IF NOT EXISTS explotaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    nombre TEXT NOT NULL,
    rega TEXT UNIQUE,
    tipo TEXT CHECK (tipo IN ('agricola', 'ganadera', 'mixta')) NOT NULL,
    provincia TEXT NOT NULL,
    municipio TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PARCELAS (SIGPAC)
CREATE TABLE IF NOT EXISTS parcelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    explotacion_id UUID REFERENCES explotaciones(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    sigpac_poligono INTEGER NOT NULL,
    sigpac_recinto INTEGER NOT NULL,
    sigpac_uso TEXT NOT NULL,
    alias TEXT,
    superficie_cultivada NUMERIC(10,4) NOT NULL, -- en hectáreas
    especie TEXT NOT NULL,
    variedad TEXT,
    regimen TEXT CHECK (regimen IN ('secano', 'regadio')) NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE ANIMALES
CREATE TABLE IF NOT EXISTS animales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    explotacion_id UUID REFERENCES explotaciones(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    crotal TEXT UNIQUE NOT NULL,
    dib TEXT,
    chip TEXT UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    fecha_alta DATE NOT NULL,
    sexo CHAR(1) CHECK (sexo IN ('M', 'H')) NOT NULL,
    raza TEXT,
    madre_crotal TEXT,
    padre_crotal TEXT,
    clasificacion TEXT NOT NULL, -- Ej: Vacuno de cebo, reproductora
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE MOVIMIENTOS (ALTAS/BAJAS TRAZABILIDAD)
CREATE TABLE IF NOT EXISTS movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animales(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    tipo TEXT CHECK (tipo IN ('compra', 'venta', 'nacimiento', 'muerte')) NOT NULL,
    fecha_evento DATE NOT NULL,
    guia_transporte TEXT,
    transportista TEXT,
    importe NUMERIC(10,2),
    peso NUMERIC(8,2),
    causa_baja TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE TRATAMIENTOS FITOSANITARIOS
CREATE TABLE IF NOT EXISTS tratamientos_fitosanitarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcela_id UUID REFERENCES parcelas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    producto TEXT NOT NULL,
    num_registro_oficial TEXT NOT NULL,
    dosis NUMERIC(10,2) NOT NULL,
    unidad_medida TEXT NOT NULL,
    superficie_tratada NUMERIC(10,4) NOT NULL,
    aplicador_nombre TEXT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    eficacia TEXT,
    problema_fitosanitario TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE TRATAMIENTOS VETERINARIOS Y RECETAS
CREATE TABLE IF NOT EXISTS tratamientos_veterinarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animales(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    medicamento TEXT NOT NULL,
    codigo_receta TEXT NOT NULL,
    dosis TEXT NOT NULL,
    via_administracion TEXT NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL,
    periodo_supresion_dias INTEGER DEFAULT 0 NOT NULL,
    proveedor TEXT,
    fecha_tratamiento DATE NOT NULL,
    veterinario_nombre TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA DE FACTURAS (ERP)
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    explotacion_id UUID REFERENCES explotaciones(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    tipo TEXT CHECK (tipo IN ('emitida', 'recibida')) NOT NULL,
    numero_factura TEXT NOT NULL,
    proveedor_cliente TEXT NOT NULL,
    fecha_emision DATE NOT NULL,
    base_imponible NUMERIC(12,2) NOT NULL,
    iva NUMERIC(4,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    doc_url TEXT, -- Almacenamiento en Supabase Storage
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) E IMPLEMENTACIÓN
-- =============================================================

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE explotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos_fitosanitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos_veterinarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener el tenant_id del usuario logueado en la sesión
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.perfiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas de aislamiento
CREATE POLICY "RLS perfiles: Acceso personal" ON perfiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "RLS explotaciones: Aislamiento por Tenant" ON explotaciones
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "RLS parcelas: Aislamiento por Tenant" ON parcelas
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "RLS animales: Aislamiento por Tenant" ON animales
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "RLS movimientos: Aislamiento por Tenant" ON movimientos
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "RLS fitosanitarios: Aislamiento por Tenant" ON tratamientos_fitosanitarios
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "RLS veterinarios: Aislamiento por Tenant" ON tratamientos_veterinarios
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "RLS facturas: Aislamiento por Tenant" ON facturas
  FOR ALL USING (tenant_id = public.get_user_tenant_id());
