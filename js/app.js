(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const { PROD } = window.MALCRI;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plata = (n) => n == null ? 'A confirmar' : '$' + Number(n).toLocaleString('es-AR');

  // ---------- fotos con carga (nunca grises ni con una foto anterior) ----------
  const ph = (root = document) => $$('.ph img', root).forEach(img => {
    const w = img.closest('.ph'); if (!w || w.dataset.ph) return; w.dataset.ph = '1';
    const ok = () => w.classList.add('ok');
    if (img.complete && img.naturalWidth) ok(); else img.addEventListener('load', ok, { once: true });
  });
  ph();

  // ---------- marcos de doble línea (firma: trazo) ----------
  const pos = { tl: [0, 0], tr: [1, 0], bl: [0, 1], br: [1, 1] };
  const marcos = new Set();
  const ajustar = (m) => {
    const w = m.offsetWidth, h = m.offsetHeight; if (w < 30 || h < 30) return;
    const R = parseFloat(getComputedStyle(m).borderTopLeftRadius) || 28, s = m.querySelector(':scope > svg.trazo');
    s.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const [o, i] = s.children;
    Object.entries({ x: 1.2, y: 1.2, width: w - 2.4, height: h - 2.4, rx: R }).forEach(([k, v]) => o.setAttribute(k, v));
    Object.entries({ x: 7, y: 7, width: w - 14, height: h - 14, rx: Math.max(4, R - 6) }).forEach(([k, v]) => i.setAttribute(k, v));
  };
  const ro = new ResizeObserver(es => es.forEach(e => ajustar(e.target)));
  const verMarco = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('dibujado'); verMarco.unobserve(e.target); } }), { threshold: 0.15 });
  const initMarco = (m, observar = true) => {
    if (marcos.has(m)) return; marcos.add(m);
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('class', 'trazo'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<rect class="out" pathLength="1"/><rect class="in" pathLength="1"/>'; m.appendChild(s);
    (m.dataset.diam || '').split(' ').filter(Boolean).forEach(k => {
      const d = document.createElement('span'); d.className = 'diam';
      d.style.left = (pos[k][0] * 100) + '%'; d.style.top = (pos[k][1] * 100) + '%';
      d.innerHTML = '<svg viewBox="-2 -2 34 42"><use href="#diam"/></svg>'; m.appendChild(d);
    });
    ajustar(m); ro.observe(m);
    if (observar) verMarco.observe(m);
  };
  const hero = $$('.heroA .marco');
  $$('.marco').forEach(m => initMarco(m, !hero.includes(m)));
  const dibujarHero = () => hero.forEach((m, i) => setTimeout(() => m.classList.add('dibujado'), i * 120));

  // ---------- entradas al hacer scroll ----------
  const verRv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); verRv.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const rv = (root = document) => $$('.rv:not(.visto)', root).forEach(el => verRv.observe(el));
  rv();

  // ---------- intro ----------
  const intro = $('#intro');
  const fin = () => { intro.classList.add('fuera'); dibujarHero(); document.documentElement.style.overflow = ''; setTimeout(() => intro.remove(), 450); };
  if (!intro || matchMedia('(prefers-reduced-motion: reduce)').matches) { intro && intro.remove(); dibujarHero(); }
  else {
    document.documentElement.style.overflow = 'hidden';
    const go = () => {
      requestAnimationFrame(() => intro.classList.add('dibujado'));
      setTimeout(() => intro.classList.add('abre'), 900);
      setTimeout(fin, 1150);
    };
    (document.fonts && document.fonts.load ? Promise.race([document.fonts.load('120px "Great Vibes"'), new Promise(r => setTimeout(r, 400))]) : Promise.resolve()).then(go);
  }

  // ---------- toast ----------
  const toast = $('#toast'); let tt;
  const avisar = (t) => { toast.textContent = t; toast.classList.add('ver'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('ver'), 2400); };

  // ---------- menú del celu ----------
  const menu = $('#menu'), bm = $('.btn-menu');
  const menuSet = (v) => { menu.classList.toggle('abierto', v); bm.setAttribute('aria-expanded', v); document.documentElement.classList.toggle('sin-scroll', v); };
  bm.addEventListener('click', () => menuSet(!menu.classList.contains('abierto')));
  $('.menu .cerrar').addEventListener('click', () => menuSet(false));
  $$('.menu a').forEach(a => a.addEventListener('click', () => menuSet(false)));

  // ---------- popups propios ----------
  let ultimoFoco = null;
  const abrirPop = (p, foco) => { ultimoFoco = document.activeElement; p.classList.add('abierto'); document.documentElement.classList.add('sin-scroll', 'pop-on'); setTimeout(() => (foco || p.querySelector('.pop-x'))?.focus({ preventScroll: true }), 60); };
  const cerrarPop = (p) => { if (!p.classList.contains('abierto')) return; p.classList.remove('abierto'); if (!$('.pop.abierto')) document.documentElement.classList.remove('pop-on'); if (!$('.pop.abierto') && !menu.classList.contains('abierto')) document.documentElement.classList.remove('sin-scroll'); ultimoFoco?.focus?.({ preventScroll: true }); };
  $$('.pop').forEach(p => {
    p.addEventListener('click', e => { if (e.target === p || e.target.closest('.pop-x,[data-cerrar],#pop-cerrar')) cerrarPop(p); });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.pop.abierto').forEach(cerrarPop); menuSet(false); } });

  // ---------- la lata ----------
  const esc_ = $('#escena'), tapa = $('#tapa'), bA = $('#btn-abrir');
  const abrir = (v) => {
    esc_.classList.toggle('abierta', v);
    tapa.setAttribute('aria-label', v ? 'Cerrar la lata' : 'Abrir la lata');
    bA.textContent = v ? 'Cerrá la lata' : 'Abrí la lata';
    $$('.celda').forEach(c => c.tabIndex = v ? 0 : -1);
    tapa.style.transform = '';
  };
  let x0, y0, dx = 0, dy = 0, drag = false;
  tapa.addEventListener('pointerdown', e => {
    if (esc_.classList.contains('abierta')) return;
    drag = true; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; tapa.setPointerCapture(e.pointerId); tapa.classList.add('arrastrando');
  });
  tapa.addEventListener('pointermove', e => {
    if (!drag) return; dx = e.clientX - x0; dy = e.clientY - y0;
    tapa.style.transform = `translate(${dx}px,${dy}px) rotate(${dx / 12}deg)`;
  });
  const soltar = () => {
    if (!drag) return; drag = false; tapa.classList.remove('arrastrando');
    const d = Math.hypot(dx, dy); tapa.style.transform = '';
    abrir(d > 60 || d < 6); tapa.dataset.recien = '1'; setTimeout(() => delete tapa.dataset.recien, 50);
  };
  tapa.addEventListener('pointerup', soltar); tapa.addEventListener('pointercancel', soltar);
  tapa.addEventListener('click', () => { if (tapa.dataset.recien) return; abrir(!esc_.classList.contains('abierta')); });
  bA.addEventListener('click', () => abrir(!esc_.classList.contains('abierta')));

  const pop = $('#pop'), pimg = $('#pop-img'), bSum = $('#pop-sumar'), mostr = $('#pop-mostrador'); let actual;
  $$('.celda').forEach(c => c.addEventListener('click', () => {
    const p = PROD[actual = c.dataset.k], w = pimg.closest('.ph');
    w.classList.remove('ok'); pimg.removeAttribute('src');
    pimg.onload = () => w.classList.add('ok'); pimg.src = `img/${p.img}.webp`; pimg.alt = p.n;
    $('#pop-t').textContent = p.n; $('#pop-d').textContent = p.d; $('#pop-p').textContent = p.p;
    const accion = !!(p.kit || p.ir);
    bSum.hidden = !accion; mostr.hidden = accion;
    bSum.textContent = p.cta || 'Sumar al encargo';
    abrirPop(pop, accion ? bSum : null);
  }));
  bSum.addEventListener('click', () => {
    const p = PROD[actual]; cerrarPop(pop);
    if (p.ir) { $(p.ir).scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (window.KIT?.carrito) { KIT.carrito.agregar(p.kit, 1, { origen: bSum }); }
  });

  // ---------- encargo: contador de la cinta ----------
  const nEl = $('#n-encargo');
  const contar = () => { const n = (window.KIT?.carrito?.lineas || []).reduce((a, l) => a + (l.cant || 0), 0); nEl.textContent = n; };
  document.addEventListener('kit:carrito', contar);

  // ---------- secciones que salen de la carta del kit ----------
  const qty = (id) => `<span class="qty" data-kit-qty="${esc(id)}"></span>`;
  // cada hoja en 3 columnas pensadas a mano (desktop); en el celu, una caja por vez
  const HOJAS = [[['tortas'], ['dulce', 'alfajores'], ['cookies']], [['salado', 'brunch'], ['sandwiches'], ['cocina']], [['cafeteria', 'otras'], ['frias'], ['tes', 'matcha']]];
  const PEDIBLES = new Set(['alfajores', 'cookies']);
  const MATCHA = `<section class="marco caja caja-matcha" data-diam="tr"><h3 class="script">Nuestro matcha</h3><p class="ficha"><b>Origen</b> Japón, región de Shizuoka</p><p class="ficha"><b>Grado</b> Ceremonial · cultivar Tsuyuhikari</p><p class="ficha"><b>Cosecha</b> Primera (first flush)</p><p class="ficha"><b>Notas</b> Vegetales frescos, umami suave, dulzor natural</p></section>`;

  const caja = (c, items) => {
    const precios = [...new Set(items.map(p => p.precio))];
    const unico = items.length > 2 && precios.length === 1 && precios[0] != null;
    const pedir = PEDIBLES.has(c.id);
    return `<section class="marco caja" data-diam="tr">
      <h3 class="script">${esc(c.nombre)}${unico ? `<small>${c.id === 'tortas' ? 'por porción ' : ''}${plata(precios[0])}</small>` : ''}</h3>
      <ul>${items.map(p => `<li class="${p.disponible === false ? 'off' : ''}"><div><b>${esc(p.nombre)}</b>${p.descripcion ? `<span>${esc(p.descripcion)}</span>` : ''}</div>${unico ? '' : `<em>${plata(p.precio)}</em>`}${pedir && p.disponible !== false ? qty(p.id) : ''}</li>`).join('')}</ul>
    </section>`;
  };

  const GRUPOS_CELU = [['g1', 'Tortas', ['tortas']], ['g2', 'Mostrador dulce', ['dulce']], ['g3', 'Alfajores y cookies', ['alfajores', 'cookies']], ['g4', 'Salado', ['salado']], ['g5', 'Sandwiches', ['sandwiches']], ['g6', 'Cocina', ['cocina']], ['g6b', 'Brunch para 2', ['brunch']], ['g7', 'Café', ['cafeteria', 'otras']], ['g8', 'Frías', ['frias']], ['g9', 'Tés y matcha', ['tes', 'matcha']]];
  let hojaAct = 0, cajaAct = 'g1';
  const pintarCarta = (cats, prods) => {
    const hojas = $('#hojas'), celu = $('#cajas-celu'), chips = $('#cat-chips');
    const cajaDe = (id) => {
      if (id === 'matcha') return MATCHA;
      const c = cats.find(x => x.id === id); if (!c) return '';
      const it = prods.filter(p => p.categoria === id); return it.length ? caja(c, it) : '';
    };
    hojas.innerHTML = HOJAS.map((cols, i) => `<div class="hoja${i === hojaAct ? ' on' : ''}" role="tabpanel" aria-hidden="${i !== hojaAct}">${cols.map(col => `<div class="col">${col.map(cajaDe).join('')}</div>`).join('')}</div>`).join('');
    const tiene = (id) => id === 'matcha' || prods.some(p => p.categoria === id);
    const grupos = GRUPOS_CELU.map(([k, n, ids]) => [k, n, ids.filter(tiene)]).filter(g => g[2].length);
    if (!grupos.some(g => g[0] === cajaAct)) cajaAct = grupos[0][0];
    chips.innerHTML = grupos.map(([k, n]) => `<button role="tab" class="chip${k === cajaAct ? ' on' : ''}" aria-selected="${k === cajaAct}" data-c="${k}">${esc(n)}</button>`).join('');
    celu.innerHTML = grupos.map(([k, , ids]) => `<div class="pila${k === cajaAct ? ' on' : ''}" data-c="${k}" aria-hidden="${k !== cajaAct}">${ids.map(cajaDe).join('')}</div>`).join('');
    $$('.hoja', hojas).forEach((h, i) => { if (i !== hojaAct) h.inert = true; });
    $$('.pila', celu).forEach(p => { if (!p.classList.contains('on')) p.inert = true; });
    $$('.marco', hojas).concat($$('.marco', celu)).forEach(m => initMarco(m));
    fijarAlto();
  };
  // alto fijo de la pila del celu: el de la caja más alta + margen (cambiar de chip nunca mueve nada)
  let anchoFijado = 0;
  const fijarAlto = () => {
    const celu = $('#cajas-celu'); if (!celu || !celu.offsetParent) return;
    celu.style.height = '';
    const h = Math.max(...$$('.pila', celu).map(p => p.scrollHeight));
    celu.style.height = Math.ceil(h + 24) + 'px'; anchoFijado = innerWidth;
  };
  addEventListener('resize', () => { if (innerWidth !== anchoFijado) fijarAlto(); });
  $$('.hoja-tab').forEach(b => b.addEventListener('click', () => {
    hojaAct = +b.dataset.h;
    $$('.hoja-tab').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    $$('#hojas .hoja').forEach((h, i) => { const on = i === hojaAct; h.classList.toggle('on', on); h.setAttribute('aria-hidden', !on); h.inert = !on; if (on) $$('.marco', h).forEach(m => { m.classList.add('dibujado'); ajustar(m); }); });
  }));
  $('#cat-chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return; cajaAct = b.dataset.c;
    $$('#cat-chips .chip').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    $$('#cajas-celu .pila').forEach(p => { const on = p.dataset.c === cajaAct; p.classList.toggle('on', on); p.setAttribute('aria-hidden', !on); p.inert = !on; if (on) $$('.marco', p).forEach(m => { m.classList.add('dibujado'); ajustar(m); }); });
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });

  const pintarTortas = (prods) => {
    const ts = prods.filter(p => p.categoria === 'tortas-enteras');
    const con = ts.filter(p => p.foto), sin = ts.filter(p => !p.foto);
    $('#tortera').innerHTML = `<div class="tortera-fila" id="tortera-fila">${con.map((p, i) => `
      <article class="marco torta${p.disponible === false ? ' off' : ''}" data-diam="${i % 2 ? 'br' : 'tl'}">
        <div class="ph"><img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" draggable="false"></div>
        <div class="torta-info"><h3 class="script">${esc(p.nombre)}</h3><p>${esc(p.descripcion || '')}</p>
          <div class="torta-pie"><b>${plata(p.precio)}</b>${p.disponible === false ? '<span class="agot">Sin stock</span>' : qty(p.id)}</div></div>
      </article>`).join('')}</div>`;
    $('#tortas-lista').innerHTML = sin.map(p => `<li><div><b>${esc(p.nombre)}</b><span>${esc(p.descripcion || '')}</span></div><em>${plata(p.precio)}</em>${p.disponible === false ? '' : qty(p.id)}</li>`).join('');
    $$('#tortera .marco').forEach(m => initMarco(m));
    arrastrable($('#tortera-fila'));
  };

  const pintarSabores = (prods) => {
    $('#sabores').innerHTML = prods.filter(p => p.categoria === 'alfajores').map(p => `<li><div><b>${esc(p.nombre)}</b><span>${esc(p.descripcion || '')}</span></div>${p.disponible === false ? '<span class="agot">Sin stock hoy</span>' : qty(p.id)}</li>`).join('');
  };

  const pintarNavidad = (prods, especiales) => {
    const ul = $('#nav-lista'), box = $('#navidad');
    const cat = (especiales || []).find(c => c.id === 'navidad');
    box.hidden = !cat;
    if (!cat) return;
    ul.innerHTML = prods.filter(p => p.categoria === 'navidad').map(p => `<li><div><b>${esc(p.nombre)}</b><em>${plata(p.precio)}</em></div>${p.disponible === false ? '' : qty(p.id)}</li>`).join('');
  };

  document.addEventListener('kit:carta', (e) => {
    if (e.detail.el.id !== 'carta-datos') return;
    const { productos, visibles, especiales } = e.detail;
    pintarCarta(visibles, productos); pintarTortas(productos); pintarSabores(productos); pintarNavidad(productos, especiales);
    ph(); rv();
    window.KIT?.carrito?.sync(document);
    requestAnimationFrame(() => window.KIT?.carrito?.sync(document));
  });
  addEventListener('malcri:kit', () => { window.KIT?.carrito?.sync(document); contar(); });

  // ---------- filas que se arrastran con el mouse ----------
  function arrastrable(fila) {
    if (!fila || fila.dataset.drag) return; fila.dataset.drag = '1';
    let x, sl, mov = false, abajo = false;
    fila.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      abajo = true; mov = false; x = e.clientX; sl = fila.scrollLeft; fila.classList.add('agarrando');
    });
    addEventListener('pointermove', e => {
      if (!abajo) return; const d = e.clientX - x;
      if (Math.abs(d) > 4) { mov = true; fila.style.scrollSnapType = 'none'; }
      if (mov) { fila.scrollLeft = sl - d; e.preventDefault(); }
    });
    addEventListener('pointerup', () => {
      if (!abajo) return; abajo = false; fila.classList.remove('agarrando');
      fila.style.scrollSnapType = ''; if (mov) { fila.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true }); }
    });
    fila.addEventListener('dragstart', e => e.preventDefault());
  }

  // ---------- eventos: popup de presupuesto ----------
  const popEv = $('#pop-ev');
  $('#abrir-ev').addEventListener('click', () => abrirPop(popEv, popEv.querySelector('input')));
  $('#ev-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f));
    if (!d.nombre || !d.mail || !f.mail.checkValidity()) { $('#ev-ok').textContent = 'Completá tu nombre y un mail válido.'; return; }
    const cuerpo = `Hola! Soy ${d.nombre}.\nEvento: ${d.tipo}${d.personas ? ` · ${d.personas} personas` : ''}${d.fecha ? ` · ${d.fecha}` : ''}\n${d.msj || ''}\nMi mail: ${d.mail}`;
    location.href = `mailto:malcriadaeventos@gmail.com?subject=${encodeURIComponent('Presupuesto para ' + d.tipo.toLowerCase())}&body=${encodeURIComponent(cuerpo)}`;
    $('#ev-ok').textContent = 'Listo: se abre tu mail con todo armado para malcriadaeventos@gmail.com.';
  });

  // ---------- píldora del panel: no tapa el hero ni la lata ----------
  const tapadas = new Set();
  const verPill = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? tapadas.add(e.target) : tapadas.delete(e.target)); document.documentElement.classList.toggle('pill-oculta', tapadas.size > 0); }, { threshold: 0.25 });
  [$('.heroA'), matchMedia('(max-width:1100px)').matches ? $('#lata') : null].filter(Boolean).forEach(el => verPill.observe(el));

  // ---------- abierto ahora ----------
  const H = { 0: [570, 1200], 1: [900, 1200], 2: [540, 1200], 3: [540, 1200], 4: [540, 1200], 5: [540, 1200], 6: [570, 1200] };
  try {
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const m = ahora.getHours() * 60 + ahora.getMinutes(), [a, c] = H[ahora.getDay()];
    const abierto = m >= a && m < c, hm = (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
    $('#estado').classList.toggle('abierto', abierto);
    $('#estado-t').textContent = abierto ? `Abierto ahora · hasta las ${hm(c)} hs` : (m < a ? `Cerrado · hoy abre a las ${hm(a)} hs` : 'Cerrado · mañana te esperamos');
  } catch (e) { /* queda el texto por defecto */ }
})();
