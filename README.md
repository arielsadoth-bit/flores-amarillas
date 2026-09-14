# Tus flores amarillas 🌻

Una galaxia interactiva de girasoles, ramos de rosas amarillas, estrellas blancas y frases de cariño alrededor de un anillo amarillo brillante. Se abre directamente sin cuentas ni instalación. Arrastra para girar la escena, usa la rueda para acercarte y toca una flor para abrir una dedicatoria sobre un campo de girasoles. El botón «Para ti» permite abrirla también con teclado. Incluye pausa y una melodía instrumental original opcional.

La composición y la tarjeta están inspiradas en la referencia de JCode: https://www.tiktok.com/@jcode.1/video/7619394911527308551. El código y las dedicatorias son propios; se conserva la página sin título grande ni personaje central.

## Desarrollo

Requiere Node.js 22.13 o posterior.

```sh
npm ci
npm run dev
```

## Publicación estática

```sh
npm run build:pages
```

Publicar el contenido de `dist/`. Las rutas son relativas y funcionan bajo una subcarpeta de GitHub Pages. No se necesita un servidor de aplicaciones, base de datos ni claves. La configuración de Sites también publica este mismo resultado estático.

`npm run build` conserva la exportación Vinext del proyecto. `npm run build:pages` genera la versión portable usada para publicación.

## Edición

- Frases, dedicatorias y animación: `app/galaxy.tsx`.
- Música y tarjeta de dedicatoria: `app/page.tsx`.
- Colores y distribución: `app/globals.css` y `app/page.tsx`.
- Imágenes: `public/sunflower.png`, `public/yellow-bouquet.png` y `public/sunflower-field-sunset.png`.
- La música comienza únicamente al pulsar Música, para cumplir las políticas de reproducción de los navegadores móviles.

## Recursos

Girasol generado con ImageGen, con transparencia real. Prompt: One realistic front-facing golden sunflower, irregular yellow petals, dark seed disk, short green stem with two small green leaves; centered square composition, tight margins, genuine transparent background, no text, extra objects, or outside shadow.

Ramo de rosas y campo de girasoles generados con la herramienta integrada ImageGen, una llamada por recurso. Los prompts completos se conservan en `asset-prompts.json`.

Fuentes locales Coming Soon (Apache 2.0, `public/ComingSoon-LICENSE.txt`) y Kalam (SIL Open Font License). La melodía de caja musical es original; no es la grabación de los videos de referencia. No se obtuvo su código original.
