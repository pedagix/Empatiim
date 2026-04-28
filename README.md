# Empatiim website

Filstruktur:

```text
empatiim_site/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── data/
    └── content.json
```

## Viktigt

Sidan läser innehåll från `data/content.json` med `fetch()`. Därför ska den köras via en lokal server eller publiceras via exempelvis GitHub Pages. Om du dubbelklickar på `index.html` lokalt kan webbläsaren blockera JSON-filen.

Snabb lokal test:

```bash
cd empatiim_site
python -m http.server 8000
```

Öppna sedan:

```text
http://localhost:8000
```
