# Política de seguridad

Waylo atiende a personas que describen cómo se sienten, así que la seguridad y la privacidad son parte del producto. Si
encuentras una vulnerabilidad, queremos saberlo y corregirla con calma.

## Cómo reportar una vulnerabilidad

**No abras una incidencia pública.** Usa el reporte privado de GitHub:

1. Ve a la pestaña [**Security**](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai/security) del repositorio.
2. Pulsa **Report a vulnerability**.
3. Describe el problema, los pasos para reproducirlo y su posible impacto.

Si no puedes usar ese canal, escribe a los mantenedores mediante un mensaje directo en GitHub a
[@GustavoAdolfoNavarroPacheco](https://github.com/GustavoAdolfoNavarroPacheco) pidiendo un canal privado; no incluyas los
detalles técnicos en un canal público.

## Qué esperar

- Acusaremos recibo y te avisaremos cuando la hayamos revisado, a la mayor brevedad posible.
- Te mantendremos informado de la corrección y, si lo deseas, te daremos crédito al publicarla.
- Pedimos tiempo razonable para corregir antes de cualquier divulgación pública.

## Qué versiones reciben correcciones

Solo la rama `main` y el despliegue de producción en [waylo-ai.vercel.app](https://waylo-ai.vercel.app). El proyecto aún no
publica versiones etiquetadas.

## Qué nos interesa

Sesiones y autenticación, exposición de claves o tokens, acceso a datos de otra persona, saltos de las señales de alarma
o de los límites clínicos (que Waylo diagnostique o recete), inyección en el modelo que filtre datos, y fallos en la
integración con la IPS.

## Qué no incluir en tu reporte

**Nunca** adjuntes datos reales de pacientes, historias clínicas, documentos de identidad, contraseñas, claves ni tokens
vivos. Usa datos sintéticos o enmascarados.

## Cómo protegemos la información

- Las claves (`WAYLO_BACKEND_KEY`, `RETO_KEY`, webhooks) viven solo en el servidor y nunca llevan el prefijo `NEXT_PUBLIC_`.
- El navegador nunca recibe el token de la IPS: las rutas `/api/ips/*` y `/api/triage` delegan en un backend privado.
- Las señales de alarma se evalúan **antes** del modelo y no consultan datos institucionales.
- Las conversaciones se guardan en el navegador de la persona, no en el servidor; la memoria clínica solo incluye lo que la
  persona confirmó y puede borrarla.
- Los avisos de error que van a Discord ocultan contraseñas, tokens, claves largas y correos, y nunca incluyen el texto de
  la conversación.
- Los archivos `.env*` están en `.gitignore`; solo se versiona `.env.example`.

## Dependencias

Las dependencias se vigilan con Dependabot y el código se analiza con CodeQL (ver `.github/`).
