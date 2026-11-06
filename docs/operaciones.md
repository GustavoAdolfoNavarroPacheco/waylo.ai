# Operación

## Integración continua

El workflow [`frontend-ci.yml`](../.github/workflows/frontend-ci.yml) se ejecuta en cada push y pull request hacia `main`.
Instala las dependencias y corre `npm run lint`, `npm test` y `npm run build` con Node.js 24, igual que la imagen de Docker.

Por ahora usa `npm install --package-lock=false` porque al lockfile le faltan entradas opcionales de `@emnapi` y `npm ci` no
puede instalarlo. Cuando el lockfile se regenere y se valide, hay que reemplazar ese paso por `npm ci` (lo mismo en el
[`Dockerfile`](../Dockerfile)).

Otros workflows:

| Workflow | Para qué |
| --- | --- |
| [`commit-messages.yml`](../.github/workflows/commit-messages.yml) | Revisa que los commits de cada pull request sigan la [convención](../CONTRIBUTING.md#convención-de-commits). |
| [`codeql.yml`](../.github/workflows/codeql.yml) | Análisis estático de seguridad de JavaScript y TypeScript. |

[`dependabot.yml`](../.github/dependabot.yml) abre pull requests semanales con las actualizaciones de dependencias.

## Votos de me gusta / no me gusta en Discord

Cada vez que alguien marca un mensaje de la IA como útil o no útil, `/api/feedback` envía un aviso a un canal de Discord.
Solo viaja el voto, el id del mensaje, el idioma y si la persona tiene cuenta; nunca el texto de la conversación. Para
activarlo, crea un webhook en el canal (Configuración del servidor → Integraciones → Webhooks) y define
`DISCORD_FEEDBACK_WEBHOOK_URL` en `.env.local` y en el entorno de despliegue. Sin la variable, el botón funciona igual y no se
envía nada. La URL del webhook es un secreto: quien la tenga puede escribir en el canal.

## Errores del servidor en Discord

Con `DISCORD_ERRORS_WEBHOOK_URL` definida, el servidor avisa en un canal (por ejemplo `#errores`) de lo que falla en
producción: el gateway de IA, la voz, la integración IPS, la base de datos y cualquier error que nadie atrape (gancho
`onRequestError` de Next.js, en `src/instrumentation.ts`). Cada aviso lleva el sitio, el error, su código y las primeras
líneas de la pila. Se ocultan contraseñas en URLs, tokens, claves largas y correos; nunca se envía el texto de la
conversación. El mismo error del mismo sitio se manda una vez por minuto (con el conteo de repeticiones omitidas) y nunca
más de 20 mensajes por minuto. En desarrollo local no se envía nada. Para reportar un error a mano en una ruta:
`reportError("api/mi-ruta", error)` de `@/lib/error-report`.
