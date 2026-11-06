# Cómo contribuir a Waylo.ai

¡Gracias por querer ayudar! Waylo orienta a personas que no se sienten bien, así que cuidamos mucho la claridad, la seguridad
y la privacidad. Esta guía resume cómo trabajar en el repositorio.

> [!IMPORTANT]
> El código es propietario (ver [LICENSE](./LICENSE)). Puedes proponer cambios por pull request; al hacerlo concedes a los
> titulares el derecho a usar, modificar y distribuir tu contribución como parte del proyecto.

## Antes de empezar

1. Busca si ya existe una [incidencia](https://github.com/GustavoAdolfoNavarroPacheco/waylo.ai/issues) sobre lo mismo.
2. Si es un cambio grande, abre primero una incidencia para acordar el enfoque.
3. Lee [`AGENTS.md`](./AGENTS.md): define lo que Waylo **nunca** debe hacer (diagnosticar, recetar, dar dosis) y las
   señales de alarma que cortan el flujo. Cualquier cambio que toque ese comportamiento necesita revisión clínica.

## Preparar el entorno

```bash
nvm use            # Node 24 (ver .nvmrc)
npm install        # instala dependencias y activa el hook de commits
cp .env.example .env.local
npm run db:migrate # crea las tablas en la base de datos
npm run dev        # http://localhost:3000
```

Las variables y su significado están en el [README](./README.md#variables-de-entorno). Nunca subas `.env.local`, claves,
tokens ni datos reales de personas.

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/nombre-corto`, `fix/nombre-corto`, `docs/...`, `chore/...`.
2. Haz cambios pequeños y enfocados. Un pull request, una idea.
3. Antes de subir, comprueba que todo pasa:

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. Abre el pull request contra `main` y completa la plantilla. Si cambia lo que se ve, añade una captura.

## Convención de commits

Cada commit se escribe como `tipo: descripción`, todo en minúsculas, en inglés y sin emojis ni códigos como `:memo:`. Los
tipos válidos son `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` y `revert`; con alcance
opcional: `fix(chat): keep the draft when the reply fails`.

Se comprueba en dos sitios con el mismo script, [`scripts/check-commit-message.mjs`](./scripts/check-commit-message.mjs),
que no necesita dependencias:

- **Hook `commit-msg` (en tu equipo).** Rechaza el commit antes de crearlo. `npm install` lo activa solo (script `prepare`);
  si usas `--ignore-scripts`, actívalo a mano con `git config core.hooksPath .githooks`. Se puede saltar con `--no-verify`,
  por eso existe el siguiente.
- **Check de pull request (en GitHub).** El workflow `Commit messages` revisa los commits de cada pull request. Para que
  bloquee la fusión, marca el check `Conventional commits` como obligatorio en
  *Settings → Branches → Branch protection rules → main*.

Si el check falla, reescribe los mensajes con `git rebase -i` (opción `reword`) y sube con `git push --force-with-lease`.
Los merges que escribe GitHub no se revisan. No añadas líneas `Co-authored-by` de asistentes de IA.

## Estilo y calidad

- **TypeScript estricto** y los componentes existentes antes de crear otros nuevos.
- **Diseño:** usa los tokens de [`src/app/globals.css`](./src/app/globals.css) (monocromo, claro y oscuro). Nada de colores
  sueltos; los niveles de atención se distinguen por peso y contraste, no por color.
- **Textos de cara al usuario:** lenguaje sencillo y breve. Los tres idiomas (`es`, `en`, `pt`) deben tener la misma
  forma; `src/i18n/messages.test.ts` lo comprueba.
- **Accesibilidad:** contraste suficiente, foco visible, respeto de `prefers-reduced-motion`, etiquetas en los controles.
- **Pruebas:** toda lógica nueva lleva pruebas con Vitest. Cualquier cambio en la detección de señales de alarma debe
  añadir casos a `src/lib/red-flags.test.ts`.
- **Privacidad:** no registres el texto de las conversaciones ni datos de salud. Los secretos viven solo en el servidor.

## Documentación

Si tu cambio altera el comportamiento, actualiza el README o el documento correspondiente en [`docs/`](./docs/README.md).

## Conducta

Participar implica aceptar el [Código de Conducta](./CODE_OF_CONDUCT.md). Para vulnerabilidades, **no abras una incidencia
pública**: sigue [SECURITY.md](./SECURITY.md).
