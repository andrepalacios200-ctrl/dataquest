# DataQuest v3 — plataforma multiusuario

DataQuest es una plataforma gamificada para aprender Ciencia de Datos, Ingeniería de Datos y Análisis de Datos. Esta versión añade autenticación, progreso sincronizado, XP persistente, rachas, quizzes, ranking y panel de administración.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth + PostgreSQL + Row Level Security + RPCs

## 1. Crear el backend Supabase
1. Crea un proyecto en https://supabase.com/.
2. Entra en **SQL Editor**.
3. Ejecuta primero `supabase/schema.sql`.
4. Ejecuta después `supabase/seed.sql`.
5. Ve a **Project Settings → API** y copia:
   - Project URL
   - publishable key
6. Crea `.env.local` a partir de `.env.example`.

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_PUBLISHABLE_KEY
```

## 2. Crear el primer usuario admin
Regístrate desde `/login`.
Después, en Supabase SQL Editor ejecuta:

```sql
update public.profiles
set role='admin'
where username='tu-usuario';
```

El panel aparecerá en `/admin`.

## 3. Desarrollo local

```bash
npm install
npm run dev
```

## 4. Producción en Vercel
En Vercel añade estas variables de entorno para Production, Preview y Development:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Después haz redeploy.

## Funcionalidades
- 3 rutas y 9 niveles sin bloqueos.
- 72 lecciones completas, cada una con objetivo, explicación, ejemplo, reto y quiz.
- Autenticación email/password.
- Perfil por usuario.
- XP y racha almacenados en PostgreSQL.
- Progreso de lecciones sincronizado entre dispositivos.
- Un quiz por lección con bonus de XP.
- Ranking global por XP.
- Panel admin para crear, editar, publicar y eliminar lecciones.
- RLS para que cada estudiante solo pueda modificar su propio progreso.
- Fallback demo con localStorage si no hay variables de Supabase configuradas.

## Estructura de contenido
`src/data/content.ts` contiene la estructura pedagógica de rutas/niveles y `src/data/lessonContent.ts` contiene el contenido detallado de las 72 lecciones. `supabase/seed.sql` permite llevar esas 72 lecciones al backend para que el administrador pueda gestionarlas.
