# Bounded Context: Design

Typography, color palette, theme switching, and accessibility conventions across all viewers.

## Key Concepts

| Term | Definition |
|------|------------|
| **Design Token** | A CSS custom property (`--color-bg`, `--color-fg`, etc.) that carries a semantic meaning independent of its value |
| **Theme** | Color mode: `dark` or `light`; detected via `prefers-color-scheme`, stored in `localStorage`, applied via `data-theme` attribute on `<html>` |
| **Typography Stack** | Three fonts: Source Serif 4 (body), JetBrains Mono (code), DM Sans (UI) |
| **Semantic Color** | A color token named for its role (`--color-bg`, `--color-accent`) not its value |

## Fonts

| Font | Use |
|------|-----|
| Source Serif 4 | Body text in rendered documents |
| JetBrains Mono | Code blocks, inline code |
| DM Sans | UI chrome: navigation, labels, metadata |

## Key Operations

| Operation | Description |
|-----------|-------------|
| **Detect Theme** | Read OS preference via `prefers-color-scheme` media query |
| **Toggle Theme** | Switch dark ↔ light; persist choice to `localStorage`; set `data-theme` attribute |
| **Apply Tokens** | Use CSS custom properties throughout; never hard-code color values |

## Design Goals

These are design intent statements, not runtime invariants:

- **Tablet-Optimized** — layout targets large touch targets, comfortable reading width (~72ch), and split-pane navigation

## Invariants

- All colors are referenced via design tokens (no hard-coded hex values in component styles)
- Theme preference persists across page reloads via `localStorage`
- `data-theme` attribute on `<html>` is the single source of truth for the active theme
