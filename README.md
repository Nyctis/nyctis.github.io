# Nyctis site

Static site for Beetle by Nyctis. English only.

```bash
python3 build.py                                  # writes docs/
python3 -m http.server 8123 --directory docs      # preview
```

Pages are in `src/en`, one file per page. The first line of a page is
`<!-- title | description -->`. Animated diagrams are defined in `src/assets/scenes.js`
and played by `src/assets/site.js`. Shared chrome and navigation are in `build.py`.

Fonts in `src/assets/fonts` are subsets of IBM Plex under the SIL Open Font License.
The logo in `src/assets/logo` is the original artwork and is not redrawn.
Screenshots in `src/assets/shots` come from Beetle Desktop, with seller addresses masked.

GitHub Pages serves `docs/` from `main`. All links are relative.
