# Import review: tools/site-mirror

Moved from the Aphrody monorepo (3a4463101), extended in `open` (c3d48c6b2), checked against decision D25.

| Check | Finding | Outcome |
|---|---|---|
| Purification | no host, path, account or identity in the code; robots.txt read for the `*` group | private-data gate clean |
| Purge | nothing specific to one deployment | kept whole |
| Naming (D23) | functional name | kept |
