# Eclipse documentation

VitePress documentation for Eclipse by Polaris. Includes the current Studio guides, installation notes, public API, format reference and GitHub Pages workflow.

## Put these files in the repository

Extract the ZIP **contents** directly into your cloned repository folder. package.json and .github must be at the repository root, not inside another eclipse-docs folder.

Open that repository folder in VS Code.

## Preview locally

Install Node.js 22 or newer from https://nodejs.org if you do not already have it. In VS Code, choose Terminal → New Terminal. The terminal must be in this repository's root folder (the folder containing package.json).

Run these as separate commands:

```powershell
npm.cmd ci
```

```powershell
npm.cmd run docs:dev
```

Open the URL printed by VitePress. The local default base is /eclipse-docs/; follow the terminal's complete URL. To stop the server, press Ctrl+C.

To verify a production build:

```powershell
npm.cmd run docs:build
```

## Publish with GitHub Desktop

1. On GitHub, open this repository's Settings → Pages.
2. Set Build and deployment → Source to GitHub Actions.
3. In GitHub Desktop, commit the extracted files to main.
4. Click Push origin.
5. Open the Actions tab on GitHub and wait for Deploy Eclipse docs to succeed.
6. Settings → Pages displays the published address.

If your default branch is not main, edit the workflow's branches entry.

The workflow determines the website's base path from GitHub Pages settings. You do not need to put a GitHub username into the configuration.

## Editing

- docs/start: short installation and integration instructions.
- docs/guides: feature guides.
- docs/api: integration reference.
- docs/learn: Studio guides in creation order, 00–17.
- docs/reference: format limits, troubleshooting and license.
- docs/.vitepress/config.mts: navigation and sidebar.
- docs/.vitepress/theme/style.css: graphite and amber theme.

The Learn pages were exported from the live Studio Docs modules on 12 October 2026. Update their Markdown when behavior changes. If retaining in-Studio guides, keep them synchronized with the Markdown before each release.

Eclipse uses the custom Polaris license in LICENSE. Third-party package attributions are described in the documentation; keep their original notices with the Roblox distribution.
