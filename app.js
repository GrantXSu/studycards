'use strict';

/* ================================================================ utilities */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = () => $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => esc(s).replace(/\n/g, '<br>');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clone = o => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
const LETTERS = 'ABCDEFGHIJ';

function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ICONS = {
  cards: '<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>',
  learn: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
  test: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
  match: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/><path d="M13 7h6M16 4v6M5 17h6"/>',
  write: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  swap: '<path d="M7 7h13l-4-4M17 17H4l4 4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>',
  restart: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
};
const I = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
}

function modal(html, onMount) {
  const w = document.createElement('div');
  w.className = 'modal-wrap';
  w.innerHTML = `<div class="modal">${html}</div>`;
  document.body.append(w);
  const key = e => { if (e.key === 'Escape') close(); };
  const close = () => { w.remove(); document.removeEventListener('keydown', key); };
  document.addEventListener('keydown', key);
  w.addEventListener('mousedown', e => { if (e.target === w) close(); });
  $$('[data-close]', w).forEach(b => (b.onclick = close));
  if (onMount) onMount(w.firstElementChild, close);
  return close;
}

function confirmBox(msg, ok = 'Delete') {
  return new Promise(res => {
    modal(`<h2>Are you sure?</h2><p>${msg}</p><div class="row gap end"><button class="btn" data-close>Cancel</button><button class="btn primary" data-ok>${ok}</button></div>`,
      (m, close) => {
        $('[data-ok]', m).onclick = () => { close(); res(true); };
        $$('[data-close]', m).forEach(b => b.addEventListener('click', () => res(false)));
      });
  });
}

function lightbox(src) {
  const w = document.createElement('div');
  w.className = 'lightbox';
  w.innerHTML = `<img src="${esc(src)}" alt="">`;
  w.onclick = () => w.remove();
  document.body.append(w);
}

function download(name, text, type = 'application/json') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

const readFile = (file, how = 'dataURL') => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = () => rej(r.error);
  how === 'text' ? r.readAsText(file) : r.readAsDataURL(file);
});

const loadImg = src => new Promise((res, rej) => {
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = rej;
  im.src = src;
});

async function fileToImage(file, max = 1400) {
  const url = await readFile(file);
  if (/svg|gif/.test(file.type)) return url;
  const im = await loadImg(url);
  const scale = Math.min(1, max / Math.max(im.width, im.height));
  if (scale === 1 && file.size < 350000) return url;
  const c = document.createElement('canvas');
  c.width = Math.round(im.width * scale);
  c.height = Math.round(im.height * scale);
  const ctx = c.getContext('2d');
  const png = file.type === 'image/png';
  if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.86);
}

function pickImage() {
  return new Promise(res => {
    const inp = $('#imgpick');
    inp.value = '';
    inp.onchange = async () => res(inp.files[0] ? await fileToImage(inp.files[0]) : null);
    inp.click();
  });
}

/* ================================================================ answer checking */

function norm(s) {
  return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/^(the|a|an) /, '');
}

function variants(ans) {
  const a = String(ans || '');
  const v = new Set([norm(a), norm(a.replace(/\([^)]*\)/g, ' '))]);
  for (const part of a.split(/\s*(?:\/|;|\bor\b)\s*/i)) v.add(norm(part.replace(/\([^)]*\)/g, ' ')));
  (a.match(/\(([^)]*)\)/g) || []).forEach(p => v.add(norm(p)));
  v.delete('');
  return [...v];
}

function lev(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

function grade(input, answer) {
  const n = norm(input);
  if (!n) return { ok: false };
  const vs = variants(answer);
  if (vs.includes(n)) return { ok: true };
  for (const v of vs) {
    const tol = v.length <= 4 ? 0 : v.length <= 9 ? 1 : v.length <= 24 ? 2 : 3;
    if (tol && lev(n, v) <= tol) return { ok: true, typo: true };
  }
  return { ok: false };
}

/* ================================================================ storage */

const Store = {
  db: null,
  ls: false,
  async open() {
    try {
      this.db = await new Promise((res, rej) => {
        const r = indexedDB.open('studycards', 1);
        r.onupgradeneeded = () => { for (const s of ['sets', 'progress', 'meta']) r.result.createObjectStore(s, { keyPath: 'id' }); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    } catch (e) {
      console.warn('IndexedDB unavailable, falling back to localStorage', e);
      this.ls = true;
    }
  },
  req(store, mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(store, mode);
      const r = fn(t.objectStore(store));
      t.oncomplete = () => res(r.result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('Storage is full'));
    });
  },
  lsGet(s) { try { return JSON.parse(localStorage.getItem('sc_' + s) || '{}'); } catch { return {}; } },
  lsSet(s, v) { localStorage.setItem('sc_' + s, JSON.stringify(v)); },
  async all(s) { return this.ls ? Object.values(this.lsGet(s)) : this.req(s, 'readonly', o => o.getAll()); },
  async get(s, id) { return this.ls ? this.lsGet(s)[id] : this.req(s, 'readonly', o => o.get(id)); },
  async put(s, v) {
    if (!this.ls) return this.req(s, 'readwrite', o => o.put(v));
    const a = this.lsGet(s); a[v.id] = v; this.lsSet(s, a);
  },
  async del(s, id) {
    if (!this.ls) return this.req(s, 'readwrite', o => o.delete(id));
    const a = this.lsGet(s); delete a[id]; this.lsSet(s, a);
  },
};

const SETS = new Map();
const PROG = new Map();

function prog(id) {
  if (!PROG.has(id)) PROG.set(id, { id, starred: {}, stats: {}, learn: null, match: [], tests: [], settings: {} });
  const p = PROG.get(id);
  p.settings ||= {}; p.starred ||= {}; p.stats ||= {}; p.match ||= []; p.tests ||= [];
  return p;
}
const saveProg = id => Store.put('progress', prog(id)).catch(e => toast('Could not save progress: ' + e.message));
async function saveSet(set) {
  set.updated = Date.now();
  await Store.put('sets', set);
  SETS.set(set.id, set);
}
function record(setId, cardId, ok) {
  const st = prog(setId).stats;
  const s = (st[cardId] ||= { c: 0, w: 0 });
  ok ? s.c++ : s.w++;
  s.t = Date.now();
}

async function seedSets() {
  if (!window.SEED) return;
  const meta = (await Store.get('meta', 'seeded')) || { id: 'seeded', ids: {} };
  for (const id of SEED.retire || []) {
    const cur = SETS.get(id);
    if (cur && !cur.edited) { await Store.del('sets', id); SETS.delete(id); }
  }
  for (const s of SEED.sets) {
    const rev = meta.ids[s.id];
    const cur = SETS.get(s.id);
    if (rev === undefined) {
      if (!cur) await saveSet({ ...clone(s), created: Date.now() });
      meta.ids[s.id] = s.rev;
    } else if (rev < s.rev && cur && !cur.edited) {
      await saveSet({ ...cur, ...clone(s) });
      meta.ids[s.id] = s.rev;
    }
  }
  await Store.put('meta', meta);
}

/* ================================================================ card helpers */

const hasContent = c => (c.term || c.termImg || c.def || c.defImg);
function cardsOf(set, starredOnly) {
  const cards = set.cards.filter(hasContent);
  if (!starredOnly) return cards;
  const st = prog(set.id).starred;
  const f = cards.filter(c => st[c.id]);
  return f.length ? f : cards;
}
const side = (c, w) => (w === 'term' ? { text: c.term, img: c.termImg } : { text: c.def, img: c.defImg });

function sideHTML(s, cls = '') {
  const len = (s.text || '').length;
  const size = len > 220 ? 'xlong' : len > 90 ? 'long' : '';
  return `<div class="sc ${cls} ${size} ${s.img && !s.text ? 'imgonly' : ''}">${s.img ? `<img src="${esc(s.img)}" alt="" draggable="false">` : ''}${s.text ? `<div class="t">${fmt(s.text)}</div>` : ''}</div>`;
}

function orient(card, answerWith) {
  const ans = answerWith === 'both' ? (Math.random() < 0.5 ? 'term' : 'def') : answerWith;
  return { card, ans, prompt: side(card, ans === 'term' ? 'def' : 'term'), answer: side(card, ans) };
}

function choicesFor(q, pool, n = 4) {
  const key = s => (s.text || '').trim().toLowerCase() + '|' + (s.img || '');
  const k0 = key(q.answer);
  const seen = new Set([k0]);
  const out = [q.answer];
  for (const c of shuffle(pool)) {
    if (out.length >= n) break;
    if (c.id === q.card.id) continue;
    const s = side(c, q.ans);
    if (!s.text && !s.img) continue;
    const k = key(s);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return shuffle(out).map(s => ({ s, correct: key(s) === k0 }));
}

function mastery(set, cards = set.cards) {
  const lv = prog(set.id).learn?.lv || {};
  let mastered = 0, learning = 0;
  for (const c of cards) {
    const l = lv[c.id];
    if (l === 2) mastered++;
    else if (l !== undefined) learning++;
  }
  const total = cards.length;
  return { total, mastered, learning, fresh: total - mastered - learning, pct: total ? Math.round((mastered / total) * 100) : 0 };
}

const awOpts = v => [['term', 'Term'], ['def', 'Definition'], ['both', 'Both']]
  .map(([k, l]) => `<option value="${k}" ${v === k ? 'selected' : ''}>${l}</option>`).join('');

/* ================================================================ router */

let onKey = null;
let timers = [];

document.addEventListener('keydown', e => {
  if (onKey && !$('.modal-wrap') && !$('.lightbox')) onKey(e);
});

function resetView() {
  onKey = null;
  timers.forEach(t => { clearTimeout(t); clearInterval(t); });
  timers = [];
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const a = app();
  a.onclick = a.oninput = a.onchange = a.onsubmit = a.onkeydown = a.onpaste = a.ondragover = a.ondragleave = a.ondrop = null;
  window.scrollTo(0, 0);
}

const ROUTES = [
  [/^#?\/?$/, () => viewHome()],
  [/^#\/set\/([^/]+)$/, id => viewSet(id)],
  [/^#\/edit\/([^/]+)$/, id => viewEdit(id)],
  [/^#\/new$/, () => viewEdit(null)],
  [/^#\/import$/, () => viewImport()],
  [/^#\/flash\/([^/]+)$/, id => viewFlash(id)],
  [/^#\/learn\/([^/]+)$/, id => viewLearn(id)],
  [/^#\/write\/([^/]+)$/, id => viewWrite(id)],
  [/^#\/test\/([^/]+)$/, id => viewTest(id)],
  [/^#\/match\/([^/]+)$/, id => viewMatch(id)],
  [/^#\/pid\/([^/]+)$/, id => viewPid(id)],
  [/^#\/mcq\/([^/]+)\/(practice|exam)$/, (id, mode) => viewMcq(id, mode)],
];

function route() {
  resetView();
  const h = location.hash || '#/';
  for (const [re, fn] of ROUTES) {
    const m = h.match(re);
    if (m) return fn(...m.slice(1).map(decodeURIComponent));
  }
  viewHome();
}

function notFound() {
  app().innerHTML = `<div class="empty"><h2>Set not found</h2><p>It may have been deleted.</p><a class="btn primary" href="#/">Back to library</a></div>`;
}

function getSet(id) {
  const s = SETS.get(id);
  if (!s) notFound();
  else { prog(id).last = Date.now(); saveProg(id); }
  return s;
}

function studyTop(s, icon, label, withSettings = true) {
  return `<div class="study-top"><a class="crumb" href="#/set/${s.id}">${I('back')} ${esc(s.title)}</a>
    <div class="mode-title">${I(icon)} ${label}</div>
    <div>${withSettings ? `<button class="ib" data-a="settings" title="Options">${I('gear')}</button>` : '<span style="width:40px;display:inline-block"></span>'}</div></div>`;
}

/* ================================================================ home */

function viewHome() {
  const q = $('#q').value.trim().toLowerCase();
  const folder = localStorage.scFolder || '';
  const sort = localStorage.scSort || 'recent';
  const all = [...SETS.values()];
  const folders = [...new Set(all.map(s => s.folder).filter(Boolean))].sort();
  const text = s => (s.title + ' ' + (s.description || '') + ' ' + (s.folder || '')).toLowerCase();
  const cardHit = c => ((c.term || '') + ' ' + (c.def || '')).toLowerCase().includes(q);
  const qHit = s => (s.questions || []).some(x => (x.stem + ' ' + (x.choices || []).join(' ') + ' ' + (x.parts || []).map(p => p.q).join(' ')).toLowerCase().includes(q));
  let list = all.filter(s => (!folder || s.folder === folder) && (!q || text(s).includes(q) || s.cards.some(cardHit) || qHit(s)));
  const last = s => prog(s.id).last || s.updated || 0;
  list.sort(sort === 'az' ? (a, b) => a.title.localeCompare(b.title) : sort === 'size' ? (a, b) => b.cards.length - a.cards.length : (a, b) => last(b) - last(a));
  const hits = q ? all.flatMap(s => s.cards.filter(cardHit).map(c => ({ s, c }))).slice(0, 40) : [];
  const nCards = all.reduce((n, s) => n + s.cards.length, 0);

  app().innerHTML = `
  <section class="home-top">
    <div><h1>Your library</h1><div class="muted">${all.length} sets · ${nCards} cards · saved in this browser, free forever</div></div>
    <div class="row gap wrap">
      <a class="btn primary" href="#/new">${I('plus')} Create set</a>
      <a class="btn" href="#/import">${I('upload')} Import</a>
      <button class="btn" data-a="backup">${I('download')} Back up</button>
      <label class="btn">${I('restart')} Restore<input type="file" id="restore" accept=".json" hidden></label>
    </div>
  </section>
  <div class="chips">
    <button class="chip ${!folder ? 'on' : ''}" data-f="">All sets</button>
    ${folders.map(f => `<button class="chip ${folder === f ? 'on' : ''}" data-f="${esc(f)}">${I('folder')} ${esc(f)}</button>`).join('')}
    <select id="sort" title="Sort">
      <option value="recent" ${sort === 'recent' ? 'selected' : ''}>Recently studied</option>
      <option value="az" ${sort === 'az' ? 'selected' : ''}>A–Z</option>
      <option value="size" ${sort === 'size' ? 'selected' : ''}>Most cards</option>
    </select>
  </div>
  ${q ? `<p class="muted">Results for “${esc(q)}”</p>` : ''}
  <div class="grid">${list.map(tile).join('') || `<div class="empty">No sets ${q ? 'match your search' : 'yet'}. <a href="#/new">Create one</a> or <a href="#/import">import from Quizlet</a>.</div>`}</div>
  ${hits.length ? `<h2 style="margin-top:28px">Matching cards</h2><div class="hits">${hits.map(({ s, c }) => `<a class="hit" href="#/set/${s.id}"><b>${esc(c.term || '(picture)')}</b><span>${esc((c.def || '').slice(0, 180))}</span><em>${esc(s.title)}</em></a>`).join('')}</div>` : ''}`;

  app().onclick = e => {
    const f = e.target.closest('[data-f]');
    if (f) { localStorage.scFolder = f.dataset.f; viewHome(); }
    if (e.target.closest('[data-a=backup]')) backupAll();
  };
  app().onchange = async e => {
    if (e.target.id === 'sort') { localStorage.scSort = e.target.value; viewHome(); }
    if (e.target.id === 'restore' && e.target.files[0]) {
      try { await importJSON(JSON.parse(await readFile(e.target.files[0], 'text')), true); viewHome(); } catch (err) { toast('That file could not be read: ' + err.message); }
    }
  };
}

function tile(s) {
  if (s.kind === 'mcq') {
    const img = s.questions.map(x => x.img).find(Boolean);
    const last = prog(s.id).quiz?.at(-1);
    return `<a class="tile" href="#/set/${s.id}">
      ${img ? `<div class="thumb"><img src="${esc(img)}" alt="" loading="lazy"></div>` : '<div class="thumb none">?</div>'}
      <div class="tbody"><div class="ttl">${esc(s.title)}</div>
      <div class="meta">${qCount(s)}${s.folder ? ` · ${esc(s.folder)}` : ''}</div>
      <div class="mbar"><span style="width:${last ? last.pct : 0}%"></span></div><div class="meta small">${last ? `Last score ${last.pct}%` : 'Not taken yet'}</div></div></a>`;
  }
  const img = s.cards.map(c => c.termImg || c.defImg).find(Boolean);
  const m = mastery(s);
  return `<a class="tile" href="#/set/${s.id}">
    ${img ? `<div class="thumb"><img src="${esc(img)}" alt="" loading="lazy"></div>` : `<div class="thumb none">${esc((s.title || '?').slice(0, 1).toUpperCase())}</div>`}
    <div class="tbody"><div class="ttl">${esc(s.title)}</div>
    <div class="meta">${s.cards.length} terms${s.folder ? ` · ${esc(s.folder)}` : ''}${img ? ' · pictures' : ''}</div>
    <div class="mbar"><span style="width:${m.pct}%"></span></div><div class="meta small">${m.mastered} of ${m.total} mastered</div></div></a>`;
}

/* ================================================================ set page */

function viewSet(id) {
  const s = SETS.get(id);
  if (!s) return notFound();
  if (s.kind === 'mcq') return viewMcqSet(s);
  const p = prog(id);
  const lv = p.learn?.lv || {};
  const m = mastery(s);
  const filter = sessionStorage.scFilter || 'all';
  const nStar = s.cards.filter(c => p.starred[c.id]).length;
  const cards = filter === 'star' ? s.cards.filter(c => p.starred[c.id]) : s.cards;
  const status = c => (lv[c.id] === 2 ? ['mastered', 'Mastered'] : lv[c.id] !== undefined ? ['learning', 'Learning'] : ['fresh', 'Not studied']);
  const best = p.match.length ? Math.min(...p.match.map(x => x.t)) : 0;
  const lastTest = p.tests[p.tests.length - 1];
  const modes = [['flash', 'cards', 'Flashcards'], ['learn', 'learn', 'Learn'], ['test', 'test', 'Test'], ['match', 'match', 'Match'], ['write', 'write', 'Write']];
  if (s.cards.some(c => c.cls && c.termImg)) modes.unshift(['pid', 'zoom', 'Picture ID test']);

  app().innerHTML = `
  <a class="crumb" href="#/">${I('back')} Library</a>
  <div class="set-head">
    <div><h1>${esc(s.title)}</h1><div class="muted">${s.cards.length} terms${s.folder ? ` · ${esc(s.folder)}` : ''}</div>${s.description ? `<p>${fmt(s.description)}</p>` : ''}</div>
    <div class="row gap wrap">
      <a class="btn" href="#/edit/${s.id}">${I('edit')} Edit</a>
      <button class="btn" data-a="export">${I('download')} Export</button>
      <button class="btn" data-a="dup">${I('copy')} Copy</button>
      <button class="btn" data-a="reset">${I('restart')} Reset progress</button>
      <button class="btn danger" data-a="del" title="Delete set">${I('trash')}</button>
    </div>
  </div>
  <div class="modes">${modes.map(([k, ic, l]) => `<a class="mode" href="#/${k}/${s.id}">${I(ic)}<span>${l}</span></a>`).join('')}</div>
  <div class="progress-row">
    <div class="pstat"><b>${m.fresh}</b>Not studied</div>
    <div class="pstat learning"><b>${m.learning}</b>Learning</div>
    <div class="pstat mastered"><b>${m.mastered}</b>Mastered</div>
    ${best ? `<div class="pstat"><b>${(best / 1000).toFixed(1)}s</b>Best Match time</div>` : ''}
    ${lastTest ? `<div class="pstat"><b>${lastTest.pct}%</b>Last test</div>` : ''}
  </div>
  <div class="list-head"><h2>Terms in this set (${s.cards.length})</h2>
    <div class="seg"><button data-filter="all" class="${filter === 'all' ? 'on' : ''}">All</button><button data-filter="star" class="${filter === 'star' ? 'on' : ''}">Starred (${nStar})</button></div></div>
  <div class="terms">${cards.map(c => {
    const [cls, lab] = status(c);
    const stt = p.stats[c.id];
    return `<div class="term">
      <div class="tside">${c.termImg ? `<img src="${esc(c.termImg)}" alt="">` : ''}<div>${fmt(c.term)}</div></div>
      <div class="dside">${c.defImg ? `<img src="${esc(c.defImg)}" alt="">` : ''}<div>${fmt(c.def)}</div>${c.note ? `<div class="note">${fmt(c.note)}</div>` : ''}</div>
      <div class="tact"><span class="chipst ${cls}" title="${stt ? `${stt.c} right, ${stt.w} wrong` : ''}">${lab}</span>
        <button class="ib star ${p.starred[c.id] ? 'on' : ''}" data-star="${c.id}" title="Star">${I('star')}</button>
        <button class="ib" data-say="${c.id}" title="Read aloud">${I('sound')}</button></div></div>`;
  }).join('') || '<p class="empty">No starred cards yet. Tap the star on any card to save it for focused practice.</p>'}</div>`;

  app().onclick = async e => {
    const t = e.target;
    const img = t.closest('.term img');
    if (img) return lightbox(img.src);
    const st = t.closest('[data-star]');
    if (st) {
      p.starred[st.dataset.star] = !p.starred[st.dataset.star];
      saveProg(id);
      return viewSet(id);
    }
    const say = t.closest('[data-say]');
    if (say) {
      const c = s.cards.find(x => x.id === say.dataset.say);
      return speak(`${c.term || ''}. ${c.def || ''}`);
    }
    const f = t.closest('[data-filter]');
    if (f) { sessionStorage.scFilter = f.dataset.filter; return viewSet(id); }
    const a = t.closest('[data-a]')?.dataset.a;
    if (a === 'export') exportModal(s);
    if (a === 'dup') {
      const copy = { ...clone(s), id: uid(), title: s.title + ' (copy)', created: Date.now(), edited: true };
      copy.cards = copy.cards.map(c => ({ ...c, id: uid() }));
      await saveSet(copy);
      toast('Copied');
      location.hash = '#/set/' + copy.id;
    }
    if (a === 'reset' && (await confirmBox('This clears Learn progress, stars, stats, Match times and test scores for this set.', 'Reset'))) {
      PROG.delete(id);
      await Store.del('progress', id);
      viewSet(id);
    }
    if (a === 'del' && (await confirmBox(`Delete “${esc(s.title)}” and all ${s.cards.length} cards? This can’t be undone.`))) {
      await Store.del('sets', id);
      await Store.del('progress', id);
      SETS.delete(id);
      PROG.delete(id);
      toast('Set deleted');
      location.hash = '#/';
    }
  };
}

/* ================================================================ export / import / backup */

function exportModal(s) {
  const clean = x => String(x || '').replace(/[\t\n\r]+/g, ' ');
  const txt = s.cards.map(c => `${clean(c.term)}\t${clean(c.def)}`).join('\n');
  const nImg = s.cards.filter(c => c.termImg || c.defImg).length;
  modal(`<h2>Export “${esc(s.title)}”</h2>
    <p class="muted">Text format: Tab between term and definition, new line between cards. Paste it into Quizlet, Anki, or back into StudyCards.${nImg ? ` Pictures (${nImg} cards) are only kept in the .json file.` : ''}</p>
    <textarea class="exp" readonly>${esc(txt)}</textarea>
    <div class="row gap wrap"><button class="btn primary" data-x="copy">${I('copy')} Copy text</button><button class="btn" data-x="txt">Download .txt</button><button class="btn" data-x="json">Download .json with pictures</button><button class="btn ghost" data-close>Close</button></div>`,
  m => {
    m.onclick = async e => {
      const x = e.target.closest('[data-x]')?.dataset.x;
      const name = s.title.replace(/[^\w\- ]+/g, '').trim() || 'set';
      if (x === 'copy') { await navigator.clipboard.writeText(txt).catch(() => $('.exp', m).select()); toast('Copied to clipboard'); }
      if (x === 'txt') download(name + '.txt', txt, 'text/plain');
      if (x === 'json') download(name + '.json', JSON.stringify({ app: 'studycards', v: 1, sets: [s] }));
    };
  });
}

function backupAll() {
  download(`studycards-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify({ app: 'studycards', v: 1, exported: Date.now(), sets: [...SETS.values()], progress: [...PROG.values()] }));
  toast('Backup downloaded');
}

async function importJSON(obj, restore) {
  const sets = obj.sets || (obj.cards ? [obj] : []);
  if (!sets.length) throw new Error('no study sets inside');
  let n = 0;
  for (const s of sets) {
    const set = clone(s);
    if (!restore && SETS.has(set.id)) set.id = uid();
    set.cards = (set.cards || []).map(c => ({ ...c, id: c.id || uid(), term: c.term || '', def: c.def || '' }));
    set.title ||= 'Imported set';
    set.edited = true;
    await saveSet(set);
    n++;
  }
  if (restore && obj.progress) for (const p of obj.progress) { PROG.set(p.id, p); await Store.put('progress', p); }
  toast(`${restore ? 'Restored' : 'Imported'} ${n} set${n === 1 ? '' : 's'}`);
  return sets;
}

function parseText(txt, ts, cs) {
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cardSep = cs === 'nl' ? /\r?\n/ : cs === 'semi' ? /;/ : new RegExp(reEsc(cs || '\n'));
  const termSep = ts === 'tab' ? '\t' : ts === 'comma' ? ',' : ts === 'dash' ? ' - ' : (ts || '\t');
  return txt.split(cardSep).filter(l => l.trim()).map(l => {
    const i = l.indexOf(termSep);
    return i < 0 ? { id: uid(), term: l.trim(), def: '' } : { id: uid(), term: l.slice(0, i).trim(), def: l.slice(i + termSep.length).trim() };
  });
}

function importUI(root, { withTitle, onImport, button = 'Import' }) {
  const radio = (name, opts) => opts.map(([v, l], k) => `<label><input type="radio" name="${name}" value="${v}" ${k === 0 ? 'checked' : ''}> ${l}</label>`).join('');
  root.innerHTML = `
    ${withTitle ? '<input id="it" class="big-input" placeholder="Title for the new set">' : ''}
    <p class="muted">Paste from Quizlet, Word, Excel or Google Docs. In Quizlet: open your set → the ⋯ menu → Export → Copy text. You can also open a .txt, .csv or .json file.</p>
    <label class="btn">${I('upload')} Open a file<input type="file" id="ifile" accept=".txt,.tsv,.csv,.json" hidden></label>
    <textarea id="itxt" class="imp" placeholder="Word 1&#9;Definition 1&#10;Word 2&#9;Definition 2&#10;Word 3&#9;Definition 3"></textarea>
    <div class="seps">
      <div><b>Between term and definition</b><div>${radio('ts', [['tab', 'Tab'], ['comma', 'Comma'], ['dash', 'Dash ( - )'], ['custom', 'Custom']])}<input type="text" id="tsc" placeholder="e.g. :"></div></div>
      <div><b>Between cards</b><div>${radio('cs', [['nl', 'New line'], ['semi', 'Semicolon'], ['custom', 'Custom']])}<input type="text" id="csc" placeholder="e.g. |"></div></div>
    </div>
    <h3>Preview <span id="icount" class="muted"></span></h3><div id="iprev" class="iprev"></div>
    <button class="btn primary big" id="igo">${button}</button>`;
  const val = n => {
    const v = $(`input[name=${n}]:checked`, root).value;
    return v === 'custom' ? $(n === 'ts' ? '#tsc' : '#csc', root).value : v;
  };
  const parse = () => parseText($('#itxt', root).value, val('ts'), val('cs'));
  const preview = () => {
    const cards = parse();
    $('#icount', root).textContent = cards.length ? `(${cards.length} cards)` : '';
    $('#iprev', root).innerHTML = cards.slice(0, 8).map(c => `<div><b>${esc(c.term)}</b><span>${esc(c.def)}</span></div>`).join('') + (cards.length > 8 ? `<p class="muted small">…and ${cards.length - 8} more</p>` : '');
  };
  const autodetect = () => {
    const t = $('#itxt', root).value;
    const pick = t.includes('\t') ? 'tab' : / - /.test(t) ? 'dash' : t.includes(',') ? 'comma' : 'tab';
    $(`input[name=ts][value=${pick}]`, root).checked = true;
  };
  root.oninput = e => { if (e.target.id === 'itxt' && e.inputType === 'insertFromPaste') autodetect(); preview(); };
  root.onchange = async e => {
    if (e.target.id !== 'ifile' || !e.target.files[0]) return preview();
    const f = e.target.files[0];
    const text = await readFile(f, 'text');
    if (/\.json$/i.test(f.name)) {
      try { const sets = await importJSON(JSON.parse(text)); onImport(null, null, sets); } catch (err) { toast('Could not read that file: ' + err.message); }
      return;
    }
    $('#itxt', root).value = text;
    if (withTitle && !$('#it', root).value) $('#it', root).value = f.name.replace(/\.[^.]+$/, '').replace(/\s*-\s*Quizlet$/i, '');
    if (/\.csv$/i.test(f.name) && !text.includes('\t')) $('input[name=ts][value=comma]', root).checked = true; else autodetect();
    preview();
  };
  $('#igo', root).onclick = () => {
    const cards = parse().filter(c => c.term || c.def);
    if (!cards.length) return toast('Paste some cards first');
    onImport(cards, withTitle ? $('#it', root).value.trim() : null);
  };
}

function viewImport() {
  app().innerHTML = `<a class="crumb" href="#/">${I('back')} Library</a><h1>Import</h1><div id="imp"></div>`;
  importUI($('#imp'), {
    withTitle: true,
    button: 'Create set',
    onImport: async (cards, title, sets) => {
      if (sets) { location.hash = sets.length === 1 ? '#/set/' + [...SETS.values()].sort((a, b) => b.updated - a.updated)[0].id : '#/'; return; }
      const set = { id: uid(), title: title || 'Imported set', description: '', folder: '', cards, created: Date.now(), edited: true };
      await saveSet(set);
      toast(`Imported ${cards.length} cards. Add pictures in Edit.`);
      location.hash = '#/set/' + set.id;
    },
  });
}

/* ================================================================ editor */

function viewEdit(id) {
  const orig = id ? SETS.get(id) : null;
  if (id && !orig) return notFound();
  const blank = () => ({ id: uid(), term: '', def: '' });
  const d = orig ? clone(orig) : { id: uid(), title: '', description: '', folder: '', cards: [], created: Date.now() };
  if (!d.cards.length) for (let k = 0; k < 5; k++) d.cards.push(blank());
  const folders = [...new Set([...SETS.values()].map(s => s.folder).filter(Boolean))];

  app().innerHTML = `
  <div class="edit-top"><a class="crumb" href="${orig ? '#/set/' + d.id : '#/'}">${I('back')} ${orig ? 'Back to set' : 'Library'}</a></div>
  <div class="edit-top"><h1>${orig ? 'Edit set' : 'Create a new study set'}</h1><button class="btn primary" data-a="save">${orig ? 'Save' : 'Create'}</button></div>
  <div class="meta-fields">
    <input id="et" class="big-input" placeholder="Title, like &quot;Biology Chapter 3&quot;" value="${esc(d.title)}">
    <textarea id="ed" placeholder="Add a description (optional)">${esc(d.description || '')}</textarea>
    <input id="ef" list="folders" placeholder="Folder (optional), like AP Bio" value="${esc(d.folder || '')}">
    <datalist id="folders">${folders.map(f => `<option value="${esc(f)}">`).join('')}</datalist>
  </div>
  <div class="row gap wrap">
    <button class="btn" data-a="import">${I('upload')} Import cards</button>
    <button class="btn" data-a="swap">${I('swap')} Swap terms and definitions</button>
    <label class="field inline">Default answer side
      <select id="eaw"><option value="">Term</option><option value="def" ${d.answerWith === 'def' ? 'selected' : ''}>Definition</option></select></label>
  </div>
  <p class="muted small">Add a picture to either side with the image button, by dragging an image onto the card, or by pasting a screenshot (⌘V) while typing in that box.</p>
  <div id="rows"></div>
  <button class="add-row" data-a="add">${I('plus')} ADD CARD</button>
  <div class="row end"><button class="btn primary big" data-a="save">${orig ? 'Save changes' : 'Create set'}</button></div>`;

  const rows = $('#rows');
  const grow = ta => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
  const field = { t: 'term', d: 'def', n: 'note' };
  const imgField = { t: 'termImg', d: 'defImg' };

  function sideBox(c, w) {
    const img = c[imgField[w]];
    return `<div class="eside" data-w="${w}">
      <textarea rows="1" data-f="${w}" placeholder="${w === 't' ? 'Enter term' : 'Enter definition'}">${esc(c[field[w]] || '')}</textarea>
      <div class="eimg">${img
        ? `<div class="thumbwrap"><img src="${esc(img)}" alt=""><button class="ib sm rm" data-a="rmimg" title="Remove picture">${I('x')}</button></div>`
        : `<button class="imgbtn" data-a="addimg" title="Add a picture">${I('image')}<span>Image</span></button>`}</div>
      <div class="elabel">${w === 't' ? 'TERM' : 'DEFINITION'}</div></div>`;
  }
  function rowHTML(c, k) {
    return `<div class="erow" data-k="${k}">
      <div class="ehead"><span class="num">${k + 1}</span><div class="row">
        <button class="ib sm" data-a="note" title="Explanation shown after answering">${c.note != null ? 'Explanation ✓' : '+ Explanation'}</button>
        <button class="ib sm" data-a="up" title="Move up" ${k === 0 ? 'disabled' : ''}>${I('up')}</button>
        <button class="ib sm" data-a="down" title="Move down" ${k === d.cards.length - 1 ? 'disabled' : ''}>${I('down')}</button>
        <button class="ib sm" data-a="delrow" title="Delete card">${I('trash')}</button></div></div>
      <div class="ebody">${sideBox(c, 't')}${sideBox(c, 'd')}</div>
      ${c.note != null ? `<div class="enote"><textarea rows="1" data-f="n" placeholder="Explanation or hint shown after you answer (optional)">${esc(c.note)}</textarea></div>` : ''}</div>`;
  }
  function renderRows() {
    rows.innerHTML = d.cards.map(rowHTML).join('');
    $$('textarea', rows).forEach(grow);
  }
  function renderRow(k) {
    const el = $(`.erow[data-k="${k}"]`, rows);
    el.outerHTML = rowHTML(d.cards[k], k);
    $$(`.erow[data-k="${k}"] textarea`, rows).forEach(grow);
  }
  async function setImg(k, w, src) {
    if (!src) return;
    d.cards[k][imgField[w]] = src;
    renderRow(k);
  }
  renderRows();

  app().oninput = e => {
    const ta = e.target.closest('textarea[data-f]');
    if (!ta) return;
    const k = +ta.closest('.erow').dataset.k;
    d.cards[k][field[ta.dataset.f]] = ta.value;
    grow(ta);
  };

  app().onclick = async e => {
    const b = e.target.closest('[data-a]');
    if (!b) {
      const th = e.target.closest('.thumbwrap img');
      if (th) lightbox(th.src);
      return;
    }
    const a = b.dataset.a;
    const row = b.closest('.erow');
    const k = row ? +row.dataset.k : -1;
    const w = b.closest('.eside')?.dataset.w;
    if (a === 'save') return save();
    if (a === 'add') {
      d.cards.push(blank());
      renderRows();
      $$('.erow', rows).at(-1).querySelector('textarea').focus();
    }
    if (a === 'delrow') { d.cards.splice(k, 1); if (!d.cards.length) d.cards.push(blank()); renderRows(); }
    if (a === 'up' && k > 0) { [d.cards[k - 1], d.cards[k]] = [d.cards[k], d.cards[k - 1]]; renderRows(); }
    if (a === 'down' && k < d.cards.length - 1) { [d.cards[k + 1], d.cards[k]] = [d.cards[k], d.cards[k + 1]]; renderRows(); }
    if (a === 'note') { d.cards[k].note = d.cards[k].note != null ? undefined : ''; renderRow(k); $(`.erow[data-k="${k}"] .enote textarea`, rows)?.focus(); }
    if (a === 'addimg') setImg(k, w, await pickImage());
    if (a === 'rmimg') { d.cards[k][imgField[w]] = undefined; renderRow(k); }
    if (a === 'swap') {
      d.cards = d.cards.map(c => ({ ...c, term: c.def, def: c.term, termImg: c.defImg, defImg: c.termImg }));
      renderRows();
      toast('Swapped');
    }
    if (a === 'import') {
      modal('<h2>Import cards</h2><div id="mimp"></div>', (m, close) => importUI($('#mimp', m), {
        button: 'Add these cards',
        onImport: cards => {
          if (!cards) return close();
          d.cards = [...d.cards.filter(hasContent), ...cards];
          renderRows();
          close();
          toast(`Added ${cards.length} cards`);
        },
      }));
    }
  };

  app().onpaste = async e => {
    const box = e.target.closest('.eside');
    if (!box) return;
    const file = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'))?.getAsFile();
    if (!file) return;
    e.preventDefault();
    setImg(+box.closest('.erow').dataset.k, box.dataset.w, await fileToImage(file));
  };
  app().ondragover = e => {
    const box = e.target.closest('.eside');
    if (!box) return;
    e.preventDefault();
    $$('.eside.drag').forEach(x => x !== box && x.classList.remove('drag'));
    box.classList.add('drag');
  };
  app().ondragleave = e => e.target.closest?.('.eside')?.classList.remove('drag');
  app().ondrop = async e => {
    const box = e.target.closest('.eside');
    if (!box) return;
    e.preventDefault();
    box.classList.remove('drag');
    const k = +box.closest('.erow').dataset.k;
    const file = [...e.dataTransfer.files].find(f => f.type.startsWith('image/'));
    if (file) return setImg(k, box.dataset.w, await fileToImage(file));
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (/^(https?:|data:image)/.test(url)) setImg(k, box.dataset.w, url.trim());
  };
  app().onkeydown = e => {
    const ta = e.target;
    if (e.key === 'Tab' && !e.shiftKey && ta.dataset?.f === 'd' && +ta.closest('.erow').dataset.k === d.cards.length - 1) {
      e.preventDefault();
      d.cards.push(blank());
      renderRows();
      $$('.erow', rows).at(-1).querySelector('textarea').focus();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  };

  async function save() {
    d.title = $('#et').value.trim() || 'Untitled set';
    d.description = $('#ed').value.trim();
    d.folder = $('#ef').value.trim();
    d.answerWith = $('#eaw').value || undefined;
    d.cards = d.cards.filter(hasContent).map(c => ({
      ...c, term: (c.term || '').trim(), def: (c.def || '').trim(), note: c.note && c.note.trim() ? c.note.trim() : undefined,
    }));
    if (!d.cards.length) { d.cards.push(blank()); renderRows(); return toast('Add at least one card'); }
    d.edited = true;
    try { await saveSet(d); } catch (err) { return toast('Could not save: ' + (err?.message || err) + '. Try smaller pictures.'); }
    toast(orig ? 'Saved' : 'Set created');
    location.hash = '#/set/' + d.id;
  }
}

/* ================================================================ flashcards */

function viewFlash(id) {
  const s = getSet(id);
  if (!s) return;
  const p = prog(id);
  const S = p.settings;
  S.fFront ||= 'term';
  let deck = [], i = 0, flipped = false, know = [], still = [], auto = null;

  function start(cards) {
    deck = S.fShuffle ? shuffle(cards) : [...cards];
    i = 0; flipped = false; know = []; still = [];
    render();
  }
  const tools = (c, w) => `<div class="ftools">${side(c, w).img ? `<button class="ib sm" data-a="zoom" data-w="${w}" title="Enlarge picture">${I('zoom')}</button>` : ''}
    <button class="ib sm" data-a="say" data-w="${w}" title="Read aloud">${I('sound')}</button>
    <button class="ib sm star ${p.starred[c.id] ? 'on' : ''}" data-a="star" title="Star (S)">${I('star')}</button></div>`;

  function render() {
    if (i >= deck.length) return renderDone();
    const c = deck[i];
    const back = S.fFront === 'term' ? 'def' : 'term';
    app().innerHTML = `${studyTop(s, 'cards', 'Flashcards')}
      ${S.fTrack ? `<div class="trackbar"><span class="still">${still.length} still learning</span><span class="count">${i + 1} / ${deck.length}</span><span class="know">${know.length} know</span></div>` : `<div class="count center row">${i + 1} / ${deck.length}</div>`}
      <div class="fbar"><span style="width:${(i / deck.length) * 100}%"></span></div>
      <div class="card3d ${flipped ? 'flipped' : ''}" id="fc"><div class="inner">
        <div class="face front">${tools(c, S.fFront)}${sideHTML(side(c, S.fFront))}</div>
        <div class="face back">${tools(c, back)}${sideHTML(side(c, back))}${c.note ? `<div class="note">${fmt(c.note)}</div>` : ''}</div>
      </div></div>
      <div class="fctl">
        ${S.fTrack ? `<button class="round still" data-a="still" title="Still learning (←)">${I('x')}</button>` : `<button class="round" data-a="prev" title="Previous (←)" ${i === 0 ? 'disabled' : ''}>${I('left')}</button>`}
        <button class="ib ${auto ? 'on' : ''}" data-a="auto" title="Autoplay">${I(auto ? 'pause' : 'play')}</button>
        <button class="ib ${S.fShuffle ? 'on' : ''}" data-a="shuffle" title="Shuffle">${I('shuffle')}</button>
        <button class="ib ${S.fTrack ? 'on' : ''}" data-a="track" title="Track progress (T)">${I('check')}</button>
        ${S.fTrack ? `<button class="round know" data-a="know" title="Know (→)">${I('check')}</button>` : `<button class="round" data-a="next" title="Next (→)">${I('right')}</button>`}
      </div>
      <div class="hint">Space or click to flip · ← → ${S.fTrack ? 'still learning / know' : 'previous / next'} · S star · T track progress</div>`;
  }

  function renderDone() {
    stopAuto();
    app().innerHTML = `${studyTop(s, 'cards', 'Flashcards')}<div class="done">
      <h2>${S.fTrack ? (still.length ? 'Nice progress! Keep going.' : 'You know all of these!') : 'Nice work! You went through every card.'}</h2>
      ${S.fTrack ? `<div class="donestats"><div class="know"><b>${know.length}</b>Know</div><div class="still"><b>${still.length}</b>Still learning</div></div>` : ''}
      <div class="row gap center wrap">
        ${S.fTrack && still.length ? `<button class="btn primary big" data-a="again">Keep reviewing ${still.length} term${still.length === 1 ? '' : 's'}</button>` : ''}
        <button class="btn ${S.fTrack && still.length ? '' : 'primary'} big" data-a="restart">Restart flashcards</button>
        <a class="btn big" href="#/learn/${s.id}">Practice with Learn</a></div></div>`;
  }

  const flip = () => { flipped = !flipped; $('#fc')?.classList.toggle('flipped', flipped); };
  const go = d => { i = Math.max(0, i + d); flipped = false; render(); };
  function judge(ok) {
    const c = deck[i];
    (ok ? know : still).push(c);
    record(id, c.id, ok);
    saveProg(id);
    $('#fc')?.classList.add(ok ? 'go-right' : 'go-left');
    setTimeout(() => go(1), 170);
  }
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  function toggleAuto() {
    if (auto) { stopAuto(); return render(); }
    auto = setInterval(() => {
      if (i >= deck.length) return stopAuto();
      if (!flipped) flip(); else S.fTrack ? judge(true) : go(1);
    }, 3200);
    timers.push(auto);
    render();
  }
  function settings() {
    modal(`<h2>Flashcard options</h2>
      <label class="field">Front of card<select id="ff"><option value="term" ${S.fFront === 'term' ? 'selected' : ''}>Term</option><option value="def" ${S.fFront === 'def' ? 'selected' : ''}>Definition</option></select></label>
      <label class="check"><input type="checkbox" id="fs" ${S.fShuffle ? 'checked' : ''}> Shuffle</label>
      <label class="check"><input type="checkbox" id="ft" ${S.fTrack ? 'checked' : ''}> Track progress (sort into Know / Still learning)</label>
      <label class="check"><input type="checkbox" id="fst" ${S.starOnly ? 'checked' : ''}> Study starred terms only</label>
      <div class="row gap end"><button class="btn" data-close>Cancel</button><button class="btn primary" id="fok">Apply and restart</button></div>`,
    (m, close) => {
      $('#fok', m).onclick = () => {
        S.fFront = $('#ff', m).value; S.fShuffle = $('#fs', m).checked; S.fTrack = $('#ft', m).checked; S.starOnly = $('#fst', m).checked;
        saveProg(id); close(); start(cardsOf(s, S.starOnly));
      };
    });
  }

  app().onclick = e => {
    const b = e.target.closest('[data-a]');
    if (!b) { if (e.target.closest('#fc')) flip(); return; }
    const a = b.dataset.a;
    const c = deck[i];
    if (a === 'settings') settings();
    if (a === 'prev') go(-1);
    if (a === 'next') go(1);
    if (a === 'know') judge(true);
    if (a === 'still') judge(false);
    if (a === 'auto') toggleAuto();
    if (a === 'shuffle') { S.fShuffle = !S.fShuffle; saveProg(id); toast(S.fShuffle ? 'Shuffle on' : 'Shuffle off'); start(cardsOf(s, S.starOnly)); }
    if (a === 'track') { S.fTrack = !S.fTrack; saveProg(id); toast(S.fTrack ? 'Tracking progress: → know, ← still learning' : 'Progress tracking off'); render(); }
    if (a === 'star') { p.starred[c.id] = !p.starred[c.id]; saveProg(id); $$('[data-a=star]').forEach(x => x.classList.toggle('on', !!p.starred[c.id])); }
    if (a === 'say') speak(side(c, b.dataset.w).text);
    if (a === 'zoom') lightbox(side(c, b.dataset.w).img);
    if (a === 'again') start(still);
    if (a === 'restart') start(cardsOf(s, S.starOnly));
  };
  onKey = e => {
    if (i >= deck.length) return;
    if ([' ', 'Enter', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); flip(); }
    else if (e.key === 'ArrowRight') S.fTrack ? judge(true) : go(1);
    else if (e.key === 'ArrowLeft') S.fTrack ? judge(false) : i > 0 && go(-1);
    else if (e.key.toLowerCase() === 's') $('[data-a=star]')?.click();
    else if (e.key.toLowerCase() === 't') $('[data-a=track]')?.click();
  };
  start(cardsOf(s, S.starOnly));
}

/* ================================================================ learn */

const PRAISE = ['Nice!', 'Correct!', 'You got it!', 'Great job!', 'Perfect!', 'Awesome!'];

function viewLearn(id) {
  const s = getSet(id);
  if (!s) return;
  const p = prog(id);
  const S = p.settings;
  S.lAw ||= s.answerWith || 'term';
  S.lMC ??= true;
  S.lWr ??= true;
  p.learn ||= { lv: {}, round: 1 };
  const L = p.learn;
  let queue = [], done = [], cur = null, locked = false, cont = null, last = null;
  const all = () => cardsOf(s, S.starOnly);

  function bars() {
    const cs = all();
    const m = mastery(s, cs);
    const n = Math.max(1, m.total);
    return `<div class="lbars"><div class="lbar"><span class="seg-m" style="width:${(m.mastered / n) * 100}%"></span><span class="seg-l" style="width:${(m.learning / n) * 100}%"></span></div>
      <div class="lcounts"><span><i class="dot f"></i>${m.fresh} not studied</span><span><i class="dot l"></i>${m.learning} learning</span><span><i class="dot m"></i>${m.mastered} mastered</span></div></div>`;
  }
  const top = () => studyTop(s, 'learn', `Learn · Round ${L.round}`) + bars();

  function newRound() {
    const nm = all().filter(c => L.lv[c.id] !== 2);
    if (!nm.length) return finish();
    const started = shuffle(nm.filter(c => L.lv[c.id] !== undefined));
    const fresh = nm.filter(c => L.lv[c.id] === undefined);
    queue = [...started, ...(S.lShuffle ? shuffle(fresh) : fresh)].slice(0, 7).map(c => ({ c, tries: 0 }));
    done = [];
    ask();
  }
  function makeQ(item) {
    const q = orient(item.c, S.lAw);
    const lv = L.lv[item.c.id] ?? 0;
    let type = S.lWr && q.answer.text && (!S.lMC || lv >= 1) ? 'write' : 'mc';
    if (type === 'mc') {
      q.choices = choicesFor(q, all().length >= 4 ? all() : s.cards.filter(hasContent));
      if (q.choices.length < 2) type = q.answer.text ? 'write' : 'self';
    }
    q.type = type;
    q.item = item;
    return q;
  }
  function ask() {
    if (!queue.length) return roundEnd();
    cur = makeQ(queue[0]);
    locked = false;
    cont = null;
    const lv = L.lv[cur.item.c.id];
    const tag = lv === undefined ? 'New term' : lv === 1 ? 'Familiar · type it to master it' : 'Still learning';
    const what = cur.ans === 'term' ? 'term' : 'definition';
    let body;
    if (cur.type === 'mc') {
      body = `<div class="qlabel">Choose the matching ${what}</div>
        <div class="choices">${cur.choices.map((ch, k) => `<button class="choice" data-a="pick" data-k="${k}"><span class="key">${k + 1}</span>${sideHTML(ch.s, 'small')}</button>`).join('')}</div>
        <button class="link" data-a="dunno">Don’t know?</button>`;
    } else if (cur.type === 'write') {
      body = `<div class="qlabel">Type the ${what}</div>
        <form class="wform" id="wf"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the answer"><button class="btn primary">Answer</button></form>
        <button class="link" data-a="dunno">Don’t know?</button>`;
    } else {
      body = `<div class="qlabel">Think of the ${what}, then check yourself</div><button class="btn primary" data-a="reveal">Show answer</button>`;
    }
    app().innerHTML = `${top()}<div class="qcard"><div class="qtag">${tag}</div><div class="prompt">${sideHTML(cur.prompt, 'big')}</div><div id="qbody">${body}</div><div id="fb"></div></div>`;
    $('#ans')?.focus();
  }

  function settle(ok) {
    const item = queue.shift();
    const c = item.c;
    const prev = L.lv[c.id];
    L.lv[c.id] = ok ? (cur.type === 'write' ? 2 : Math.min(2, (prev ?? 0) + 1)) : 0;
    record(id, c.id, ok);
    saveProg(id);
    let requeued = false;
    if (!ok && ++item.tries < 3) { queue.push(item); requeued = true; }
    done.push({ c, ok });
    last = { item, prev, requeued };
  }
  function feedback(ok, o = {}) {
    const fb = $('#fb');
    const note = cur.item.c.note ? `<div class="note">${fmt(cur.item.c.note)}</div>` : '';
    if (ok) {
      fb.innerHTML = `<div class="fb good">${I('check')} ${o.typo ? `Correct, but watch the spelling: <b>${fmt(cur.answer.text)}</b>` : PRAISE[Math.floor(Math.random() * PRAISE.length)]}</div>${o.typo ? note : ''}`;
      timers.push(setTimeout(ask, o.typo ? 2200 : 850));
      return;
    }
    const msg = cur.type === 'mc'
      ? (o.dunno ? 'No problem. The answer is highlighted in green.' : 'Not quite. The correct answer is highlighted in green.')
      : (o.dunno ? 'No problem. Here’s the answer:' : 'Not quite. The correct answer is:');
    fb.innerHTML = `<div class="fb bad">${msg}</div>
      ${cur.type !== 'mc' ? `<div class="correct-ans">${sideHTML(cur.answer)}</div>` : ''}
      ${o.typed ? `<div class="you-said">You said: <b>${esc(o.typed)}</b></div>` : ''}${note}
      <div class="row gap wrap"><button class="btn primary" data-a="continue">Continue</button>${o.typed ? '<button class="btn" data-a="override">Override: I was right</button>' : ''}</div>
      <div class="hint">Press any key to continue</div>`;
    cont = ask;
  }
  function pick(k) {
    if (locked) return;
    locked = true;
    const ok = cur.choices[k].correct;
    $$('.choice').forEach((b, j) => { b.disabled = true; if (cur.choices[j].correct) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
    settle(ok);
    feedback(ok);
  }
  function submit() {
    if (locked) return;
    const v = $('#ans').value;
    if (!v.trim()) return;
    locked = true;
    $('#ans').disabled = true;
    const g = grade(v, cur.answer.text);
    settle(g.ok);
    feedback(g.ok, { typed: g.ok ? '' : v, typo: g.typo });
  }
  function dunno() {
    if (locked) return;
    locked = true;
    $$('.choice').forEach((b, j) => { b.disabled = true; if (cur.choices?.[j]?.correct) b.classList.add('right'); });
    if ($('#ans')) $('#ans').disabled = true;
    settle(false);
    feedback(false, { dunno: true });
  }
  function override() {
    const { item, requeued } = last;
    L.lv[item.c.id] = 2;
    const st = p.stats[item.c.id];
    if (st) { st.w = Math.max(0, st.w - 1); st.c++; }
    if (requeued && queue.at(-1) === item) queue.pop();
    done[done.length - 1].ok = true;
    saveProg(id);
    toast('Counted as correct');
    ask();
  }
  function reveal() {
    $('#qbody').innerHTML = `<div class="correct-ans">${sideHTML(cur.answer)}</div>${cur.item.c.note ? `<div class="note">${fmt(cur.item.c.note)}</div>` : ''}
      <div class="row gap center" style="margin-top:14px"><button class="btn" data-a="self0">I didn’t know it</button><button class="btn primary" data-a="self1">I knew it</button></div>`;
  }
  function roundEnd() {
    const finished = all().every(c => L.lv[c.id] === 2);
    L.round++;
    saveProg(id);
    if (finished) return finish();
    const uniq = [...new Map(done.map(d => [d.c.id, d])).values()];
    app().innerHTML = `${top()}<div class="qcard center">
      <h2>Round ${L.round - 1} complete. Keep it up!</h2>
      <p class="muted">${mastery(s, all()).mastered} of ${all().length} terms mastered so far.</p>
      <div class="rsum">${uniq.map(d => { const m = L.lv[d.c.id] === 2; return `<div class="rrow ${m ? 'm' : 'l'}"><span>${esc(d.c.term || d.c.def || '(picture)')}</span><em>${m ? 'Mastered' : 'Still learning'}</em></div>`; }).join('')}</div>
      <button class="btn primary big" data-a="continue">Continue to round ${L.round}</button><div class="hint">Press Enter to continue</div></div>`;
    cont = newRound;
  }
  function finish() {
    cont = null;
    app().innerHTML = `${top()}<div class="qcard center"><h2>You’ve mastered all ${all().length} terms!</h2>
      <p>Great work. Lock it in with a practice test or a round of Match.</p>
      <div class="row gap center wrap"><a class="btn primary big" href="#/test/${s.id}">Take a practice test</a><a class="btn big" href="#/match/${s.id}">Play Match</a><button class="btn big" data-a="restart">Restart Learn</button></div></div>`;
  }
  function restart() { L.lv = {}; L.round = 1; saveProg(id); newRound(); }
  function settings() {
    modal(`<h2>Learn options</h2>
      <label class="field">Answer with<select id="law">${awOpts(S.lAw)}</select></label>
      <div class="field">Question types
        <label class="check"><input type="checkbox" id="lmc" ${S.lMC ? 'checked' : ''}> Multiple choice</label>
        <label class="check"><input type="checkbox" id="lwr" ${S.lWr ? 'checked' : ''}> Written (type the answer)</label></div>
      <label class="check"><input type="checkbox" id="lsh" ${S.lShuffle ? 'checked' : ''}> Shuffle new terms</label>
      <label class="check"><input type="checkbox" id="lst" ${S.starOnly ? 'checked' : ''}> Study starred terms only</label>
      <div class="row gap end wrap"><button class="btn danger" id="lrs">Restart progress</button><button class="btn" data-close>Cancel</button><button class="btn primary" id="lok">Apply</button></div>`,
    (m, close) => {
      $('#lok', m).onclick = () => {
        const mc = $('#lmc', m).checked, wr = $('#lwr', m).checked;
        if (!mc && !wr) return toast('Pick at least one question type');
        Object.assign(S, { lAw: $('#law', m).value, lMC: mc, lWr: wr, lShuffle: $('#lsh', m).checked, starOnly: $('#lst', m).checked });
        saveProg(id); close(); newRound();
      };
      $('#lrs', m).onclick = () => { close(); restart(); };
    });
  }

  app().onclick = e => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'pick') pick(+b.dataset.k);
    if (a === 'dunno') dunno();
    if (a === 'continue' && cont) cont();
    if (a === 'override') override();
    if (a === 'reveal') reveal();
    if (a === 'self0' || a === 'self1') { if (locked) return; locked = true; settle(a === 'self1'); ask(); }
    if (a === 'restart') restart();
    if (a === 'settings') settings();
  };
  app().onsubmit = e => { e.preventDefault(); submit(); };
  onKey = e => {
    if (cont && !e.metaKey && !e.ctrlKey && !['Shift', 'Alt', 'Meta', 'Control', 'Tab'].includes(e.key)) {
      if (document.activeElement?.id === 'ans' && e.key !== 'Enter') return;
      e.preventDefault();
      const c = cont; cont = null; c();
      return;
    }
    if (cur?.type === 'mc' && !locked && /^[1-9]$/.test(e.key) && cur.choices[+e.key - 1]) pick(+e.key - 1);
  };
  newRound();
}

/* ================================================================ write */

function viewWrite(id) {
  const s = getSet(id);
  if (!s) return;
  const p = prog(id);
  const S = p.settings;
  S.wAw ||= s.answerWith || 'term';
  let qs = [], k = 0, results = [], locked = false, cont = null;
  const top = () => studyTop(s, 'write', 'Write');

  function start(cards) {
    qs = (S.wShuffle === false ? cards : shuffle(cards)).map(c => orient(c, S.wAw)).filter(q => q.answer.text);
    k = 0; results = [];
    if (!qs.length) {
      app().innerHTML = `${top()}<div class="qcard center"><h2>Nothing to type here</h2><p>The answer side of these cards is only pictures. Change “Answer with” in the options, or try Learn or Match instead.</p></div>`;
      return;
    }
    next();
  }
  function next() {
    if (k >= qs.length) return end();
    const q = qs[k];
    locked = false; cont = null;
    const right = results.filter(r => r.ok).length;
    app().innerHTML = `${top()}
      <div class="trackbar"><span class="know">${right} correct</span><span class="count">${k + 1} / ${qs.length}</span><span style="color:var(--bad)">${results.length - right} incorrect</span></div>
      <div class="fbar"><span style="width:${(k / qs.length) * 100}%"></span></div>
      <div class="qcard"><div class="prompt">${sideHTML(q.prompt, 'big')}</div>
        <div class="qlabel">Type the ${q.ans === 'term' ? 'term' : 'definition'}</div>
        <form class="wform" id="wf"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the answer"><button class="btn primary">Answer</button></form>
        <button class="link" data-a="dunno">Don’t know?</button><div id="fb"></div></div>`;
    $('#ans').focus();
  }
  function check(v, dunno) {
    if (locked) return;
    locked = true;
    const q = qs[k];
    const g = dunno ? { ok: false } : grade(v, q.answer.text);
    $('#ans').disabled = true;
    results.push({ q, ok: g.ok, typed: v });
    record(id, q.card.id, g.ok);
    saveProg(id);
    const fb = $('#fb');
    if (g.ok) {
      fb.innerHTML = `<div class="fb good">${I('check')} ${g.typo ? `Correct, but watch the spelling: <b>${fmt(q.answer.text)}</b>` : 'Correct!'}</div>`;
      timers.push(setTimeout(() => { k++; next(); }, g.typo ? 2000 : 750));
      return;
    }
    fb.innerHTML = `<div class="fb bad">${dunno ? 'Here’s the answer:' : 'Not quite. The correct answer is:'}</div><div class="correct-ans">${sideHTML(q.answer)}</div>
      ${v ? `<div class="you-said">You said: <b>${esc(v)}</b></div>` : ''}${q.card.note ? `<div class="note">${fmt(q.card.note)}</div>` : ''}
      <div class="row gap wrap"><button class="btn primary" data-a="continue">Continue</button>${v ? '<button class="btn" data-a="override">Override: I was right</button>' : ''}</div>
      <div class="hint">Press any key to continue</div>`;
    cont = () => { k++; next(); };
  }
  function end() {
    const right = results.filter(r => r.ok).length;
    const missed = results.filter(r => !r.ok);
    cont = null;
    app().innerHTML = `${top()}<div class="qcard center"><div class="score">${Math.round((right / results.length) * 100)}%</div>
      <h2>${right} of ${results.length} correct</h2>
      ${missed.length ? `<div class="rsum">${missed.map(r => `<div class="rrow x"><span>${esc(r.q.prompt.text || '(picture)').slice(0, 90)}</span><em>${esc(r.q.answer.text).slice(0, 60)}</em></div>`).join('')}</div>` : '<p>Perfect round!</p>'}
      <div class="row gap center wrap">${missed.length ? `<button class="btn primary big" data-a="missed">Retry ${missed.length} missed</button>` : ''}<button class="btn big" data-a="again">Start over</button></div></div>`;
  }
  function settings() {
    modal(`<h2>Write options</h2><label class="field">Answer with<select id="waw">${awOpts(S.wAw)}</select></label>
      <label class="check"><input type="checkbox" id="wsh" ${S.wShuffle !== false ? 'checked' : ''}> Shuffle</label>
      <label class="check"><input type="checkbox" id="wst" ${S.starOnly ? 'checked' : ''}> Starred terms only</label>
      <div class="row gap end"><button class="btn" data-close>Cancel</button><button class="btn primary" id="wok">Apply and restart</button></div>`,
    (m, close) => { $('#wok', m).onclick = () => { S.wAw = $('#waw', m).value; S.wShuffle = $('#wsh', m).checked; S.starOnly = $('#wst', m).checked; saveProg(id); close(); start(cardsOf(s, S.starOnly)); }; });
  }

  app().onsubmit = e => { e.preventDefault(); const v = $('#ans').value; if (v.trim()) check(v); };
  app().onclick = e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'dunno') check('', true);
    if (a === 'continue' && cont) cont();
    if (a === 'override') {
      const r = results.at(-1); r.ok = true;
      const st = p.stats[r.q.card.id]; if (st) { st.w = Math.max(0, st.w - 1); st.c++; }
      saveProg(id); k++; next();
    }
    if (a === 'missed') start(results.filter(r => !r.ok).map(r => r.q.card));
    if (a === 'again') start(cardsOf(s, S.starOnly));
    if (a === 'settings') settings();
  };
  onKey = e => {
    if (cont && !['Shift', 'Alt', 'Meta', 'Control', 'Tab'].includes(e.key) && !e.metaKey) { e.preventDefault(); const c = cont; cont = null; c(); }
  };
  start(cardsOf(s, S.starOnly));
}

/* ================================================================ test */

function viewTest(id) {
  const s = getSet(id);
  if (!s) return;
  const p = prog(id);
  const S = p.settings;
  const cards = () => cardsOf(s, S.starOnly);
  S.tAw ||= s.answerWith || 'term';
  S.tTypes ||= { tf: true, mc: true, wr: true, mt: true };
  S.tN ||= Math.min(20, s.cards.length);
  let items = [], graded = false, t0 = 0;
  const top = () => studyTop(s, 'test', 'Test', false);

  function setup() {
    const n = cards().length;
    app().innerHTML = `${top()}<div class="qcard setup"><h2>Set up your test</h2>
      <label class="field">Number of questions (max ${n})<input type="number" id="tn" min="1" max="${n}" value="${Math.min(S.tN, n)}"></label>
      <label class="field">Answer with<select id="taw">${awOpts(S.tAw)}</select></label>
      <div class="field">Question types
        ${[['tf', 'True / False'], ['mc', 'Multiple choice'], ['wr', 'Written'], ['mt', 'Matching']].map(([k, l]) => `<label class="check"><input type="checkbox" data-t="${k}" ${S.tTypes[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div>
      <label class="check"><input type="checkbox" id="tst" ${S.starOnly ? 'checked' : ''}> Starred terms only</label>
      ${p.tests.length ? `<p class="muted small">Past scores: ${p.tests.slice(-6).map(t => t.pct + '%').join(' · ')}</p>` : ''}
      <button class="btn primary big" data-a="make">Start test</button></div>`;
  }

  function build() {
    const pool = cards();
    const picked = shuffle(pool).slice(0, Math.max(1, Math.min(S.tN, pool.length)));
    const types = ['tf', 'mc', 'wr', 'mt'].filter(t => S.tTypes[t]);
    const buckets = Object.fromEntries(types.map(t => [t, []]));
    picked.forEach((c, i) => buckets[types[i % types.length]].push(c));
    if (buckets.mt && buckets.mt.length < 2) { (buckets.mc ||= []).push(...buckets.mt); buckets.mt = []; }
    items = [];
    const toMC = [];
    for (const c of buckets.wr || []) {
      const q = orient(c, S.tAw);
      q.answer.text ? items.push({ kind: 'wr', q }) : toMC.push(c);
    }
    const wr = items.splice(0);
    const tf = (buckets.tf || []).map(c => {
      const q = orient(c, S.tAw);
      const others = pool.filter(o => o.id !== c.id && (side(o, q.ans).text || side(o, q.ans).img) && (side(o, q.ans).text !== q.answer.text || side(o, q.ans).img !== q.answer.img));
      const truth = !others.length || Math.random() < 0.5;
      return { kind: 'tf', q, truth, shown: truth ? q.answer : side(others[Math.floor(Math.random() * others.length)], q.ans) };
    });
    const mc = [...(buckets.mc || []), ...toMC].map(c => { const q = orient(c, S.tAw); return { kind: 'mc', q, choices: choicesFor(q, pool.length >= 4 ? pool : s.cards.filter(hasContent)) }; });
    const mtCards = buckets.mt || [];
    const groups = [];
    for (let i = 0; i < mtCards.length; i += 5) groups.push(mtCards.slice(i, i + 5));
    const lastG = groups.at(-1);
    if (lastG && lastG.length === 1 && groups.length > 1) groups[groups.length - 2].push(...groups.pop());
    const aw = S.tAw === 'both' ? 'term' : S.tAw;
    const mt = groups.map(g => { const qs = g.map(c => orient(c, aw)); return { kind: 'mtg', qs, bank: shuffle(qs.map((q, i) => ({ s: q.answer, i }))) }; });
    items = [...tf, ...mc, ...wr, ...mt];
  }

  function renderTest() {
    let n = 0;
    const total = items.reduce((a, it) => a + (it.kind === 'mtg' ? it.qs.length : 1), 0);
    const sec = (kind, title, fn) => {
      const list = items.filter(it => it.kind === kind);
      if (!list.length) return '';
      const count = list.reduce((a, it) => a + (it.kind === 'mtg' ? it.qs.length : 1), 0);
      return `<section class="tsec"><h3>${title} <span>${count} question${count === 1 ? '' : 's'}</span></h3>${list.map(fn).join('')}</section>`;
    };
    const html = [
      sec('tf', 'True or false', it => { it.n = ++n; return `<div class="tq" id="q${it.n}"><div class="tqn">${it.n} of ${total}</div>
        <div class="tfgrid"><div>${sideHTML(it.q.prompt)}</div><div>${sideHTML(it.shown)}</div></div>
        <div class="opts">${[['1', 'True'], ['0', 'False']].map(([v, l]) => `<label class="opt"><input type="radio" name="q${it.n}" value="${v}"> ${l}</label>`).join('')}</div></div>`; }),
      sec('mc', 'Multiple choice', it => { it.n = ++n; return `<div class="tq" id="q${it.n}"><div class="tqn">${it.n} of ${total}</div>${sideHTML(it.q.prompt)}
        <div class="qlabel" style="margin-top:14px">Choose the matching ${it.q.ans === 'term' ? 'term' : 'definition'}</div>
        <div class="opts">${it.choices.map((ch, k) => `<label class="opt"><input type="radio" name="q${it.n}" value="${k}">${sideHTML(ch.s, 'small')}</label>`).join('')}</div></div>`; }),
      sec('wr', 'Written', it => { it.n = ++n; return `<div class="tq" id="q${it.n}"><div class="tqn">${it.n} of ${total}</div>${sideHTML(it.q.prompt)}
        <div class="qlabel" style="margin-top:14px">Your answer</div><input type="text" name="q${it.n}" autocomplete="off" spellcheck="false" placeholder="Type the ${it.q.ans === 'term' ? 'term' : 'definition'}" style="width:100%"></div>`; }),
      sec('mtg', 'Matching', it => { it.ns = it.qs.map(() => ++n); return `<div class="tq"><div class="tqn">Questions ${it.ns[0]}–${it.ns.at(-1)}: pick the letter that matches each one</div>
        <div class="mtwrap"><div>${it.qs.map((q, k) => `<div class="mt-row" id="q${it.ns[k]}"><select name="q${it.ns[k]}"><option value="">–</option>${it.bank.map((_, li) => `<option value="${li}">${LETTERS[li]}</option>`).join('')}</select>${sideHTML(q.prompt, 'small')}</div>`).join('')}</div>
        <div>${it.bank.map((b, li) => `<div class="bank"><b>${LETTERS[li]}</b>${sideHTML(b.s, 'small')}</div>`).join('')}</div></div></div>`; }),
    ].join('');
    app().innerHTML = `${top()}<div id="tres"></div><div id="tbody">${html}</div>
      <div class="qcard center" id="tsubmit"><h2>All done?</h2><button class="btn primary big" data-a="submit">Submit test</button></div>`;
    t0 = Date.now();
    graded = false;
  }

  const val = n => { const el = $(`[name="q${n}"]:checked`) || $(`[name="q${n}"]`); return el && (el.type === 'radio' ? (el.checked ? el.value : '') : el.value); };

  async function submit() {
    const total = items.reduce((a, it) => a + (it.kind === 'mtg' ? it.qs.length : 1), 0);
    let answered = 0;
    items.forEach(it => (it.kind === 'mtg' ? it.ns : [it.n]).forEach(n => { if ((val(n) || '').trim()) answered++; }));
    if (answered < total && !(await confirmBox(`You answered ${answered} of ${total} questions. Submit anyway?`, 'Submit'))) return;
    let right = 0;
    const mark = (el, ok) => { el.classList.add(ok ? 'right' : 'wrong'); if (ok) right++; };
    for (const it of items) {
      if (it.kind === 'tf') {
        const v = val(it.n);
        const ok = v !== '' && (v === '1') === it.truth;
        mark($('#q' + it.n), ok);
        record(id, it.q.card.id, ok);
        if (!ok) $('#q' + it.n).insertAdjacentHTML('beforeend', `<div class="reveal"><b>${it.truth ? 'True' : 'False'}.</b> ${it.truth ? '' : 'The correct answer is:'}${it.truth ? '' : sideHTML(it.q.answer)}</div>`);
      }
      if (it.kind === 'mc') {
        const v = val(it.n);
        const ok = v !== '' && it.choices[+v]?.correct;
        mark($('#q' + it.n), ok);
        record(id, it.q.card.id, ok);
        $$(`#q${it.n} .opt`).forEach((o, k) => { if (it.choices[k].correct) o.classList.add('right'); else if (String(k) === v) o.classList.add('wrong'); });
      }
      if (it.kind === 'wr') {
        const v = val(it.n);
        const g = grade(v, it.q.answer.text);
        mark($('#q' + it.n), g.ok);
        record(id, it.q.card.id, g.ok);
        if (!g.ok || g.typo) $('#q' + it.n).insertAdjacentHTML('beforeend', `<div class="reveal">${g.ok ? 'Correct (small typo). ' : ''}Correct answer:${sideHTML(it.q.answer)}</div>`);
      }
      if (it.kind === 'mtg') {
        it.qs.forEach((q, k) => {
          const v = val(it.ns[k]);
          const ok = v !== '' && it.bank[+v].i === k;
          const row = $('#q' + it.ns[k]);
          mark(row, ok);
          record(id, q.card.id, ok);
          if (!ok) row.insertAdjacentHTML('beforeend', `<span class="fix">→ ${LETTERS[it.bank.findIndex(b => b.i === k)]}</span>`);
        });
      }
    }
    $$('#tbody input, #tbody select').forEach(el => (el.disabled = true));
    const pct = Math.round((right / total) * 100);
    p.tests.push({ t: Date.now(), pct, n: total });
    p.tests = p.tests.slice(-30);
    saveProg(id);
    graded = true;
    const mins = Math.max(1, Math.round((Date.now() - t0) / 60000));
    $('#tres').innerHTML = `<div class="qcard"><div class="resultbar"><div class="score">${pct}%</div><div><h2>${pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Nice work!' : 'Keep practicing!'}</h2>
      <div class="muted">${right} correct · ${total - right} incorrect · about ${mins} min</div></div></div>
      <div class="row gap wrap" style="margin-top:16px"><button class="btn primary" data-a="retake">New test</button><a class="btn" href="#/learn/${s.id}">Study with Learn</a><button class="btn" data-a="settings">Change options</button></div></div>`;
    $('#tsubmit').remove();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  app().onclick = e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'make') {
      S.tN = Math.max(1, +$('#tn').value || 10);
      S.tAw = $('#taw').value;
      S.starOnly = $('#tst').checked;
      $$('[data-t]').forEach(x => (S.tTypes[x.dataset.t] = x.checked));
      if (!Object.values(S.tTypes).some(Boolean)) return toast('Pick at least one question type');
      saveProg(id); build(); renderTest();
    }
    if (a === 'submit' && !graded) submit();
    if (a === 'retake') { build(); renderTest(); window.scrollTo(0, 0); }
    if (a === 'settings') setup();
  };
  setup();
}

/* ================================================================ match */

function viewMatch(id) {
  const s = getSet(id);
  if (!s) return;
  const p = prog(id);
  const S = p.settings;
  S.mN ||= 6;
  let tiles = [], sel = null, t0 = 0, penalty = 0, left = 0, clock = null, busy = false;
  const top = () => studyTop(s, 'match', 'Match', false);
  const best = () => (p.match.length ? Math.min(...p.match.map(x => x.t)) : 0);
  const secs = ms => (ms / 1000).toFixed(1) + 's';

  function intro() {
    const n = cardsOf(s, S.starOnly).length;
    app().innerHTML = `${top()}<div class="qcard center"><h2>Ready to play?</h2>
      <p>Match every term with its definition as fast as you can.<br>A wrong match adds 1 second to your time.</p>
      ${best() ? `<p class="muted">Your best time: <b>${secs(best())}</b></p>` : ''}
      <div class="row gap center wrap" style="margin:18px 0">
        <label class="field inline">Pairs <select id="mn">${[4, 6, 8, 10].filter(k => k <= Math.max(4, n)).map(k => `<option ${S.mN == k ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" id="mst" ${S.starOnly ? 'checked' : ''}> Starred only</label></div>
      <button class="btn primary big" data-a="go">Start game</button></div>`;
  }
  function go() {
    S.mN = +($('#mn')?.value || S.mN);
    S.starOnly = $('#mst')?.checked ?? S.starOnly;
    saveProg(id);
    const pool = shuffle(cardsOf(s, S.starOnly)).slice(0, S.mN);
    if (pool.length < 2) return toast('You need at least 2 cards to play');
    tiles = shuffle(pool.flatMap(c => [{ id: c.id, s: side(c, 'term'), k: 't' }, { id: c.id, s: side(c, 'def'), k: 'd' }]));
    sel = null; penalty = 0; left = pool.length; busy = false;
    app().innerHTML = `${top()}<div class="match-top"><span class="timer" id="tm">0.0s</span><span class="muted" id="left">${left} pairs left</span><button class="btn" data-a="quit">Quit</button></div>
      <div class="mgrid">${tiles.map((t, k) => `<button class="mtile" data-a="tile" data-k="${k}">${sideHTML(t.s, 'small')}</button>`).join('')}</div>`;
    t0 = performance.now();
    clock = setInterval(() => { const el = $('#tm'); if (el) el.textContent = secs(performance.now() - t0 + penalty); }, 100);
    timers.push(clock);
  }
  function tap(k) {
    if (busy) return;
    const el = $(`.mtile[data-k="${k}"]`);
    if (sel === null) { sel = k; el.classList.add('sel'); return; }
    if (sel === k) { sel = null; el.classList.remove('sel'); return; }
    const a = tiles[sel], b = tiles[k];
    const other = $(`.mtile[data-k="${sel}"]`);
    const same = a.k !== b.k && (a.id === b.id || (a.s.text && a.s.text === side(s.cards.find(c => c.id === b.id), a.k === 't' ? 'term' : 'def').text));
    if (same) {
      record(id, a.id, true);
      [el, other].forEach(x => { x.classList.remove('sel'); x.classList.add('good'); });
      setTimeout(() => [el, other].forEach(x => x.classList.add('gone')), 180);
      sel = null;
      left--;
      $('#left').textContent = `${left} pairs left`;
      if (!left) setTimeout(end, 260);
    } else {
      penalty += 1000;
      record(id, a.id, false);
      busy = true;
      [el, other].forEach(x => { x.classList.remove('sel'); x.classList.add('bad'); });
      setTimeout(() => { [el, other].forEach(x => x.classList.remove('bad')); busy = false; }, 450);
      sel = null;
      toast('+1 second');
    }
  }
  function end() {
    clearInterval(clock);
    const t = Math.round(performance.now() - t0 + penalty);
    const prevBest = best();
    p.match.push({ t, d: Date.now(), n: tiles.length / 2 });
    p.match = p.match.slice(-40);
    saveProg(id);
    const recent = [...p.match].sort((x, y) => x.t - y.t).slice(0, 5);
    app().innerHTML = `${top()}<div class="qcard center"><div class="score">${secs(t)}</div>
      <h2>${!prevBest || t < prevBest ? 'New personal best!' : 'Nice matching!'}</h2>
      ${penalty ? `<p class="muted">Includes ${penalty / 1000}s of penalties</p>` : ''}
      <div class="rsum">${recent.map((r, i) => `<div class="rrow ${r.d === p.match.at(-1).d ? 'm' : ''}"><span>#${i + 1} · ${r.n} pairs · ${new Date(r.d).toLocaleDateString()}</span><em>${secs(r.t)}</em></div>`).join('')}</div>
      <div class="row gap center"><button class="btn primary big" data-a="go">Play again</button><button class="btn big" data-a="intro">Options</button></div></div>`;
  }

  app().onclick = e => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'go') go();
    if (a === 'intro' || a === 'quit') { clearInterval(clock); intro(); }
    if (a === 'tile') tap(+b.dataset.k);
  };
  intro();
}

/* ================================================================ picture ID (class → exact kind) */

const CLASS_ORDER = ['Carbohydrate', 'Lipid', 'Protein', 'Nucleic acid', 'Functional group'];

function viewPid(id) {
  const s = getSet(id);
  if (!s) return;
  const p = prog(id);
  const S = p.settings;
  S.pN ||= 20;
  S.pGroups ??= true;
  p.pid ||= [];
  const tagged = s.cards.filter(c => c.cls && c.termImg);
  const P = { q1: 'What kind of molecule is this?', q2: cl => `Which ${cl === 'Functional group' ? 'group' : esc(cl.toLowerCase())} is it exactly?`, intro: 'pick which kind of molecule it is', yes: cl => `Yes, it’s a ${esc(cl.toLowerCase())}.`, no: cl => `It’s actually a ${esc(cl.toLowerCase())}.`, k1: 'Kind of molecule', groups: true, order: CLASS_ORDER, ...(s.pid && { q1: s.pid.q1, q2: () => esc(s.pid.q2), intro: esc(s.pid.intro), yes: cl => `Yes: ${esc(cl)}.`, no: cl => `Answer: ${esc(cl)}.`, k1: esc(s.pid.k1), groups: false, order: s.pid.order || [] }) };
  const classesAll = P.order.filter(k => tagged.some(c => c.cls === k)).concat([...new Set(tagged.map(c => c.cls))].filter(k => !P.order.includes(k)));
  const namesOf = cls => [...new Set(tagged.filter(c => c.cls === cls).map(c => c.name))];
  let qs = [], k = 0, res = [], stage = 0, cont = null, classes = classesAll;
  const top = () => studyTop(s, 'zoom', 'Picture ID test', false);

  function setup() {
    const n = tagged.filter(c => S.pGroups || c.cls !== 'Functional group').length;
    app().innerHTML = `${top()}<div class="qcard setup"><h2>Picture ID test</h2>
      <p>You’ll see a structure. <b>Step 1:</b> ${P.intro}. <b>Step 2:</b> pick exactly what it is. After each one you get the clue that gives it away.</p>
      <label class="field">Number of pictures<select id="pn">${[10, 20, 30, n].filter((v, i, a) => v <= n && a.indexOf(v) === i).map(v => `<option value="${v}" ${S.pN === v ? 'selected' : ''}>${v === n ? `All ${n}` : v}</option>`).join('')}</select></label>
      ${P.groups ? `<label class="check"><input type="checkbox" id="pg" ${S.pGroups ? 'checked' : ''}> Include functional groups (like −OH, −COOH, phosphate)</label>` : ''}
      ${p.pid.length ? `<p class="muted small">Past scores: ${p.pid.slice(-6).map(t => t.pct + '%').join(' · ')}</p>` : ''}
      <button class="btn primary big" data-a="start">Start</button></div>`;
  }
  function start(cards) {
    classes = classesAll.filter(c => S.pGroups || c !== 'Functional group');
    qs = shuffle(cards);
    k = 0; res = [];
    ask();
  }
  function head() {
    const right = res.filter(r => r.c1 && r.c2).length;
    return `<div class="trackbar"><span class="know">${right} fully right</span><span class="count">${k + 1} / ${qs.length}</span><span style="color:var(--bad)">${res.length - right} missed</span></div>
      <div class="fbar"><span style="width:${(k / qs.length) * 100}%"></span></div>`;
  }
  function ask() {
    if (k >= qs.length) return end();
    const c = qs[k];
    stage = 1; cont = null;
    app().innerHTML = `${top()}${head()}<div class="qcard">
      <div class="prompt">${sideHTML({ img: c.termImg }, 'big')}</div>
      <div class="qlabel">Step 1 · ${P.q1}</div>
      <div class="choices" id="c1">${classes.map((cl, i) => `<button class="choice" data-a="c1" data-v="${esc(cl)}"><span class="key">${i + 1}</span><div class="sc small"><div class="t">${esc(cl)}</div></div></button>`).join('')}</div>
      <div id="step2"></div><div id="fb"></div></div>`;
  }
  function pickClass(v) {
    if (stage !== 1) return;
    const c = qs[k];
    const ok = v === c.cls;
    $$('#c1 .choice').forEach(b => { b.disabled = true; if (b.dataset.v === c.cls) b.classList.add('right'); else if (b.dataset.v === v) b.classList.add('wrong'); });
    res.push({ c, c1: ok, c2: false });
    stage = 2;
    const names = namesOf(c.cls);
    $('#step2').innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}">${ok ? `${I('check')} ${P.yes(c.cls)}` : P.no(c.cls)}</div>
      <div class="qlabel" style="margin-top:16px">Step 2 · ${P.q2(c.cls)}</div>
      <div class="choices" id="c2">${names.map((n, i) => `<button class="choice" data-a="c2" data-v="${esc(n)}"><span class="key">${i + 1}</span><div class="sc small"><div class="t">${esc(n)}</div></div></button>`).join('')}</div>`;
    if (names.length === 1) pickName(names[0]);
  }
  function pickName(v) {
    if (stage !== 2) return;
    const c = qs[k];
    const r = res.at(-1);
    r.c2 = v === c.name;
    $$('#c2 .choice').forEach(b => { b.disabled = true; if (b.dataset.v === c.name) b.classList.add('right'); else if (b.dataset.v === v) b.classList.add('wrong'); });
    record(id, c.id, r.c1 && r.c2);
    saveProg(id);
    stage = 3;
    $('#fb').innerHTML = `<div class="fb ${r.c2 ? 'good' : 'bad'}">${r.c2 ? I('check') + ' Correct: ' : 'Answer: '}${esc(c.name)} · ${esc(c.detail || '')}</div>
      <div class="note"><b>How to tell:</b> ${fmt((c.note || '').replace(/^This one: [^.]*\.\s*/, ''))}</div>
      <div class="row gap" style="margin-top:14px"><button class="btn primary" data-a="next">${k + 1 < qs.length ? 'Next picture' : 'See results'}</button></div>
      <div class="hint">Press Enter to continue</div>`;
    cont = () => { k++; ask(); };
    $('#fb').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function end() {
    cont = null;
    const n = res.length;
    const both = res.filter(r => r.c1 && r.c2).length;
    const c1 = res.filter(r => r.c1).length;
    const c2 = res.filter(r => r.c2).length;
    const pct = Math.round(((c1 + c2) / (2 * n)) * 100);
    p.pid.push({ t: Date.now(), pct, n });
    p.pid = p.pid.slice(-30);
    saveProg(id);
    const by = classes.map(cl => { const rs = res.filter(r => r.c.cls === cl); return rs.length ? `<div class="rrow ${rs.every(r => r.c1 && r.c2) ? 'm' : 'l'}"><span>${esc(cl)}</span><em>${rs.filter(r => r.c1 && r.c2).length} / ${rs.length}</em></div>` : ''; }).join('');
    const missed = res.filter(r => !(r.c1 && r.c2));
    app().innerHTML = `${top()}<div class="qcard center"><div class="score">${pct}%</div>
      <h2>${both} of ${n} pictures fully right</h2>
      <p class="muted">${P.k1}: ${c1}/${n} · Exact name: ${c2}/${n}</p>
      <h3>By class</h3><div class="rsum">${by}</div>
      ${missed.length ? `<h3>Missed (${missed.length})</h3><div class="pidmiss">${missed.map(r => `<div class="pm"><img src="${esc(r.c.termImg)}" alt=""><div><b>${esc(r.c.name)}</b> (${esc(P.groups ? r.c.cls.toLowerCase() : r.c.cls)})<br><span class="muted small">${esc(r.c.detail || '')}</span></div></div>`).join('')}</div>` : '<p>Perfect! You can identify every one.</p>'}
      <div class="row gap center wrap" style="margin-top:18px">${missed.length ? `<button class="btn primary big" data-a="missed">Retry ${missed.length} missed</button>` : ''}<button class="btn big" data-a="again">New test</button><button class="btn big" data-a="setup">Options</button></div></div>`;
  }

  app().onclick = e => {
    const b = e.target.closest('[data-a]');
    if (!b) { const im = e.target.closest('.pm img, .prompt img'); if (im) lightbox(im.src); return; }
    const a = b.dataset.a;
    if (a === 'start') {
      S.pN = +$('#pn').value;
      if ($('#pg')) S.pGroups = $('#pg').checked;
      saveProg(id);
      start(shuffle(tagged.filter(c => S.pGroups || c.cls !== 'Functional group')).slice(0, S.pN));
    }
    if (a === 'c1') pickClass(b.dataset.v);
    if (a === 'c2') pickName(b.dataset.v);
    if (a === 'next' && cont) cont();
    if (a === 'missed') start(res.filter(r => !(r.c1 && r.c2)).map(r => r.c));
    if (a === 'again') start(shuffle(tagged.filter(c => S.pGroups || c.cls !== 'Functional group')).slice(0, S.pN));
    if (a === 'setup') setup();
  };
  onKey = e => {
    if (stage === 3 && cont && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const c = cont; cont = null; c(); return; }
    if (!/^[1-9]$/.test(e.key)) return;
    const list = $$(stage === 1 ? '#c1 .choice' : stage === 2 ? '#c2 .choice' : '.none');
    const btn = list[+e.key - 1];
    if (btn && !btn.disabled) btn.click();
  };
  if (!tagged.length) {
    app().innerHTML = `${top()}<div class="qcard center"><p>This set has no tagged pictures. Picture ID works with the “Picture ID — Which Macromolecule Is It?” set.</p></div>`;
    return;
  }
  setup();
}

/* ================================================================ multiple-choice sets */

function mcqHTML(qn, n, total, opts = {}) {
  return `<div class="tq" id="mq${n}"><div class="tqn">Question ${n} of ${total}</div>
    ${qn.img ? `<div class="qimg"><img src="${esc(qn.img)}" alt=""></div>` : ''}
    <div class="qstem">${qn.stem}</div>
    <div class="mcopts">${qn.choices.map((c, k) => opts.radio
      ? `<label class="opt"><input type="radio" name="mq${n}" value="${k}"><span class="letter">${LETTERS[k]}</span><span>${esc(c)}</span></label>`
      : `<button class="choice" data-a="ans" data-k="${k}"><span class="key">${LETTERS[k]}</span><span>${esc(c)}</span></button>`).join('')}</div>
    ${qn.source ? `<div class="fsrc">Source: ${esc(qn.source)}</div>` : ''}</div>`;
}

const isFrq = qn => qn.type === 'frq';
const htmlText = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
const partPts = p => p.pts || 1;
const qPts = qn => (isFrq(qn) ? qn.parts.reduce((n, p) => n + partPts(p), 0) : 1);
const partLabel = (p, j) => p.label || `(${LETTERS[j].toLowerCase()})`;
function qCount(s) {
  const f = s.questions.filter(isFrq).length, m = s.questions.length - f;
  return [m && `${m} multiple-choice`, f && `${f} free-response`].filter(Boolean).join(' · ') + ' questions';
}

function frqHTML(qn, n, total, opts = {}) {
  return `<div class="tq frq" id="mq${n}"><div class="tqn">Question ${n} of ${total} · Free response · ${qPts(qn)} points</div>
    ${qn.img ? `<div class="qimg"><img src="${esc(qn.img)}" alt=""></div>` : ''}
    <div class="qstem">${qn.stem}</div>
    ${qn.parts.map((p, j) => `<div class="fpart" data-p="${j}"><div class="fq"><b>${partLabel(p, j)}</b> ${p.q} <span class="muted">[${partPts(p)} pt${partPts(p) > 1 ? 's' : ''}]</span></div>
      <textarea class="fwork" rows="3" placeholder="Write your work here (or on paper), then check it"></textarea>
      ${opts.exam ? '' : `<button class="btn" data-a="sol" data-p="${j}">Show solution</button>`}
      <div class="fsol"></div></div>`).join('')}
    ${qn.source ? `<div class="fsrc">Source: ${esc(qn.source)}</div>` : ''}</div>`;
}

function frqSol(box, qn, j, pick) {
  const p = qn.parts[j], max = partPts(p), part = $(`.fpart[data-p="${j}"]`, box);
  $('[data-a=sol]', part)?.remove();
  $('.fsol', part).innerHTML = `<div class="reveal"><b>Solution:</b> ${p.sol}</div>
    <div class="selfrow"><span class="muted">Score yourself:</span>${Array.from({ length: max + 1 }, (_, v) => max - v).map(v => `<button class="btn ${pick === v ? 'primary' : ''}" data-a="self" data-p="${j}" data-v="${v}">${v} / ${max}</button>`).join('')}</div>`;
}

function viewMcqSet(s) {
  const p = prog(s.id);
  p.quiz ||= [];
  const best = p.quiz.length ? Math.max(...p.quiz.map(x => x.pct)) : null;
  const lessons = new Map();
  for (const qn of s.questions) { const l = (qn.stem.match(/Lesson (\d+\.\d+)/) || [])[1]; if (l) lessons.set(l, [...(lessons.get(l) || []), qn.id]); }
  const byLesson = lessons.size > 1 ? [...lessons].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])) : [];
  app().innerHTML = `
  <a class="crumb" href="#/">${I('back')} Library</a>
  <div class="set-head"><div><h1>${esc(s.title)}</h1><div class="muted">${qCount(s)}${s.folder ? ` · ${esc(s.folder)}` : ''}</div>${s.description ? `<p>${fmt(s.description)}</p>` : ''}</div>
    <div class="row gap wrap"><button class="btn" data-a="json">${I('download')} Export</button><button class="btn" data-a="reset">${I('restart')} Reset scores</button><button class="btn danger" data-a="del">${I('trash')}</button></div></div>
  <div class="modes">
    <a class="mode" href="#/mcq/${s.id}/practice">${I('learn')}<span>Practice<br><small class="muted">feedback after each question</small></span></a>
    <a class="mode" href="#/mcq/${s.id}/exam">${I('test')}<span>Exam mode<br><small class="muted">graded at the end</small></span></a>
  </div>
  ${byLesson.length ? `<div class="row gap wrap" style="align-items:center;margin:4px 0 18px"><b>Practice one lesson:</b>${byLesson.map(([l, ids]) => `<button class="btn" data-a="lesson" data-l="${l}">${l} <small class="muted">(${ids.length})</small></button>`).join('')}</div>` : ''}
  <div class="progress-row">
    <div class="pstat"><b>${s.questions.length}</b>Questions</div>
    ${best !== null ? `<div class="pstat mastered"><b>${best}%</b>Best score</div><div class="pstat"><b>${p.quiz.at(-1).pct}%</b>Last score</div>` : ''}
  </div>
  <div class="list-head"><h2>All questions</h2><label class="check"><input type="checkbox" id="showans"> Show answers</label></div>
  <div id="qlist">${s.questions.map((qn, i) => `<div class="tq">${`<div class="tqn">${i + 1}.${isFrq(qn) ? ` Free response · ${qPts(qn)} points` : ''}</div>`}${qn.img ? `<div class="qimg"><img src="${esc(qn.img)}" alt=""></div>` : ''}<div class="qstem">${qn.stem}</div>
    ${isFrq(qn)
      ? qn.parts.map((p, j) => `<div class="fq"><b>${partLabel(p, j)}</b> ${p.q}</div><div class="why hidden-ans">${p.sol}</div>`).join('') + (qn.source ? `<div class="fsrc">Source: ${esc(qn.source)}</div>` : '')
      : `<ol class="plain" type="A">${qn.choices.map((c, k) => `<li class="${k === qn.answer ? 'isans' : ''}">${esc(c)}</li>`).join('')}</ol><div class="why hidden-ans">${esc(qn.why)}${qn.whyImg ? `<div class="qimg whyimg"><img src="${esc(qn.whyImg)}" alt=""></div>` : ''}</div>`}</div>`).join('')}</div>`;
  app().onchange = e => { if (e.target.id === 'showans') $('#qlist').classList.toggle('reveal-all', e.target.checked); };
  app().onclick = async e => {
    const im = e.target.closest('.qimg img');
    if (im) return lightbox(im.src);
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'lesson') { sessionStorage.scRetry = JSON.stringify(lessons.get(e.target.closest('[data-l]').dataset.l)); location.hash = `#/mcq/${s.id}/practice`; }
    if (a === 'json') download(s.title.replace(/[^\w\- ]+/g, '') + '.json', JSON.stringify({ app: 'studycards', v: 1, sets: [s] }));
    if (a === 'reset' && (await confirmBox('Clear all scores for this set?', 'Reset'))) { p.quiz = []; saveProg(s.id); viewMcqSet(s); }
    if (a === 'del' && (await confirmBox(`Delete “${esc(s.title)}”?`))) { await Store.del('sets', s.id); SETS.delete(s.id); toast('Deleted'); location.hash = '#/'; }
  };
}

function viewMcq(id, mode) {
  const s = getSet(id);
  if (!s) return;
  if (s.kind !== 'mcq') return viewSet(id);
  const p = prog(id);
  const S = p.settings;
  p.quiz ||= [];
  let qs = [], k = 0, res = [], locked = false, cont = null;
  const top = () => studyTop(s, mode === 'exam' ? 'test' : 'learn', mode === 'exam' ? 'Exam mode' : 'Practice', false);
  const pool = () => (S.qShuffle ? shuffle(s.questions) : [...s.questions]);

  const hasF = s.questions.some(isFrq);
  const sum = (a, f) => a.reduce((n, x) => n + f(x), 0);
  const qHTML = (qn, n, total, opts) => (isFrq(qn) ? frqHTML(qn, n, total, opts) : mcqHTML(qn, n, total, opts));

  function save(got, max) {
    const entry = { t: Date.now(), pct: Math.round((got / max) * 100), n: qs.length, mode };
    p.quiz.push(entry);
    p.quiz = p.quiz.slice(-40);
    saveProg(id);
    return entry;
  }

  // ---------- practice: one at a time, instant feedback
  let fs = [];
  function start(list) { qs = list; k = 0; res = []; ask(); }
  function ask() {
    if (k >= qs.length) return end();
    locked = false; cont = null;
    const qn = qs[k];
    fs = isFrq(qn) ? qn.parts.map(() => null) : [];
    const got = sum(res, r => r.got), lost = sum(res, r => r.max - r.got);
    app().innerHTML = `${top()}
      <div class="trackbar"><span class="know">${got} ${hasF ? 'pts earned' : 'correct'}</span><span class="count">${k + 1} / ${qs.length}</span><span style="color:var(--bad)">${lost} ${hasF ? 'pts missed' : 'incorrect'}</span></div>
      <div class="fbar"><span style="width:${(k / qs.length) * 100}%"></span></div>
      <div class="qcard">${qHTML(qn, k + 1, qs.length)}<div id="fb"></div></div>
      <div class="row gap wrap" style="margin-top:12px"><label class="check"><input type="checkbox" id="qsh" ${S.qShuffle ? 'checked' : ''}> Shuffle order next time</label></div>`;
  }
  function answer(i) {
    if (locked) return;
    locked = true;
    const qn = qs[k];
    const ok = i === qn.answer;
    res[k] = { got: ok ? 1 : 0, max: 1 };
    $$('.choice').forEach((b, j) => { b.disabled = true; if (j === qn.answer) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
    $('#fb').innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}">${ok ? I('check') + ' Correct!' : `Not quite. The answer is ${LETTERS[qn.answer]}.`}</div>
      <div class="note"><b>Why:</b> ${esc(qn.why)}${qn.whyImg ? `<div class="qimg whyimg"><img src="${esc(qn.whyImg)}" alt=""></div>` : ''}</div>
      <div class="row gap" style="margin-top:14px"><button class="btn primary" data-a="next">${k + 1 < qs.length ? 'Next question' : 'See results'}</button></div><div class="hint">Press Enter to continue</div>`;
    cont = () => { k++; ask(); };
    $('#fb').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function selfScore(j, v) {
    const qn = qs[k];
    fs[j] = v;
    frqSol($('#mq' + (k + 1)), qn, j, v);
    if (fs.some(x => x === null)) return;
    const got = sum(fs, x => x), max = qPts(qn);
    res[k] = { got, max };
    $('#fb').innerHTML = `<div class="fb ${got === max ? 'good' : 'bad'}">${got === max ? I('check') + ' ' : ''}You gave yourself ${got} of ${max} points.</div>
      <div class="row gap" style="margin-top:14px"><button class="btn primary" data-a="next">${k + 1 < qs.length ? 'Next question' : 'See results'}</button></div><div class="hint">You can still change a part's score before moving on.</div>`;
    cont = () => { k++; ask(); };
  }
  function end() {
    cont = null;
    const got = sum(res, r => r.got), max = sum(res, r => r.max);
    const { pct } = save(got, max);
    const missed = qs.filter((_, i) => res[i].got < res[i].max);
    app().innerHTML = `${top()}<div class="qcard center"><div class="score">${pct}%</div><h2>${hasF ? `${got} of ${max} points` : `${got} of ${qs.length} correct`}</h2>
      ${missed.length ? `<div class="rsum">${missed.map(qn => { const r = res[qs.indexOf(qn)]; return `<div class="rrow x"><span>${esc(htmlText(qn.stem).slice(0, 110))}…</span><em>${isFrq(qn) ? `${r.got}/${r.max}` : LETTERS[qn.answer]}</em></div>`; }).join('')}</div>` : '<p>Perfect score!</p>'}
      <div class="row gap center wrap">${missed.length ? `<button class="btn primary big" data-a="missed">Retry ${missed.length} missed</button>` : ''}<button class="btn big" data-a="again">Start over</button><a class="btn big" href="#/mcq/${s.id}/exam">Try exam mode</a></div></div>`;
    retry = missed;
  }
  let retry = [];

  // ---------- exam: all questions, graded at the end (free response is self-graded after submitting)
  let picks = [], efs = [], entry = null;
  function exam() {
    qs = pool();
    entry = null;
    const nf = qs.filter(isFrq).length;
    app().innerHTML = `${top()}<div id="tres"></div>
      <div class="row gap wrap" style="justify-content:space-between"><span class="muted">${qs.length} questions · answer them all, then submit${nf ? ' · free-response solutions appear after you submit' : ''}</span><label class="check"><input type="checkbox" id="qsh" ${S.qShuffle ? 'checked' : ''}> Shuffle order</label></div>
      <div id="tbody">${qs.map((qn, i) => qHTML(qn, i + 1, qs.length, { radio: true, exam: true })).join('')}</div>
      <div class="qcard center" id="tsubmit"><h2>All done?</h2><p class="muted" id="answered"></p><button class="btn primary big" data-a="submit">Submit and grade</button></div>`;
  }
  async function submit() {
    picks = qs.map((qn, i) => { if (isFrq(qn)) return null; const r = $(`input[name="mq${i + 1}"]:checked`); return r ? +r.value : -1; });
    const blank = picks.filter(x => x === -1).length;
    if (blank && !(await confirmBox(`${blank} multiple-choice question${blank === 1 ? ' is' : 's are'} unanswered. Submit anyway?`, 'Submit'))) return;
    efs = qs.map(qn => (isFrq(qn) ? qn.parts.map(() => null) : null));
    qs.forEach((qn, i) => {
      const box = $('#mq' + (i + 1));
      if (isFrq(qn)) { qn.parts.forEach((_, j) => frqSol(box, qn, j, null)); return; }
      const ok = picks[i] === qn.answer;
      box.classList.add(ok ? 'right' : 'wrong');
      $$('.opt', box).forEach((o, j) => { if (j === qn.answer) o.classList.add('right'); else if (j === picks[i]) o.classList.add('wrong'); });
      box.insertAdjacentHTML('beforeend', `<div class="reveal"><b>${ok ? 'Correct.' : `Answer: ${LETTERS[qn.answer]}.`}</b> ${esc(qn.why)}${qn.whyImg ? `<div class="qimg whyimg"><img src="${esc(qn.whyImg)}" alt=""></div>` : ''}</div>`);
    });
    $$('#tbody input').forEach(x => (x.disabled = true));
    $('#tsubmit').remove();
    grade();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function grade() {
    const mGot = qs.filter((qn, i) => !isFrq(qn) && picks[i] === qn.answer).length;
    const mMax = qs.filter(qn => !isFrq(qn)).length;
    const fGot = sum(efs.filter(Boolean), a => sum(a, x => x || 0));
    const fMax = sum(qs.filter(isFrq), qPts);
    const todo = sum(efs.filter(Boolean), a => a.filter(x => x === null).length);
    const got = mGot + fGot, max = mMax + fMax;
    if (!entry) entry = save(got, max);
    else { entry.pct = Math.round((got / max) * 100); saveProg(id); }
    retry = qs.filter((qn, i) => (isFrq(qn) ? sum(efs[i], x => x || 0) < qPts(qn) : picks[i] !== qn.answer));
    $('#tres').innerHTML = `<div class="qcard"><div class="resultbar"><div class="score">${entry.pct}%</div><div><h2>${hasF ? `${got} of ${max} points` : `${got} of ${qs.length} correct`}</h2>
      <div class="muted">${hasF ? `Multiple choice: ${mGot} / ${mMax} · Free response: ${fGot} / ${fMax}${todo ? ` · <b>${todo} free-response part${todo === 1 ? '' : 's'} still to score</b>: scroll down, compare your work to each solution, and tap a score` : ''}` : 'Wrong answers are outlined in red below, with explanations.'}</div></div></div>
      <div class="row gap wrap" style="margin-top:16px">${retry.length ? `<a class="btn primary" href="#/mcq/${s.id}/practice" data-a="practice-missed">Practice the ${retry.length} missed</a>` : ''}<button class="btn" data-a="exam-again">Take it again</button></div></div>`;
  }
  function examSelf(i, j, v) {
    const qn = qs[i], box = $('#mq' + (i + 1));
    efs[i][j] = v;
    frqSol(box, qn, j, v);
    if (!efs[i].some(x => x === null)) { box.classList.remove('right', 'wrong'); box.classList.add(sum(efs[i], x => x) === qPts(qn) ? 'right' : 'wrong'); }
    grade();
  }

  app().onchange = e => {
    if (e.target.id === 'qsh') { S.qShuffle = e.target.checked; saveProg(id); }
    if (mode === 'exam' && e.target.name?.startsWith('mq')) {
      const n = $$('#tbody input:checked').length;
      const el = $('#answered');
      if (el) el.textContent = `${n} of ${qs.filter(x => !isFrq(x)).length} multiple-choice answered`;
    }
  };
  app().onclick = e => {
    const im = e.target.closest('.qimg img');
    if (im) return lightbox(im.src);
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'ans') answer(+b.dataset.k);
    if (a === 'sol') frqSol($('#mq' + (k + 1)), qs[k], +b.dataset.p, null);
    if (a === 'self') {
      if (mode === 'exam') examSelf(+b.closest('.tq').id.slice(2) - 1, +b.dataset.p, +b.dataset.v);
      else selfScore(+b.dataset.p, +b.dataset.v);
    }
    if (a === 'next' && cont) cont();
    if (a === 'missed') start(retry);
    if (a === 'again') start(pool());
    if (a === 'submit') submit();
    if (a === 'exam-again') { exam(); window.scrollTo(0, 0); }
    if (a === 'practice-missed') { e.preventDefault(); sessionStorage.scRetry = JSON.stringify(retry.map(x => x.id)); location.hash = `#/mcq/${s.id}/practice`; }
  };
  onKey = e => {
    if (mode !== 'practice' || e.target.closest?.('textarea, input')) return;
    if (cont && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const c = cont; cont = null; c(); return; }
    if (!qs[k] || isFrq(qs[k])) return;
    const i = 'abcd'.indexOf(e.key.toLowerCase()) >= 0 ? 'abcd'.indexOf(e.key.toLowerCase()) : '1234'.indexOf(e.key);
    if (i >= 0 && !locked && i < qs[k].choices.length) answer(i);
  };

  if (mode === 'exam') return exam();
  const ids = sessionStorage.scRetry ? JSON.parse(sessionStorage.scRetry) : null;
  sessionStorage.removeItem('scRetry');
  start(ids ? s.questions.filter(x => ids.includes(x.id)) : pool());
}

/* ================================================================ boot */

(async function init() {
  if (localStorage.scTheme === 'dark') document.body.classList.add('dark');
  $('#theme').onclick = () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.scTheme = dark ? 'dark' : 'light';
  };
  $('#q').addEventListener('input', () => {
    if (!/^#?\/?$/.test(location.hash)) location.hash = '#/';
    else viewHome();
  });
  await Store.open();
  for (const s of await Store.all('sets')) SETS.set(s.id, s);
  for (const p of await Store.all('progress')) PROG.set(p.id, p);
  await seedSets();
  window.addEventListener('hashchange', route);
  route();
})();
