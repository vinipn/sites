/* Laís de Lima: cardápio, pedido pelo WhatsApp e pequenas interações. Sem dependências, sem cookies, sem guardar dados. */
(() => {
  'use strict';
  const D = window.CARDAPIO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;

  try {
    if (!D) throw new Error('cardapio.js não carregou');

    /* ---------- Formatação ---------- */
    const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const kg = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const money = (n) => brl.format(Math.round(n)).replace(/ /g, ' ');
    const faixa = (min, max, sufixo = '') => (Math.round(min) === Math.round(max) ? money(min) : `${money(min)} a ${money(max)}`) + sufixo;
    const faixaNum = (a, b) => (a === b ? `${a}` : `${a} a ${b}`);
    const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
    const addDias = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dataBR = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const dataLonga = (s) => { const d = dataBR(s); return `${d.toLocaleDateString('pt-BR', { weekday: 'long' })}, ${d.toLocaleDateString('pt-BR')}`; };
    const limpa = (t, max) => String(t || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
    const limpaLinhas = (t, max) => String(t || '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

    const tipoPorId = (id) => D.tipos.find((t) => t.id === id);
    const tamPorId = (id) => D.tamanhos.find((t) => t.id === id);
    const saborPorId = (id) => D.sabores.find((s) => s.id === id);
    const valorTipo = (tipo) => (tipo.venda === 'fatia' ? { ...tipo.precoFatia, un: 'a fatia' } : { ...tipo.precoKg, un: 'o kg' });

    /* ---------- Prazos escritos no site ---------- */
    const prazo = D.prazoEncomendaDias;
    $$('[data-prazo]').forEach((e) => { e.textContent = `${prazo} dias`; });
    $$('[data-prazo-fim]').forEach((e) => { e.textContent = `a partir de ${prazo} dias`; });
    const ano = $('[data-ano]'); if (ano) ano.textContent = new Date().getFullYear();

    /* ---------- Preços escritos nos planos ---------- */
    const tSlice = tipoPorId('slice'), tBolo = tipoPorId('bolo');
    $$('[data-preco-fatia]').forEach((e) => { e.textContent = faixa(tSlice.precoFatia.min, tSlice.precoFatia.max); });
    $$('[data-preco-kg]').forEach((e) => { e.textContent = faixa(tBolo.precoKg.min, tBolo.precoKg.max); });

    /* ---------- Cardápio: cartões com arte de confeitaria (formas, nunca fotos que pareçam dos bolos dela) ---------- */
    const NS = 'http://www.w3.org/2000/svg';
    const arteDe = { matilda: 'a-matilda', 'doce-de-leite-nozes': 'a-nozes', 'cha-da-tarde': 'a-cha', slice: 'a-slice', bolo: 'a-bolo', torta: 'a-torta' };
    const artes = ['a-matilda', 'a-nozes', 'a-cha', 'a-slice', 'a-bolo', 'a-torta'];
    const sprite = (id, cls) => { const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 400 500'); sv.setAttribute('aria-hidden', 'true'); if (cls) sv.setAttribute('class', cls); const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#' + id); sv.append(u); return sv; };
    const grade = $('[data-grade-cardapio]');
    function cartao({ id, nome, cat, desc, foto, fotoAlt, atalho, pedir }) {
      const art = el('article', 'cprod'); art.dataset.tilt = '';
      const a = el('a', 'cprod__link'); a.href = '#pedido'; a.dataset[atalho[0]] = atalho[1];
      const arte = el('div', `cprod__arte arte--${id}`);
      if (foto) { const im = el('img'); im.src = foto; im.alt = fotoAlt || nome; im.loading = 'lazy'; im.width = 600; im.height = 750; arte.append(im); }
      else { arte.append(sprite(arteDe[id] || artes[grade.children.length % artes.length])); arte.append(el('span', 'cprod__foto', 'Foto em breve')); }
      const txt = el('div', 'cprod__txt');
      txt.append(el('h3', null, nome), el('p', 'cprod__cat', cat));
      if (desc) txt.append(el('p', 'cprod__desc', desc));
      txt.append(el('span', 'cprod__pedir', pedir));
      a.append(arte, txt); art.append(a); grade.append(art);
    }
    D.sabores.filter((x) => x.destaque).forEach((x) => cartao({ id: x.id, nome: x.nome, cat: 'Mais pedido', desc: x.descricao, foto: x.foto, fotoAlt: x.fotoAlt, atalho: ['sabor', x.id], pedir: 'Pedir este' }));
    D.tipos.forEach((t) => { const v = valorTipo(t); cartao({ id: t.id, nome: t.nome, cat: faixa(v.min, v.max, ` ${v.un}`), desc: t.descricao, atalho: ['tipo', t.id], pedir: t.venda === 'fatia' ? 'Pedir fatias' : 'Encomendar' }); });

    /* ---------- Tamanhos: toque na forma para "cortar" ---------- */
    const discos = $('[data-discos]'), legenda = $('[data-discos-legenda]');
    const legendaPadrao = legenda.textContent;
    D.tamanhos.forEach((t, i) => {
      const n = Math.round((t.fatias[0] + t.fatias[1]) / 2);
      const d = el('button', 'disco'); d.type = 'button'; d.setAttribute('aria-pressed', 'false');
      d.setAttribute('aria-label', `${t.diametro} cm: ${faixaNum(...t.fatias)} fatias. Toque para ver o corte`);
      d.style.setProperty('--d', t.diametro); d.style.setProperty('--i', i);
      d.dataset.fatias = faixaNum(...t.fatias);
      const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 100 100'); sv.setAttribute('class', 'disco__corte'); sv.setAttribute('aria-hidden', 'true');
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2 - Math.PI / 2, ln = document.createElementNS(NS, 'line');
        ln.setAttribute('x1', 50); ln.setAttribute('y1', 50); ln.setAttribute('x2', 50 + 49 * Math.cos(ang)); ln.setAttribute('y2', 50 + 49 * Math.sin(ang));
        ln.setAttribute('pathLength', 1); ln.style.setProperty('--k', k); sv.append(ln);
      }
      d.append(sv, el('span', 'disco__nome', `${t.diametro} cm`));
      d.addEventListener('click', () => {
        const ligar = d.getAttribute('aria-pressed') !== 'true';
        $$('.disco', discos).forEach((o) => { o.setAttribute('aria-pressed', 'false'); o.classList.remove('is-cortado'); });
        if (ligar) { d.setAttribute('aria-pressed', 'true'); d.classList.add('is-cortado'); legenda.textContent = `${t.diametro} cm rende de ${faixaNum(...t.fatias)} fatias.`; document.dispatchEvent(new CustomEvent('corte', { detail: { el: d } })); }
        else legenda.textContent = legendaPadrao;
      });
      discos.append(d);
    });
    const tabela = $('[data-tamanhos]');
    D.tamanhos.forEach((t) => {
      const l = el('div', 'linha-tam');
      const v = estimarInteiro(tBolo, t, null);
      l.append(
        el('span', 'linha-tam__tam', `${t.diametro} cm`),
        el('span', 'linha-tam__valor', faixa(v.min, v.max)),
        el('span', 'linha-tam__info', `${faixaNum(...t.fatias)} fatias · ${faixaNum(kg.format(t.pesoKg[0]), kg.format(t.pesoKg[1]))} kg`)
      );
      tabela.append(l);
    });
    function estimarInteiro(tipo, tam, sabor) {
      const p = (sabor && sabor.precoKg) || tipo.precoKg;
      return { min: p.min * tam.pesoKg[0], max: p.max * tam.pesoKg[1] };
    }

    /* ---------- Depoimentos (só se a lista tiver itens) ---------- */
    if (Array.isArray(D.depoimentos) && D.depoimentos.length) {
      const box = $('[data-depoimentos]'); box.textContent = '';
      const cores = ['verde', 'manteiga', 'azul'];
      D.depoimentos.forEach((d, i) => {
        const art = el('article', `dep dep--${cores[i % 3]}`); art.dataset.rv = 'escala';
        const m = el('div', 'dep__miolo');
        if (d.imagem) { const im = el('img'); im.src = d.imagem; im.alt = d.alt || 'Mensagem de um cliente elogiando a Laís'; im.loading = 'lazy'; im.className = 'dep__print'; m.append(im); }
        else { m.append(el('p', 'dep__texto', d.texto || '')); }
        art.append(m, el('p', 'dep__quem', [d.nome, d.detalhe].filter(Boolean).join(', ')));
        box.append(art);
      });
    }

    /* ---------- Formulário de pedido ---------- */
    const form = $('[data-form]');
    const S = { tipo: '', sabor: '', tamanho: '', qtd: 1, receber: '', endereco: '', data: '', nome: '', obs: '' };

    const optTipos = $('[data-opc-tipos]');
    D.tipos.forEach((t) => {
      const v = valorTipo(t);
      const lab = el('label', 'opc');
      const inp = el('input'); inp.type = 'radio'; inp.name = 'tipo'; inp.value = t.id;
      const cx = el('span', 'caixa'); cx.append(el('b', null, t.nome), el('small', null, t.prontaEntrega ? 'pronta entrega' : 'sob encomenda'));
      lab.append(inp, cx); optTipos.append(lab);
    });
    const optTam = $('[data-opc-tamanhos]');
    D.tamanhos.forEach((t) => {
      const lab = el('label', 'opc');
      const inp = el('input'); inp.type = 'radio'; inp.name = 'tamanho'; inp.value = t.id;
      const cx = el('span', 'caixa'); cx.append(el('b', null, `${t.diametro} cm`), el('small', null, `${faixaNum(...t.fatias)} fatias`));
      lab.append(inp, cx); optTam.append(lab);
    });
    const selSabor = $('#f-sabor');
    const preencheSabores = () => {
      selSabor.textContent = '';
      const o0 = el('option', null, 'Escolha o sabor'); o0.value = ''; selSabor.append(o0);
      D.sabores.filter((s) => !s.tipos || !S.tipo || s.tipos.includes(S.tipo)).forEach((s) => {
        const o = el('option', null, s.nome); o.value = s.id; selSabor.append(o);
      });
      const oo = el('option', null, 'Outro sabor (combino com você)'); oo.value = 'outro'; selSabor.append(oo);
      selSabor.value = [...selSabor.options].some((o) => o.value === S.sabor) ? S.sabor : '';
      S.sabor = selSabor.value;
    };

    const gTam = $('[data-grupo-tamanho]'), gQtd = $('[data-grupo-qtd]'), gEnd = $('[data-grupo-endereco]');
    const inData = $('#f-data'), dicaData = $('[data-dica-data]'), inQtd = $('#f-qtd');
    $('[data-aviso-entrega]').textContent = D.avisoEntrega;

    const dataMinima = () => {
      const t = tipoPorId(S.tipo);
      return iso(t && t.prontaEntrega ? hoje() : addDias(hoje(), prazo));
    };
    const atualizaData = () => {
      const min = dataMinima();
      inData.min = min;
      const t = tipoPorId(S.tipo);
      if (t && t.prontaEntrega) dicaData.textContent = 'Slice cake é de pronta entrega: escolha hoje ou outro dia. Eu confirmo o horário com você.';
      else dicaData.textContent = `Bolos e tortas: a partir de ${dataBR(min).toLocaleDateString('pt-BR')} (${prazo} dias de antecedência).`;
      if (S.data && S.data < min) { S.data = ''; inData.value = ''; dicaData.textContent += ' A data escolhida antes não vale mais: escolha outra.'; }
    };

    function estimativa() {
      const t = tipoPorId(S.tipo); if (!t) return null;
      const s = S.sabor && S.sabor !== 'outro' ? saborPorId(S.sabor) : null;
      if (t.venda === 'fatia') {
        const p = (s && s.precoFatia) || t.precoFatia; const q = Math.max(1, S.qtd);
        return { min: p.min * q, max: p.max * q };
      }
      const tam = tamPorId(S.tamanho); if (!tam) return null;
      return estimarInteiro(t, tam, s);
    }

    function linhasResumo() {
      const t = tipoPorId(S.tipo), r = [];
      if (t) r.push(['Produto', t.nome]);
      if (S.sabor) r.push(['Sabor', S.sabor === 'outro' ? 'Outro (a combinar)' : saborPorId(S.sabor).nome]);
      if (t && t.venda === 'fatia') r.push(['Quantidade', `${S.qtd} ${S.qtd === 1 ? 'fatia' : 'fatias'}`]);
      if (t && t.venda !== 'fatia' && S.tamanho) { const m = tamPorId(S.tamanho); r.push(['Tamanho', `${m.diametro} cm`]); }
      const e = estimativa(); if (e) r.push(['Valor estimado', faixa(e.min, e.max)]);
      if (S.receber) r.push(['Receber', S.receber === 'entrega' ? 'Entrega' : 'Retirada']);
      if (S.data) r.push(['Dia', dataBR(S.data).toLocaleDateString('pt-BR')]);
      return r;
    }
    function renderResumo() {
      $$('[data-resumo]').forEach((box) => {
        box.textContent = '';
        const r = linhasResumo();
        if (!r.length) { box.append(el('p', 'resumo--vazio', 'Escolha o produto para começar.')); return; }
        const dl = el('dl', 'resumo');
        r.forEach(([k, v]) => { const d = el('div'); d.append(el('dt', null, k), el('dd', null, v)); dl.append(d); });
        box.append(dl);
      });
      const out = $('[data-estimativa]'), e = estimativa(), t = tipoPorId(S.tipo);
      if (!t) out.textContent = 'Escolha o produto para ver o valor estimado.';
      else if (!e) out.textContent = 'Escolha o tamanho para ver o valor estimado.';
      else out.textContent = `Valor estimado: ${faixa(e.min, e.max)}. Eu confirmo o valor final.`;
    }

    function atualizaCampos() {
      const t = tipoPorId(S.tipo);
      gTam.hidden = !(t && t.venda !== 'fatia');
      gQtd.hidden = !(t && t.venda === 'fatia');
      gEnd.hidden = S.receber !== 'entrega';
      atualizaData(); renderResumo();
    }

    function escolherTipo(id) {
      S.tipo = id;
      $$('input[name=tipo]', form).forEach((i) => { i.checked = i.value === id; });
      preencheSabores(); atualizaCampos();
    }
    function escolherSabor(id) {
      if (!saborPorId(id) && id !== 'outro') return;
      S.sabor = id;
      if (![...selSabor.options].some((o) => o.value === id)) preencheSabores();
      selSabor.value = id; renderResumo();
    }

    preencheSabores(); atualizaCampos();

    form.addEventListener('change', (ev) => {
      const n = ev.target.name;
      if (n === 'tipo') escolherTipo(ev.target.value);
      else if (n === 'sabor') { S.sabor = ev.target.value; renderResumo(); }
      else if (n === 'tamanho') { S.tamanho = ev.target.value; renderResumo(); }
      else if (n === 'receber') { S.receber = ev.target.value; atualizaCampos(); }
      else if (n === 'data') { S.data = ev.target.value; renderResumo(); }
    });
    form.addEventListener('focusout', (ev) => { if (ev.target.name === 'qtd') { ev.target.value = S.qtd; } });
    form.addEventListener('input', (ev) => {
      const n = ev.target.name;
      if (n === 'qtd') { const bruto = parseInt(ev.target.value, 10); if (ev.target.value === '') return; S.qtd = Math.min(30, Math.max(1, bruto || 1)); if (String(S.qtd) !== String(bruto)) ev.target.value = S.qtd; renderResumo(); }
      else if (n === 'nome') S.nome = ev.target.value;
      else if (n === 'obs') S.obs = ev.target.value;
      else if (n === 'endereco') S.endereco = ev.target.value;
    });
    form.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-qtd]'); if (!b) return;
      S.qtd = Math.min(30, Math.max(1, S.qtd + Number(b.dataset.qtd))); inQtd.value = S.qtd; renderResumo();
    });

    /* Atalhos do cardápio: "Pedir este" / "Pedir fatias" */
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-tipo], a[data-sabor]'); if (!a) return;
      if (a.dataset.tipo) escolherTipo(a.dataset.tipo);
      if (a.dataset.sabor) escolherSabor(a.dataset.sabor);
    });

    /* ---------- Validação e mensagem ---------- */
    const erros = $('[data-erros]');
    const marca = (campo, ruim) => { if (campo) campo.setAttribute('aria-invalid', ruim ? 'true' : 'false'); };

    function validar() {
      const e = [], t = tipoPorId(S.tipo);
      if (!t) e.push('Escolha o que você quer: slice cake, bolo ou torta.');
      if (t && !S.sabor) e.push('Escolha o sabor (ou "Outro sabor").');
      marca(selSabor, t && !S.sabor);
      if (t && t.venda !== 'fatia' && !S.tamanho) e.push('Escolha o tamanho.');
      if (t && t.venda === 'fatia' && !(S.qtd >= 1)) e.push('Informe a quantidade de fatias.');
      if (!S.receber) e.push('Escolha entre retirada e entrega.');
      const end = limpaLinhas(S.endereco, 200);
      marca($('#f-endereco'), S.receber === 'entrega' && !end);
      if (S.receber === 'entrega' && !end) e.push('Informe o endereço de entrega.');
      const min = dataMinima();
      const dataOk = /^\d{4}-\d{2}-\d{2}$/.test(S.data) && S.data >= min;
      marca(inData, !dataOk);
      if (!S.data) e.push('Escolha o dia.');
      else if (!dataOk) e.push(`A data precisa ser a partir de ${dataBR(min).toLocaleDateString('pt-BR')}.`);
      const nome = limpa(S.nome, 80);
      marca($('#f-nome'), !nome);
      if (!nome) e.push('Informe seu nome.');
      return e;
    }

    function montaMensagem() {
      const t = tipoPorId(S.tipo), L = [];
      L.push('Olá, Laís! Vim pelo site e quero fazer um pedido.', '');
      L.push(`*Produto:* ${t.nome}`);
      L.push(`*Sabor:* ${S.sabor === 'outro' ? 'outro sabor (quero combinar com você)' : saborPorId(S.sabor).nome}`);
      if (t.venda === 'fatia') L.push(`*Quantidade:* ${S.qtd} ${S.qtd === 1 ? 'fatia' : 'fatias'}`);
      else {
        const m = tamPorId(S.tamanho);
        L.push(`*Tamanho:* ${m.diametro} cm (${faixaNum(...m.fatias)} fatias, cerca de ${faixaNum(kg.format(m.pesoKg[0]), kg.format(m.pesoKg[1]))} kg)`);
      }
      const e = estimativa(); if (e) L.push(`*Valor estimado:* ${faixa(e.min, e.max)} (você confirma o valor final)`);
      L.push('');
      if (S.receber === 'entrega') { L.push('*Como receber:* entrega', `*Endereço:* ${limpaLinhas(S.endereco, 200)}`, '(taxa de entrega a combinar)'); }
      else L.push('*Como receber:* retirada em Lages');
      L.push(`*Dia desejado:* ${dataLonga(S.data)}`);
      L.push(`*Nome:* ${limpa(S.nome, 80)}`);
      const obs = limpaLinhas(S.obs, 500); if (obs) L.push(`*Observações:* ${obs}`);
      return L.join('\n');
    }

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const e = validar();
      if (e.length) {
        erros.hidden = false; erros.textContent = e.join(' ');
        const primeiro = $('[aria-invalid="true"]', form); (primeiro || erros).scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (primeiro) primeiro.focus({ preventScroll: true });
        return;
      }
      erros.hidden = true; erros.textContent = '';
      const url = `https://wa.me/${D.negocio.whatsapp}?text=${encodeURIComponent(montaMensagem())}`;
      const a = document.createElement('a');   // um link real: abre uma vez só, em nova aba, sem perder o site
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.append(a); a.click(); a.remove();
    });

    /* ---------- WhatsApp flutuante: some enquanto o pedido está na tela (lá já há o botão principal) ---------- */
    const secPedido = $('#pedido');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        const wa = $('[data-wa-flutuante]'); if (wa) wa.classList.toggle('is-oculto', en.isIntersecting);
      }, { rootMargin: '-35% 0px -35% 0px' }).observe(secPedido);
    }

    /* ---------- Cabeçalho, menu ---------- */
    const topo = $('[data-topo]');
    const noScroll = () => topo.classList.toggle('is-rolado', scrollY > 24);
    addEventListener('scroll', noScroll, { passive: true }); noScroll();

    const btn = $('[data-menu-btn]'), menu = $('[data-menu]');
    const setMenu = (abrir) => {
      btn.setAttribute('aria-expanded', String(abrir)); menu.hidden = !abrir;
      document.body.classList.toggle('menu-aberto', abrir);
    };
    btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (ev) => { if (ev.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
    matchMedia('(min-width:1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  } catch (err) {
    html.classList.remove('js');
    console.error(err);
  }
})();
