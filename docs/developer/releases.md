# Releases

Release process, version management, and auto-update system.

## Overview

The release system provides:

- Automated GitHub Actions workflow for building releases
- Version management script for updating all version files
- Auto-updater for seamless user updates
- Cross-platform builds (macOS, Windows, Linux)

## Initial Setup

### 1. Generate Signing Keys

```bash
bun add -g @tauri-apps/cli
tauri signer generate -w ~/.tauri/myapp.key
# Outputs private key (saved) and public key (displayed)
```

### 2. Configure GitHub Repository

Add these secrets (Settings → Secrets and variables → Actions):

- `TAURI_PRIVATE_KEY`: Content of `~/.tauri/myapp.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: Password you set (if any)

### 3. Update Configuration

**`src-tauri/tauri.conf.json`:**

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
      ],
      "dialog": false,
      "pubkey": "YOUR_PUBLIC_KEY_FROM_STEP_1"
    }
  }
}
```

**Bundle info in `tauri.conf.json`:**

- Update `publisher`, `shortDescription`, `longDescription`
- Update `productName` and `identifier`

## Release Process

### Simple Method

```bash
bun run release:prepare v1.0.0
```

This will:

1. Check git status is clean
2. Run all quality checks (`bun run check:all`)
3. Update versions in `package.json`, `Cargo.toml`, `tauri.conf.json`
4. Ask if you want to commit and push

Then GitHub Actions will:

1. Build the app for all platforms
2. Create a draft release
3. Generate `latest.json` for auto-updates
4. Upload all installers and signatures

The workflow publishes the GitHub release automatically once the tagged build succeeds.

### Manual Method

```bash
# Update versions in package.json, Cargo.toml, tauri.conf.json
bun run check:all
git add .
git commit -m "chore: release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

## Version Strategy

Semantic versioning (`v1.0.0`):

- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features, backwards compatible
- **Patch** (x.x.1): Bug fixes

All three files must have matching versions:

- `package.json` → `"version": "1.0.0"`
- `src-tauri/Cargo.toml` → `version = "1.0.0"`
- `src-tauri/tauri.conf.json` → `"version": "1.0.0"`

### Tauri dependency compatibility

The app version above is separate from the Tauri framework versions. The
installed `@tauri-apps/api` and Rust `tauri` crate must share a major/minor
release, as must each installed JavaScript plugin and its matching Rust crate.
Patch versions may differ. Check the resolved versions in `bun.lock` and
`src-tauri/Cargo.lock` when updating either side; a broad `"2"` Cargo range can
leave the two lockfiles on different minor releases. Keep compatible Cargo
ranges in `src-tauri/Cargo.toml`, then run `bun run tauri info` and
`cargo check --locked` from `src-tauri` before releasing. CI installs JavaScript
dependencies from `bun.lock` with Bun 1.4.2 and `--frozen-lockfile`.

## Auto-Update System

### Behavior

- Checks for updates 5 seconds after app launch
- Shows an in-app notification and opens Preferences → Updates when update is available
- Downloads and installs only after the user clicks install
- Restarts after installation
- Fails silently on network issues

### Update Flow

```
App Launch → (5s delay) → Check GitHub → Preferences → Updates → Download → Install → Restart
```

### Implementation

```typescript
// src/App.tsx starts the passive check.
import { check } from '@tauri-apps/plugin-updater'

useEffect(() => {
  const checkForUpdates = async () => {
    try {
      const update = await check()
      if (update) {
        notifications.info(
          'Update available',
          `Version ${update.version} is available`
        )
        useUIStore.getState().setPreferencesOpen(true, 'updates')
      }
    } catch {
      // Silent fail - don't bother user with network issues
    }
  }

  const timer = setTimeout(checkForUpdates, 5000)
  return () => clearTimeout(timer)
}, [])
```

### Manual Update Check

Users can manually check via:

- **Menu**: App → Check for Updates
- **Preferences**: Updates → Check for Updates
- **Command Palette**: Cmd+K → "Check for Updates"

## Development Data Isolation

Local development uses `src-tauri/tauri.dev.conf.json` through `bun run tauri:dev`.
That config changes the product name to `Bon Dev` and the app identifier to
`com.gabrielleall.bon.dev`, so test data written by the dev build does
not share the release app data directory.

The former identifiers (`com.gabrielleall.axis-desktop` and its `.dev` variant)
are migration sources. On first launch, Bon copies app data, a consistent SQLite
snapshot, and Windows WebView local storage into its new directories; it does
not delete the old installation or data. Credential reads also migrate the old
keyring entry lazily. Because the bundle identifier changes, distribute Bon as
a new installation and verify upgrade/migration on each supported platform.

## Release Artifacts

Each release creates:

- **macOS**: `.dmg` installer
- **Windows**: `.msi` installer (when configured)
- **Linux**: `.deb` and `.AppImage` (when configured)
- **Auto-updater**: `latest.json` manifest and `.sig` signature files

## Security

All updates are cryptographically signed:

1. Private key signs releases during build
2. Public key in config verifies downloads
3. Invalid signatures are automatically rejected

## Troubleshooting

| Issue                    | Solution                                              |
| ------------------------ | ----------------------------------------------------- |
| Workflow doesn't trigger | Ensure tag starts with `v` and is pushed              |
| Build fails              | Check GitHub secrets, run `bun run check:all` locally |
| Updates not detected     | Verify endpoint URL and public key match              |
| Download fails           | Check signatures, file permissions, disk space        |
