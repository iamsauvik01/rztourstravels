/*!
 * R&Z Tours and Travels — main.js
 * Requires jQuery 3.7.1. One shared script for every page; page-specific
 * modules check for their markup first and quietly do nothing if it's absent.
 *
 * Modules
 *   entrance ........ first-visit preloader / page-transition curtain reveal
 *   pageTransitions . intercept internal links, play curtain, then navigate
 *   header .......... transparent -> solid on scroll, hide down / show up
 *   mobileMenu ...... full-screen overlay, focus trap, body scroll lock
 *   splitText ....... word-by-word headline reveal
 *   reveal .......... IntersectionObserver scroll reveals + stagger
 *   counters ........ animated number counters
 *   parallax ........ subtle background parallax (desktop, fine pointer only)
 *   heroSlider ...... crossfading Ken Burns hero slideshow
 *   destStrip ....... draggable / swipeable horizontal destinations strip
 *   carousel ........ testimonial carousel (autoplay, pause, swipe, keys)
 *   lightbox ........ accessible gallery lightbox (keys, swipe, focus trap)
 *   filters ......... animated package filtering
 *   accordion ....... itinerary + FAQ accordions
 *   contactForm ..... inline validation, Formspree submit, ?package= preselect
 *   ratingBars / timeline / anchors / misc
 */
(function ($, window, document) {
  'use strict';

  var $win = $(window);
  var $doc = $(document);
  var $html = $(document.documentElement);
  var $body;

  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var prefersReduced = mq('(prefers-reduced-motion: reduce)');
  var isTouch = mq('(hover: none), (pointer: coarse)');
  var isSmall = function () { return window.innerWidth < 768; };

  var RZ = { suppressHeader: false };
  window.RZ = RZ;

  /* ---------- Shared helpers ---------- */

  // rAF-throttled handler
  function rafThrottle(fn) {
    var queued = false;
    return function () {
      if (queued) { return; }
      queued = true;
      window.requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  // Body scroll lock that also works on iOS (position: fixed technique)
  var lockY = 0, lockCount = 0;
  RZ.lock = function () {
    if (lockCount++ > 0) { return; }
    lockY = window.scrollY || window.pageYOffset;
    $body.addClass('is-locked').css({ position: 'fixed', top: -lockY + 'px', left: 0, right: 0, width: '100%' });
  };
  RZ.unlock = function () {
    if (lockCount === 0) { return; }
    if (--lockCount > 0) { return; }
    $body.removeClass('is-locked').css({ position: '', top: '', left: '', right: '', width: '' });
    RZ.suppressHeader = true;
    window.scrollTo(0, lockY);
  };

  // Keep Tab focus inside a container (menus, dialogs)
  function trapFocus(e, $container, $extra) {
    if (e.key !== 'Tab') { return; }
    var $f = $container.find('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])').filter(':visible');
    if ($extra) { $f = $extra.add($f); }
    if (!$f.length) { return; }
    var first = $f.get(0), last = $f.get($f.length - 1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Entrance: preloader or curtain reveal ---------- */
  RZ.entrance = function () {
    var $pt = $('.page-transition');
    var ready = function () {
      if ($body.hasClass('is-ready')) { return; }
      $body.addClass('is-ready');
      $doc.trigger('rz:ready');
    };

    if ($html.hasClass('show-preloader')) {
      setTimeout(function () {
        $('.preloader').addClass('is-done');
        ready();
        setTimeout(function () { $html.removeClass('show-preloader'); }, 700);
      }, prefersReduced ? 150 : 1350);
    } else if ($html.hasClass('pt-cover')) {
      window.requestAnimationFrame(function () {
        var done = false;
        var cleanup = function () {
          if (done) { return; }
          done = true;
          $pt.removeClass('is-revealing');
        };
        $pt.addClass('is-revealing');
        $html.removeClass('pt-cover');
        setTimeout(ready, prefersReduced ? 0 : 280);
        $pt.one('transitionend', cleanup);
        setTimeout(cleanup, 1200);
      });
    } else {
      ready();
    }
  };

  /* ---------- Page transitions ---------- */
  RZ.pageTransitions = function () {
    var $pt = $('.page-transition');

    $doc.on('click', 'a[href]', function (e) {
      var a = this;
      var href = a.getAttribute('href');
      if (e.isDefaultPrevented() || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
      if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) { return; }
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|sms|javascript):/i.test(href)) { return; }
      if (a.protocol !== window.location.protocol || a.host !== window.location.host) { return; }
      // same-page hash links scroll normally
      if (a.pathname === window.location.pathname && a.search === window.location.search && a.hash) { return; }
      // only HTML pages (never images opened by the lightbox, PDFs, etc.)
      if (!/(\.html?|\/)$/i.test(a.pathname)) { return; }

      e.preventDefault();
      var dest = a.href;
      if (prefersReduced) { window.location.href = dest; return; }
      $pt.removeClass('is-revealing').addClass('is-leaving');
      setTimeout(function () { window.location.href = dest; }, 620);
    });

    // Back/forward cache: never leave the curtain stuck over the page
    $win.on('pageshow', function (e) {
      if (e.originalEvent && e.originalEvent.persisted) {
        $pt.removeClass('is-leaving is-revealing');
        $html.removeClass('pt-cover show-preloader');
        $body.addClass('is-ready');
        if ($body.hasClass('menu-open')) { $('.menu-toggle').trigger('click'); }
      }
    });
  };

  /* ---------- Header ---------- */
  RZ.header = function () {
    var $h = $('.site-header');
    if (!$h.length) { return; }
    var lastY = window.scrollY;

    var update = function () {
      var y = window.scrollY;
      if (RZ.suppressHeader || $body.hasClass('is-locked')) {
        RZ.suppressHeader = false;
        lastY = y;
        return;
      }
      $h.toggleClass('is-solid', y > 40);
      if (y > lastY + 6 && y > 260) { $h.addClass('is-hidden'); }
      else if (y < lastY - 6 || y <= 260) { $h.removeClass('is-hidden'); }
      lastY = y;
    };
    $win.on('scroll', rafThrottle(update));
    $h.on('focusin', function () { $h.removeClass('is-hidden'); });
    update();
  };

  /* ---------- Mobile menu ---------- */
  RZ.mobileMenu = function () {
    var $btn = $('.menu-toggle');
    var $menu = $('#mobile-menu');
    if (!$btn.length || !$menu.length) { return; }

    var isOpen = false;
    var open = function () {
      isOpen = true;
      $btn.attr({ 'aria-expanded': 'true', 'aria-label': 'Close menu' });
      $menu.addClass('is-open');
      $body.addClass('menu-open');
      RZ.lock();
      setTimeout(function () { $menu.find('.mobile-menu__link').first().trigger('focus'); }, 400);
    };
    var close = function (returnFocus) {
      if (!isOpen) { return; }
      isOpen = false;
      $btn.attr({ 'aria-expanded': 'false', 'aria-label': 'Open menu' });
      $menu.removeClass('is-open');
      $body.removeClass('menu-open');
      RZ.unlock();
      if (returnFocus) { $btn.trigger('focus'); }
    };

    $btn.on('click', function () { if (isOpen) { close(true); } else { open(); } });
    $menu.on('click', 'a[href^="#"]', function () { close(false); });
    $doc.on('keydown', function (e) {
      if (!isOpen) { return; }
      if (e.key === 'Escape') { close(true); }
      trapFocus(e, $menu, $btn);
    });
    $win.on('resize', function () { if (isOpen && window.innerWidth >= 1024) { close(false); } });
  };

  /* ---------- Split text (word reveal) ---------- */
  RZ.splitText = function () {
    var $targets = $('[data-split]');
    if (!$targets.length) { return; }
    var esc = function (s) { return $('<div>').text(s).html(); };

    $targets.each(function () {
      var i = 0;
      var wrap = function (text) {
        return text.split(/(\s+)/).map(function (part) {
          if (!part || /^\s+$/.test(part)) { return part; }
          return '<span class="word"><span class="word__inner" style="--i:' + (i++) + '">' + esc(part) + '</span></span>';
        }).join('');
      };
      var html = '';
      $(this).contents().each(function () {
        if (this.nodeType === 3) { html += wrap(this.textContent); }
        else if (this.nodeType === 1) {
          var tag = this.tagName.toLowerCase();
          if (tag === 'br') { html += '<br>'; return; }
          html += '<' + tag + '>' + wrap(this.textContent) + '</' + tag + '>';
        }
      });
      $(this).html(html).addClass('split-text');
    });

    $doc.on('rz:ready', function () {
      setTimeout(function () { $targets.addClass('is-in'); }, prefersReduced ? 0 : 120);
    });
  };

  /* ---------- Scroll reveal ---------- */
  RZ.reveal = function () {
    // Stagger: give each child a reveal + incremental delay
    $('[data-stagger]').each(function () {
      var step = parseFloat($(this).attr('data-stagger')) || 0.1;
      if (isSmall()) { step = Math.min(step, 0.06); }
      $(this).children().each(function (i) {
        if (!this.hasAttribute('data-reveal') && !$(this).hasClass('mask-reveal')) { this.setAttribute('data-reveal', ''); }
        this.style.setProperty('--d', (i * step).toFixed(2) + 's');
      });
    });

    var $els = $('[data-reveal], .mask-reveal');
    if (!$els.length) { return; }
    if (prefersReduced || !('IntersectionObserver' in window)) { $els.addClass('is-visible'); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          $(en.target).addClass('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    $els.each(function () { io.observe(this); });
  };

  /* ---------- Counters ---------- */
  RZ.counters = function () {
    var $c = $('[data-count]');
    if (!$c.length) { return; }
    var fmt = function (n) { return Math.round(n).toLocaleString('en-IN'); };

    var run = function (el) {
      var $v = $(el).find('.counter__value');
      var target = parseFloat($(el).attr('data-count')) || 0;
      if (prefersReduced) { $v.text(fmt(target)); return; }
      var dur = isSmall() ? 1500 : 2200, start = null;
      var step = function (ts) {
        if (start === null) { start = ts; }
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        $v.text(fmt(target * eased));
        if (p < 1) { window.requestAnimationFrame(step); }
      };
      $v.text('0');
      window.requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    $c.each(function () { io.observe(this); });
  };

  /* ---------- Parallax (desktop + fine pointer only) ---------- */
  RZ.parallax = function () {
    var $items = $('[data-parallax]');
    if (!$items.length || prefersReduced || isTouch) { return; }
    var items = $items.map(function () {
      return { el: this, speed: parseFloat($(this).attr('data-parallax')) || 0.2, box: this.parentElement };
    }).get();
    var active = false;

    var update = function () {
      var vh = window.innerHeight;
      if (window.innerWidth < 1024) {
        if (active) { items.forEach(function (it) { it.el.style.transform = ''; }); active = false; }
        return;
      }
      active = true;
      items.forEach(function (it) {
        var r = it.box.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) { return; }
        var offset = (r.top + r.height / 2 - vh / 2) * -it.speed;
        it.el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    };
    $win.on('scroll resize', rafThrottle(update));
    update();
  };

  /* ---------- Hero slideshow ---------- */
  RZ.heroSlider = function () {
    var $hero = $('[data-hero-slider]');
    if (!$hero.length) { return; }
    var $slides = $hero.find('.hero__slide');
    var $dots = $hero.find('.hero__dot');
    var $count = $hero.find('[data-hero-count]');
    var $cap = $hero.find('[data-hero-caption]');
    var $toggle = $hero.find('[data-hero-toggle]');
    var n = $slides.length, idx = 0, timer = null, paused = false;
    var DUR = prefersReduced ? 9000 : 7000;
    if (n < 2) { return; }
    $hero[0].style.setProperty('--slide-ms', DUR + 'ms');

    var restartDot = function () {
      $dots.removeClass('is-active').attr('aria-current', 'false');
      void $hero[0].offsetWidth; // reflow so the progress animation restarts
      $dots.eq(idx).addClass('is-active').attr('aria-current', 'true');
    };
    var schedule = function () {
      clearTimeout(timer);
      if (paused || document.hidden) { return; }
      timer = setTimeout(function () { go(idx + 1); }, DUR);
    };
    var go = function (i) {
      var next = (i + n) % n;
      if (next === idx) { schedule(); return; }
      var $prev = $slides.eq(idx);
      idx = next;
      $slides.removeClass('is-leaving');
      $prev.removeClass('is-active').addClass('is-leaving');
      $slides.eq(idx).addClass('is-active');
      setTimeout(function () { $prev.removeClass('is-leaving'); }, 1900);
      $count.text(pad(idx + 1));
      $cap.text($slides.eq(idx).attr('data-caption') || '');
      restartDot();
      schedule();
    };

    $dots.on('click', function () { go($dots.index(this)); });
    $toggle.on('click', function () {
      paused = !paused;
      $hero.toggleClass('is-paused', paused);
      $toggle.attr({ 'aria-pressed': String(paused), 'aria-label': paused ? 'Play slideshow' : 'Pause slideshow' });
      $toggle.find('[data-icon="pause"]').toggle(!paused);
      $toggle.find('[data-icon="play"]').toggle(paused);
      if (paused) { clearTimeout(timer); } else { schedule(); }
    });
    $doc.on('visibilitychange', function () { if (document.hidden) { clearTimeout(timer); } else { schedule(); } });

    restartDot();
    schedule();
  };

  /* ---------- Destinations strip ---------- */
  RZ.destStrip = function () {
    $('.dest-strip').each(function () {
      var strip = this, $strip = $(this);
      var $wrap = $strip.closest('.dest');
      var $prev = $wrap.find('[data-dest-prev]'), $next = $wrap.find('[data-dest-next]');
      var $bar = $wrap.find('.dest-progress__bar');

      var stepSize = function () {
        var card = $strip.find('.dest-card').get(0);
        return card ? card.getBoundingClientRect().width + 24 : 320;
      };
      var update = function () {
        var max = strip.scrollWidth - strip.clientWidth;
        var p = max > 0 ? strip.scrollLeft / max : 1;
        $bar.css('transform', 'scaleX(' + (0.12 + 0.88 * p).toFixed(3) + ')');
        $prev.prop('disabled', strip.scrollLeft <= 4);
        $next.prop('disabled', strip.scrollLeft >= max - 4);
      };
      $strip.on('scroll', rafThrottle(update));
      $win.on('resize', rafThrottle(update));
      update();

      var scrollByCards = function (dir) {
        strip.scrollBy({ left: dir * stepSize(), behavior: prefersReduced ? 'auto' : 'smooth' });
      };
      $prev.on('click', function () { scrollByCards(-1); });
      $next.on('click', function () { scrollByCards(1); });

      // Mouse drag-to-scroll (touch devices use native swipe + scroll-snap)
      var down = false, moved = false, startX = 0, startLeft = 0;
      $strip.on('pointerdown', function (e) {
        var oe = e.originalEvent;
        if (oe.pointerType !== 'mouse' || oe.button !== 0) { return; }
        down = true; moved = false; startX = oe.clientX; startLeft = strip.scrollLeft;
      });
      $win.on('pointermove', function (e) {
        if (!down) { return; }
        var dx = e.originalEvent.clientX - startX;
        if (!moved && Math.abs(dx) > 6) { moved = true; $strip.addClass('is-dragging'); }
        if (moved) { strip.scrollLeft = startLeft - dx; e.preventDefault(); }
      });
      $win.on('pointerup pointercancel', function () {
        if (!down) { return; }
        down = false;
        if (moved) {
          // re-enable scroll snapping on the next frame so it settles smoothly
          window.requestAnimationFrame(function () { $strip.removeClass('is-dragging'); });
          setTimeout(function () { moved = false; }, 50);
        }
      });
      // swallow the click that ends a drag
      strip.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  };

  /* ---------- Testimonial carousel ---------- */
  RZ.carousel = function () {
    $('[data-carousel]').each(function () {
      var $c = $(this);
      var $viewport = $c.find('.carousel__viewport');
      var $track = $c.find('.carousel__track');
      var $slides = $c.find('.carousel__slide');
      var $dotsWrap = $c.find('.carousel__dots');
      var n = $slides.length, idx = 0, timer = null, hovered = false, focused = false;
      var DUR = 6500;
      if (!n) { return; }

      for (var i = 0; i < n; i++) {
        $dotsWrap.append('<button class="carousel__dot" type="button" aria-label="Show testimonial ' + (i + 1) + ' of ' + n + '"></button>');
      }
      var $dots = $dotsWrap.children();

      var restart = function () {
        clearTimeout(timer);
        if (hovered || focused || prefersReduced || document.hidden) { return; }
        timer = setTimeout(function () { go(idx + 1); }, DUR);
      };
      var go = function (i, byUser) {
        idx = (i + n) % n;
        $track.css('transform', 'translate3d(' + (-idx * 100) + '%,0,0)');
        $slides.each(function (j) {
          var current = j === idx;
          $(this).attr('aria-hidden', String(!current));
          $(this).find('a, button').attr('tabindex', current ? null : '-1');
        });
        $dots.attr('aria-current', 'false').eq(idx).attr('aria-current', 'true');
        $viewport.attr('aria-live', byUser ? 'polite' : 'off');
        restart();
      };

      $c.find('[data-carousel-prev]').on('click', function () { go(idx - 1, true); });
      $c.find('[data-carousel-next]').on('click', function () { go(idx + 1, true); });
      $dots.on('click', function () { go($dots.index(this), true); });
      $c.on('mouseenter', function () { hovered = true; clearTimeout(timer); })
        .on('mouseleave', function () { hovered = false; restart(); })
        .on('focusin', function () { focused = true; clearTimeout(timer); })
        .on('focusout', function () { setTimeout(function () { focused = $c[0].contains(document.activeElement); restart(); }, 0); })
        .on('keydown', function (e) {
          if (e.key === 'ArrowLeft') { go(idx - 1, true); }
          if (e.key === 'ArrowRight') { go(idx + 1, true); }
        });
      $doc.on('visibilitychange', restart);

      // Touch swipe
      var vp = $viewport[0], sx = 0, sy = 0, dx = 0, tracking = false, horizontal = null;
      vp.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        sx = t.clientX; sy = t.clientY; dx = 0; tracking = true; horizontal = null;
        clearTimeout(timer);
      }, { passive: true });
      vp.addEventListener('touchmove', function (e) {
        if (!tracking) { return; }
        var t = e.touches[0];
        dx = t.clientX - sx;
        if (horizontal === null) { horizontal = Math.abs(dx) > Math.abs(t.clientY - sy); }
        if (horizontal) {
          $track.css({ transition: 'none', transform: 'translate3d(calc(' + (-idx * 100) + '% + ' + dx + 'px),0,0)' });
        }
      }, { passive: true });
      vp.addEventListener('touchend', function () {
        if (!tracking) { return; }
        tracking = false;
        $track.css('transition', '');
        if (horizontal && Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1), true); } else { go(idx); }
      });

      go(0);
    });
  };

  /* ---------- Lightbox ---------- */
  RZ.lightbox = function () {
    if (!$('[data-lightbox]').length) { return; }
    var icon = {
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
      next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    };
    var $lb = $(
      '<div class="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" aria-hidden="true">' +
        '<div class="lightbox__top"><span class="lightbox__count" aria-live="polite"></span>' +
        '<button class="icon-btn icon-btn--light lightbox__close" type="button" aria-label="Close image viewer">' + icon.close + '</button></div>' +
        '<div class="lightbox__stage">' +
          '<button class="icon-btn icon-btn--light lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">' + icon.prev + '</button>' +
          '<img class="lightbox__img" alt="">' +
          '<button class="icon-btn icon-btn--light lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">' + icon.next + '</button>' +
        '</div>' +
        '<div class="lightbox__bottom"><p class="lightbox__caption"></p><p class="lightbox__credit"></p></div>' +
      '</div>'
    ).appendTo('body');

    var $img = $lb.find('.lightbox__img');
    var $count = $lb.find('.lightbox__count');
    var $cap = $lb.find('.lightbox__caption');
    var $credit = $lb.find('.lightbox__credit');
    var $close = $lb.find('.lightbox__close');
    var group = [], idx = 0, lastFocus = null, isOpen = false;

    var show = function (i) {
      idx = (i + group.length) % group.length;
      var $a = $(group[idx]);
      $img.removeClass('is-loaded');
      var src = $a.attr('href');
      var thumbAlt = $a.find('img').attr('alt') || '';
      // swap after a beat so the fade-out reads as a transition
      setTimeout(function () {
        $img.attr({ src: src, alt: thumbAlt });
        if ($img[0].complete && $img[0].naturalWidth) { $img.addClass('is-loaded'); }
      }, prefersReduced ? 0 : 120);
      $count.text(pad(idx + 1) + ' / ' + pad(group.length));
      $cap.text($a.attr('data-caption') || thumbAlt);
      $credit.empty();
      if ($a.attr('data-credit')) {
        var $link = $('<a target="_blank" rel="noopener">').attr('href', $a.attr('data-credit-url') || '#').text($a.attr('data-credit'));
        $credit.append('Photo: ').append($link);
      }
      $lb.find('.lightbox__nav').toggle(group.length > 1);
      // preload neighbours
      [idx + 1, idx - 1].forEach(function (k) {
        var nb = group[(k + group.length) % group.length];
        if (nb) { (new Image()).src = nb.getAttribute('href'); }
      });
    };
    $img.on('load', function () { $img.addClass('is-loaded'); });

    var open = function (anchor) {
      var $gallery = $(anchor).closest('[data-gallery]');
      group = ($gallery.length ? $gallery.find('[data-lightbox]') : $(anchor)).get();
      lastFocus = anchor;
      isOpen = true;
      show(group.indexOf(anchor));
      $lb.addClass('is-open').attr('aria-hidden', 'false');
      RZ.lock();
      setTimeout(function () { $close.trigger('focus'); }, 50);
    };
    var close = function () {
      if (!isOpen) { return; }
      isOpen = false;
      $lb.removeClass('is-open').attr('aria-hidden', 'true');
      RZ.unlock();
      if (lastFocus) { lastFocus.focus(); }
    };

    $doc.on('click', '[data-lightbox]', function (e) { e.preventDefault(); open(this); });
    $close.on('click', close);
    $lb.find('.lightbox__nav--prev').on('click', function () { show(idx - 1); });
    $lb.find('.lightbox__nav--next').on('click', function () { show(idx + 1); });
    $lb.on('click', function (e) {
      if (e.target === this || $(e.target).is('.lightbox__stage, .lightbox__bottom, .lightbox__top')) { close(); }
    });
    $doc.on('keydown', function (e) {
      if (!isOpen) { return; }
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowLeft') { show(idx - 1); }
      else if (e.key === 'ArrowRight') { show(idx + 1); }
      trapFocus(e, $lb);
    });

    // swipe
    var stage = $lb.find('.lightbox__stage')[0], sx = 0, sy = 0;
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { show(idx + (dx < 0 ? 1 : -1)); }
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) { close(); }
    });
  };

  /* ---------- Package filters ---------- */
  RZ.filters = function () {
    var $group = $('[data-filter-group]');
    if (!$group.length) { return; }
    var $btns = $group.find('[data-filter]');
    var $cards = $($group.attr('data-filter-group')).children('.pkg-card');
    var $status = $('#filter-status');
    var hideTimer, cleanTimer;

    var matches = function (card, f) {
      return f === 'all' || (' ' + card.getAttribute('data-category') + ' ').indexOf(' ' + f + ' ') > -1;
    };
    var label = function (f) { return $btns.filter('[data-filter="' + f + '"]').attr('data-label') || f; };

    // live counts on each button
    $btns.each(function () {
      var f = $(this).attr('data-filter');
      var count = $cards.filter(function () { return matches(this, f); }).length;
      $(this).append('<sup aria-hidden="true">' + count + '</sup>');
    });

    var apply = function (f, animate) {
      var $show = $cards.filter(function () { return matches(this, f); });
      var $hide = $cards.not($show);
      var $leaving = $hide.not('.is-hidden');
      var wait = animate && !prefersReduced && $leaving.length ? 340 : 0;
      clearTimeout(hideTimer); clearTimeout(cleanTimer);
      $leaving.addClass('is-hiding');

      hideTimer = setTimeout(function () {
        $hide.addClass('is-hidden').removeClass('is-hiding is-shown is-showing');
        var $entering = $show.filter('.is-hidden');
        $show.removeClass('is-hidden is-hiding');
        if (animate && !prefersReduced) {
          $entering.addClass('is-showing');
          void document.body.offsetWidth;
          $entering.each(function (i) { this.style.transitionDelay = (i * 70) + 'ms'; });
          $entering.addClass('is-shown').removeClass('is-showing');
          cleanTimer = setTimeout(function () {
            $entering.removeClass('is-shown').each(function () { this.style.transitionDelay = ''; });
          }, 1100);
        }
        var n = $show.length;
        $status.text(f === 'all' ? 'Showing all ' + n + ' packages' : 'Showing ' + n + ' ' + label(f).toLowerCase() + ' package' + (n === 1 ? '' : 's'));
      }, wait);
    };

    $btns.on('click', function () {
      var f = $(this).attr('data-filter');
      $btns.attr('aria-pressed', 'false');
      $(this).attr('aria-pressed', 'true');
      apply(f, true);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', f === 'all' ? window.location.pathname : '#' + f);
      }
    });

    // deep link: packages.html#honeymoon
    var initial = (window.location.hash || '').replace('#', '');
    if (initial && $btns.filter('[data-filter="' + initial + '"]').length) {
      $btns.attr('aria-pressed', 'false').filter('[data-filter="' + initial + '"]').attr('aria-pressed', 'true');
      apply(initial, false);
    } else {
      apply('all', false);
    }
  };

  /* ---------- Accordion ---------- */
  RZ.accordion = function () {
    var $accs = $('[data-accordion]');
    if (!$accs.length) { return; }
    var DUR = prefersReduced ? 0 : 420;

    var setOpen = function ($t, open) {
      var $panel = $('#' + $t.attr('aria-controls'));
      var $item = $t.closest('.acc-item');
      $t.attr('aria-expanded', String(open));
      $item.toggleClass('is-open', open);
      if (open) {
        $panel.prop('hidden', false).hide().stop(true, true).slideDown(DUR, function () { $panel.css('display', ''); });
      } else {
        $panel.stop(true, true).slideUp(DUR, function () { $panel.prop('hidden', true).css('display', ''); });
      }
    };

    $accs.each(function () {
      var $acc = $(this);
      var single = $acc.attr('data-accordion') === 'single';
      var $triggers = $acc.find('.acc-trigger');

      $triggers.each(function () {
        var expanded = $(this).attr('aria-expanded') === 'true';
        $('#' + $(this).attr('aria-controls')).prop('hidden', !expanded);
        $(this).closest('.acc-item').toggleClass('is-open', expanded);
      });

      $triggers.on('click', function () {
        var $t = $(this);
        var willOpen = $t.attr('aria-expanded') !== 'true';
        if (willOpen && single) {
          $triggers.not($t).filter('[aria-expanded="true"]').each(function () { setOpen($(this), false); });
        }
        setOpen($t, willOpen);
      });

      // Arrow / Home / End keys move between headers (WAI-ARIA accordion pattern)
      $triggers.on('keydown', function (e) {
        var i = $triggers.index(this), next = null;
        if (e.key === 'ArrowDown') { next = (i + 1) % $triggers.length; }
        else if (e.key === 'ArrowUp') { next = (i - 1 + $triggers.length) % $triggers.length; }
        else if (e.key === 'Home') { next = 0; }
        else if (e.key === 'End') { next = $triggers.length - 1; }
        if (next !== null) { e.preventDefault(); $triggers.eq(next).trigger('focus'); }
      });
    });

    // Expand / collapse all (itinerary)
    $('[data-acc-toggle-all]').on('click', function () {
      var $btn = $(this);
      var $acc = $($btn.attr('data-acc-toggle-all'));
      var expand = $btn.attr('aria-pressed') !== 'true';
      $acc.find('.acc-trigger').each(function () {
        if (($(this).attr('aria-expanded') === 'true') !== expand) { setOpen($(this), expand); }
      });
      $btn.attr('aria-pressed', String(expand)).find('.btn__label').text(expand ? 'Collapse all days' : 'Expand all days');
    });
  };

  /* ---------- Contact form ---------- */
  RZ.contactForm = function () {
    var $form = $('#enquiry-form');
    if (!$form.length) { return; }
    var $submit = $form.find('[type="submit"]');
    var $alert = $form.find('.form-alert');
    var $success = $('#form-success');

    // 1) Preselect a package from ?package=slug
    var params = new URLSearchParams(window.location.search);
    var pkg = params.get('package');
    var $sel = $('#f-package');
    if (pkg && $sel.find('option').filter(function () { return this.value === pkg; }).length) {
      $sel.val(pkg);
      $sel.closest('.field').addClass('is-valid');
      $('#package-note').text('Great choice — we have preselected “' + $sel.find('option:selected').text() + '” for you.').prop('hidden', false);
    }

    // 2) Travel date cannot be in the past
    var today = new Date();
    var iso = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    $('#f-date').attr('min', iso);

    // 3) Validation rules
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
      email: function (v) {
        if (!v.trim()) { return 'Please enter your email address.'; }
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That email doesn’t look quite right.';
      },
      phone: function (v) {
        var digits = v.replace(/[^\d]/g, '');
        if (!digits) { return 'Please enter a phone number so we can reach you.'; }
        return digits.length >= 10 && digits.length <= 13 ? '' : 'Please enter a valid phone number (10 digits, with country code if outside India).';
      },
      package: function (v) { return v ? '' : 'Please choose a package — or “Not sure yet”.'; },
      date: function (v) {
        if (!v) { return 'Please choose your preferred start date.'; }
        return v >= iso ? '' : 'Please choose a date from today onwards.';
      },
      travellers: function (v) {
        var n = parseInt(v, 10);
        return n >= 1 && n <= 50 && String(n) === String(v).trim() ? '' : 'Please enter between 1 and 50 travellers.';
      },
      message: function (v) { return v.length <= 1500 ? '' : 'Please keep your message under 1500 characters.'; }
    };

    var validate = function (el) {
      var rule = rules[el.name];
      if (!rule) { return true; }
      var msg = rule(el.value || '');
      var $field = $(el).closest('.field');
      var $err = $field.find('.field__error');
      $field.toggleClass('has-error', !!msg).toggleClass('is-valid', !msg && !!el.value);
      $(el).attr('aria-invalid', msg ? 'true' : 'false');
      $err.text(msg);
      return !msg;
    };

    $form.on('blur', 'input, select, textarea', function () {
      if (this.value || $(this).closest('.field').hasClass('has-error')) { validate(this); }
    });
    $form.on('input change', 'input, select, textarea', function () {
      if ($(this).closest('.field').hasClass('has-error')) { validate(this); }
    });

    var showSuccess = function () {
      var first = ($('#f-name').val() || '').trim().split(/\s+/)[0];
      if (first) { $success.find('[data-success-name]').text(', ' + first); }
      $form.css({ transition: 'opacity .4s', opacity: 0 });
      setTimeout(function () {
        $form.prop('hidden', true).css('opacity', '');
        $success.addClass('is-visible');
        void $success[0].offsetWidth;
        $success.addClass('is-in');
        $success.find('h3').attr('tabindex', '-1').trigger('focus');
      }, prefersReduced ? 0 : 400);
    };

    $form.on('submit', function (e) {
      e.preventDefault();
      $alert.removeClass('is-visible').text('');
      if ($form.find('[name="_gotcha"]').val()) { return; } // honeypot
      var ok = true, firstBad = null;
      $form.find('input, select, textarea').not('[type="hidden"], [name="_gotcha"]').each(function () {
        if (!validate(this)) { ok = false; firstBad = firstBad || this; }
      });
      if (!ok) { firstBad.focus(); return; }

      var action = $form.attr('action') || '';
      $submit.addClass('is-loading').attr('aria-busy', 'true');

      // Demo mode until a real Formspree form ID is configured (see README)
      if (/YOUR_FORM_ID/.test(action)) {
        setTimeout(function () { $submit.removeClass('is-loading').removeAttr('aria-busy'); showSuccess(); }, 900);
        return;
      }

      $.ajax({
        url: action,
        method: 'POST',
        data: $form.serialize(),
        dataType: 'json',
        headers: { Accept: 'application/json' }
      }).done(showSuccess).fail(function () {
        $alert.text('Sorry — your message could not be sent. Please try again, or reach us on WhatsApp / phone.').addClass('is-visible');
      }).always(function () {
        $submit.removeClass('is-loading').removeAttr('aria-busy');
      });
    });

    $('[data-form-reset]').on('click', function () {
      $form[0].reset();
      $form.find('.field').removeClass('has-error is-valid');
      $form.find('.field__error').text('');
      $success.removeClass('is-visible is-in');
      $form.prop('hidden', false);
      $('#f-name').trigger('focus');
    });
  };

  /* ---------- Rating bars (reviews) ---------- */
  RZ.ratingBars = function () {
    var $bars = $('.rating-bars');
    if (!$bars.length) { return; }
    if (!('IntersectionObserver' in window)) { $bars.addClass('is-in'); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { $(en.target).addClass('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.3 });
    $bars.each(function () { io.observe(this); });
  };

  /* ---------- Timeline progress line (about) ---------- */
  RZ.timeline = function () {
    var $tl = $('.timeline');
    if (!$tl.length) { return; }
    var $bar = $tl.find('.timeline__progress');
    if (prefersReduced) { $bar.css('transform', 'scaleY(1)'); return; }
    var update = function () {
      var r = $tl[0].getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(Math.max((vh * 0.65 - r.top) / r.height, 0), 1);
      $bar.css('transform', 'scaleY(' + p.toFixed(3) + ')');
    };
    $win.on('scroll resize', rafThrottle(update));
    update();
  };

  /* ---------- Smooth in-page anchors ---------- */
  RZ.anchors = function () {
    $doc.on('click', 'a[href^="#"]:not([href="#"])', function (e) {
      var $t = $(this.getAttribute('href'));
      if (!$t.length) { return; }
      e.preventDefault();
      $t[0].scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      if (!$t.is('[tabindex]')) { $t.attr('tabindex', '-1'); }
      setTimeout(function () { $t[0].focus({ preventScroll: true }); }, prefersReduced ? 0 : 600);
    });
  };

  /* ---------- Boot ---------- */
  $(function () {
    $body = $(document.body);
    $('[data-year]').text(new Date().getFullYear());

    // Each module is isolated so one failure never breaks the others
    var modules = ['splitText', 'pageTransitions', 'header', 'mobileMenu', 'reveal', 'counters', 'parallax',
      'heroSlider', 'destStrip', 'carousel', 'lightbox', 'filters', 'accordion', 'contactForm',
      'ratingBars', 'timeline', 'anchors', 'entrance'];
    modules.forEach(function (m) {
      try { RZ[m](); } catch (err) { if (window.console) { window.console.error('[RZ] ' + m + ' failed:', err); } }
    });
  });
})(jQuery, window, document);
