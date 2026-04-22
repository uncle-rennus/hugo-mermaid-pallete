(function () {
  /** Dispatched by the host site when light/dark (or any) theme changes. */
  var THEME_EVENT = 'mermaid-palette:themechange';

  function normalizeColorForMermaid(value, fallbackHex) {
    if (!value) return fallbackHex;
    var v = value.trim();
    if (v.indexOf('var(') === 0) return fallbackHex;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v;
    var m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) {
      return (
        '#' +
        [m[1], m[2], m[3]]
          .map(function (x) {
            var h = parseInt(x, 10).toString(16);
            return h.length === 1 ? '0' + h : h;
          })
          .join('')
      );
    }
    return fallbackHex;
  }

  function readCssHex(name, fallbackHex) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return normalizeColorForMermaid(raw, fallbackHex);
  }

  /** Full stack so Mermaid’s text metrics match the page (first-font-only caused clipping). */
  function readFontFamily() {
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-family-body')
      .trim();
    if (!raw) return 'Inter, "Segoe UI", system-ui, sans-serif';
    return raw;
  }

  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  /** Hugo may serialize booleans; treat common falsy forms as off. */
  function shouldPreserveInlineColors() {
    var v = (window.__MERMAID_PALLETE__ || {}).preserveInlineColors;
    if (v === false || v === 'false' || v === 0 || v === '0') return false;
    return true;
  }

  /**
   * Without this, flowcharts still assign cScale0–cScale11 (hue-rotated from primaryColor),
   * so nodes look blue/green/purple even after stripping classDef. When forcing palette-only,
   * make every scale slot use the same fill, border, and label colors.
   */
  function applyUniformFlowchartPalette(out) {
    var fill = out.primaryColor;
    var stroke = out.nodeBorder;
    var txt = out.nodeTextColor;
    var i;
    out.scaleLabelColor = txt;
    for (i = 0; i < 12; i++) {
      out['cScale' + i] = fill;
      out['cScaleInv' + i] = txt;
      out['cScalePeer' + i] = stroke;
      out['cScaleLabel' + i] = txt;
    }
    for (i = 0; i < 8; i++) {
      out['fillType' + i] = fill;
    }
    var pieAlt = [out.primaryColor, out.secondaryColor, out.tertiaryColor, out.lineColor];
    for (i = 0; i < 12; i++) {
      out['pie' + (i + 1)] = pieAlt[i % pieAlt.length];
    }
  }

  function paletteThemeVariables() {
    var dark = isDarkTheme();
    var fd = dark
      ? {
          light: '#212529',
          g100: '#2d2d2d',
          g200: '#3a3a3a',
          g300: '#4a4a4a',
          g400: '#5a5a5a',
          g500: '#8a8a8a',
          g600: '#aaaaaa',
          text: '#ffffff',
          white: '#ffffff',
          primary: '#e7d7ad',
          secondary: '#ffd479',
          error: '#ef4444',
        }
      : {
          light: '#ffffff',
          g100: '#f8f9fa',
          g200: '#e9ecef',
          g300: '#dee2e6',
          g400: '#ced4da',
          g500: '#adb5bd',
          g600: '#666666',
          text: '#333333',
          white: '#ffffff',
          primary: '#ffd479',
          secondary: '#e7d7ad',
          error: '#ef4444',
        };

    var out = {
      darkMode: dark,
      background: readCssHex('--color-light', fd.light),
      fontFamily: readFontFamily(),
      fontSize: '16px',
      primaryColor: readCssHex('--color-gray-100', fd.g100),
      primaryTextColor: readCssHex('--color-dark', fd.text),
      primaryBorderColor: readCssHex('--color-primary', fd.primary),
      secondaryColor: readCssHex('--color-gray-200', fd.g200),
      tertiaryColor: readCssHex('--color-gray-300', fd.g300),
      lineColor: readCssHex('--color-gray-500', fd.g500),
      textColor: readCssHex('--color-dark', fd.text),
      mainBkg: readCssHex('--color-gray-100', fd.g100),
      nodeBorder: readCssHex('--color-gray-400', fd.g400),
      nodeTextColor: readCssHex('--color-dark', fd.text),
      clusterBkg: readCssHex('--color-gray-200', fd.g200),
      clusterBorder: readCssHex('--color-gray-400', fd.g400),
      defaultLinkColor: readCssHex('--color-gray-600', fd.g600),
      titleColor: readCssHex('--color-dark', fd.text),
      edgeLabelBackground: readCssHex('--color-gray-100', fd.g100),
      noteBkgColor: readCssHex('--color-gray-200', fd.g200),
      noteTextColor: readCssHex('--color-dark', fd.text),
      errorBkgColor: readCssHex('--color-error', fd.error),
      errorTextColor: dark ? '#212529' : '#ffffff',
      pie1: readCssHex('--color-primary', fd.primary),
      pie2: readCssHex('--color-secondary', fd.secondary),
      pie3: readCssHex('--color-gray-400', fd.g400),
      actorBkg: readCssHex('--color-gray-100', fd.g100),
      actorBorder: readCssHex('--color-gray-400', fd.g400),
      actorTextColor: readCssHex('--color-dark', fd.text),
      signalColor: readCssHex('--color-dark', fd.text),
      signalTextColor: readCssHex('--color-dark', fd.text),
      labelBoxBkgColor: readCssHex('--color-gray-100', fd.g100),
      labelBoxBorderColor: readCssHex('--color-gray-400', fd.g400),
      labelTextColor: readCssHex('--color-dark', fd.text),
      loopTextColor: readCssHex('--color-dark', fd.text),
      activationBorderColor: readCssHex('--color-gray-400', fd.g400),
      activationBkgColor: readCssHex('--color-gray-200', fd.g200),
      sequenceNumberColor: readCssHex('--color-on-accent', dark ? '#212529' : '#000000'),
      sectionBkgColor: readCssHex('--color-gray-200', fd.g200),
      altSectionBkgColor: readCssHex('--color-light', fd.light),
      gridColor: readCssHex('--color-gray-300', fd.g300),
      todayLineColor: readCssHex('--color-primary', fd.primary),
      taskBkgColor: readCssHex('--color-gray-200', fd.g200),
      taskTextColor: readCssHex('--color-dark', fd.text),
      taskTextLightColor: readCssHex('--color-dark', fd.text),
      taskTextOutsideColor: readCssHex('--color-dark', fd.text),
      taskTextClickableColor: readCssHex('--color-link', fd.text),
      activeTaskBkgColor: readCssHex('--color-primary', fd.primary),
      activeTaskBorderColor: readCssHex('--color-secondary', fd.secondary),
      doneTaskBkgColor: readCssHex('--color-gray-400', fd.g400),
      doneTaskBorderColor: readCssHex('--color-gray-600', fd.g600),
      critBkgColor: readCssHex('--color-error', fd.error),
      critBorderColor: readCssHex('--color-error', fd.error),
    };

    if (!shouldPreserveInlineColors()) {
      applyUniformFlowchartPalette(out);
    }

    return out;
  }

  function mermaidFullConfig() {
    return {
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      htmlLabels: false,
      themeVariables: paletteThemeVariables(),
      flowchart: {
        useMaxWidth: true,
        padding: 36,
        diagramPadding: 16,
        wrappingWidth: 280,
      },
    };
  }

  function diagramSource(wrapper) {
    var tpl = wrapper.querySelector('template.mermaid-source');
    if (tpl) return tpl.content.textContent;
    var pre = wrapper.querySelector('pre.mermaid');
    return pre ? pre.textContent : '';
  }

  /**
   * When preserveInlineColors is false, drop Mermaid lines that set per-diagram colors.
   * The diagram then uses only themeVariables (CSS palette). Limitation: does not rewrite
   * colors embedded in node text or %%init%% blocks; see module README.
   */
  function stripInlineColorDirectives(src) {
    var withoutInit = src.replace(/%%\{\s*init:[\s\S]*?\}\s*%%/g, '');
    return withoutInit
      .split('\n')
      .map(function (line) {
        return line.replace(/\s*:::[-a-zA-Z0-9_.]+\s*/g, ' ');
      })
      .filter(function (line) {
        var t = line.trim();
        if (/^classDef\s/i.test(t)) return false;
        if (/^class\s+/i.test(t)) return false;
        if (/^style\s+/i.test(t)) return false;
        if (/^linkStyle\s+/i.test(t)) return false;
        return true;
      })
      .join('\n');
  }

  function effectiveSourceForRender(raw) {
    if (shouldPreserveInlineColors()) return raw;
    return stripInlineColorDirectives(raw);
  }

  function resetDiagramWrapper(wrapper) {
    var raw = diagramSource(wrapper);
    var src = effectiveSourceForRender(raw);
    var toRemove = [];
    Array.prototype.forEach.call(wrapper.children, function (el) {
      if (el.tagName !== 'TEMPLATE') toRemove.push(el);
    });
    toRemove.forEach(function (el) {
      wrapper.removeChild(el);
    });
    var pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = src;
    wrapper.appendChild(pre);
  }

  function runMermaid() {
    if (typeof mermaid === 'undefined') return Promise.resolve();

    mermaid.initialize(mermaidFullConfig());

    return mermaid.run({ querySelector: '.mermaid-diagram pre.mermaid' });
  }

  function refreshAll() {
    document.querySelectorAll('.mermaid-diagram').forEach(resetDiagramWrapper);
    return runMermaid();
  }

  function whenStylesAndFontsReady(cb) {
    function run() {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(cb).catch(cb);
      } else {
        cb();
      }
    }
    if (document.readyState === 'complete') {
      requestAnimationFrame(run);
    } else {
      window.addEventListener('load', function () {
        requestAnimationFrame(run);
      });
    }
  }

  if (!document.querySelector('.mermaid-diagram')) return;

  document.addEventListener(THEME_EVENT, function () {
    refreshAll().catch(function (e) {
      console.warn('Mermaid refresh failed:', e);
    });
  });

  whenStylesAndFontsReady(function () {
    refreshAll().catch(function (e) {
      console.warn('Mermaid initial render failed:', e);
    });
  });
})();
