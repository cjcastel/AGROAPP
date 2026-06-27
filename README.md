# AGROAPP - Sistema de Gestión Agropecuaria de Alta Precisión

AGROAPP es una plataforma integral SaaS y multi-tenant diseñada para digitalizar, optimizar y controlar explotaciones agrícolas y ganaderas de precisión. Este repositorio contiene el mockup interactivo del frontend y la especificación de requisitos técnicos (SRS).

---

## 🚀 Despliegue de la Aplicación (Para Mostrar a Clientes)

Para que tus clientes puedan interactuar con el mockup de forma online sin necesidad de configurar nada localmente, te recomendamos las siguientes opciones de hosting gratuitas y automáticas.

### Opción A: Despliegue en Vercel (Recomendado)
Vercel compila y publica aplicaciones React/Vite en segundos, ofreciendo un enlace público inmediato y actualizándose automáticamente cada vez que hagas `git push` a tu repositorio de GitHub.
1. Inicia sesión en [Vercel](https://vercel.com/) (puedes acceder directamente con tu cuenta de GitHub).
2. Haz clic en **"Add New"** ➔ **"Project"**.
3. Importa tu repositorio `AGROAPP`.
4. En la configuración del proyecto:
   * **Framework Preset:** Selecciona `Vite`.
   * **Root Directory:** Haz clic en *Edit* y selecciona la carpeta `frontend`.
5. Haz clic en **"Deploy"**. En 1 minuto tendrás una URL pública tipo `https://agroapp-xxxx.vercel.app/`.

### Opción B: Despliegue en Netlify
Netlify es otra excelente plataforma de hosting gratuito con integración directa con GitHub.
1. Entra en [Netlify](https://www.netlify.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add new site"** ➔ **"Import an existing project"**.
3. Selecciona **GitHub** y autoriza el repositorio `AGROAPP`.
4. En las configuraciones de build:
   * **Base directory:** `frontend`
   * **Build command:** `npm run build`
   * **Publish directory:** `frontend/dist`
5. Haz clic en **"Deploy site"** para obtener tu enlace público.

### Opción C: Despliegue en GitHub Pages
La aplicación ha sido refactorizada para utilizar **rutas relativas** en todas sus peticiones de datos (`aemet_data.json`) e imágenes de plagas, haciéndola compatible con GitHub Pages bajo subdirectorios.
1. Ve a la pestaña **Settings** de tu repositorio `cjcastel/AGROAPP` en GitHub.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección *Build and deployment*:
   * **Source:** Selecciona *GitHub Actions*.
4. Esto te permitirá utilizar un workflow automatizado de compilación (GitHub Action) para publicar el build de la carpeta `frontend/dist` directamente en `https://cjcastel.github.io/AGROAPP/`.

---

## 💻 Ejecución en Entorno Local

Si deseas levantar el panel de control localmente en tu ordenador de desarrollo:

### 1. Clonar el repositorio
```bash
git clone https://github.com/cjcastel/AGROAPP.git
cd AGROAPP
```

### 2. Instalar dependencias del Frontend
```bash
cd frontend
npm install
```

### 3. Levantar servidor de desarrollo (Vite)
```bash
npm run dev
```
Abre en tu navegador la dirección indicada en la terminal (usualmente [http://localhost:5173/](http://localhost:5173/)).

---

## 🛠 Arquitectura Técnica y Módulos de IA

El frontend está construido sobre **React 19 + TypeScript** y cuenta con tres módulos piloto de Inteligencia Artificial totalmente integrados en la interfaz de usuario:

1. **Diagnóstico IA (Clasificación de Plagas):** Escáner visual simulado que analiza patologías foliares (ej: Repilo del Olivar) recomendando medidas biológicas e indicando tratamientos fitosanitarios homologados por el MAPA. Permite el volcado automático del diagnóstico al cuaderno de explotación digital (CUE).
2. **Consultor SIEX IA (Chatbot):** Chatbot asistente legal integrado como burbuja flotante para resolver preguntas relativas a plazos del cuaderno digital, regulaciones del SIEX o límites de abonados nitrogenados en zonas vulnerables.
3. **Recomendación Inteligente de Riego (AEMET + IoT):** Asesor de riego que lee telemetría de suelo local y pronósticos del servidor simulado de AEMET para emitir sugerencias dinámicas (ej: desactivación del riego por lluvias pronosticadas o ráfagas de viento fuertes que provoquen pérdidas por deriva).

---

## 📄 Documentación Técnica Incluida

*   **[srs_agroapp.md](./srs_agroapp.md):** Documento formal de especificación de requisitos del software, estimaciones de horas, costes y proyecciones de negocio.
*   **[supabase_schema.sql](./supabase_schema.sql):** Estructura DDL de tablas y políticas RLS para Supabase.
*   **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md):** Manual detallado de integración de base de datos Supabase en producción.
