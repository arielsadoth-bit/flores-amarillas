# Flores Amarillas 🌻

Una galaxia interactiva de girasoles, partículas doradas y frases de cariño, recreada a partir de la referencia visual de AlexDev. Se abre directamente sin cuentas ni instalación. Admite ratón y pantalla táctil; incluye pausa y una melodía instrumental original opcional.

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

- Frases y animación: `app/page.tsx`.
- Colores, título y distribución: `app/globals.css` y `app/page.tsx`.
- Imagen: `public/sunflower.png`.
- La música comienza únicamente al pulsar Música, para cumplir las políticas de reproducción de los navegadores móviles.

## Recursos

Girasol generado con ImageGen, con transparencia real. Prompt: One realistic front-facing golden sunflower, irregular yellow petals, dark seed disk, short green stem with two small green leaves; centered square composition, tight margins, genuine transparent background, no text, extra objects, or outside shadow.

Fuente Kalam de Google Fonts (licencia SIL Open Font License). La melodía de caja musical es original; no es la grabación de Floricienta del video. La referencia fue usada para recrear el estilo visual, no se obtuvo su código original.
