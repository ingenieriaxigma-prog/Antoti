# 🚀 Guía: Desplegar Oti en Vercel (5 minutos)

## 📋 Prerrequisitos

- [ ] Cuenta de GitHub (gratis): https://github.com/signup
- [ ] Cuenta de Vercel (gratis): https://vercel.com/signup

---

## 📥 PASO 1: Exportar código de Figma Make

### Opción A: Exportar desde Figma Make UI

1. En Figma Make, busca el botón **"Export"** o **"Download"** 
2. Descarga todo el código como `.zip`
3. Descomprime el archivo en tu computadora

### Opción B: Copiar archivos manualmente

Si no hay opción de exportar, copia todos estos archivos a una carpeta local:

**Archivos principales:**
```
/
├── App.tsx
├── package.json (IMPORTANTE - lo crearemos)
├── index.html (IMPORTANTE - lo crearemos)
├── vite.config.ts (IMPORTANTE - lo crearemos)
├── tsconfig.json
├── /components/
│   ├── (todos los archivos .tsx)
├── /features/
│   ├── (todas las carpetas)
├── /contexts/
│   ├── (todos los archivos)
├── /services/
│   ├── (todos los archivos)
├── /utils/
│   ├── (todos los archivos)
├── /hooks/
│   ├── (todos los archivos)
├── /styles/
│   └── globals.css
└── /imports/
    └── (SVGs y assets)
```

---

## 📦 PASO 2: Crear archivos de configuración

Necesitas crear estos archivos en la raíz del proyecto:

### 1. `package.json`

```json
{
  "name": "oti-finanzas",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "motion": "^10.18.0",
    "lucide-react": "^0.460.0",
    "recharts": "^2.15.0",
    "sonner": "^2.0.3",
    "react-hook-form": "^7.55.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.6.3",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

### 2. `vite.config.ts`

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],  // Sin plugins - esbuild nativo
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: {
      'figma:asset': '/assets'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['motion'],
          charts: ['recharts']
        }
      }
    }
  }
});
```

### 3. `index.html`

```html
<!DOCTYPE html>
<html lang="es" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  
  <!-- 🔥 META TAGS ESTÁTICAS PARA REDES SOCIALES -->
  <title>Oti - Tu Asistente Financiero Personal con IA</title>
  <meta name="description" content="Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada.">
  
  <!-- Idioma -->
  <meta name="language" content="Spanish">
  <meta http-equiv="content-language" content="es">
  <meta name="google" content="notranslate">
  
  <!-- Open Graph (Facebook, WhatsApp, LinkedIn) -->
  <meta property="og:title" content="Oti - Tu Asistente Financiero Personal con IA">
  <meta property="og:description" content="Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.finanzapersonal.com">
  <meta property="og:site_name" content="Oti">
  <meta property="og:locale" content="es_ES">
  <meta property="og:image" content="https://www.finanzapersonal.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Oti - Asistente Financiero con IA">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Oti - Tu Asistente Financiero Personal con IA">
  <meta name="twitter:description" content="Controla tus finanzas con inteligencia artificial: registra gastos, crea presupuestos, analiza tus hábitos y recibe asesoría financiera personalizada.">
  <meta name="twitter:image" content="https://www.finanzapersonal.com/og-image.png">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="#10b981">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/logo.png">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### 4. `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 5. `.gitignore`

```
node_modules
dist
.env
.env.local
.DS_Store
*.log
.vercel
```

---

## 🐙 PASO 3: Subir a GitHub

### 1. Crea un nuevo repositorio en GitHub

1. Ve a: https://github.com/new
2. Nombre: `oti-finanzas`
3. Descripción: `Oti - Asistente Financiero Personal con IA`
4. **Público** o **Privado** (tú eliges)
5. Click en **"Create repository"**

### 2. Sube tu código

Abre la terminal en la carpeta de tu proyecto y ejecuta:

```bash
# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "🚀 Initial commit - Oti App"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/oti-finanzas.git

# Subir el código
git push -u origin main
```

**💡 Si te pide usuario/contraseña:**
- Usa tu username de GitHub
- Para la contraseña, genera un **Personal Access Token** aquí:
  https://github.com/settings/tokens

---

## ☁️ PASO 4: Desplegar en Vercel

### 1. Conecta GitHub con Vercel

1. Ve a: https://vercel.com/new
2. Click en **"Import Git Repository"**
3. Autoriza a Vercel para acceder a GitHub
4. Busca tu repositorio `oti-finanzas`
5. Click en **"Import"**

### 2. Configurar el proyecto

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 3. Variables de entorno

Agrega las siguientes variables de entorno en Vercel:

```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_OPENAI_API_KEY=tu_openai_api_key
```

### 4. Deploy!

Click en **"Deploy"** y espera 2-3 minutos.

---

## 🖼️ PASO 5: Subir la imagen Open Graph

### 1. Genera la imagen

Usa el componente `OgImageGenerator` que creamos en tu app para descargar la imagen.

### 2. Sube la imagen

**Opción A:** Sube a ImgBB (https://imgbb.com/) y copia la URL

**Opción B:** Coloca la imagen en `/public/og-image.png` en tu repositorio y actualiza el `index.html`:

```html
<meta property="og:image" content="https://tu-dominio.vercel.app/og-image.png">
```

---

## ✅ PASO 6: Verificar

### 1. Prueba la app

Abre la URL que Vercel te dio (ejemplo: `https://oti-finanzas.vercel.app`)

### 2. Verifica meta tags

Ve a: https://developers.facebook.com/tools/debug/

Pega tu URL de Vercel y click en **"Depurar"**

Deberías ver:
- ✅ og:title: "Oti - Tu Asistente Financiero Personal con IA"
- ✅ og:description: "Controla tus finanzas con inteligencia artificial..."
- ✅ og:image: Tu imagen de 1200x630px

### 3. Prueba en WhatsApp

Comparte el link en WhatsApp y verifica que aparezca el preview correcto.

---

## 🌐 PASO 7: Conectar tu dominio personalizado

Si quieres seguir usando `www.finanzapersonal.com`:

1. En Vercel, ve a tu proyecto > **Settings** > **Domains**
2. Agrega `www.finanzapersonal.com`
3. Vercel te dará instrucciones para actualizar los DNS en tu proveedor de dominio

---

## 🎯 Resumen

| Paso | Tiempo | Dificultad |
|------|--------|------------|
| 1. Exportar código | 5 min | ⭐ Fácil |
| 2. Crear archivos config | 5 min | ⭐ Fácil |
| 3. Subir a GitHub | 3 min | ⭐⭐ Media |
| 4. Desplegar en Vercel | 2 min | ⭐ Fácil |
| 5. Subir imagen OG | 2 min | ⭐ Fácil |
| 6. Verificar | 3 min | ⭐ Fácil |
| **TOTAL** | **~20 min** | ⭐⭐ Media |

---

## 🆘 ¿Necesitas ayuda?

- **Error en Git:** Asegúrate de tener Git instalado (https://git-scm.com/downloads)
- **Error en build:** Verifica que todos los archivos estén en la carpeta correcta
- **Meta tags no aparecen:** Asegúrate de que el `index.html` esté en la raíz del proyecto

---

## ✨ ¡Listo!

Después de estos pasos, tu app estará en Vercel con meta tags perfectas para WhatsApp/Facebook. 🎉

**Próximo paso:** Comparte el link de Vercel en WhatsApp y verás el preview correcto con el logo de Oti.