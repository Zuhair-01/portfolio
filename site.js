(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');

  var EMAIL = 'zoherwazz6@gmail.com';
  var WA = 'https://wa.me/963968304197?text=';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MODES = {
    hire: {
      href: 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Role inquiry for Zuhair'),
      label: 'Email me about a role'
    },
    build: {
      href: WA + encodeURIComponent('Hi Zuhair, I have an idea I want built. Here is what I need: '),
      label: 'Tell me your idea on WhatsApp'
    }
  };

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.switch button'));
  var pill = document.querySelector('.switch .pill');
  var swaps = Array.prototype.slice.call(document.querySelectorAll('[data-hire][data-build]'));
  var ctas = Array.prototype.slice.call(document.querySelectorAll('[data-cta]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));

  function movePill() {
    var on = document.querySelector('.switch button[aria-pressed="true"]');
    if (!on || !pill) return;
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + on.offsetLeft + 'px)';
  }

  function apply(mode, animate) {
    root.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
    movePill();

    var write = function () {
      swaps.forEach(function (el) { el.textContent = el.getAttribute('data-' + mode); });
      ctas.forEach(function (a) {
        a.setAttribute('href', MODES[mode].href);
        var t = a.querySelector('.t');
        if (t) t.textContent = MODES[mode].label;
      });
      cards.forEach(function (c) { c.style.setProperty('--o', c.getAttribute('data-o-' + mode) || 0); });
    };

    if (animate && !reduce) {
      var fx = document.querySelectorAll('.swap');
      fx.forEach(function (n) { n.classList.add('out'); });
      setTimeout(function () { write(); fx.forEach(function (n) { n.classList.remove('out'); }); }, 300);
    } else { write(); }

    store('mode', mode);
    try {
      var u = new URL(location.href); u.searchParams.set('for', mode);
      history.replaceState(null, '', u);
    } catch (e) {}
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { apply(b.dataset.mode, true); });
  });

  var q = new URLSearchParams(location.search).get('for');
  var start = (q === 'build' || q === 'hire') ? q : (store('mode') === 'build' ? 'build' : 'hire');
  apply(start, false);
  window.addEventListener('resize', movePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

  var fbtns = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.dataset.f;
      cards.forEach(function (c) {
        var show = f === 'all' || (c.dataset.cat || '').split(' ').indexOf(f) > -1;
        c.classList.toggle('hide', !show);
      });
    });
  });

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(function (n) { io ? io.observe(n) : n.classList.add('in'); });

  var stack = document.querySelector('.stack');
  if (stack && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var a = stack.querySelector('.win.a'), b2 = stack.querySelector('.win.b');
    stack.addEventListener('pointermove', function (e) {
      var r = stack.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      a.style.transform = 'rotateY(' + (8 + x * 10) + 'deg) rotateX(' + (3 - y * 8) + 'deg) translate3d(' + x * 8 + 'px,' + y * 8 + 'px,0)';
      b2.style.transform = 'rotateY(' + (-6 + x * 8) + 'deg) rotateX(' + (2 - y * 6) + 'deg) translate3d(' + x * -10 + 'px,' + y * -10 + 'px,0)';
    });
    stack.addEventListener('pointerleave', function () { a.style.transform = ''; b2.style.transform = ''; });
  }

  var copy = document.querySelector('.copy');
  if (copy) {
    copy.addEventListener('click', function () {
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = EMAIL; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(EMAIL).then(done, function () {});
      else { var t = document.createElement('textarea'); t.value = EMAIL; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) {} t.remove(); }
    });
  }
})();
