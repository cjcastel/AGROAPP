# ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (SRS)
## PROYECTO: AGROAPP 🌾
**Versión:** 1.0  
**Fecha:** 27 de junio de 2026  
**Entorno de Datos:** Supabase BaaS (Postgres)  
**Cumplimiento Normativo:** CUE / SIEX España 2026  

---

## 1. INTRODUCCIÓN Y OBJETIVOS

### 1.1 Propósito
Este documento describe de forma completa, clara y precisa el propósito, comportamiento, arquitectura e implicaciones técnicas del sistema **AGROAPP**. Su objetivo es servir como guía para el equipo de desarrollo, QA y administración del proyecto.

### 1.2 Alcance del Sistema
**AGROAPP** es una plataforma en modelo **SaaS (Software as a Service) multi-tenant** en la nube, diseñada específicamente para el sector agropecuario español. Permite una gestión integral "end-to-end" de explotaciones agrícolas y ganaderas mediante:
*   La digitalización y estructuración de datos diarios de campo y ganaderos.
*   La generación automatizada de informes de compliance oficiales (Cuaderno de Campo Digital y Libro de Registro Ganadero) bajo la normativa CUE/SIEX 2026.
*   El control financiero (ERP básico) y analíticas de costes y sostenibilidad (ODS).
*   La integración con dispositivos IoT (sensores, microchips, maquinaria) y modelos de Inteligencia Artificial predictiva.

### 1.3 Definiciones, Acrónimos y Abreviaturas
*   **SIGPAC:** Sistema de Información Geográfica de Parcelas Agrícolas.
*   **REGA:** Registro General de Explotaciones Ganaderas.
*   **DIB:** Documento de Identificación Bovina.
*   **SIEX:** Sistema de Información de Explotaciones Agrícolas y Ganaderas y de la Producción Agraria.
*   **RLS (Row Level Security):** Seguridad a nivel de fila en base de datos.
*   **BaaS (Backend as a Service):** Backend como servicio (Supabase).
*   **Tenant:** Explotación o cliente aislado lógicamente dentro de la plataforma.

---

## 2. DESCRIPCIÓN GENERAL DEL SISTEMA

### 2.1 Perspectiva del Producto
AGROAPP se concibe como una solución integral que conecta la gestión de campo con las oficinas y las administraciones públicas:
1.  **Frontend Responsivo (SPA/SSR):** Diseñado con un UX denso pero eficiente y limpio para uso en escritorio, tablets y smartphones.
2.  **App Móvil Offline:** Permite registrar actividades directamente en el campo sin conexión a internet y sincronizarlas de forma diferida.
3.  **Backend Serverless (Supabase):** Gestión de base de datos PostgreSQL, autenticación de usuarios y almacenamiento de archivos adjuntos.

```mermaid
graph TD
    A[App Móvil Offline - SQLite Local] -->|Sincronización API REST| B(Supabase API Gateway)
    C[Frontend SPA/SSR - Web] -->|Consumo API REST| B
    B --> D[(Supabase - PostgreSQL DB)]
    B --> E[Supabase Auth]
    B --> F[Supabase Storage]
    B --> G[APIs Gubernamentales: SIGPAC/REGA/SIEX]
    B --> H[Servicios Externos: AEMET / Noticias CCAA]
```

### 2.2 Perfiles de Usuario
La plataforma implementa un acceso jerárquico segregado para asegurar la confidencialidad:
*   **Administrador (Propietario de la Explotación):** Acceso total a datos financieros, empleados, configuración de la explotación, asignación de permisos e informes oficiales.
*   **Editor (Usuarios Autorizados / Trabajadores / Aplicadores):** Capacidad de cargar y editar registros de labores, tratamientos, censo de animales y alimentación. Sin acceso a datos financieros o de administración global.
*   **Lector (Veterinarios Externos / Inspectores / Socios):** Acceso de solo lectura a registros históricos, informes sanitarios y cuaderno de campo.

### 2.3 Restricciones y Dependencias
*   **Regulaciones de Compliance:** La salida de datos del Cuaderno de Campo y del Libro Ganadero debe ajustarse estrictamente a las especificaciones ministeriales y de las comunidades autónomas españolas.
*   **Conectividad:** La aplicación móvil debe disponer de almacenamiento local ligero (p. ej., SQLite o IndexedDB) para no interrumpir el registro de campo debido a la falta de cobertura.

---

## 3. REQUISITOS FUNCIONALES DETALLADOS

### 3.1 Módulo de Explotaciones y Recursos Generales
Permite configurar el entorno básico de la explotación.
*   **Listado de Explotaciones:** Búsqueda, filtrado y alta de explotaciones agrícolas, ganaderas o mixtas.
*   **Datos Generales:** Configuración de datos REGA base, NIF, código de explotación y datos catastrales.
*   **Gestión de Recursos:**
    *   **Empleados:** Fichas del personal con sus roles y habilitaciones (ej. carnet de aplicador de fitosanitarios).
    *   **Edificios e Instalaciones:** Silos, naves ganaderas, almacenes.
    *   **Maquinaria y Vehículos:** Registro de tractores, atomizadores, remolques con fechas de ITV y revisiones.
*   **Catálogos Maestros:** CRUDs de Clientes, Proveedores, Transportistas y Asociaciones Ganaderas/Veterinarias para agilizar y normalizar la entrada de datos.

### 3.2 Módulo de Agricultura (Parcelas y Labores)
*   **Integración SIGPAC:** Gestión de parcelas vinculadas a datos oficiales de SIGPAC mediante la introducción de Provincia, Municipio, Polígono, Recinto y Uso. Almacena superficie cultivable, especie, variedad y régimen de riego (secano/regadío).
*   **Tratamientos Fitosanitarios:** Registro obligatorio de tratamientos para cumplir con el cuaderno de campo.
    *   *Campos requeridos:* Parcela, fecha, producto, número de registro oficial de fitosanitarios, dosis aplicada, superficie tratada, aplicador cualificado y problema fitosanitario a tratar.
*   **Planes de Fertilización y Abonado:** Registro de abonados indicando el producto químico o abono orgánico, dosis y riquezas en Nitrógeno, Fósforo y Potasio (N/P/K).
*   **Actividades Adicionales:** Registro de siembras, cosechas (toneladas/kilos obtenidos), podas, cubiertas vegetales y riegos (metros cúbicos estimados).

### 3.3 Módulo de Ganadería (Censo y Trazabilidad)
*   **Censo Animal:** Registro de animales individuales (especialmente vacuno y equino) o por lotes (porcino y ovino). Filtros por estado, edad y clasificación zootécnica.
*   **Gestión de Crotales:** Administración de stock de crotales solicitados a la Oficina Comarcal Agraria (OCA) pendientes de asignación.
*   **Actividad (Altas y Bajas):** Trazabilidad obligatoria del movimiento de animales.
    *   *Nacimientos y Compras:* Registro de número DIB/crotal, fecha del evento, sexo, raza, crotal de la madre, guía de origen, transportista e importe de compra.
    *   *Muertes y Ventas:* Registro de causa de baja, fecha del evento, peso final, guía de transporte de destino, transportista e importe de venta.
*   **Alimentación:** Control de existencias e ingresos de alimentos (pastos, piensos, forrajes) con proveedor, cantidades e importes.
*   **Sanidad Ganadera y Medicamentos:**
    *   Registro de veterinarios autorizados.
    *   Historial de tratamientos veterinarios y administración de medicamentos, documentando el número de receta, la dosis, la vía de administración, el periodo de supresión/retiro (días de seguridad obligatorios antes del sacrificio/ordeño) y el proveedor del fármaco.
    *   Registro de saneamientos ganaderos oficiales y analíticas.

### 3.4 Módulo de Compliance / Informes Oficiales
El motor de exportación automatizada genera los documentos requeridos ante inspecciones:
*   **Cuaderno de Campo Digital:** Consolidación cronológica de tratamientos fitosanitarios, fertilización, riegos y parcelas SIGPAC bajo el esquema CUE 2026.
*   **Libro de Registro Ganadero:** Reporte estructurado por secciones obligatorias:
    1. Datos generales de la explotación y REGA.
    2. Censo inicial, final y reproductor.
    3. Historial de movimientos (altas, bajas y guías).
    4. Libro de tratamientos veterinarios y recetas.

### 3.5 Módulo ERP Financiero y Administración
*   **Facturación Básica:** Registro y carga de facturas emitidas (ventas de cosechas o ganado) y facturas recibidas (compras de fitosanitarios, pienso, gasoil, etc.).
*   **Gestión de Gastos y Nóminas:** Control de nóminas de empleados y gastos fijos (agua, luz, reparaciones).
*   **Planificación del Trabajo:** Asignación de tareas operativas diarias a los empleados y control de horas de ejecución.

### 3.6 Módulos Premium, IoT e Inteligencia Artificial
*   **IoT y Telemetría:** Conexión con sensores de humedad de suelo, tractores ISOBUS, lectores RFID/NFC para crotales de animales y geolocalización en tiempo real.
*   **Integración AEMET:** Predicción meteorológica local detallada a nivel de parcela para optimizar riegos y tratamientos.
*   **Captura por Voz con IA:** Permite a los operarios en terreno registrar actividades (ej. "He aplicado 2 litros de abono en parcela 4") mediante comandos de voz procesados por un LLM local.
*   **Modelos Predictivos:**
    *   Predicción de riesgos sanitarios en el ganado.
    *   Optimización de riego y cálculo de necesidades de fertilización agrícola.
    *   Alertas de márgenes financieros basadas en precios históricos de lonjas y subastas locales.

---

## 4. REQUISITOS NO FUNCIONALES (NFR)

### 4.1 Seguridad y Aislamiento Multi-tenant
*   **Aislamiento de Datos:** Cada tenant debe estar aislado lógicamente. Ningún usuario de un tenant podrá realizar consultas o escrituras sobre datos pertenecientes a otro tenant. Esto se implementará obligatoriamente a nivel de base de datos a través de políticas **Row Level Security (RLS)** de Postgres.
*   **Autenticación y Autorización:** Implementado con Supabase Auth utilizando tokens JWT. Las llamadas a la API deben incluir el Bearer Token que contiene el `user_id` del usuario autenticado.

### 4.2 Fiabilidad, Disponibilidad y Rendimiento
*   **Disponibilidad:** 99.9% de uptime garantizado por la infraestructura cloud de Supabase.
*   **Modo Offline Móvil:** Los datos ingresados sin cobertura deben guardarse localmente en la base de datos de la app y sincronizarse de manera segura una vez se restablezca la conexión, aplicando resolución de conflictos automáticos basada en marcas de tiempo (`updated_at`).

### 4.3 Privacidad de Datos y RGPD
*   Garantizar el cumplimiento del RGPD en España en la gestión de datos personales de empleados y propietarios de explotaciones. Encriptación en reposo y en tránsito (HTTPS / SSL).

---

## 5. ARQUITECTURA TÉCNICA Y BASE DE DATOS

### 5.1 Especificación de la Infraestructura BaaS (Supabase)
*   **Project ID:** `clozlsswwytenzmniqjr`
*   **Anon Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3psc3N3d3l0ZW56bW5pcWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTc3OTUsImV4cCI6MjA5ODEzMzc5NX0.loybVMacLyqmIcogfbVXYxeulzkzs0ukZ9I0E1uWd_c`
*   **Servicio de Autenticación:** Supabase Auth (JWT).
*   **Base de Datos:** Postgres con extensión `uuid-ossp` habilitada.

### 5.2 Esquema de Base de Datos Relacional (DDL SQL)
A continuación se presenta la propuesta inicial de DDL de base de datos con políticas de seguridad RLS:

```sql
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES (Vinculada a Auth.Users)
CREATE TABLE perfiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    rol TEXT CHECK (rol IN ('admin', 'editor', 'lector')) DEFAULT 'lector',
    tenant_id UUID NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE EXPLOTACIONES
CREATE TABLE explotaciones (
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
CREATE TABLE parcelas (
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
CREATE TABLE animales (
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
CREATE TABLE movimientos (
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
CREATE TABLE tratamientos_fitosanitarios (
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
CREATE TABLE tratamientos_veterinarios (
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
CREATE TABLE facturas (
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

-- -------------------------------------------------------------
-- ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) E IMPLEMENTACIÓN
-- -------------------------------------------------------------

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
```

---

### 5.3 UX/UI y Sistema de Diseño (Basado en Mockups de Referencia)
La interfaz web de la aplicación se construirá utilizando hojas de estilo CSS nativas y adaptadas a los tokens de diseño identificados en la maqueta `/home/charogerboles/Documentos/@ 0000 CARLOS/@ 0020 AGROAPP/MOCKUP/styles.css`:

#### Variables CSS Base (Design Tokens)
```css
:root {
    --color-agri: #27AE60;    /* Verde Agricultura */
    --color-gana: #D35400;    /* Naranja Ganadería */
    --color-admin: #2C3E50;   /* Azul Admin/Finanzas */
    --color-bg: #F4F6F7;      /* Fondo general */
    --color-text: #34495E;    /* Color del texto */
    --color-border: #BDC3C7;  /* Bordes */
    --color-white: #FFFFFF;
    --color-danger: #C0392B;
    --color-warning: #F1C40F;
    --color-success: #2ECC71;
    --radius: 8px;
    --shadow: 0 2px 5px rgba(0,0,0,0.05);
}
```

#### Reglas de Estilo del Layout e Interacción
*   **Estructura de Tres Niveles:** 
    *   **Nivel 1 (Sidebar):** Ancho fijo de `260px` y color de fondo `var(--color-admin)`. Los elementos de navegación activos se destacan aplicando un borde izquierdo de `3px` usando `var(--color-agri)` o `var(--color-gana)` según corresponda al módulo.
    *   **Nivel 2 (Layout General):** Fondo en `var(--color-bg)` con contenedor principal fluido (`max-width: 1400px`).
    *   **Nivel 3 (Tabs/Secciones de Contenido):** Módulos agrupados de forma dinámica y cargados con animaciones suaves de transición `@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`.
*   **Elementos Gráficos Especializados:**
    *   *Sensores IoT:* Indicadores circulares de estado con clases `.sensor-circle.safe` (verde success) y `.sensor-circle.alert` (rojo danger).
    *   *Ganadería:* Visualización simplificada tipo cuadrícula utilizando la clase `.animal-card`, la cual resalta con un borde naranja `var(--color-gana)` y sombra leve al pasar el cursor (hover).
    *   *Formularios Densos:* Utilización estructurada de filas `.form-row` y grupos `.form-group` para optimizar el ingreso veloz de datos fitosanitarios y de censo.

---

## 6. PLAN DE TRABAJO, ESTIMACIÓN Y PROYECCIÓN OPERATIVA

### 6.1 Roadmap de Desarrollo MVP (6 meses)
El desarrollo del MVP de AGROAPP requiere un esfuerzo conjunto estimado en **1.660 Horas Hombre (HH)**.

```mermaid
gantt
    title Roadmap de AGROAPP - MVP (6 Meses)
    dateFormat  X
    axisFormat %m
    
    section Definición & UI
    Levantamiento de procesos & Backlog       :active, p1, 0, 2
    UX/UI Prototipos navegables               :active, p2, 0, 2
    
    section Arquitectura
    Entorno Supabase & Modelo de Datos        :active, p3, 0, 2
    
    section Desarrollo Core
    Core Plataforma Web (Login, Perfiles)    :p4, 1, 4
    Módulo Agricultura (SIGPAC/Tratamientos) :p5, 2, 5
    Módulo Ganadería (Censo/Movimientos)     :p6, 2, 5
    
    section Reportes & QA
    Compliance (Cuaderno de Campo/Libro REGA) :p7, 3, 6
    QA & Pruebas Piloto (UAT)                 :p8, 3, 6
    Comercialización & Despliegue Azure       :p9, 4, 6
```

### 6.2 Planificación de Carga y Hitos Mensuales
*   **Hito 1 (Mes 2):** Prototipos aprobados, base de datos Supabase configurada y esquema de autenticación JWT funcionando. (Esfuerzo acumulado: ~250 HH).
*   **Hito 2 (Mes 4):** Core web operativo y catálogos de explotaciones listos. (Esfuerzo acumulado: ~1.100 HH).
*   **Hito 3 (Mes 6):** Cierre de módulos de Agricultura y Ganadería, informes oficiales de exportación funcionando y validación UAT completada. (Esfuerzo total: 1.660 HH).

### 6.3 Proyección Financiera a 3 Años
*   **Coste Inicial del MVP:** Calculado a una tarifa promedio de 18,75 €/HH para desarrollo directo, las 1.660 HH del MVP representan un coste total de **31.125,00 €**.
*   **Presupuesto y Escalamiento Operativo (Plan de 3 años):**
    *   **Coste total de desarrollo (Año 1):** **94.143,75 €** (incluyendo iteraciones sobre el MVP y lanzamiento comercial).
    *   **Pico de financiación requerido:** **263.627,97 €** en el mes 12.
    *   **Coste Operativo Total a 3 años:** **765.694,02 €** (cubre desarrollo continuado, equipo de soporte, campañas de marketing, servidores y servicios en la nube de Supabase/Azure).
    *   **Rentabilidad (Break-even):** Prevista para el **Mes 24**.
    *   **Ingresos acumulados a 3 años:** **695.935,14 €** con una proyección de **751 clientes activos** y un ARR (Ingreso Recurrente Anualizado) final de **811.210,42 €**.
