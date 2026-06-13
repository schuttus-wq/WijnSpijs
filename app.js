// WijnSpijs — UI-logica.
(function () {
  'use strict';

  const E = window.WijnSpijsEngine;

  // Mooie labels voor pairing tags.
  const TAG_LABELS = {
    'rood-vlees': 'rood vlees', 'gevogelte': 'gevogelte', 'wild': 'wild',
    'vis-mager': 'magere vis', 'vis-vet': 'vette vis', 'schaaldieren': 'schaal- & schelpdieren',
    'kaas-zacht': 'zachte kaas', 'kaas-pittig': 'pittige kaas', 'pasta': 'pasta',
    'pizza': 'pizza', 'pittig': 'pittig', 'kruidig': 'kruidig', 'romig': 'romig',
    'gegrild': 'gegrild', 'vegetarisch': 'vegetarisch', 'dessert': 'dessert',
    'aperitief': 'aperitief', 'zomers': 'zomers', 'hartig': 'hartig',
    'aziatisch': 'Aziatisch', 'paddenstoelen': 'paddenstoelen', 'gefrituurd': 'gefrituurd',
    'chocolade': 'chocolade',
  };

  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Tabs ----------
  function switchTab(which) {
    const isWine = which === 'wine';
    el('tab-wine').classList.toggle('active', isWine);
    el('tab-food').classList.toggle('active', !isWine);
    el('tab-wine').setAttribute('aria-selected', String(isWine));
    el('tab-food').setAttribute('aria-selected', String(!isWine));
    el('panel-wine').hidden = !isWine;
    el('panel-food').hidden = isWine;
    el('panel-wine').classList.toggle('active', isWine);
    el('panel-food').classList.toggle('active', !isWine);
  }
  el('tab-wine').addEventListener('click', () => switchTab('wine'));
  el('tab-food').addEventListener('click', () => switchTab('food'));

  // ---------- Render helpers ----------
  function tagRow(tags) {
    if (!tags || !tags.length) return '';
    return `<div class="tag-row">${tags
      .map((t) => `<span class="tag">${esc(TAG_LABELS[t] || t)}</span>`)
      .join('')}</div>`;
  }

  function winePill(type) {
    const cls = 'type-' + E.normalize(type).replace(/[^a-z]/g, '');
    return `<span class="wine-pill ${cls}">${esc(type)}</span>`;
  }

  // Een gerecht-kaart met receptknop.
  function dishCard(dish, score) {
    const matchHtml = score
      ? `<span class="match">${score}× match</span>` : '';
    return `
      <div class="card">
        <div class="card-main">
          <p class="card-title">${esc(dish.name)}</p>
          <p class="card-meta">Keuken: ${esc(dish.keuken)} · ${esc(dish.ingredienten.slice(0, 4).join(', '))}</p>
          ${tagRow(dish.tags)}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
          ${matchHtml}
          <button class="btn-recipe" data-recipe="${esc(dish.id)}">Bekijk recept</button>
        </div>
      </div>`;
  }

  // Een wijn-kaart.
  function wineCard(wine, score) {
    const matchHtml = score
      ? `<span class="match">${score} pt</span>` : '';
    return `
      <div class="card">
        <div class="card-main">
          <p class="card-title">${winePill(wine.type)}${esc(wine.name)}</p>
          <p class="card-meta">${esc(wine.druif)} · ${esc(wine.body)}</p>
          <p class="card-desc">${esc(wine.omschrijving)}</p>
        </div>
        ${matchHtml}
      </div>`;
  }

  // ---------- Zoek op wijn ----------
  function initWineSelect() {
    const sel = el('wine-select');
    E.WINES.forEach((w) => {
      const o = document.createElement('option');
      o.value = w.id;
      o.textContent = `${w.name} (${w.type})`;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => renderWineResults(sel.value));

    // Snelkeuze-chips voor populaire wijnen.
    const quick = el('wine-quick');
    ['cabernet-sauvignon', 'pinot-noir', 'chardonnay', 'sauvignon-blanc', 'rose', 'champagne']
      .forEach((id) => {
        const w = E.WINES.find((x) => x.id === id);
        if (!w) return;
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = w.name;
        chip.addEventListener('click', () => {
          sel.value = id;
          renderWineResults(id);
        });
        quick.appendChild(chip);
      });
  }

  function renderWineResults(wineId) {
    const box = el('wine-results');
    if (!wineId) { box.innerHTML = ''; return; }
    const wine = E.WINES.find((w) => w.id === wineId);
    const matches = E.dishesForWine(wineId);

    let html = `<div class="results-heading">Bij <span class="accent">${esc(wine.name)}</span> passen deze gerechten:</div>`;
    if (!matches.length) {
      html += '<p class="empty">Geen bijpassende gerechten gevonden.</p>';
    } else {
      html += matches.map((m) => dishCard(m.dish, m.score)).join('');
    }
    box.innerHTML = html;
  }

  // ---------- Zoek op gerecht/ingrediënt/keuken ----------
  function initFoodSearch() {
    el('food-form').addEventListener('submit', (e) => {
      e.preventDefault();
      renderFoodResults(el('food-input').value);
    });

    const quick = el('food-quick');
    ['Pittig', 'Zalm', 'Italiaans', 'Biefstuk', 'Vegetarisch', 'Kaas', 'Aziatisch', 'Dessert']
      .forEach((term) => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = term;
        chip.addEventListener('click', () => {
          el('food-input').value = term;
          renderFoodResults(term);
        });
        quick.appendChild(chip);
      });
  }

  function renderFoodResults(text) {
    const box = el('food-results');
    const q = (text || '').trim();
    if (!q) { box.innerHTML = ''; return; }

    const { wines, dishes, directWine } = E.winesForText(q);

    let html = '';

    // Als direct een wijn werd herkend: toon ook de gerechten daarbij.
    if (directWine) {
      html += `<div class="results-heading">Wijn herkend: <span class="accent">${esc(directWine.name)}</span> — bijpassende gerechten:</div>`;
      const dForWine = E.dishesForWine(directWine.id);
      html += dForWine.length
        ? dForWine.map((m) => dishCard(m.dish, m.score)).join('')
        : '<p class="empty">Geen gerechten gevonden.</p>';
    }

    // Aanbevolen wijnen.
    html += `<div class="results-heading">Aanbevolen <span class="accent">wijnen</span> bij "${esc(q)}":</div>`;
    html += wines.length
      ? wines.slice(0, 5).map((m) => wineCard(m.wine, m.score)).join('')
      : '<p class="empty">Geen passende wijn gevonden. Probeer een ander gerecht, ingrediënt of keuken.</p>';

    // Gevonden gerechten (met recept).
    if (dishes.length && !directWine) {
      html += `<div class="results-heading">Gevonden <span class="accent">gerechten</span> (met recept):</div>`;
      html += dishes.slice(0, 6).map((m) => dishCard(m.dish, 0)).join('');
    }

    box.innerHTML = html;
  }

  // ---------- Recept-dialoog ----------
  const dialog = el('recipe-dialog');

  function bestWineLine(dish) {
    const wines = E.winesForDish(dish.id);
    if (!wines.length) return '';
    const names = wines.slice(0, 2).map((w) => w.wine.name).join(' of ');
    return `<div class="recipe-pairing">🍷 <strong>Wijntip:</strong> serveer met ${esc(names)}.</div>`;
  }

  function openRecipe(dishId) {
    const dish = E.DISHES.find((d) => d.id === dishId);
    if (!dish) return;
    const r = dish.recipe;
    let html = `<h2>${esc(dish.name)}</h2>`;

    if (r.type === 'eigen') {
      html += `<p class="recipe-meta">${esc(dish.keuken)} · ${esc(r.porties)} porties · ${esc(r.tijd)}</p>`;
      html += '<div class="recipe-section-title">Ingrediënten</div><ul>';
      html += r.ingredienten.map((i) => `<li>${esc(i)}</li>`).join('');
      html += '</ul>';
      html += '<div class="recipe-section-title">Bereiding</div><ol>';
      html += r.stappen.map((s) => `<li>${esc(s)}</li>`).join('');
      html += '</ol>';
    } else {
      html += `<p class="recipe-meta">${esc(dish.keuken)}</p>`;
      html += `<p>Het volledige recept vind je op <strong>${esc(r.bron)}</strong>:</p>`;
      html += `<a class="recipe-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open recept bij ${esc(r.bron)} ↗</a>`;
    }

    html += bestWineLine(dish);
    el('recipe-content').innerHTML = html;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  el('recipe-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    // Klik op de backdrop sluit de dialoog.
    if (e.target === dialog) dialog.close();
  });

  // Event delegation voor alle recept-knoppen.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-recipe]');
    if (btn) openRecipe(btn.getAttribute('data-recipe'));
  });

  // ---------- Init ----------
  initWineSelect();
  initFoodSearch();
})();
