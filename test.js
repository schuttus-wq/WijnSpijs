// WijnSpijs — integriteitstests voor de dataset en koppelmotor.
// Draai met: npm test
const assert = require('assert');
const E = require('./engine.js');

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('✓', name); }
  catch (e) { failures++; console.error('✗', name, '-', e.message); }
}

check('dataset geladen', () => {
  assert(E.WINES.length >= 20, 'verwacht >= 20 wijnen, kreeg ' + E.WINES.length);
  assert(E.DISHES.length >= 30, 'verwacht >= 30 gerechten, kreeg ' + E.DISHES.length);
});

check('alle id\'s zijn uniek', () => {
  const wIds = new Set(E.WINES.map((w) => w.id));
  const dIds = new Set(E.DISHES.map((d) => d.id));
  assert.strictEqual(wIds.size, E.WINES.length, 'dubbele wijn-id');
  assert.strictEqual(dIds.size, E.DISHES.length, 'dubbele gerecht-id');
});

check('elke wijn heeft minstens één passend gerecht', () => {
  const orphans = E.WINES.filter((w) => E.dishesForWine(w.id).length === 0);
  assert.strictEqual(orphans.length, 0, 'orphan wijnen: ' + orphans.map((w) => w.name));
});

check('elk gerecht heeft minstens één passende wijn', () => {
  const orphans = E.DISHES.filter((d) => E.winesForDish(d.id).length === 0);
  assert.strictEqual(orphans.length, 0, 'orphan gerechten: ' + orphans.map((d) => d.name));
});

check('elk gerecht heeft een geldig recept', () => {
  for (const d of E.DISHES) {
    const r = d.recipe;
    assert(r, d.name + ' mist een recept');
    if (r.type === 'eigen') {
      assert(r.ingredienten && r.ingredienten.length, d.name + ': eigen recept zonder ingrediënten');
      assert(r.stappen && r.stappen.length, d.name + ': eigen recept zonder stappen');
    } else if (r.type === 'link') {
      assert(/^https?:\/\//.test(r.url), d.name + ': ongeldige recept-url');
      assert(r.bron, d.name + ': linkrecept zonder bron');
    } else {
      throw new Error(d.name + ': onbekend recepttype ' + r.type);
    }
  }
});

check('zoeken op tekst geeft zinnige resultaten', () => {
  assert(E.winesForText('pittig').wines.length > 0, 'geen wijn bij "pittig"');
  assert(E.searchDishes('italiaans').length > 0, 'geen gerecht bij "italiaans"');
  assert(E.winesForText('riesling').directWine, 'directe wijn "riesling" niet herkend');
});

if (failures) {
  console.error('\n' + failures + ' test(s) gefaald');
  process.exit(1);
}
console.log('\nAlle tests geslaagd ✅');
