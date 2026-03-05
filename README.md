# 🚀 SalesFlow CRM — Guía de Instalación

## ¿Qué es esto?
Un sistema CRM completo con gestión de clientes, pipeline de ventas, envío de WhatsApp y Email.

---

## ✅ OPCIÓN A: Subir a Vercel (Recomendado — GRATIS)

### Paso 1: Crear cuenta en GitHub
1. Ve a https://github.com y crea una cuenta gratuita

### Paso 2: Subir el proyecto
1. En GitHub, haz clic en **"New repository"**
2. Ponle nombre: `salesflow-crm`
3. Haz clic en **"uploading an existing file"**
4. Arrastra **TODA la carpeta salesflow** y sube los archivos
5. Haz clic en **"Commit changes"**

### Paso 3: Publicar en Vercel
1. Ve a https://vercel.com y crea una cuenta (puedes usar tu cuenta de GitHub)
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio `salesflow-crm`
4. Vercel detecta automáticamente que es Vite → haz clic en **"Deploy"**
5. En ~2 minutos tendrás tu URL: `salesflow-crm.vercel.app`

---

## ✅ OPCIÓN B: Usar localmente en tu computadora

### Requisitos
- Node.js 18+ (descargar en https://nodejs.org)

### Pasos
```bash
# 1. Entrar a la carpeta del proyecto
cd salesflow

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run dev

# 4. Abrir en el navegador: http://localhost:5173
```

---

## 📦 Estructura del proyecto
```
salesflow/
├── src/
│   ├── App.jsx        ← Toda la aplicación
│   ├── main.jsx       ← Punto de entrada
│   └── index.css      ← Estilos globales
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

---

## 💾 Datos
Los datos de clientes se guardan automáticamente en el navegador (localStorage).
Cada usuario que abra la app tendrá sus propios datos guardados en su dispositivo.

---

## 📞 Soporte
¿Necesitas ayuda? Puedes volver a Claude y preguntar cualquier duda.
