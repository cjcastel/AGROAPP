# Guía Detallada de Despliegue de AGROAPP en Vercel

Esta guía documenta paso a paso el proceso realizado para configurar, publicar y conectar el mockup interactivo de **AGROAPP** en la plataforma de hosting en la nube **Vercel**, enlazando la autenticación real con **Supabase**.

---

## 📋 Resumen del Flujo de Trabajo

El despliegue de una SPA (Single Page Application) compilada con **Vite** que consume variables de entorno requiere sincronizar el código fuente, configurar la raíz del subdirectorio, inyectar claves de API y compilar el código. El proceso se divide en 4 fases principales:

```
[ Fase 1: Configurar Rutas Relativas ] ➔ [ Fase 2: Crear Proyecto en Vercel ]
                                                      │
[ Fase 4: Compilación y Redeploy ]   ◀─ [ Fase 3: Inyectar Claves Supabase ]
```

---

## 🔍 Fase 1: Preparación del Repositorio (Portabilidad)

Para garantizar que el compilado funcione en cualquier servidor web sin importar el dominio o subcarpeta, realizamos los siguientes cambios técnicos:

### 1. Configuración del Path Base en Vite
En el archivo `frontend/vite.config.ts`, añadimos la propiedad `base: './'`. Esto fuerza a Vite a compilar las llamadas de assets usando rutas relativas en lugar de absolutas:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Genera paths relativos (./assets/...) en el index.html
  plugins: [react()],
})
```

### 2. Referencias de Recursos en el Código
Cambiamos todas las llamadas de archivos estáticos (que se encuentran en la carpeta `public/`) para que utilicen rutas relativas en `App.tsx`:
*   Carga de datos del clima: `fetch('./aemet_data.json')`
*   Imágenes del Diagnóstico IA: `setUploadedImage('./olive_leaf_disease.png')` y `setUploadedImage('./wheat_leaf_rust.png')`

---

## 🚀 Fase 2: Creación del Proyecto en Vercel

Dado que el código fuente de la aplicación React está contenido dentro de la subcarpeta `frontend/` y el repositorio contiene archivos de planificación en la raíz, configuramos Vercel para apuntar al subdirectorio correcto:

1.  Inicia sesión en **[Vercel](https://vercel.com/)** utilizando tu cuenta de GitHub.
2.  Haz clic en **"Add New..."** ➔ **"Project"**.
3.  Busca tu repositorio **`AGROAPP`** y haz clic en **"Import"**.
4.  En la pantalla de configuración:
    *   **Root Directory:** Haz clic en **"Edit"**, selecciona la subcarpeta **`frontend`** y presiona **"Continue"**.
    *   Vercel detectará de manera automática que se trata de un proyecto **Vite** y configurará por sí mismo los comandos de compilación y salida:
        *   *Build Command:* `npm run build`
        *   *Output Directory:* `dist`
5.  Haz clic en **"Deploy"**. En este punto, la aplicación se publica con éxito, pero la pestaña de **Supabase Auth** dará error porque aún no tiene las claves de acceso de la base de datos.

---

## 🔑 Fase 3: Conexión de Supabase (Variables de Entorno)

Las variables en Vite (con prefijo `VITE_`) se inyectan en el cliente del navegador durante la compilación en el servidor de Vercel. Si no están configuradas, el SDK de Supabase fallará. Para conectarlo de forma segura:

### Opción A: A través de la Consola Web de Vercel
1.  Ve a tu proyecto en Vercel y haz clic en la pestaña **"Settings"** (Configuración) en la barra superior.
2.  En el menú lateral izquierdo, haz clic en **"Environment Variables"** (o accede directamente mediante la URL [https://vercel.com/cjcastels-projects/agroapp-gz21/settings/environment-variables](https://vercel.com/cjcastels-projects/agroapp-gz21/settings/environment-variables)).
3.  Añade las siguientes variables:
    *   **Clave 1:**
        *   *Name:* `VITE_SUPABASE_URL`
        *   *Value:* *(Tu URL del proyecto de Supabase)*
    *   **Clave 2:**
        *   *Name:* `VITE_SUPABASE_ANON_KEY`
        *   *Value:* *(Tu clave anon pública de Supabase)*
4.  Asegúrate de marcar los entornos **"Production"**, **"Preview"** y **"Development"**.
5.  Haz clic en **"Save"**.

### Opción B: A través de la Terminal (Vercel CLI)
Si prefieres no usar la interfaz web, puedes añadir las variables directamente desde la consola ejecutando los siguientes comandos en la carpeta `frontend/`:
```bash
npx vercel env add VITE_SUPABASE_URL
# Introduce la URL de tu Supabase cuando te lo pida y selecciona todos los entornos.

npx vercel env add VITE_SUPABASE_ANON_KEY
# Introduce tu clave anon y selecciona todos los entornos.
```

---

## 🔄 Fase 4: Compilación y Despliegue Final (Redeploy)

Las variables de entorno añadidas **no se aplican automáticamente a las publicaciones antiguas**. Es obligatorio recompilar la aplicación para incrustar las nuevas credenciales en el archivo bundle generado:

1.  En la barra superior de Vercel, entra en la pestaña **"Deployments"**.
2.  Busca tu último despliegue (la primera fila de la lista) y haz clic en el botón de los **tres puntos (`...`)** situado a la derecha.
3.  Selecciona la opción **"Redeploy"** y confirma en la ventana emergente haciendo clic en el botón azul **"Redeploy"**.
4.  Vercel reconstruirá el código en 30-40 segundos.

---

## ✅ Verificación del Funcionamiento

Una vez completado el redespliegue, abre la URL pública proporcionada por Vercel. Podrás probar ambos accesos:

*   **Modo Demo Local (Por Defecto):** Permite navegar por todo el dashboard, simular el escaneo de plagas y chatear con el Asistente SIEX al instante sin realizar ninguna llamada de red, ideal para demostraciones rápidas.
*   **Supabase Auth:** Te permite introducir las credenciales reales de tus usuarios registrados (ej. `carlos@agrotoledo.es`) y validar el flujo de inicio de sesión real contra tu base de datos PostgreSQL alojada en Supabase.

---

## 🌤️ Integración y Actualización de Clima en Vivo (AEMET)

La sección de **Sensores IoT** de AgroApp calcula recomendaciones de riego inteligentes basándose en variables meteorológicas reales. Para evitar datos obsoletos en el mockup, hemos integrado un actualizador dinámico conectado directamente a las **APIs de la AEMET**.

### 1. El Script de Actualización
El script en `frontend/scripts/update_weather.py` realiza lo siguiente:
*   Se conecta a la API de AEMET usando la clave de API oficial configurada.
*   Obtiene la predicción oficial para **Toledo** (Alcaudete de la Jara - ID: `45005`) y **Cáceres** (Trujillo - ID: `10190`).
*   Limpia y da formato a los campos (lluvia, viento, temperaturas y humedad) estructurándolos exactamente como requiere el front.
*   Actualiza el archivo estático `frontend/public/aemet_data.json`.

### 2. Cómo actualizar los datos meteorológicos antes de desplegar
Cuando quieras actualizar el clima del mockup a las predicciones reales del día actual:
1.  Abre la terminal en la carpeta `/frontend` y ejecuta el comando de Node:
    ```bash
    npm run update-weather
    ```
2.  Agrega el archivo JSON actualizado a tu commit de Git y envíalo a GitHub:
    ```bash
    git add public/aemet_data.json
    git commit -m "chore: actualizar predicción del clima de AEMET en vivo"
    git push
    ```
3.  Vercel detectará el commit, recompilará y servirá el mockup con el pronóstico del tiempo real y actualizado de las explotaciones agrícolas.
