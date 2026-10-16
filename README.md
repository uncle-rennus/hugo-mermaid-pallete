# hugo-mermaid-pallete

Hugo **module**: Goldmark render hook for fenced **` ```mermaid `** blocks, plus browser initialization that maps your site’s CSS custom properties to Mermaid v11 **`themeVariables`**. Diagrams **re-render** when the host page dispatches a small custom event after updating `data-theme` on `<html>`.

> **Spelling:** the partial path and `params` key use **`pallete`** (not `palette`) for backwards compatibility. A future major version may rename them.

## Requirements

- **Hugo** extended or standard, **≥ 0.110.0** (see [`hugo.toml`](hugo.toml)).
- **Go** 1.22+ on the machine where you run `hugo mod get` (Hugo uses Go modules for dependencies).
- **Mermaid** is loaded from **unpkg** by default (see [Content Security Policy](#content-security-policy)).

## Install

From your Hugo site root:

```bash
hugo mod init github.com/youruser/yoursite   # if you do not already have go.mod
hugo mod get github.com/uncle-rennus/hugo-mermaid-pallete@v0.1.0
```

In **`hugo.toml`** or **`config.toml`**:

```toml
[module]
  [[module.imports]]
    path = "github.com/uncle-rennus/hugo-mermaid-pallete"
```

Optional — control inline diagram colors:

```toml
[params.mermaidPallete]
  preserveInlineColors = true   # default: keep classDef/style/class colors from markdown
  # preserveInlineColors = false  # strip them; diagrams use CSS palette only (better contrast with tokens)
```

## Layout

In your base template (e.g. before `</body>`, after your main scripts if any):

```go-html-template
{{ partial "mermaid-pallete/inject.html" . }}
```

The partial only emits scripts on pages whose **raw** content contains a <code>```mermaid</code> fence (cheap check).

## Theme changes (light / dark)

1. Set **`data-theme`** on `<html>` (e.g. `light` or `dark`) to match your CSS token strategy.
2. Whenever the theme changes, dispatch:

   ```js
   document.dispatchEvent(
     new CustomEvent('mermaid-palette:themechange', { detail: { theme: 'dark' } })
   );
   ```

   Use the actual theme string you applied to `data-theme`. The `detail` object is optional but useful for debugging.

If you do not dispatch this event, diagrams still render on load but **will not** update when switching themes.

## CSS contract

The init script reads **computed** styles from `document.documentElement`. Define these **custom properties** on `:root` (and override them under `[data-theme="dark"]` or equivalent) so Mermaid matches your site:

| Token | Role |
|--------|------|
| `--color-light` | Page / diagram background |
| `--color-dark` | Primary text (light theme) |
| `--color-primary` | Accent / borders |
| `--color-secondary` | Second accent |
| `--color-gray-100` … `--color-gray-600` | Surfaces, borders, muted text |
| `--color-error` | Error states |
| `--color-on-accent` | Text on primary-filled UI |
| `--color-link` | Link color (e.g. Gantt tasks) |
| `--font-family-body` | Font stack for diagram labels |

If a variable is missing, **fallback hex values** inside `mermaid-init.js` still produce readable output.

## Content Security Policy

The inject partial loads **Mermaid** from:

`https://unpkg.com/mermaid@11.6.0/dist/mermaid.min.js`

Allow that origin in **`script-src`** (and ensure **`unsafe-eval`** is acceptable for your threat model if Mermaid requires it), **or** vendor `mermaid.min.js` into your site’s `static/` and edit [`layouts/partials/mermaid-pallete/inject.html`](layouts/partials/mermaid-pallete/inject.html) to point to your copy.

## Label clipping (Chromium)

Mermaid **v11** respects **`htmlLabels`** only at the **top level** of `mermaid.initialize()`. This module sets **`htmlLabels: false`** so labels use SVG text and avoid common **`foreignObject`** clipping. Flowcharts use extra **`padding`** and your full **`--font-family-body`** stack so bbox measurement matches the page.

## Inline colors (`classDef`, `style`, …)

- **`preserveInlineColors = true` (default)** — Keeps author directives; diagram-specified fills can override theme tokens.
- **`preserveInlineColors = false`** — Strips those lines before `mermaid.run()`; nodes use **`themeVariables`** only. The script also flattens **`cScale0`–`cScale11`** so flowcharts do not cycle hues when directives are removed. **`%%{init: ...}%%`** blocks are removed in that mode.

Edge cases: colors embedded only in node text, or unusual syntax; see upstream Mermaid issues.

## Local development (fork / clone)

In your test site **`go.mod`**:

```go
replace github.com/uncle-rennus/hugo-mermaid-pallete => ../hugo-mermaid-pallete
```

Use a pseudo-version or `v0.0.0` in `require` while replacing. Do not commit `replace` lines in libraries meant for others — only in your local site.

## Files in this module

| Path | Purpose |
|------|---------|
| `layouts/_markup/render-codeblock-mermaid.html` | Output for fenced `mermaid` blocks |
| `assets/js/mermaid-init.js` | Palette-aware `mermaid.initialize` / `run` / refresh |
| `layouts/partials/mermaid-pallete/inject.html` | Conditional script tags + `window.__MERMAID_PALLETE__` |
| `hugo.toml` | Minimum Hugo version |
| `go.mod` | Go module path for Hugo |

## Publish / first-time setup (maintainers)

This module is developed in its **own Git repository** (not inside a consumer site). After cloning:

```bash
git remote add origin https://github.com/uncle-rennus/hugo-mermaid-pallete.git
git push -u origin main
git push origin v0.1.0   # annotated tag for hugo mod get
```

Create the empty **`uncle-rennus/hugo-mermaid-pallete`** repo on GitHub first if it does not exist. Consumer sites should **not** use a `replace` directive once the tag is public.

## License

MIT — see [LICENSE](LICENSE).
