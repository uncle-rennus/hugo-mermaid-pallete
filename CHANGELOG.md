# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-21

### Added

- Initial public release as a Hugo module.
- Goldmark render hook for fenced `mermaid` code blocks.
- Browser init (`mermaid-init.js`) mapping site CSS custom properties to Mermaid `themeVariables` (Mermaid v11).
- Re-render on theme change via custom event `mermaid-palette:themechange`.
- Site param `params.mermaidPallete.preserveInlineColors` to keep or strip diagram-authored colors (`classDef`, `style`, etc.).
- Documentation: README (install, CSS contract, CSP), CONTRIBUTING.

### Notes

- The directory and param key use the spelling **pallete** (historical); a future major release may rename to `palette`.

[0.1.0]: https://github.com/uncle-rennus/hugo-mermaid-pallete/releases/tag/v0.1.0
