/* ── Mobile hamburger menu ── */
(function () {
  const btn = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function openMenu() {
    btn.classList.add('open');
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    lockScroll();
  }

  function closeMenu() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    unlockScroll();
  }

  const closeBtn = document.getElementById('mobile-menu-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Fechar ao clicar no overlay (fora do painel)
  menu.addEventListener('click', e => {
    if (e.target === menu) closeMenu();
  });

  btn.addEventListener('click', () => {
    btn.classList.contains('open') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ── Loader ── */
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loader-pct');
const loaderDuration = 1600; // ms to reach 100%
const loaderStart = performance.now();
(function loaderTick(now) {
  const progress = Math.min((now - loaderStart) / loaderDuration, 1);
  loaderPct.textContent = Math.floor(progress * 100) + '%';
  if (progress < 1) {
    requestAnimationFrame(loaderTick);
  } else {
    loaderPct.textContent = '100%';
    setTimeout(() => {
      loader.classList.add('hidden');
      document.querySelector('nav').classList.add('nav-visible');
    }, 400); // 1600 + 400 = 2000ms total
  }
})(loaderStart);

/* ── About symbols 3D ── */
(function() {
  const syms = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => document.getElementById('sym'+i)).filter(Boolean);
  const phases  = [0, 0.3, 0.6, 0.1, 0.4, 0.7, 0.2, 0.5, 0.8, 0.15, 0.45, 0.75, 0.05, 0.35, 0.65, 0.25, 0.55, 0.85];
  const speeds  = [1.1, 0.8, 1.3, 0.9, 1.2, 0.7, 1.0, 1.4, 0.85, 1.15, 0.75, 1.25, 0.95, 1.05, 0.8, 1.3, 0.9, 1.1];

  let mx = 0, my = 0, targetMx = 0, targetMy = 0;

  document.addEventListener('mousemove', e => {
    targetMx = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetMy = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function tick(t) {
    mx += (targetMx - mx) * 0.06;
    my += (targetMy - my) * 0.06;

    syms.forEach((s, i) => {
      const ph  = phases[i] * Math.PI * 2;
      const spd = speeds[i];
      const idle_rotY = Math.sin(t * 0.001 * spd + ph) * 40;
      const idle_rotX = Math.cos(t * 0.0007 * spd + ph) * 28;
      const idle_y    = Math.sin(t * 0.0008 * spd + ph) * 14;

      const rotY = idle_rotY + mx * 50;
      const rotX = idle_rotX - my * 35;
      const lx   = 50 + mx * 40;
      const ly   = 50 + my * 40;

      const glow  = `radial-gradient(circle at ${lx}% ${ly}%, #fff 0%, var(--orange) 45%, transparent 70%)`;
      const shine = `0 0 ${18 + Math.abs(mx) * 25}px rgba(255,77,0,${0.25 + Math.abs(mx) * 0.35}),
                     ${mx * 6}px ${my * 6}px ${20 + Math.abs(my) * 15}px rgba(255,77,0,0.15)`;

      s.style.transform = `perspective(600px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(${idle_y}px)`;
      if (s.tagName === 'IMG') {
        s.style.filter = `drop-shadow(${mx*8}px ${my*6}px ${18+Math.abs(mx)*25}px rgba(255,77,0,${0.3+Math.abs(mx)*0.4}))`;
      } else {
        s.style.textShadow = shine;
        s.style.backgroundImage = glow;
        s.style.webkitBackgroundClip = 'text';
        s.style.webkitTextFillColor = 'transparent';
      }
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ── Scroll progress bar ── */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ── Scroll reveal ── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

/* ── Counter animation ── */
function animateCounter(el, target) {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + (target >= 10 ? '+' : '');
    if (current >= target) clearInterval(timer);
  }, 25);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target, parseInt(entry.target.dataset.target));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-target]').forEach(el => statObserver.observe(el));

/* ── Parallax hero title ── */
const heroTitle = document.querySelector('.hero-title');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroTitle) heroTitle.style.transform = `translateY(${y * 0.15}px)`;
});

/* ── Typewriter cycling word ── */
const cyclingWord = document.getElementById('cycling-word');
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const words = isMobile ? ['marcas', 'ideias', 'projetos'] : ['experiências', 'resultados', 'projetos', 'marcas'];
let wordIndex = 0;
let charIndex = words[0].length;
let isDeleting = false;

function typeWriter() {
  const current = words[wordIndex];

  if (isDeleting) {
    charIndex--;
    cyclingWord.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeWriter, 400);
      return;
    }
    setTimeout(typeWriter, 45);
  } else {
    charIndex++;
    cyclingWord.textContent = words[wordIndex].slice(0, charIndex);
    if (charIndex === words[wordIndex].length) {
      setTimeout(() => { isDeleting = true; typeWriter(); }, 2000);
      return;
    }
    setTimeout(typeWriter, 90);
  }
}

setTimeout(() => { isDeleting = true; typeWriter(); }, 2000);

/* ── Project Modal ── */
const projects = [
  { num:'01', name:'Moqueca de Bacalhau · Riberalves', tags:['Audiovisual','Motion'], page: 'pages/riberalves.html' },
  { num:'02', name:'Matrículas 2025 · CRECEI', tags:['Audiovisual','Motion'], page: 'pages/matriculas-crecei.html' },
  { num:'03', name:'Divulgação do Evento · LKC CON', tags:['Audiovisual','Motion'], page: 'pages/lkc-con-anuncio.html' },
  { num:'04', name:'São Paulo · Hybrid Media', tags:['Branding','Motion'], page: 'pages/hybrid-media.html' },
  { num:'05', name:'Por Que Você Ainda Não Evoluiu? · Asafe Quirino', tags:['Audiovisual','Motion'], page: 'pages/asafe-quirino.html' },
  { num:'06', name:'Welcome Day · CCRP', tags:['Design','Motion'], page: 'pages/welcome-day.html' },
  { num:'07', name:'Highlights Acampa · LKC', tags:['Design','Identidade'], page: 'pages/acampa-lkc.html' },
  { num:'08', name:'Brand Strategy & Visual Identity · Stalo', tags:['Branding','Estratégia'], page: 'pages/stalo.html' },
  { num:'09', name:'Brand Refresh · CRECEI', tags:['Branding','Refresh'], page: 'pages/crecei.html' },
  { num:'10', name:'Brand Design · Charlotte', tags:['Branding','Design'], page: 'pages/charlotte.html' },
  { num:'11', name:'Brand Design · Wave Agency', tags:['Branding','Design'], page: 'pages/wave-agency.html' },
];

const drawer        = document.getElementById('project-drawer');
const frameA        = document.getElementById('drawer-frame-a');
const frameB        = document.getElementById('drawer-frame-b');
const drawerClose   = document.getElementById('drawer-close');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerPrev    = document.getElementById('drawer-prev');
const drawerNext    = document.getElementById('drawer-next');
let currentProject  = 0;
let activeFrame     = frameA;
let animating       = false;

function updateArrows() {
  drawerPrev.disabled = false;
  drawerNext.disabled = false;
}

function slideToProject(index, direction) {
  if (animating || index === currentProject) return;
  const p = projects[index];
  if (!p.page) return;
  animating = true;

  // pausa qualquer vídeo rodando no frame que vai sair
  try {
    const outDoc = activeFrame.contentDocument || activeFrame.contentWindow?.document;
    outDoc?.querySelectorAll('video').forEach(v => v.pause());
  } catch(e) {}

  const outClass = direction === 'next' ? 'slide-out-left'  : 'slide-out-right';
  const inClass  = direction === 'next' ? 'slide-in-right'  : 'slide-in-left';
  const incoming = activeFrame === frameA ? frameB : frameA;

  incoming.src = p.page;
  incoming.style.opacity = '1';
  incoming.style.pointerEvents = 'all';

  activeFrame.classList.add(outClass);
  incoming.classList.add(inClass);

  currentProject = index;
  updateArrows();

  setTimeout(() => {
    activeFrame.classList.remove(outClass);
    activeFrame.style.opacity = '0';
    activeFrame.style.pointerEvents = 'none';
    incoming.classList.remove(inClass);
    activeFrame = incoming;
    animating = false;
  }, 500);
}

function loadProject(index, direction = 'next') {
  if (index === currentProject && drawer.classList.contains('open')) return;
  slideToProject(index, direction);
}

let _lockScrollY = 0;

function lockScroll() {
  if (window.__lenis) window.__lenis.stop();
  _lockScrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_lockScrollY}px`;
  document.body.style.width = '100%';
}

function unlockScroll() {
  if (window.__lenis) window.__lenis.start();
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, _lockScrollY);
}

function openDrawer(index) {
  const p = projects[index];
  if (!p.page) return;
  currentProject = index;
  frameA.src = p.page;
  frameA.style.opacity = '1';
  frameA.style.pointerEvents = 'all';
  frameB.src = '';
  frameB.style.opacity = '0';
  frameB.style.pointerEvents = 'none';
  activeFrame = frameA;
  updateArrows();
  updateMobileCounter();
  lockScroll();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      drawer.classList.add('open');
    });
  });
}

function closeDrawer() {
  try {
    [frameA, frameB].forEach(f => {
      const doc = f.contentDocument || f.contentWindow?.document;
      doc?.querySelectorAll('video').forEach(v => v.pause());
    });
  } catch(e) {}
  drawer.classList.remove('open');
  unlockScroll();
  setTimeout(() => { frameA.src = ''; frameB.src = ''; }, 600);
}

drawerPrev.addEventListener('click', () => { loadProject((currentProject - 1 + projects.length) % projects.length, 'prev'); });
drawerNext.addEventListener('click', () => { loadProject((currentProject + 1) % projects.length, 'next'); });

// Mobile nav buttons
const mobileCounter = document.getElementById('drawer-mobile-counter');
const mobilePrev    = document.getElementById('drawer-mobile-prev');
const mobileNext    = document.getElementById('drawer-mobile-next');
function updateMobileCounter() {
  if (mobileCounter) mobileCounter.textContent = (currentProject + 1) + '/' + projects.length;
}
if (mobilePrev) mobilePrev.addEventListener('click', () => { loadProject((currentProject - 1 + projects.length) % projects.length, 'prev'); updateMobileCounter(); });
if (mobileNext) mobileNext.addEventListener('click', () => { loadProject((currentProject + 1) % projects.length, 'next'); updateMobileCounter(); });

// Swipe touch no drawer panel
(function() {
  const panel = document.getElementById('drawer-panel');
  if (!panel) return;
  let startX = 0, startY = 0;
  panel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  panel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = Math.abs(e.changedTouches[0].clientY - startY);
    if (Math.abs(dx) < 60 || dy > 80) return; // swipe horizontal mínimo 60px
    if (dx < 0) { loadProject((currentProject + 1) % projects.length, 'next'); }
    else        { loadProject((currentProject - 1 + projects.length) % projects.length, 'prev'); }
    updateMobileCounter();
  }, { passive: true });
})();

document.querySelectorAll('.project-item[data-project]').forEach(el => {
  el.addEventListener('click', () => openDrawer(+el.dataset.project));
});
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', () => {
  if (document.getElementById('contact-panel')?.classList.contains('open')) return;
  closeDrawer();
});
document.addEventListener('keydown', e => {
  if (!drawer.classList.contains('open')) return;
  const contactOpen = document.getElementById('contact-panel')?.classList.contains('open');
  if (e.key === 'Escape' && !contactOpen) closeDrawer();
  if (contactOpen) return;
  if (e.key === 'ArrowLeft') loadProject((currentProject - 1 + projects.length) % projects.length, 'prev');
  if (e.key === 'ArrowRight') loadProject((currentProject + 1) % projects.length, 'next');
});
window.addEventListener('message', e => {
  if (e.data === 'closeDrawer') { closeDrawer(); return; }
});

/* ── 3D Tilt effect ── */
function initTilt(el, strength = 12) {
  const glare = document.createElement('div');
  glare.className = 'tilt-glare';
  el.style.position = 'relative';
  el.appendChild(glare);

  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    const rotY =  x * strength;
    const rotX = -y * strength;
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
    el.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    glare.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    el.style.transition = 'transform 0.6s var(--ease), box-shadow 0.4s ease';
  });
}

document.querySelectorAll('.project-item').forEach(el => {
  const thumb = el.querySelector('.project-thumb');
  if (thumb) { thumb.classList.add('tilt'); initTilt(thumb, 14); }
});
document.querySelectorAll('.step, .cta-box').forEach(el => {
  el.classList.add('tilt');
  initTilt(el, el.classList.contains('cta-box') ? 6 : 10);
});

const btnPrimary = document.querySelector('.btn-primary');
if (btnPrimary) initTilt(btnPrimary, 16);

/* ── Background Canvas ── */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let W, H;
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

let mouseX = W * 0.5, mouseY = H * 0.4;
let lerpX  = mouseX,  lerpY  = mouseY;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

const orbs = [
  { x: 0.2, y: 0.3, r: 0.55, color: [255, 77,  0],  speed: 0.00018, phase: 0,    mouse: true  },
  { x: 0.8, y: 0.7, r: 0.45, color: [80,  20, 180], speed: 0.00013, phase: 2.1,  mouse: false },
  { x: 0.5, y: 0.1, r: 0.40, color: [0,  120, 200], speed: 0.00020, phase: 4.3,  mouse: false },
  { x: 0.1, y: 0.8, r: 0.35, color: [180, 40, 255], speed: 0.00015, phase: 1.1,  mouse: false },
];

function drawBg(t) {
  lerpX += (mouseX - lerpX) * 0.04;
  lerpY += (mouseY - lerpY) * 0.04;

  const isLight = document.documentElement.classList.contains('light');
  ctx.fillStyle = isLight ? '#f5f2ee' : '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  orbs.forEach(o => {
    const cx = o.mouse
      ? lerpX + (o.x - 0.5) * W * 0.3
      : (o.x + Math.sin(t * o.speed + o.phase) * 0.12) * W;
    const cy = o.mouse
      ? lerpY + (o.y - 0.5) * H * 0.3
      : (o.y + Math.cos(t * o.speed * 0.8 + o.phase) * 0.10) * H;

    const radius = o.r * Math.max(W, H);
    const alpha  = isLight ? 0.07 : 0.13;
    const [r, g, b] = o.color;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.4})`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(drawBg);
}
requestAnimationFrame(drawBg);

/* ── Lenis smooth scroll + parallax zoom ── */
(function () {
  var lenis = window.__lenis = new Lenis({
    duration: 1.15,
    easing: function(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    smoothWheel: true,
  });

  var easeInOutExpo = function(t) {
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  };

  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      if (href === '#' || href === '#hero') {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.4, easing: easeInOutExpo });
        return;
      }
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4, easing: easeInOutExpo });
    });
  });

  var sections = document.querySelectorAll('.parallax-section');

  function updateParallax() {
    var vh = window.innerHeight;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      var progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
      var eased = 1 - Math.pow(1 - progress, 2);
      var scale = 1.08 - 0.08 * eased;
      sections[i].style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
    }
  }

  function raf(time) {
    lenis.raf(time);
    updateParallax();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* ── Photo blob reveal animation ── */
(function () {
  var wrap = document.getElementById('about-photo-anim');
  if (!wrap) return;

  var gooCanvas = document.getElementById('goo-canvas');
  var gooCtx   = gooCanvas.getContext('2d');
  var maskCvs  = document.createElement('canvas');
  var maskCtx  = maskCvs.getContext('2d');

  var altImg = new Image();
  altImg.src = 'assets/images/about/nathan-alt.webp';

  var blobs = [
    { x: -999, y: -999, ease: 0.18 },
    { x: -999, y: -999, ease: 0.11 },
    { x: -999, y: -999, ease: 0.07 },
    { x: -999, y: -999, ease: 0.045 },
    { x: -999, y: -999, ease: 0.028 }
  ];
  var mouseX = -999, mouseY = -999, hovered = false, gooRunning = false;

  function gooResize() {
    var W = wrap.offsetWidth, H = wrap.offsetHeight;
    gooCanvas.width  = W; gooCanvas.height  = H;
    maskCvs.width    = W; maskCvs.height    = H;
  }

  function coverDraw(ctx, img, W, H) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    var scale = Math.max(W / iw, H / ih);
    var sw = iw * scale, sh = ih * scale;
    ctx.drawImage(img, (W - sw) * 0.65, (H - sh) * 0.15, sw, sh);
  }

  function gooTick() {
    for (var i = 0; i < blobs.length; i++) {
      var tx = i === 0 ? mouseX : blobs[i - 1].x;
      var ty = i === 0 ? mouseY : blobs[i - 1].y;
      blobs[i].x += (tx - blobs[i].x) * blobs[i].ease;
      blobs[i].y += (ty - blobs[i].y) * blobs[i].ease;
    }

    var W = gooCanvas.width, H = gooCanvas.height;
    if (!W || !H || !altImg.complete) { requestAnimationFrame(gooTick); return; }

    var scale = W / 320;
    var radii = [110, 86, 64, 45, 28].map(function(r) { return r * scale; });
    var blur  = Math.round(18 * scale);

    var S = 2;
    var MW = Math.ceil(W / S), MH = Math.ceil(H / S);
    if (maskCvs.width !== MW || maskCvs.height !== MH) {
      maskCvs.width = MW; maskCvs.height = MH;
    }
    maskCtx.clearRect(0, 0, MW, MH);
    maskCtx.filter = 'blur(' + Math.round(blur / S) + 'px)';
    maskCtx.fillStyle = 'white';
    for (var i = 0; i < blobs.length; i++) {
      maskCtx.beginPath();
      maskCtx.arc(blobs[i].x / S, blobs[i].y / S, radii[i] / S, 0, Math.PI * 2);
      maskCtx.fill();
    }
    maskCtx.filter = 'none';

    var id = maskCtx.getImageData(0, 0, MW, MH);
    var d = id.data;
    for (var j = 0; j < d.length; j += 4) {
      var a = d[j + 3];
      var v = a < 40 ? 0 : a > 100 ? 255 : Math.round((a - 40) / 60 * 255);
      d[j] = d[j+1] = d[j+2] = d[j+3] = v;
    }
    maskCtx.putImageData(id, 0, 0);

    gooCtx.clearRect(0, 0, W, H);
    coverDraw(gooCtx, altImg, W, H);
    gooCtx.globalCompositeOperation = 'destination-in';
    gooCtx.drawImage(maskCvs, 0, 0, W, H);
    gooCtx.globalCompositeOperation = 'source-over';

    if (gooRunning) requestAnimationFrame(gooTick);
  }

  wrap.addEventListener('mouseenter', function() {
    hovered = true;
    if (!gooRunning) { gooRunning = true; requestAnimationFrame(gooTick); }
  });
  wrap.addEventListener('mouseleave', function() {
    hovered = false;
    gooRunning = false;
    // reset blobs off-screen so canvas clears on next hover
    blobs.forEach(function(b) { b.x = -999; b.y = -999; });
    mouseX = -999; mouseY = -999;
    // clear canvas
    gooCtx.clearRect(0, 0, gooCanvas.width, gooCanvas.height);
  });

  window.addEventListener('mousemove', function (e) {
    if (!hovered) return;
    var rect = wrap.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  window.addEventListener('resize', gooResize);

  gooResize();
})();

/* ── Hero scroll indicator visibility ── */
(function () {
  const scrollWrap = document.querySelector('.hero-scroll-wrap');
  const hero = document.getElementById('hero');
  if (!scrollWrap || !hero) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      scrollWrap.style.opacity = entry.isIntersecting ? '1' : '0';
      scrollWrap.style.pointerEvents = entry.isIntersecting ? 'auto' : 'none';
    });
  }, { threshold: 0.3 });

  obs.observe(hero);
})();

/* ── Process Carousel ── */
(function () {
  const track = document.querySelector('.process-track');
  const steps = document.querySelectorAll('.process-track .step');
  const dots = document.querySelectorAll('.process-dot');
  const prev = document.querySelector('.process-prev');
  const next = document.querySelector('.process-next');
  if (!track || !steps.length) return;

  let current = 0;

  function goTo(idx) {
    steps[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + steps.length) % steps.length;
    steps[current].classList.add('active');
    dots[current].classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
})();

/* ── CTA hover — site fica laranja ── */
let ctaHoverFreeze = null;
let ctaHoverUnfreeze = null;
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'cta-overlay';
  document.body.appendChild(overlay);

  const cta    = document.querySelector('#cta .btn-primary');
  const ctaBox = document.querySelector('.cta-box');
  if (!cta || !ctaBox) return;

  // SVG trim-path stroke — fora da box para não ser cortado pelo overflow:hidden
  const ctaSection = document.querySelector('#cta');
  const ns  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.id    = 'cta-stroke-svg';
  const r   = document.createElementNS(ns, 'rect');
  r.setAttribute('rx', '20');
  svg.appendChild(r);
  ctaSection.appendChild(svg);

  function updateStroke() {
    const boxRect     = ctaBox.getBoundingClientRect();
    const parentRect  = ctaSection.getBoundingClientRect();
    const top    = boxRect.top  - parentRect.top;
    const left   = boxRect.left - parentRect.left;
    const width  = boxRect.width;
    const height = boxRect.height;
    const rx = 20;
    const perimeter = 2 * (width - 2 * rx) + 2 * (height - 2 * rx) + 2 * Math.PI * rx;

    svg.style.position = 'absolute';
    svg.style.top      = top  + 'px';
    svg.style.left     = left + 'px';
    svg.style.width    = width  + 'px';
    svg.style.height   = height + 'px';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    r.setAttribute('width',  width  - 3);
    r.setAttribute('height', height - 3);
    r.setAttribute('x', '1.5');
    r.setAttribute('y', '1.5');
    r.style.strokeDasharray  = perimeter;
    r.style.strokeDashoffset = perimeter;
    svg.dataset.perimeter = perimeter;
  }

  // Logo branca sobre a box
  const logoSrc = document.querySelector('.nav-logo-img');
  const logoOverlay = document.createElement('div');
  logoOverlay.id = 'cta-logo-overlay';
  if (logoSrc) {
    const logoClone = logoSrc.cloneNode(true);
    logoClone.removeAttribute('class');
    logoOverlay.appendChild(logoClone);
  }
  ctaSection.appendChild(logoOverlay);

  function updateLogoPos() {
    const boxRect    = ctaBox.getBoundingClientRect();
    const parentRect = ctaSection.getBoundingClientRect();
    const top  = boxRect.top  - parentRect.top;
    const left = boxRect.left - parentRect.left + boxRect.width / 2;
    logoOverlay.style.top       = top + 'px';
    logoOverlay.style.left      = left + 'px';
    logoOverlay.style.transform = 'translate(-50%, -160%)';
  }

  updateStroke();
  updateLogoPos();
  window.addEventListener('resize', () => { updateStroke(); updateLogoPos(); });

  let frozen = false;

  function activateHover() {
    updateStroke();
    updateLogoPos();
    overlay.classList.add('active');
    ctaBox.classList.add('btn-hovered');
    logoOverlay.classList.add('visible');
    const p = svg.dataset.perimeter;
    r.style.transition = 'none';
    r.style.strokeDashoffset = p;
    requestAnimationFrame(() => {
      r.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
      r.style.strokeDashoffset = 0;
    });
  }

  function deactivateHover() {
    overlay.classList.remove('active');
    ctaBox.classList.remove('btn-hovered');
    logoOverlay.classList.remove('visible');
    const p = svg.dataset.perimeter;
    r.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)';
    r.style.strokeDashoffset = p;
  }

  cta.addEventListener('mouseenter', () => { if (!frozen) activateHover(); });
  cta.addEventListener('mouseleave', () => { if (!frozen) deactivateHover(); });

  ctaHoverFreeze   = () => { frozen = true;  if (!ctaBox.classList.contains('btn-hovered')) activateHover(); };
  ctaHoverUnfreeze = () => { frozen = false; deactivateHover(); };
})();

/* ── Contact Panel ── */
(function () {
  const panel   = document.getElementById('contact-panel');
  const overlay = document.getElementById('contact-overlay');
  const closeBtn = document.getElementById('contact-close');
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('cf-success');

  const whatsappBtn = document.getElementById('whatsapp-btn');

  function openContact(fromCtaBtn = false) {
    if (fromCtaBtn && ctaHoverFreeze) ctaHoverFreeze();
    lockScroll();
    panel.classList.add('open');
    if (whatsappBtn) whatsappBtn.style.display = 'none';
    if (window.matchMedia('(hover: hover)').matches) {
      panel.querySelector('#cf-name')?.focus();
    }
  }

  function closeContact() {
    panel.classList.remove('open');
    unlockScroll();
    if (whatsappBtn) whatsappBtn.style.display = '';
    if (ctaHoverUnfreeze) ctaHoverUnfreeze();
  }

  document.querySelectorAll('.open-contact').forEach(btn => {
    const isCtaBtn = btn.closest('#cta') !== null;
    btn.addEventListener('click', () => openContact(isCtaBtn));
  });

  closeBtn.addEventListener('click', closeContact);
  overlay.addEventListener('click', closeContact);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeContact();
  });

  panel.addEventListener('touchstart', e => {
    const tag = e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
      document.activeElement?.blur();
    }
  }, { passive: true });

  const errorEl  = document.getElementById('cf-error');
  const submitBtn = form.querySelector('.cf-submit');

  function showMsg(el, text, duration = 5000) {
    el.textContent = text;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), duration);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = form.querySelector('#cf-name').value.trim();
    const contact = form.querySelector('#cf-contact').value.trim();
    const message = form.querySelector('#cf-message').value.trim();
    const types   = [...form.querySelectorAll('input[name="type"]:checked')].map(c => c.value).join(', ');

    // Validação
    if (!name) { showMsg(errorEl, 'Por favor, preencha seu nome.'); return; }
    if (!contact) { showMsg(errorEl, 'Por favor, preencha seu e-mail ou WhatsApp.'); return; }
    if (contact.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
        showMsg(errorEl, 'E-mail inválido. Verifique o formato (ex: nome@email.com).'); return;
      }
    } else {
      const digits = contact.replace(/\D/g, '');
      if (digits.length < 10) {
        showMsg(errorEl, 'WhatsApp inválido. Digite pelo menos 10 dígitos com DDD.'); return;
      }
    }
    if (!message) { showMsg(errorEl, 'Conte um pouco sobre o seu projeto.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    emailjs.send('service_op2nr3o', 'template_hxodt4e', {
      nome:           name,
      contato:        contact,
      tipo_projeto:   types || '—',
      mensagem:       message,
    })
    .then(() => {
      showMsg(success, 'Mensagem enviada com sucesso!');
      form.reset();
    })
    .catch(() => {
      showMsg(errorEl, 'Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Vamos criar <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    });
  });
})();

/* ── Lazy load card videos ── */
(function() {
  const lazyVideos = document.querySelectorAll('video.lazy-video[data-src]');
  if (!lazyVideos.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const v = e.target;
        v.src = v.dataset.src;
        v.removeAttribute('data-src');
        v.play().catch(() => {});
        obs.unobserve(v);
      }
    });
  }, { rootMargin: '200px' });
  lazyVideos.forEach(v => obs.observe(v));
})();
