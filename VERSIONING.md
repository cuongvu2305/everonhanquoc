# Versioning

This project follows the same release-tag pattern as `pi-rag`:

- `VERSION`, `package.json`, and `package-lock.json` hold the application version.
- `GIT_TAG` (preferred) or `RELEASE_VERSION` controls the release artifact tag at build time.
- If no release tag is provided, the build falls back to `dev-<commit>`.

## Set The App Version

```bash
npm run version:set v1.0.2
```

## Build A Release Artifact

```bash
RELEASE_VERSION=vX.Y.Z npm run build
```

In CI/CD, pass the git tag as `GIT_TAG`:

```bash
GIT_TAG=vX.Y.Z npm run build
```

`npm run build` runs `scripts/generate-build-info.mjs` before Vite. The script regenerates the tracked `public/build-info.json`, then Vite copies it to `dist/build-info.json`. Generate this file only through a build, never by editing it directly.

The generated `public/build-info.json` contains:

- `version`: app version from `VERSION`
- `releaseTag`: `GIT_TAG`, otherwise `RELEASE_VERSION`, normalized with a leading `v`; without either it is `dev-<commit>`
- `tag`: same as `releaseTag` for backward compatibility
- `builtAt`: ISO build timestamp
- `commit`: short git commit SHA
