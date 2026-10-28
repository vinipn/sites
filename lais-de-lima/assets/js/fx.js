/* Laís de Lima: movimento e pequenas surpresas. Tudo é enfeite: sem isto o site funciona igual (o pedido está em main.js). */
(() => {
  'use strict';
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sorteia = (a, b) => a + Math.random() * (b - a);
  const escolhe = (l) => l[Math.floor(Math.random() * l.length)];

  try {
    /* ---------- Aviso (toast) ---------- */
    const toast = $('[data-toast]');
    let toastTimer;
    const avisa = (txt) => {
      if (!toast) return;
      toast.textContent = txt;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
    };

    /* ---------- Granulado do início (canvas) ---------- */
    const tela = $('[data-granulado]');
    const hero = $('.hero');
    if (tela && hero && tela.getContext) {
      const ctx = tela.getContext('2d');
      const cores = () => [css('--verde'), css('--manteiga'), css('--azul'), css('--creme'), css('--caramelo')];
      let paleta = cores(), W = 0, H = 0, dpr = 1, graos = [], rodando = false, visivel = true, raf = 0;
      const mouse = { x: -999, y: -999, ativo: false };

      const novoGrao = () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: sorteia(-.12, .12), vy: sorteia(-.1, .1),
        a: Math.random() * Math.PI * 2, va: sorteia(-.012, .012),
        c: escolhe(paleta), l: sorteia(9, 17), e: sorteia(3.5, 5.5)
      });
      const mede = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = hero.clientWidth; H = hero.clientHeight;
        tela.width = Math.round(W * dpr); tela.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const alvo = Math.min(90, Math.round((W * H) / 9000));
        while (graos.length < alvo) graos.push(novoGrao());
        graos.length = alvo;
        graos.forEach((g) => { g.x = Math.min(g.x, W); g.y = Math.min(g.y, H); });
      };
      const desenha = () => {
        ctx.clearRect(0, 0, W, H);
        for (const g of graos) {
          ctx.save();
          ctx.translate(g.x, g.y); ctx.rotate(g.a);
          ctx.fillStyle = g.c; ctx.globalAlpha = .6;
          ctx.beginPath();
          ctx.roundRect(-g.l / 2, -g.e / 2, g.l, g.e, g.e / 2);
          ctx.fill();
          ctx.restore();
        }
      };
      const passo = () => {
        for (const g of graos) {
          if (mouse.ativo) {
            const dx = g.x - mouse.x, dy = g.y - mouse.y, d2 = dx * dx + dy * dy;
            if (d2 < 14400 && d2 > 1) { const d = Math.sqrt(d2), f = (120 - d) / 120 * .9; g.vx += dx / d * f; g.vy += dy / d * f; g.va += (dx > 0 ? 1 : -1) * f * .02; }
          }
          g.vx *= .985; g.vy *= .985; g.va *= .98;
          g.vx += sorteia(-.01, .01); g.vy += sorteia(-.01, .01);
          g.x += g.vx; g.y += g.vy; g.a += g.va;
          if (g.x < -20) g.x = W + 20; else if (g.x > W + 20) g.x = -20;
          if (g.y < -20) g.y = H + 20; else if (g.y > H + 20) g.y = -20;
        }
        desenha();
        raf = requestAnimationFrame(passo);
      };
      const liga = () => { if (!rodando && visivel && !document.hidden && !reduzido.matches) { rodando = true; raf = requestAnimationFrame(passo); } };
      const desliga = () => { rodando = false; cancelAnimationFrame(raf); };

      const explode = (x, y) => {
        for (const g of graos) {
          const dx = g.x - x, dy = g.y - y, d = Math.hypot(dx, dy) || 1;
          const f = Math.max(0, 320 - d) / 320 * 7;
          g.vx += dx / d * f; g.vy += dy / d * f; g.va += sorteia(-.12, .12);
        }
      };
      const pos = (e) => { const r = tela.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      hero.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; [mouse.x, mouse.y] = pos(e); mouse.ativo = true; });
      hero.addEventListener('pointerleave', () => { mouse.ativo = false; });
      hero.addEventListener('pointerdown', (e) => {
        if (e.target.closest('a,button')) return;
        const [x, y] = pos(e);
        if (reduzido.matches) return;
        explode(x, y);
      });

      const waf = $('[data-wa-flutuante]');
      mede(); desenha();
      new ResizeObserver(() => { mede(); if (!rodando) desenha(); }).observe(hero);
      new IntersectionObserver(([en]) => { visivel = en.isIntersecting; if (waf) waf.classList.toggle('is-hero', en.intersectionRatio > .55); visivel ? liga() : desliga(); }, { threshold: [0, .3, .55, .8, 1] }).observe(hero);
      document.addEventListener('visibilitychange', () => (document.hidden ? desliga() : liga()));
      reduzido.addEventListener('change', () => (reduzido.matches ? (desliga(), desenha()) : liga()));
      liga();
    }

    /* ---------- O botão do WhatsApp some no início e no rodapé (não cobre o texto) ---------- */
    const waf = $('[data-wa-flutuante]');
    const rodape = $('.rodape');
    if (waf && 'IntersectionObserver' in window) {
      const alvo = { hero: false, rodape: false };
      const atualiza = () => waf.classList.toggle('is-hero', alvo.hero || alvo.rodape);
      if (hero) new IntersectionObserver(([en]) => { alvo.hero = en.intersectionRatio > .35; atualiza(); }, { threshold: [0, .35, .7] }).observe(hero);
      if (rodape) new IntersectionObserver(([en]) => { alvo.rodape = en.isIntersecting; atualiza(); }, { threshold: [0, .05] }).observe($('.rodape__fim') || rodape);
    }

    /* ---------- Faixas rolantes (duplicam a lista; aceleram com a rolagem) ---------- */
    const faixas = [];
    $$('[data-fita]').forEach((fita) => {
      const lista = $('.fita__lista', fita);
      if (!lista) return;
      const trilho = document.createElement('div');
      trilho.className = 'fita__trilho';
      fita.insertBefore(trilho, lista);
      trilho.append(lista);
      const larg = () => lista.getBoundingClientRect().width || 1;
      let copias = [];
      const monta = () => {
        copias.forEach((c) => c.remove()); copias = [];
        const v = Math.max(window.innerWidth, 400);
        const n = Math.max(1, Math.ceil(v / larg()));
        // cada metade do trilho deve cobrir a tela; o -50% da animação fecha o ciclo
        for (let i = 0; i < n * 2 - 1; i++) { const c = lista.cloneNode(true); c.setAttribute('aria-hidden', 'true'); trilho.append(c); copias.push(c); }
        const seg = (larg() * n) / 60; // ~60 px por segundo
        trilho.style.setProperty('--dur', `${Math.max(18, seg)}s`);
        trilho.style.animationDuration = `${Math.max(18, seg)}s`;
      };
      monta();
      let ult = window.innerWidth;
      window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - ult) > 40) { ult = window.innerWidth; monta(); } });
      faixas.push(trilho);
    });
    if (faixas.length && !reduzido.matches) {
      let ultY = window.scrollY, vel = 0, taxa = 1;
      const atualiza = () => {
        const y = window.scrollY;
        vel = vel * .9 + Math.abs(y - ultY) * .1; ultY = y;
        const alvo = 1 + Math.min(vel / 6, 5);
        taxa += (alvo - taxa) * .12;
        for (const t of faixas) { const a = t.getAnimations()[0]; if (a) a.updatePlaybackRate(taxa); }
        requestAnimationFrame(atualiza);
      };
      requestAnimationFrame(atualiza);
    }

    /* ---------- Revelar ao rolar ---------- */
    // elementos criados pelo main.js e blocos sem marca ganham a revelação aqui
    ['.cprod', '.linha-tam', '.plano', '.dep', '.azulejo', '.disco', '.moldura'].forEach((sel) => $$(sel).forEach((e) => { if (!e.hasAttribute('data-rv')) e.setAttribute('data-rv', sel === '.disco' ? 'escala' : ''); }));
    $$('[data-palavras]').forEach((h) => {
      const txt = h.textContent.trim().replace(/\s+/g, ' ');
      h.textContent = '';
      txt.split(' ').forEach((p, i, l) => {
        const o = document.createElement('span'); o.className = 'pal'; o.style.setProperty('--w', i);
        const s = document.createElement('span'); s.textContent = p; o.append(s); h.append(o);
        if (i < l.length - 1) h.append(' ');
      });
    });
    if ('IntersectionObserver' in window && !reduzido.matches) {
      const io = new IntersectionObserver((lista) => {
        lista.filter((e) => e.isIntersecting).forEach((e, i) => {
          if (!e.target.style.getPropertyValue('--d')) e.target.style.setProperty('--d', `${Math.min(i, 5) * .09}s`);
          e.target.classList.add('is-in'); io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      $$('[data-rv],[data-palavras]').forEach((e) => io.observe(e));
    } else {
      $$('[data-rv],[data-palavras]').forEach((e) => e.classList.add('is-in'));
    }

    /* ---------- Parallax das formas soltas ---------- */
    const par = $$('[data-par]');
    if (par.length && !reduzido.matches) {
      let pronto = false;
      const mexe = () => {
        pronto = false;
        const h = window.innerHeight;
        for (const e of par) {
          const r = e.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > h + 200) continue;
          e.style.setProperty('--f', e.dataset.par);
          e.style.setProperty('--py', `${(r.top + r.height / 2 - h / 2).toFixed(1)}px`);
        }
      };
      window.addEventListener('scroll', () => { if (!pronto) { pronto = true; requestAnimationFrame(mexe); } }, { passive: true });
      mexe();
    }

    /* ---------- Inclinação 3D com o ponteiro ---------- */
    if (ponteiroFino.matches && !reduzido.matches) {
      $$('[data-tilt]').forEach((e) => {
        e.addEventListener('pointermove', (ev) => {
          const r = e.getBoundingClientRect();
          e.style.setProperty('--ry', `${(((ev.clientX - r.left) / r.width) - .5) * 12}deg`);
          e.style.setProperty('--rx', `${-(((ev.clientY - r.top) / r.height) - .5) * 12}deg`);
        });
        e.addEventListener('pointerleave', () => { e.style.setProperty('--rx', '0deg'); e.style.setProperty('--ry', '0deg'); });
      });
    }

    /* ---------- Palavras grandes: miniatura do bolo segue o cursor ---------- */
    const palavras = $('[data-palavras-grandes]');
    const blob = palavras && $('.palavras__blob', palavras);
    if (palavras && blob && ponteiroFino.matches && !reduzido.matches) {
      const arte = { slice: 'a-slice', bolo: 'a-bolo', torta: 'a-torta' };
      const cor = { slice: 'var(--verde)', bolo: 'var(--manteiga)', torta: 'var(--azul)' };
      let alvoX = 0, alvoY = 0, x = 0, y = 0, anda = false;
      const volta = () => {
        x += (alvoX - x) * .16; y += (alvoY - y) * .16;
        blob.style.setProperty('--x', `${x.toFixed(1)}px`); blob.style.setProperty('--y', `${y.toFixed(1)}px`);
        if (blob.classList.contains('is-on') || Math.abs(alvoX - x) > .5) requestAnimationFrame(volta); else anda = false;
      };
      palavras.addEventListener('pointermove', (e) => {
        const r = palavras.getBoundingClientRect(); alvoX = e.clientX - r.left; alvoY = e.clientY - r.top;
        if (!anda) { anda = true; x = alvoX; y = alvoY; requestAnimationFrame(volta); }
      });
      $$('a[data-tipo]', palavras).forEach((a) => {
        a.addEventListener('pointerenter', () => {
          const t = a.dataset.tipo;
          blob.style.background = cor[t];
          blob.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${arte[t]}"/></svg>`;
          blob.classList.add('is-on');
        });
        a.addEventListener('pointerleave', () => blob.classList.remove('is-on'));
      });
      palavras.addEventListener('pointerleave', () => blob.classList.remove('is-on'));
    }

    /* ---------- Perguntas (sanfona) ---------- */
    $$('.faq__item').forEach((item, i) => {
      const b = $('.faq__q', item), r = $('.faq__r', item);
      if (!b || !r) return;
      item.style.setProperty('--rot', `${[-.4, .3, -.2, .4, -.3, .2][i % 6]}deg`);
      r.inert = true;
      b.addEventListener('click', () => {
        const abre = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(abre));
        item.classList.toggle('is-aberto', abre);
        r.inert = !abre;
      });
    });

    /* ---------- Chuva de formas e confete ---------- */
    const chuvaDe = (ids, qtd = 26) => {
      if (reduzido.matches) return;
      const caixa = document.createElement('div'); caixa.className = 'chuva'; caixa.setAttribute('aria-hidden', 'true');
      const cores = [css('--verde'), css('--manteiga'), css('--azul'), css('--creme'), css('--caramelo')];
      for (let i = 0; i < qtd; i++) {
        const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24');
        s.innerHTML = `<use href="#${escolhe(ids)}"/>`;
        s.style.setProperty('--s', `${sorteia(26, 58).toFixed(0)}px`);
        s.style.setProperty('--cor', escolhe(cores));
        s.style.setProperty('--t', `${sorteia(3, 5.2).toFixed(2)}s`);
        s.style.setProperty('--atraso', `${sorteia(0, 1.3).toFixed(2)}s`);
        s.style.setProperty('--dx', `${sorteia(-90, 90).toFixed(0)}px`);
        s.style.setProperty('--giro', `${sorteia(-540, 540).toFixed(0)}deg`);
        s.style.left = `${sorteia(0, 98).toFixed(1)}%`;
        caixa.append(s);
      }
      document.body.append(caixa);
      setTimeout(() => caixa.remove(), 7000);
    };

    const confete = (cx, cy) => {
      if (reduzido.matches) return;
      const c = document.createElement('canvas'); c.className = 'confete'; c.setAttribute('aria-hidden', 'true');
      c.width = window.innerWidth; c.height = window.innerHeight; document.body.append(c);
      const g = c.getContext('2d'), cores = [css('--verde'), css('--manteiga'), css('--azul'), css('--creme'), css('--caramelo'), css('--tinta')];
      const ps = Array.from({ length: 70 }, () => {
        const ang = sorteia(-Math.PI, 0), v = sorteia(4, 12);
        return { x: cx, y: cy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, a: sorteia(0, 6.28), va: sorteia(-.3, .3), c: escolhe(cores), l: sorteia(8, 15) };
      });
      let t = 0;
      const tick = () => {
        g.clearRect(0, 0, c.width, c.height);
        ps.forEach((p) => {
          p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
          g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c;
          g.beginPath(); g.roundRect(-p.l / 2, -2, p.l, 4, 2); g.fill(); g.restore();
        });
        if (++t < 110) requestAnimationFrame(tick); else c.remove();
      };
      requestAnimationFrame(tick);
    };

    /* ---------- Velinha do logotipo: assopre (e acenda de novo) ---------- */
    const vela = $('[data-vela]');
    if (vela) {
      vela.addEventListener('click', () => {
        const acesa = vela.getAttribute('aria-pressed') === 'true';
        vela.setAttribute('aria-pressed', String(!acesa));
        vela.setAttribute('aria-label', acesa ? 'Acender a velinha' : 'Soprar a velinha');
        if (acesa) { const r = vela.getBoundingClientRect(); confete(r.left + r.width / 2, r.top + 20); avisa('Desejo feito! Agora é só montar o seu pedido.'); }
      });
    }

    /* ---------- Marca no topo: 5 cliques fazem festa ---------- */
    const marca = $('[data-marca]');
    if (marca) {
      let cliques = 0, tempo;
      marca.addEventListener('click', () => {
        marca.classList.remove('is-balanco'); void marca.offsetWidth; marca.classList.add('is-balanco');
        cliques++; clearTimeout(tempo); tempo = setTimeout(() => { cliques = 0; }, 1400);
        if (cliques >= 5) { cliques = 0; chuvaDe(['i-cereja', 'i-flor', 'i-gran', 'i-flor12'], 28); avisa('Parabéns! Você descobriu o segredo da confeiteira.'); }
      });
    }

    /* ---------- Digitar "bolo" faz chover bolo ---------- */
    let digitado = '';
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input,textarea,select,[contenteditable]') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      digitado = (digitado + e.key.toLowerCase()).slice(-4);
      if (digitado === 'bolo') { digitado = ''; chuvaDe(['i-fatia', 'i-cereja', 'i-flor'], 30); avisa('Chuva de bolo! Que tal pedir o seu?'); }
    });

    /* ---------- Nome gigante do rodapé: letras de geleia ---------- */
    const gigante = $('[data-gigante]');
    if (gigante) {
      const geleia = (l) => { l.classList.remove('is-gel'); void l.offsetWidth; l.classList.add('is-gel'); };
      $$('i', gigante).forEach((l, i, todas) => {
        l.addEventListener('pointerenter', () => { if (!reduzido.matches) geleia(l); });
        l.addEventListener('click', () => {
          if (reduzido.matches) return;
          const r = l.getBoundingClientRect(); confete(r.left + r.width / 2, r.top + r.height / 2);
          todas.forEach((o, j) => setTimeout(() => geleia(o), Math.abs(i - j) * 45));
        });
      });
      // as letras chegam em onda quando o rodapé aparece
      if ('IntersectionObserver' in window && !reduzido.matches) {
        const o = new IntersectionObserver(([en]) => {
          if (!en.isIntersecting) return;
          $$('i', gigante).forEach((l, i) => setTimeout(() => geleia(l), i * 60));
          o.disconnect();
        }, { threshold: .4 });
        o.observe(gigante);
      }
    }

    /* ---------- Discos: ao cortar, saem confeitos ---------- */
    document.addEventListener('corte', (e) => {
      if (reduzido.matches) return;
      const r = e.detail.el.getBoundingClientRect();
      confete(r.left + r.width / 2, r.top + r.height / 2);
    });

    /* ---------- Selo gira mais rápido com a rolagem ---------- */
    const selo = $('[data-selo] .selo__anel');
    if (selo && !reduzido.matches) {
      let y0 = window.scrollY, giro = 0;
      const volta = () => {
        const y = window.scrollY; giro += (y - y0) * .4; y0 = y;
        selo.style.rotate = `${giro % 360}deg`;
        requestAnimationFrame(volta);
      };
      requestAnimationFrame(volta);
    }

    /* ---------- Para quem olha o console ---------- */
    console.log('%cLaís de Lima — confeitaria artesanal, Lages/SC', 'font:600 14px Georgia;color:#523B1D');
    console.log('Dica: digite "bolo" na página, clique 5 vezes no nome lá em cima, sopre a velinha e aperte as letras do rodapé.');
  } catch (erro) {
    html.classList.remove('js');
    console.error('Efeitos desligados:', erro);
  }
})();
