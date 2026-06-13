// WijnSpijs — koppelmotor.
// Bevat de logica om wijnen aan gerechten te koppelen en vrije tekst
// (gerecht, ingrediënt of keuken) te vertalen naar pairing tags.

(function (global) {
  const data = (typeof module !== 'undefined' && module.exports)
    ? require('./data.js')
    : { WINES: global.WINES, DISHES: global.DISHES, TAG_KEYWORDS: global.TAG_KEYWORDS };

  const { WINES, DISHES, TAG_KEYWORDS } = data;

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // accenten weg
      .trim();
  }

  // Score tussen één wijn en één gerecht: aantal gedeelde pairing tags.
  function pairScore(wine, dish) {
    const dishTags = new Set(dish.tags);
    let score = 0;
    for (const t of wine.pairsWith) {
      if (dishTags.has(t)) score += 1;
    }
    return score;
  }

  // Gegeven een wijn-id: gerechten gesorteerd op match (alleen score > 0).
  function dishesForWine(wineId) {
    const wine = WINES.find((w) => w.id === wineId);
    if (!wine) return [];
    return DISHES
      .map((dish) => ({ dish, score: pairScore(wine, dish) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Gegeven een gerecht-id: wijnen gesorteerd op match.
  function winesForDish(dishId) {
    const dish = DISHES.find((d) => d.id === dishId);
    if (!dish) return [];
    return WINES
      .map((wine) => ({ wine, score: pairScore(wine, dish) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Vertaal vrije tekst naar pairing tags op basis van trefwoorden.
  function tagsFromText(text) {
    const q = normalize(text);
    if (!q) return [];
    const found = new Set();
    for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
      for (const kw of keywords) {
        if (q.includes(normalize(kw))) {
          found.add(tag);
          break;
        }
      }
    }
    return [...found];
  }

  // Zoek gerechten op vrije tekst: matcht op naam, ingrediënten, keuken en tags.
  function searchDishes(text) {
    const q = normalize(text);
    if (!q) return [];
    const tags = new Set(tagsFromText(text));

    return DISHES
      .map((dish) => {
        let score = 0;
        if (normalize(dish.name).includes(q)) score += 5;
        if (normalize(dish.keuken).includes(q)) score += 3;
        for (const ing of dish.ingredienten) {
          if (normalize(ing).includes(q) || q.includes(normalize(ing))) score += 2;
        }
        for (const t of dish.tags) {
          if (tags.has(t)) score += 1;
        }
        return { dish, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Zoek wijnen op basis van vrije tekst (gerecht/ingrediënt/keuken):
  // 1) vind passende gerechten, 2) tel daaruit de beste wijnen op.
  function winesForText(text) {
    const q = normalize(text);
    if (!q) return { wines: [], dishes: [] };

    // Directe match op wijnnaam/druif? Dan die wijn meteen teruggeven.
    const directWine = WINES.find(
      (w) => normalize(w.name).includes(q) || normalize(w.druif).includes(q)
    );

    const dishHits = searchDishes(text);
    const tags = new Set(tagsFromText(text));

    // Verzamel wijnscores via gevonden gerechten én via directe tags.
    const wineScores = new Map();
    const add = (wine, s) => {
      wineScores.set(wine.id, (wineScores.get(wine.id) || 0) + s);
    };

    for (const { dish, score } of dishHits) {
      for (const { wine, score: ps } of winesForDish(dish.id)) {
        add(wine, ps * Math.max(1, score));
      }
    }
    // Tags die direct uit de tekst komen (bijv. "pittig") ook meewegen.
    for (const wine of WINES) {
      const overlap = wine.pairsWith.filter((t) => tags.has(t)).length;
      if (overlap) add(wine, overlap * 2);
    }
    if (directWine) add(directWine, 100);

    const wines = WINES
      .map((wine) => ({ wine, score: wineScores.get(wine.id) || 0 }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return { wines, dishes: dishHits, directWine: directWine || null };
  }

  const api = {
    normalize,
    pairScore,
    dishesForWine,
    winesForDish,
    tagsFromText,
    searchDishes,
    winesForText,
    WINES,
    DISHES,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.WijnSpijsEngine = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
