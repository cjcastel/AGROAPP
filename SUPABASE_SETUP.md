# Guía de Integración y Configuración de Supabase - AGROAPP

Esta guía describe cómo implementar y configurar el backend en **Supabase** para dar soporte a la aplicación **AGROAPP** en base a las especificaciones técnicas definidas.

---

## 1. Conexión del Proyecto

El frontend de AGROAPP está configurado con las siguientes credenciales (definidas en tu archivo `.env`):
- **Project ID / URL**: `https://clozlsswwytenzmniqjr.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 2. Despliegue del Esquema de Datos (DDL)

El archivo relacional DDL completo está disponible en el workspace:
📂 [supabase_schema.sql](file:///home/charogerboles/Documentos/@%200000%20CARLOS/@%200020%20AGROAPP/supabase_schema.sql)

### Instrucciones para desplegar en Supabase:
1. Ve al panel de control de tu proyecto en [Supabase](https://supabase.com).
2. Haz clic en el módulo **SQL Editor** en el menú lateral izquierdo.
3. Crea una nueva consulta ("New Query").
4. Copia el contenido del archivo `supabase_schema.sql` y pégalo en el editor.
5. Haz clic en **Run** para ejecutar la consulta.

Esto creará automáticamente las 8 tablas de la aplicación (`perfiles`, `explotaciones`, `parcelas`, `animales`, `movimientos`, `tratamientos_fitosanitarios`, `tratamientos_veterinarios`, `facturas`), habilitará la extensión de IDs únicos `uuid-ossp`, creará la función multi-tenant `get_user_tenant_id()`, y habilitará las directivas de seguridad **RLS**.

---

## 3. Seguridad Multi-Tenant y RLS (Row Level Security)

Para garantizar un aislamiento completo de los datos entre diferentes clientes (explotaciones):
- Se ha activado la política **Row Level Security (RLS)** en todas las tablas.
- La función de seguridad `get_user_tenant_id()` se ejecuta en el contexto del usuario logueado en la sesión (`auth.uid()`), buscando su perfil en `public.perfiles` y recuperando su identificador de organización (`tenant_id`).
- Todas las consultas y escrituras del frontend se filtran automáticamente en base al tenant activo de dicho perfil.

---

## 4. Registro de Usuarios y Gestión de Sesiones

### Crear un Usuario en Supabase:
1. Ve a **Authentication** -> **Users** en Supabase.
2. Haz clic en **Add User** -> **Create User**.
3. Ingresa un correo electrónico (por ejemplo: `demo@agroapp.es`) y una contraseña.

### Vincular el perfil de usuario al Tenant:
Una vez que el usuario se ha registrado en `auth.users`, debes crear su perfil correspondiente en la tabla `public.perfiles` para asignarle un rol y un `tenant_id` inicial:

```sql
INSERT INTO public.perfiles (user_id, nombre, rol, tenant_id)
VALUES (
  'ID_DEL_USUARIO_DE_AUTH.USERS', -- Copiar del panel de autenticación
  'Juan Agricultor', 
  'admin', 
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8' -- UUID de tu tenant u organización
);
```

---

## 5. Modos de Operación en el Frontend

La aplicación permite conmutar dinámicamente entre dos modos en la pantalla de acceso (Login):
1. **Modo Demo Local**: Se ejecuta en memoria del navegador utilizando mocks de datos precargados de parcelas, animales, tratamientos e IoT. No requiere credenciales reales ni conexión a internet.
2. **Supabase Auth**: Autentica usuarios contra tu base de datos Supabase utilizando `signInWithPassword()` y lee/escribe datos de manera persistente aplicando las restricciones del tenant autenticado.
