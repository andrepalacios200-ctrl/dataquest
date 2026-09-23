# DataQuest

Plataforma educativa gamificada para aprender Ciencia de Datos, Ingeniería de Datos y Análisis de Datos.

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Progreso local

La versión actual guarda en `localStorage` del navegador:

- XP acumulado
- Lecciones completadas
- Racha diaria
- Intentos y aciertos de quizzes
- Quizzes ya reclamados

El progreso es por navegador/dispositivo. Todavía no existe backend ni sincronización entre dispositivos.

## Despliegue en Vercel

Conecta el repositorio de GitHub a Vercel y usa:

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

No hacen falta variables de entorno para esta versión.
