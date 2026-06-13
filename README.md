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

Open simpelweg `index.html` in een browser. Of start een lokale server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

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
