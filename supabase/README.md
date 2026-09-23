# Supabase

1. Ejecuta `schema.sql` en SQL Editor.
2. Ejecuta `seed.sql`.
3. Regístrate en DataQuest.
4. Promueve tu usuario a admin:

```sql
update public.profiles set role='admin' where username='tu-usuario';
```

El frontend usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
