# Evidencia del agente (hito S2)

Diez ejecuciones reales de punta a punta, grabadas el **2026-11-05**.

| Archivo | Qué contiene |
| --- | --- |
| [`runs.jsonl`](./runs.jsonl) | Una línea por ejecución: petición, id, estado, herramientas, reintentos, tiempos y las llamadas observadas al modelo y a la IPS. |
| [`summary.json`](./summary.json) | Resumen: 10 de 10 auditadas, 10 de 10 exitosas, herramientas usadas y reintentos registrados. |
| [`tooling/`](./tooling) | Los scripts que las generan y cómo repetirlas. |

## Qué se ejecutó

- El **backend real** ([`waylo.ai-backend`](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai-backend)), el **modelo real**
  (Reto) y la **API real de Confianza IPS**, con un paciente de prueba vinculado. Solo herramientas de lectura: no se aparta,
  cancela ni mueve ninguna cita.
- Cuatro herramientas distintas (`get_patient_profile`, `list_appointment_catalog`, `find_earliest_availability`,
  `list_my_appointments`) y seis endpoints de la IPS (`/patients/me`, `/services`, `/doctors`, `/sites`, `/availability`,
  `/appointments`).
- La fuente de verdad de cada ejecución es la tabla `agent_executions` del backend. El script la lee al final y marca la
  evidencia como incompleta si falta algo.

## Fallos inyectados

Para demostrar la recuperación, el script provoca **dos fallos transitorios a propósito**: en la ejecución 4 el modelo responde
503 una vez y en la 7 lo hace la IPS. El reintento y la recuperación son del backend real, no del script.

`retry_count` cuenta solo los reintentos al modelo. El reintento a la IPS (ejecución 7) se ve en las llamadas observadas
(`ips_calls`), no en esa tabla.

## Privacidad

Los archivos no contienen cuerpos de peticiones, cabeceras, claves, tokens ni datos del paciente de prueba. De cada llamada
solo se guardan método, ruta (con los números sustituidos), estado y tiempo.

## Cómo repetirlas

Requiere el backend clonado junto a este repositorio (`../waylo.ai-backend`), con su `.env`, las migraciones aplicadas y
al menos un vínculo activo con Confianza; y `RETO_KEY` en el `.env.local` de este repositorio.

```bash
node docs/evidence/tooling/run-evidence.mjs
```

El script arranca el backend con dos observadores (uno delante del modelo y otro dentro del proceso para la IPS), ejecuta las diez solicitudes y reescribe estos archivos.
