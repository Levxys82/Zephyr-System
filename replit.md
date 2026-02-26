# Zephyr Engine - SkyWind Asset Browser

## Overview
A Minecraft mod/plugin/resource pack browser powered by the Modrinth API. Built as a static frontend using Vite. Users can search, filter, and browse mods, plugins, resource packs, shader packs, modpacks, and data packs.

## Project Architecture
- **Frontend**: Vanilla HTML/JS with Tailwind CSS (CDN), served by Vite
- **Build Tool**: Vite 5
- **API**: Modrinth v2 API (external, no backend needed)
- **Entry Point**: `index.html`
- **Core Logic**: `zephyr-core.js` (download injection helper)

## Project Structure
```
index.html          - Main application page
zephyr-core.js      - Download helper module
zephyrlogo.png      - Logo asset
vite.config.js      - Vite dev/build config (port 5000, all hosts allowed)
package.json        - Node.js dependencies
```

## Running
- Dev: `npm run dev` (Vite dev server on port 5000)
- Build: `npm run build` (outputs to `dist/`)
- Deployment: Static site deployment from `dist/`

## Recent Changes
- 2026-02-17: Initial Replit setup - added vite.config.js, configured workflow and deployment
