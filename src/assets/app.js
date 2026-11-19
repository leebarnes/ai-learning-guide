// AI Advantage — progressive enhancements. Every page works without this file.
(function () {
  'use strict';

  // ── Theme toggle (light / dark; defaults to the system setting) ───────────
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    var root = document.documentElement;
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    var current = function () {
      return root.dataset.theme || (systemDark && systemDark.matches ? 'dark' : 'light');
    };
    var label = function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      themeBtn.title = 'Switch to ' + next + ' theme';
    };
    themeBtn.hidden = false;
    label();
    themeBtn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      label();
    });
    if (systemDark && systemDark.addEventListener) systemDark.addEventListener('change', label);
  }

  // ── Mobile navigation ─────────────────────────────────────────────────────
  var navBtn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (navBtn && nav) {
    navBtn.hidden = false;
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      navBtn.setAttribute('aria-expanded', String(open));
    };
    navBtn.addEventListener('click', function () {
      setOpen(navBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        navBtn.focus();
      }
    });
  }

  // ── Copy-prompt buttons ───────────────────────────────────────────────────
  if (navigator.clipboard) {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      var code = btn.closest('figure').querySelector('pre');
      btn.hidden = false;
      btn.setAttribute('aria-label', 'Copy prompt to clipboard');
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(code.innerText).then(
          function () {
            btn.textContent = 'Copied';
            setTimeout(function () { btn.textContent = 'Copy'; }, 1800);
          },
          function () {
            btn.textContent = 'Select and copy';
          }
        );
      });
    });
  }

  // ── Resource filters ──────────────────────────────────────────────────────
  var form = document.getElementById('resource-filters');
  var list = document.getElementById('resource-list');
  if (form && list) {
    var items = Array.prototype.slice.call(list.children);
    var status = document.getElementById('filter-status');
    var empty = document.getElementById('empty-state');
    var selects = Array.prototype.slice.call(form.querySelectorAll('select'));

    // Which data-* attribute each filter reads, and whether it holds a space-separated list.
    var fields = {
      stage: { attr: 'stages', list: true },
      topic: { attr: 'topics', list: true },
      role: { attr: 'roles', list: true },
      level: { attr: 'level' },
      scope: { attr: 'scope' },
      cost: { attr: 'cost' },
    };

    var matches = function (el, name, value) {
      var f = fields[name];
      var raw = el.dataset[f.attr] || '';
      if (name === 'level') return raw === value || raw === 'all';
      if (name === 'cost' && value === 'free') return raw === 'free' || raw === 'free-account';
      return f.list ? raw.split(' ').indexOf(value) !== -1 : raw === value;
    };

    var apply = function (updateUrl) {
      var active = selects.filter(function (s) { return s.value; });
      var shown = 0;
      items.forEach(function (el) {
        var ok = active.every(function (s) { return matches(el, s.name, s.value); });
        el.hidden = !ok;
        if (ok) shown++;
      });
      selects.forEach(function (s) { s.classList.toggle('is-active', !!s.value); });
      empty.hidden = shown !== 0;
      status.textContent = active.length
        ? 'Showing ' + shown + ' of ' + items.length + ' resources'
        : 'Showing all ' + items.length + ' resources';

      if (updateUrl && window.history && history.replaceState) {
        var params = new URLSearchParams();
        active.forEach(function (s) { params.set(s.name, s.value); });
        var qs = params.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      }
    };

    // Pre-select filters from the URL, e.g. resources/?stage=3&role=data-analyst
    var params = new URLSearchParams(location.search);
    selects.forEach(function (s) {
      var v = params.get(s.name);
      if (v && s.querySelector('option[value="' + CSS.escape(v) + '"]')) s.value = v;
    });

    form.hidden = false;
    form.addEventListener('change', function () { apply(true); });
    form.addEventListener('reset', function () { setTimeout(function () { apply(true); }, 0); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    apply(false);
  }
})();
