# Hito S2: herramientas reales y trazabilidad

Waylo usa el backend privado `waylo.ai-backend` como relay server-side hacia
Grok/Reto. Cuando la persona tiene un vínculo IPS activo, el frontend envía el
`sujeto externo` al relay; el navegador nunca recibe las claves del proveedor ni
el token de Confianza.

## Herramientas demostrables

El backend expone al agente las herramientas reales del adaptador ConfianzaIPS,
entre ellas:

- `list_appointment_catalog`: servicios, médicos y sedes institucionales.
- `find_earliest_availability`: primeros cupos obtenidos de la agenda real.
- `list_my_appointments`: citas del paciente vinculado.

También existen perfil, disponibilidad por médico y fecha, historia clínica,
constancias y operaciones de cita. Crear, cancelar y reprogramar requieren
confirmación explícita y firmada.

## Errores y reintentos

El relay reintenta fallos transitorios de Grok/Reto y Confianza con backoff
acotado. Los errores permanentes de autorización no se reintentan
indefinidamente. El agente recibe los errores normalizados y puede continuar el
ciclo de herramientas o explicar que la IPS no está disponible.

## Registro de ejecuciones

Cada llamada a `POST /internal/chat/completion` devuelve un `execution_id`. El
backend guarda metadatos sanitizados (estado, tools, reintentos, duración y código
de error) en `agent_executions`; no guarda prompts, respuestas, argumentos,
tokens ni claves. La lectura interna protegida es:

```bash
curl -H "X-Waylo-Internal-Key: $WAYLO_INTERNAL_KEY" \
  "http://localhost:3001/internal/chat/executions?limit=10"
```

El ejecutable pertenece al repositorio separado
[`waylo.ai-backend`](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai-backend):
`scripts/record-s2-executions.mjs`. Corre `npm run dev` en una terminal desde la
raíz de ese checkout. En otra terminal, también desde la raíz del backend, carga
su `.env` y ejecuta el alias `s2:evidence`:

```bash
set -a
. ./.env
set +a

S2_INTERNAL_KEY="$WAYLO_INTERNAL_KEY" \
S2_EXTERNAL_SUBJECT="ID_DE_LA_SESION_WAYLO_VINCULADA" \
npm run s2:evidence
```

El backend escucha en `localhost:3001` por defecto. El sujeto debe ser la sesión
Waylo con un vínculo IPS activo; la base del backend debe tener sus migraciones
aplicadas y `CONFIANZA_BASE_URL` debe apuntar a la instancia real de ConfianzaIPS.
El JSONL se guarda en
`waylo.ai-backend/docs/evidence/s2-executions.jsonl`, dentro del checkout del
backend. El script valida que las diez solicitudes tengan registro auditado y
estado exitoso, que haya herramientas registradas y que aparezcan
`list_appointment_catalog`, `find_earliest_availability` y
`list_my_appointments`. Conserva el JSONL aunque falle esta validación y termina
con código distinto de cero para que la evidencia incompleta sea detectable.

El runner llama directamente al endpoint privado del backend. Para mostrar el
flujo visible de la persona, demuestra el chat desde la interfaz Waylo en el
video. Los mocks sirven para pruebas de regresión, no como evidencia de llamadas
reales a la IPS.

## Guion del video de dos minutos

1. Problema en una frase: “Waylo ayuda a una persona vinculada a consultar su IPS
   y encontrar una cita sin inventar disponibilidad”.
2. Mostrar el chat ejecutando catálogo, primeros cupos y citas del paciente.
3. Mostrar un 503 o error transitorio de Reto y el reintento recuperado; el campo
   `retry_count` registra esos reintentos. Los reintentos internos de Confianza no
   se suman actualmente a ese contador.
4. Abrir la consulta interna de ejecuciones y enseñar diez `execution_id` con
   tools y reintentos.
5. Cerrar con el resultado concreto y recordar que las escrituras exigen
   confirmación.
