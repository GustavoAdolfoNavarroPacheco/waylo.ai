# Imágenes del repositorio

| Archivo | Uso |
| --- | --- |
| `banner-light.png`, `banner-dark.png` | Banner del README (2400 × 800). Se elige según el tema de GitHub. |
| `social-preview.png` | Imagen al compartir el enlace (1280 × 640). **Se sube a mano** en *Settings → General → Social preview*. |
| `demo.gif` | Fragmento del video de demostración: la IPS falla y el agente se recupera. |
| `screenshots/` | Capturas de la web real, en claro y oscuro. |
| `banner/banner.html` | Fuente del banner y de la imagen social. |

## Regenerar el banner y la imagen social

`banner/banner.html` usa los tokens, las fuentes y la mascota de la web. Se parametriza por la URL:

```text
banner.html?theme=light&variant=banner   # 2400 x 800
banner.html?theme=dark&variant=banner
banner.html?theme=light&variant=social   # 1280 x 640
```

Ábrelo en un navegador con esa ventana (por ejemplo con `puppeteer-core` o las herramientas de desarrollo) y captura el
elemento `#stage` a su tamaño real. Las fuentes se cargan de Google Fonts, así que hace falta conexión.

## Regenerar las capturas

Con la web corriendo en `http://localhost:3000` (`npm run build && npm start`), captura `/`, `/chat` y las secciones
`#home-steps` y `#home-faq` en 1440 × 900 (factor de escala 1,5), con el esquema de color claro y oscuro, y en 390 × 844
(factor 2) para móvil. Espera unos segundos tras cargar: la portada tiene animaciones de entrada.
