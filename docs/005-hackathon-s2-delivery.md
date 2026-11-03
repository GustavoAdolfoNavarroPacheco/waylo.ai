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

Para producir las diez líneas de evidencia del hito contra servicios conectados,
seguir las instrucciones de
[`waylo.ai-backend`](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai-backend)
y ejecutar `scripts/record-s2-executions.mjs`. Los mocks sirven para pruebas de
regresión, no para afirmar ejecuciones end-to-end.

## Guion del video de dos minutos

1. Problema en una frase: “Waylo ayuda a una persona vinculada a consultar su IPS
   y encontrar una cita sin inventar disponibilidad”.
2. Mostrar el chat ejecutando catálogo, primeros cupos y citas del paciente.
3. Mostrar un 503 o error transitorio y el reintento recuperado.
4. Abrir la consulta interna de ejecuciones y enseñar diez `execution_id` con
   tools y reintentos.
5. Cerrar con el resultado concreto y recordar que las escrituras exigen
   confirmación.
