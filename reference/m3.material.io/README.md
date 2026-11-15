# m3.material.io

Design facts measured from a browser-rendered mirror of m3.material.io (`tools/site-mirror`): 391 pages, 4761 recorded responses, 1147 stylesheets.

| File | Contents |
|---|---|
| [pages.json](pages.json) | every page: URL, status, title, rendered-DOM size and SHA-256, screenshot name |
| [design.json](design.json) | custom properties, colors, font families and sizes, line heights, radii, shadows, spacing, breakpoints, transitions, ranked by use |

The mirror itself (pages, screenshots, assets) is not stored here: it is the site's content. Reproduce it:

```sh
bun tools/site-mirror/mirror.ts --site https://m3.material.io --out <dir>
bun tools/site-mirror/extract.ts --mirror <dir> --to reference/m3.material.io
```
