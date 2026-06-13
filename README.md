# 🍷 WijnSpijs

Een app die **wijn-spijs combinaties** geeft. Zoek op een wijn en vind
bijpassende gerechten (inclusief recept), óf voer een gerecht, ingrediënt of
soort keuken in en vind de bijpassende wijn.

## Functies

- **Zoek op wijn** → krijg een lijst met bijpassende gerechten, gesorteerd op
  hoe goed ze matchen. Bij elk gerecht zit een **recept**: een eigen recept
  (ingrediënten + bereiding) of een link naar een betrouwbare receptensite.
- **Zoek op gerecht / ingrediënt / keuken** → typ bijvoorbeeld `zalm`,
  `pittig`, `Italiaans` of `biefstuk` en krijg de best passende wijnen, plus de
  gevonden gerechten met recept.
- **Wijntip bij elk recept**: in het receptvenster staat meteen welke wijn er
  het beste bij past.
- Werkt volledig **offline** in de browser — geen build, geen server, geen
  externe afhankelijkheden.

## Hoe het werkt

Wijnen en gerechten delen zogeheten *pairing tags* (bijv. `rood-vlees`,
`schaaldieren`, `pittig`, `romig`). De koppelmotor (`engine.js`) berekent de
overlap tussen die tags om de beste combinaties te vinden. Vrije tekst wordt
via trefwoorden (`TAG_KEYWORDS` in `data.js`) vertaald naar pairing tags, zodat
je ook op ingrediënt of keuken kunt zoeken.

## Gebruiken

**Direct openen:** dubbelklik op `index.html` — de app werkt volledig in de browser.

**Lokaal serveren** (aanbevolen, bv. voor mobiel testen):

```bash
npm start          # start op http://localhost:8000 (via 'serve')
# of zonder npm:
python3 -m http.server 8000
```

**Live online:** bij elke push naar `main` zet de GitHub Actions-workflow
(`.github/workflows/deploy.yml`) de app automatisch op **GitHub Pages**. Zorg
dat in de repo onder *Settings → Pages* de bron op **GitHub Actions** staat; de
workflow probeert dit ook zelf in te schakelen. De live-URL verschijnt na de
deploy in de Actions-run.

## Testen

```bash
npm test
```

Dit controleert de dataset-integriteit: unieke id's, geen wijn of gerecht
zonder match, en geldige recepten.

## Bestanden

| Bestand       | Inhoud                                                    |
| ------------- | --------------------------------------------------------- |
| `index.html`  | De pagina en structuur                                     |
| `styles.css`  | Vormgeving                                                 |
| `data.js`     | Dataset: wijnen, gerechten, recepten en trefwoorden       |
| `engine.js`   | Koppelmotor (matchen van wijn ↔ spijs, zoeken op tekst)   |
| `app.js`      | UI-logica (tabs, zoeken, recept-venster)                  |

## Dataset uitbreiden

Voeg een wijn toe in `WINES` (met `pairsWith` tags) of een gerecht in `DISHES`
(met `tags` en een `recipe`). Een recept is óf `type: 'eigen'` met
`ingredienten` en `stappen`, óf `type: 'link'` met `url` en `bron`. De rest
werkt automatisch.

---

Geniet met mate. 18+
