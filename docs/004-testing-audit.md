# Auditoría de pruebas del frontend ciudadano

Fecha de corte: 2026-10-29

## Alcance

Se revisaron las rutas App Router, los clientes server-side, la sesión, las
preferencias, la memoria clínica y los límites de lectura de la IPS. La
auditoría se concentró en comportamiento determinista y no persiste ni expone
credenciales reales.

## Cobertura añadida

- Preferencias: validación de idioma/voz, fallback de cookies, etiquetas de
  idioma y selección de voz.
- Seguridad: hash scrypt, salts distintos y rechazo de hashes corruptos.
- Memoria clínica: solo registros activos, límites de serialización y limpieza
  de contenido estructurado.
- Lecturas IPS: sesión obligatoria, propagación del subject server-side,
  `Cache-Control: no-store`, errores tipados y reporte seguro de indisponibilidad.
- Sesiones: cierre de otros dispositivos, protección de la sesión actual,
  validación de UUID, not-found y degradación ante errores de persistencia.

## Evidencia

- `git diff --check`: correcto.
- Los cinco archivos TypeScript nuevos fueron parseados con el compilador
  TypeScript disponible en el workspace: sin errores sintácticos.
- La suite no pudo ejecutarse localmente porque este checkout no tiene
  `node_modules/.bin/vitest` ni `next`.
- La instalación temporal sin modificar `package-lock.json` quedó bloqueada por
  la red restringida del entorno. El lockfile ya está documentado como no apto
  para `npm ci` hasta regenerar sus entradas opcionales de `@emnapi`.

## Riesgos y pendientes

La evidencia actual no incluye cobertura porcentual ni una prueba de navegador
real. La siguiente mejora debe regenerar y validar el lockfile, instalar
`@vitest/coverage-v8` de forma reproducible y publicar umbrales de cobertura
por paquete. La verificación de producción debe comprobar por separado la
sesión, el backend Waylo y la IPS conectada.
