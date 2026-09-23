# DataQuest — Data Learning Platform

Primera versión frontend de una plataforma gamificada estilo Duolingo para aprender Ciencia de Datos, Ingeniería de Datos y Análisis de Datos.

## Stack
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Datos mock en `src/data/content.ts`

## Ejecutar
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Decisiones clave
- Los 3 niveles (Junior, Mid-Senior y Senior) están disponibles desde el inicio.
- No existen candados ni prerequisitos de progreso.
- El progreso, XP, racha, medallas y ranking son mock y están preparados para sustituirse por API/estado persistente.
- La estructura separa datos, componentes y páginas para facilitar una futura conexión con backend.
