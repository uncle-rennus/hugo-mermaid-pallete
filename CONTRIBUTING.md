# Contributing

Thanks for helping improve this module.

## Development setup

1. Clone this repository.
2. Create or use a small Hugo site and point the module import at your clone with a **`replace`** directive in the site `go.mod`:

   ```go
   module example.com/testsite

   go 1.22

   replace github.com/uncle-rennus/hugo-mermaid-pallete => ../hugo-mermaid-pallete

   require github.com/uncle-rennus/hugo-mermaid-pallete v0.0.0
   ```

3. In the site `hugo.toml` / `config.toml`:

   ```toml
   [module]
     [[module.imports]]
       path = "github.com/uncle-rennus/hugo-mermaid-pallete"
   ```

4. Add `{{ partial "mermaid-pallete/inject.html" . }}` to your base layout and a test page with a ` ```mermaid ` fence.

5. Run `hugo server` and verify diagrams and light/dark refresh (dispatch `mermaid-palette:themechange` when `data-theme` changes).

## Pull requests

- Keep changes focused; match existing HTML/JS style (no build step for JS).
- Update **README.md** or **CHANGELOG.md** when behavior or install steps change.
- If you change the theme custom event name or params keys, treat it as a **breaking** change and bump semver accordingly.

## Releases

Maintainers: tag with `vMAJOR.MINOR.PATCH` (e.g. `v0.1.0`) so `hugo mod get` and the Go proxy resolve versions correctly.
