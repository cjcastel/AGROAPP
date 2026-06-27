# Guía de Pruebas y Generación de Credenciales - AGROAPP

Este documento resume los pasos para ejecutar la aplicación de forma local, crear credenciales de acceso y conectarla con la base de datos Supabase en base a la configuración y documentación generada.

---

## 1. Servidor de Desarrollo Local

El frontend de AGROAPP (React + Vite) está activo localmente en tu sistema. Puedes abrirlo e interactuar con el mockup/MVP en:

🔗 **[http://localhost:5173/](http://localhost:5173/)**

---

## 2. Creación de Credenciales en Supabase (Modo Autenticación)

Para iniciar sesión en modo **Supabase Auth** y probar las consultas y escrituras reales en la base de datos, debes registrar las credenciales siguiendo estos dos pasos en la consola web de Supabase:

### Paso A: Registrar el usuario (Authentication)
1. Ve al panel de control de [Supabase](https://supabase.com) y entra en tu proyecto (`clozlsswwytenzmniqjr`).
2. Entra en el menú lateral izquierdo: **Authentication** (icono de candado) ➔ **Users**.
3. Haz clic en **Add user** ➔ **Create user**.
4. Rellena el **Email** y la **Password** del usuario:
   * *Ejemplo simulado:* `B-12345678@agroapp.es` (para emular el NIF en el campo de usuario).
5. **Deja marcada** la opción de confirmación automática (*Auto-confirm user*) para habilitarlo inmediatamente.
6. Haz clic en **Create user** y copia el **User ID (UUID)** generado para este nuevo usuario de la lista.

### Paso B: Asociar el usuario a un Tenant (SQL Editor)
Dado que todas las consultas y escrituras de AGROAPP aplican políticas RLS por organización (`tenant_id`), debes asociar el nuevo usuario registrado con una fila en tu tabla de perfiles en el esquema público:
1. Ve a **SQL Editor** en el panel lateral de Supabase.
2. Crea una consulta en blanco y ejecuta el siguiente bloque SQL:

```sql
INSERT INTO public.perfiles (user_id, nombre, rol, tenant_id)
VALUES (
  'AQUÍ_PEGA_EL_USER_ID_UUID_DE_SUPABASE', -- Reemplazar por tu ID de usuario
  'Carlos Administrador',                 -- Nombre para mostrar en cabecera
  'admin',                                 -- Rol: 'admin', 'editor' o 'lector'
  'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8'   -- Tenant ID de ejemplo
);
```
3. Haz clic en **Run**.

Una vez realizado, podrás volver a [http://localhost:5173/](http://localhost:5173/), seleccionar la pestaña **Supabase Auth** e ingresar el email y contraseña creados para validar el funcionamiento.

---

## 3. Modos de Conexión del Mockup

La pantalla de login del frontend te permite conmutar entre:
*   **Modo Demo Local:** Utiliza datos de mock cargados en memoria. No realiza peticiones de red y te permite navegar y operar de forma inmediata haciendo clic en *Iniciar Sesión*.
*   **Supabase Auth:** Realiza peticiones reales contra la API de Supabase, validando la sesión mediante token JWT y aplicando seguridad RLS sobre tus tablas PostgreSQL.

---

## 4. Archivos de Soporte Generados en el Workspace

*   📄 **[srs_agroapp.md](file:///home/charogerboles/Documentos/@%200000%20CARLOS/@%200020%20AGROAPP/srs_agroapp.md)**: Especificación de requisitos completa, roadmap temporal y proyecciones.
*   📄 **[supabase_schema.sql](file:///home/charogerboles/Documentos/@%200000%20CARLOS/@%200020%20AGROAPP/supabase_schema.sql)**: Código DDL SQL limpio de tablas, relaciones y políticas RLS para Supabase.
*   📄 **[SUPABASE_SETUP.md](file:///home/charogerboles/Documentos/@%200000%20CARLOS/@%200020%20AGROAPP/SUPABASE_SETUP.md)**: Guía detallada para la integración del backend Supabase.
