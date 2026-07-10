# Versioning

This project follows the same release-tag pattern as `pi-rag`:

- `VERSION`, `package.json`, and `package-lock.json` hold the application version.
- `GIT_TAG` or `RELEASE_VERSION` controls the release artifact tag at build time.
- If no release tag is provided, `build.mjs` falls back to `dev-<commit>`.

## Set The App Version

```bash
npm run version:set v1.0.2
```

## Build A Release Artifact

```bash
RELEASE_VERSION=v1.0.2 npm run build
```

In CI/CD, pass the git tag as `GIT_TAG`:

```bash
GIT_TAG=v1.0.2 npm run build
```

The generated `public/build-info.json` contains:

- `version`: app version from `VERSION`
- `releaseTag`: git/release tag or `dev-<commit>`
- `tag`: same as `releaseTag` for backward compatibility
- `builtAt`: ISO build timestamp
- `commit`: short git commit SHA
