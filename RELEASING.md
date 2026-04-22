# Releasing

## One-time: create the GitHub repository

Create **`cantalops/hugo-mermaid-pallete`** (empty, no README) under the org that owns `go.mod`’s module path.

## Push this repository

From a clone of **this** repo (not the consumer site):

```bash
git remote add origin https://github.com/cantalops/hugo-mermaid-pallete.git
git push -u origin main
git push origin v0.1.0
```

If the tag already existed remotely, use `git push origin :refs/tags/v0.1.0` then push the tag again, or bump the version in `CHANGELOG.md` / new tag.

## Verify consumers can resolve the module

```bash
cd /path/to/hugo-site
hugo mod get github.com/cantalops/hugo-mermaid-pallete@v0.1.0
hugo mod graph
hugo --gc --minify
```

## Consumer site (`github.com/cantalops/site`)

That site’s `go.mod` should contain **only**:

```go
require github.com/cantalops/hugo-mermaid-pallete v0.1.0
```

with **no** `replace` line, once the tag is public.
