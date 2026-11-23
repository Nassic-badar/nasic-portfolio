/* ─────────────────────────────────────────────────────────────────────────
   Nasic Badar — Portfolio
   Vanilla JS. No dependencies. Progressive enhancement where it counts.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ── Theme ────────────────────────────────────────────────────────────── */
  var themeToggle = document.getElementById('theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (themeToggle) {
      var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#121110' : '#f3f0e8');
  }

  syncTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('nb-theme', next);
      } catch (e) {
        /* private mode — ignore */
      }
      syncTheme();
      window.dispatchEvent(new CustomEvent('nb:theme'));
    });
  }

  /* ── Clock (Karak, PKT) ───────────────────────────────────────────────── */
  var clockEls = Array.prototype.slice.call(document.querySelectorAll('[data-clock]'));
  var clockFmt = null;

  try {
    clockFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (e) {
    clockFmt = null;
  }

  function tickClock() {
    var now = new Date();
    var text = clockFmt ? clockFmt.format(now) : now.toTimeString().slice(0, 5);
    clockEls.forEach(function (el) {
      el.textContent = text;
      el.setAttribute('datetime', now.toISOString());
    });
  }

  tickClock();
  window.setInterval(tickClock, 15000);

  /* ── Mobile menu ──────────────────────────────────────────────────────── */
  var menu = document.getElementById('mobile-menu');
  var menuToggle = document.getElementById('menu-toggle');
  var menuLabel = menuToggle ? menuToggle.querySelector('.menu-label') : null;

  function setMenu(open) {
    if (!menu || !menuToggle) return;
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (menu) {
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) {
      setMenu(false);
      if (menuToggle) menuToggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && menu && !menu.hidden) setMenu(false);
  });

  /* ── Scroll progress + header state ───────────────────────────────────── */
  var progressBar = document.querySelector('.scroll-progress span');
  var header = document.querySelector('.site-header');
  var scrollQueued = false;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.transform = 'scaleX(' + ratio + ')';
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    scrollQueued = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!scrollQueued) {
        scrollQueued = true;
        window.requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* ── Reveal on scroll ─────────────────────────────────────────────────── */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('in');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    revealEls.forEach(function (el, i) {
      el.style.setProperty('--d', String(i % 4));
      revealObserver.observe(el);
    });
  }

  /* ── Active nav link ──────────────────────────────────────────────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var navSections = navLinks
    .map(function (link) {
      var id = (link.getAttribute('href') || '').slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && navSections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
    );
    navSections.forEach(function (section) {
      navObserver.observe(section);
    });

    window.addEventListener(
      'scroll',
      function () {
        if (window.scrollY < 80) {
          navLinks.forEach(function (link) {
            link.classList.remove('is-active');
          });
        }
      },
      { passive: true }
    );
  }

  /* ── Pipeline tabs ────────────────────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-pipeline]'), function (pipeline) {
    var tabs = Array.prototype.slice.call(pipeline.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(pipeline.querySelectorAll('[role="tabpanel"]'));

    function select(index) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle('is-active', active);
      });
      panels.forEach(function (panel, i) {
        panel.hidden = i !== index;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i);
      });

      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;

        if (next !== null) {
          e.preventDefault();
          select(next);
          tabs[next].focus();
        }
      });
    });
  });

  /* ── Stack filter ─────────────────────────────────────────────────────── */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var stackGroups = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (other) {
        var active = other === button;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      stackGroups.forEach(function (group) {
        var match = filter === 'all' || group.getAttribute('data-group') === filter;
        group.classList.toggle('is-dimmed', !match);
      });
    });
  });

  /* ── Copy email ───────────────────────────────────────────────────────── */
  var copyBtn = document.getElementById('copy-email');
  var copyLabel = copyBtn ? copyBtn.querySelector('.copy-label') : null;
  var copyTimer = 0;

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    area.remove();
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || '';

      function done(ok) {
        if (copyLabel) copyLabel.textContent = ok ? 'Copied' : 'Copy failed';
        copyBtn.classList.toggle('is-copied', ok);
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () {
          if (copyLabel) copyLabel.textContent = 'Copy';
          copyBtn.classList.remove('is-copied');
        }, 2200);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(
          function () {
            done(true);
          },
          function () {
            done(fallbackCopy(email));
          }
        );
      } else {
        done(fallbackCopy(email));
      }
    });
  }

  /* ───────────────────────────────────────────────────────────────────────
     Signal field
     A live scalar surface drawn with marching squares. Four drifting
     Gaussian centres; ink contours; one highlighted signal line; a probe
     that reports the value under the cursor. Pauses off-screen and
     respects reduced motion.
     ─────────────────────────────────────────────────────────────────────── */
  function SignalField(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stage = canvas.parentElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = 0;
    this.h = 0;
    this.cols = 0;
    this.rows = 0;
    this.vals = null;
    this.levels = [0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92];
    this.highlight = 0.52;
    this.blobs = [
      { x: 0.36, y: 0.36, r: 0.155, a: 1.0, sx: 0.11, sy: 0.09, px: 0.0, py: 1.4, ax: 0.035, ay: 0.03 },
      { x: 0.68, y: 0.64, r: 0.145, a: 0.92, sx: 0.09, sy: 0.12, px: 2.1, py: 0.3, ax: 0.04, ay: 0.035 },
      { x: 0.56, y: 0.2, r: 0.115, a: 0.8, sx: 0.14, sy: 0.08, px: 4.2, py: 2.6, ax: 0.03, ay: 0.04 },
      { x: 0.22, y: 0.78, r: 0.125, a: 0.72, sx: 0.07, sy: 0.1, px: 1.3, py: 5.1, ax: 0.035, ay: 0.025 },
      { x: 0.8, y: 0.28, r: 0.105, a: 0.62, sx: 0.12, sy: 0.07, px: 3.4, py: 0.9, ax: 0.03, ay: 0.035 },
      { x: 0.45, y: 0.85, r: 0.1, a: 0.55, sx: 0.08, sy: 0.13, px: 5.2, py: 3.7, ax: 0.03, ay: 0.025 }
    ];
    this.pointer = { x: 0.5, y: 0.5, active: false };
    this.probe = { x: 0.5, y: 0.5 };
    this.t = 0;
    this.running = false;
    this.visible = true;
    this.raf = 0;
    this.lastTs = 0;
    this.lastDraw = 0;
    this.lastReadout = { x: -1, y: -1, f: -1 };
    this.readoutX = document.querySelector('[data-probe="x"]');
    this.readoutY = document.querySelector('[data-probe="y"]');
    this.readoutF = document.querySelector('[data-probe="f"]');
    this.colors = this.readColors();

    this.onResize = this.resize.bind(this);
    this.onPointerMove = this.handlePointer.bind(this);
    this.onPointerLeave = this.handleLeave.bind(this);
    this.loop = this.loop.bind(this);
    this.handleTheme = this.handleTheme.bind(this);

    this.resize();
    this.bind();
    this.observe();

    if (reducedMotion) {
      this.t = 2.4;
      this.compute();
      this.draw();
    } else {
      this.setRunning(true);
    }

    window.addEventListener('nb:theme', this.handleTheme);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(this.draw.bind(this));
    }
  }

  SignalField.prototype.readColors = function () {
    var styles = getComputedStyle(root);
    function get(name, fallback) {
      var value = styles.getPropertyValue(name).trim();
      return value || fallback;
    }
    return {
      ink: get('--ink', '#14130f'),
      accent: get('--accent', '#cf4318'),
      rule: get('--rule-strong', 'rgba(20,19,15,.32)'),
      paper: get('--paper', '#f3f0e8'),
      muted: get('--muted', '#655e51')
    };
  };

  SignalField.prototype.resize = function () {
    var rect = this.stage.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));

    this.w = w;
    this.h = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cols = 80;
    this.rows = Math.max(48, Math.round((80 * h) / w));
    this.vals = new Float32Array((this.cols + 1) * (this.rows + 1));

    this.compute();
    this.draw();
  };

  SignalField.prototype.bind = function () {
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerdown', this.onPointerMove);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
  };

  SignalField.prototype.observe = function () {
    var self = this;

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.stage);
    } else {
      window.addEventListener('resize', this.onResize);
    }

    if ('IntersectionObserver' in window) {
      this.intersection = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            self.visible = entry.isIntersecting;
            self.setRunning(self.visible);
          });
        },
        { threshold: 0 }
      );
      this.intersection.observe(this.stage);
    }
  };

  SignalField.prototype.handlePointer = function (e) {
    var rect = this.canvas.getBoundingClientRect();
    this.pointer.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    this.pointer.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    this.pointer.active = true;
    if (reducedMotion) this.draw();
  };

  SignalField.prototype.handleLeave = function () {
    this.pointer.active = false;
    if (reducedMotion) this.draw();
  };

  SignalField.prototype.handleTheme = function () {
    this.colors = this.readColors();
    if (reducedMotion) this.draw();
    else this.draw();
  };

  SignalField.prototype.setRunning = function (run) {
    if (reducedMotion) {
      if (run) this.draw();
      return;
    }
    if (run && !this.running) {
      this.running = true;
      this.lastTs = 0;
      this.raf = window.requestAnimationFrame(this.loop);
    } else if (!run && this.running) {
      this.running = false;
      window.cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  };

  SignalField.prototype.loop = function (ts) {
    if (!this.running) return;
    if (!this.lastTs) this.lastTs = ts;

    var dt = Math.min(0.05, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    this.t += dt;

    if (ts - this.lastDraw >= 32) {
      this.lastDraw = ts;
      this.compute();
      this.draw();
    }

    this.raf = window.requestAnimationFrame(this.loop);
  };

  SignalField.prototype.field = function (x, y) {
    var v = 0.022 * Math.sin(11 * x + this.t * 0.35) * Math.cos(9 * y - this.t * 0.28);
    for (var i = 0; i < this.blobs.length; i++) {
      var b = this.blobs[i];
      var bx = b.x + b.ax * Math.sin(this.t * b.sx + b.px);
      var by = b.y + b.ay * Math.cos(this.t * b.sy + b.py);
      var dx = x - bx;
      var dy = y - by;
      v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.r * b.r));
    }
    return v;
  };

  SignalField.prototype.compute = function () {
    if (!this.vals) return;

    var cols = this.cols;
    var rows = this.rows;
    var vals = this.vals;
    var stride = cols + 1;

    for (var j = 0; j <= rows; j++) {
      var y = j / rows;
      for (var i = 0; i <= cols; i++) {
        vals[j * stride + i] = this.field(i / cols, y);
      }
    }
  };

  SignalField.prototype.inverse = function (a, b, level) {
    var d = b - a;
    if (d === 0) return 0.5;
    return Math.min(1, Math.max(0, (level - a) / d));
  };

  SignalField.prototype.drawContours = function () {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var cols = this.cols;
    var rows = this.rows;
    var vals = this.vals;
    var stride = cols + 1;
    var sx = w / cols;
    var sy = h / rows;
    var colors = this.colors;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (var l = 0; l < this.levels.length; l++) {
      var level = this.levels[l];
      var highlighted = Math.abs(level - this.highlight) < 0.0001;

      ctx.beginPath();

      for (var j = 0; j < rows; j++) {
        var y0 = j * sy;
        var y1 = y0 + sy;

        for (var i = 0; i < cols; i++) {
          var v00 = vals[j * stride + i];
          var v10 = vals[j * stride + i + 1];
          var v01 = vals[(j + 1) * stride + i];
          var v11 = vals[(j + 1) * stride + i + 1];

          var code = 0;
          if (v00 > level) code |= 1;
          if (v10 > level) code |= 2;
          if (v11 > level) code |= 4;
          if (v01 > level) code |= 8;

          if (code === 0 || code === 15) continue;

          var x0 = i * sx;
          var x1 = x0 + sx;

          var top = [x0 + sx * this.inverse(v00, v10, level), y0];
          var right = [x1, y0 + sy * this.inverse(v10, v11, level)];
          var bottom = [x0 + sx * this.inverse(v01, v11, level), y1];
          var left = [x0, y0 + sy * this.inverse(v00, v01, level)];

          switch (code) {
            case 1:
            case 14:
              ctx.moveTo(left[0], left[1]);
              ctx.lineTo(top[0], top[1]);
              break;
            case 2:
            case 13:
              ctx.moveTo(top[0], top[1]);
              ctx.lineTo(right[0], right[1]);
              break;
            case 3:
            case 12:
              ctx.moveTo(left[0], left[1]);
              ctx.lineTo(right[0], right[1]);
              break;
            case 4:
            case 11:
              ctx.moveTo(right[0], right[1]);
              ctx.lineTo(bottom[0], bottom[1]);
              break;
            case 6:
            case 9:
              ctx.moveTo(top[0], top[1]);
              ctx.lineTo(bottom[0], bottom[1]);
              break;
            case 7:
            case 8:
              ctx.moveTo(left[0], left[1]);
              ctx.lineTo(bottom[0], bottom[1]);
              break;
            case 5:
              ctx.moveTo(left[0], left[1]);
              ctx.lineTo(top[0], top[1]);
              ctx.moveTo(right[0], right[1]);
              ctx.lineTo(bottom[0], bottom[1]);
              break;
            case 10:
              ctx.moveTo(top[0], top[1]);
              ctx.lineTo(right[0], right[1]);
              ctx.moveTo(left[0], left[1]);
              ctx.lineTo(bottom[0], bottom[1]);
              break;
            default:
              break;
          }
        }
      }

      ctx.globalAlpha = highlighted ? 0.95 : 0.08 + (level / 0.9) * 0.34;
      ctx.strokeStyle = highlighted ? colors.accent : colors.ink;
      ctx.lineWidth = highlighted ? 1.6 : 1;
      ctx.stroke();
    }

    ctx.restore();
  };

  SignalField.prototype.updateProbe = function () {
    var x;
    var y;

    if (this.pointer.active) {
      x = this.pointer.x;
      y = this.pointer.y;
    } else {
      x = 0.42 + 0.24 * Math.sin(this.t * 0.22);
      y = 0.4 + 0.2 * Math.cos(this.t * 0.17);
    }

    this.probe.x = x;
    this.probe.y = y;

    var f = this.field(x, y);

    if (
      Math.abs(f - this.lastReadout.f) > 0.002 ||
      Math.abs(x - this.lastReadout.x) > 0.003 ||
      Math.abs(y - this.lastReadout.y) > 0.003
    ) {
      this.lastReadout = { x: x, y: y, f: f };
      if (this.readoutX) this.readoutX.textContent = x.toFixed(2);
      if (this.readoutY) this.readoutY.textContent = y.toFixed(2);
      if (this.readoutF) this.readoutF.textContent = f.toFixed(3);
    }
  };

  SignalField.prototype.drawProbe = function () {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var colors = this.colors;
    var px = this.probe.x * w;
    var py = this.probe.y * h;
    var f = this.field(this.probe.x, this.probe.y);

    ctx.save();

    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
    ctx.moveTo(px, 0);
    ctx.lineTo(px, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();

    var label = 'f ' + f.toFixed(3);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'middle';
    var textWidth = ctx.measureText(label).width;
    var lx = px + 14;
    var ly = py - 14;

    if (lx + textWidth + 12 > w) lx = px - textWidth - 20;
    if (ly < 16) ly = py + 16;

    ctx.globalAlpha = 0.92;
    ctx.fillStyle = colors.paper;
    ctx.fillRect(lx - 5, ly - 9, textWidth + 10, 18);
    ctx.strokeStyle = colors.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(lx - 5, ly - 9, textWidth + 10, 18);
    ctx.fillStyle = colors.accent;
    ctx.fillText(label, lx, ly);

    ctx.restore();
  };

  SignalField.prototype.draw = function () {
    if (!this.ctx || !this.w || !this.h) return;
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawContours();
    this.updateProbe();
    this.drawProbe();
  };

  var fieldCanvas = document.getElementById('field-canvas');
  if (fieldCanvas && fieldCanvas.getContext) {
    try {
      new SignalField(fieldCanvas);
    } catch (e) {
      /* the field is decorative; never let it break the page */
    }
  }
})();
