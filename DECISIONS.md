# Decisiones técnicas — TicketScan

## Arquitectura
- Monorepo Turborepo con apps/mobile, apps/admin, apps/api, packages/*
- App móvil: Next.js 15 output:'export' + Capacitor (no SSR)
- Panel admin: Next.js 15 completo (no Supabase Studio)
- Backend: API Routes en apps/api

## Base de datos
- ORM: Drizzle (PostgreSQL, compatible Supabase)
- Esquema: tickets, productos, ticket_items, categorias, normalizacion_log, ai_providers, app_config

## IA proveedores (agnóstico)
- Admin CRUD proveedores en ai_providers (Gemini, OpenAI, Anthropic)
- API keys encriptadas con pgcrypto, nunca expuestas al frontend
- Backend lee proveedor activo + fallback de DB
- Enrutamiento: Vercel AI SDK con Provider Registry

## Normalización
- Orden: reglas → fuzzy match → IA
- Auditoría en normalizacion_log con flujo de aprobación

## Supabase
- Auth (email + Google), Storage (RLS por user_id)
- PostgreSQL con pgcrypto

## Docker
- NO por defecto. Dev local: pnpm dev + Supabase cloud.
- Deploy: Vercel from source. APK: Capacitor Docker opcional.

## Implementación completada
1. ✅ Monorepo + schema (Drizzle)
2. ✅ Admin auth + proveedores IA (CRUD + test conexión)
3. ✅ Backend API Routes (procesamiento de tickets con IA)
4. ✅ Mobile app (auth + importar imagen + lista tickets)
5. ✅ Mobile análisis (gastos por mes, gráficos, PDF)
6. ✅ Admin monitorización y normalización
7. ✅ Capacitor configurado (build exitoso)

## Próximos pasos
- Generar APK de prueba con Capacitor
- Configurar CI/CD para builds automáticos
- Añadir tests unitarios e de integración
- Optimizar rendimiento y tamaño de build
