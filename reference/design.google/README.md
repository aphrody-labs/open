# design.google

Design facts measured from a browser-rendered mirror of design.google (`tools/site-mirror`): 304 pages, 8170 recorded responses, 2200 stylesheets.

| File | Contents |
|---|---|
| [pages.json](pages.json) | every page: URL, status, title, rendered-DOM size and SHA-256, screenshot name |
| [design.json](design.json) | custom properties, colors, font families and sizes, line heights, radii, shadows, spacing, breakpoints, transitions, ranked by use |

The mirror itself (pages, screenshots, assets) is not stored here: it is the site's content. Reproduce it:

```sh
bun tools/site-mirror/mirror.ts --site https://design.google --out <dir>
bun tools/site-mirror/extract.ts --mirror <dir> --to reference/design.google
```
