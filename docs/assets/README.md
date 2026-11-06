# Repository images

| File | Use |
| --- | --- |
| `banner-light.png`, `banner-dark.png` | The README banner (2400 × 800). It is chosen by the GitHub theme. |
| `social-preview.png` | The image shown when the link is shared (1280 × 640). **Upload it by hand** in *Settings → General → Social preview*. |
| `demo.gif` | An excerpt of the demo video: the IPS fails and the agent recovers. |
| `screenshots/` | Screenshots of the real web app, in light and dark. |
| `banner/banner.html` | The source of the banner and the social image. |

## Regenerate the banner and the social image

`banner/banner.html` uses the web app's tokens, fonts and mascot. It is parametrized through the URL:

```text
banner.html?theme=light&variant=banner   # 2400 x 800
banner.html?theme=dark&variant=banner
banner.html?theme=light&variant=social   # 1280 x 640
```

Open it in a browser at that window size (for example with `puppeteer-core` or the developer tools) and capture the `#stage`
element at its real size. The fonts load from Google Fonts, so a connection is needed.

## Regenerate the screenshots

With the web app running at `http://localhost:3000` (`npm run build && npm start`), capture `/`, `/chat` and the
`#home-steps` section at 1440 × 900 (scale factor 1.5), with the light and dark color schemes and the `Accept-Language: en`
header so the interface is in English, and at 390 × 844 (scale factor 2) for mobile. Wait a few seconds after loading: the
home page has entrance animations.
