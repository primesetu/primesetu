---
name: Sovereign Light
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e6'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ededfa'
  surface-container-high: '#e7e7f5'
  surface-container-highest: '#e1e1ef'
  on-surface: '#191b25'
  on-surface-variant: '#434656'
  inverse-surface: '#2e303a'
  inverse-on-surface: '#f0f0fd'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ee7'
  primary: '#0043c8'
  on-primary: '#ffffff'
  primary-container: '#0057ff'
  on-primary-container: '#e5e8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#972800'
  on-tertiary: '#ffffff'
  tertiary-container: '#c13600'
  on-tertiary-container: '#ffe3db'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab2'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb59f'
  on-tertiary-fixed: '#3a0a00'
  on-tertiary-fixed-variant: '#862300'
  background: '#faf8ff'
  on-background: '#191b25'
  surface-variant: '#e1e1ef'
typography:
  headline-lg:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.1em
  headline-md:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.05em
  terminal-status:
    fontFamily: monospace
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.2em
  data-metric:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-main:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Public Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 1px
  grid-gap: 16px
  stack-tight: 8px
  stack-loose: 32px
---

## Brand & Style

This design system translates a high-security, institutional terminal aesthetic into a professional light-mode environment. The brand personality is rooted in precision, transparency, and hardened reliability. It evokes the feeling of a digital vault—uncompromising and structured—designed for high-stakes financial or cryptographic execution.

The design style combines **Minimalism** with **Institutional Brutalism**. It utilizes a strict high-density grid and sharp-edged containers to communicate order. The "UTS-1300 terminal branding" is maintained through technical data displays, constant status monitoring, and a rigid information hierarchy that prioritizes clarity and speed of data ingestion over decorative flourish.

## Colors

The palette is anchored by "Sovereign Blue," a high-vibrancy primary used specifically for calls to action, active states, and critical paths. The background architecture uses a three-tier grayscale system to create structural separation without relying on heavy shadows.

- **Primary**: Used for the most critical interaction points and brand signatures.
- **Surface Stack**: Surface-Bright is reserved for active input areas and high-priority cards; Surface-Dim provides the structural "gutter" or sidebar background to anchor the primary content area.
- **Functional Slates**: Text colors are selected for high-contrast ratios (AAA compliance) to ensure the UI feels like a printed financial statement.

## Typography

The typography strategy employs a dual-stack approach. **Public Sans** is used for the primary interface structure and body copy to provide an institutional, accessible feel. A **Monospace** font (system-default mono or JetBrains Mono) is strictly reserved for metrics, addresses, and terminal readouts to preserve the design system's technical DNA.

Key headers and terminal status indicators must use `tracking-widest` (0.1em to 0.2em) and uppercase transformation to evoke the UTS-1300 hardware interface. This creates a distinct visual rhythm that separates static labels from dynamic, executable data.

## Layout & Spacing

This design system uses a **fixed grid** philosophy with a 1px gutter execution. The layout is built on a 4px baseline grid to ensure mathematical precision in all component sizing.

Information density should be high. Use 1px borders (#E2E8F0) to define sections rather than whitespace wherever possible, creating a "boxed" or "cell-based" layout reminiscent of an institutional ledger. Margins are kept tight to maximize data real estate, but core functional containers should maintain a standard 24px internal padding for touch and click precision.

## Elevation & Depth

Depth is conveyed through **Bold Borders** and **Tonal Layering** rather than shadows. In this design system, "up" is represented by a shift from Surface (#F8FAFC) to Surface-Bright (#FFFFFF), accompanied by a crisp 1px border.

Shadows are almost entirely avoided, used only in rare "Security Overlays" (modals) as a 100% black 1px offset to maintain the brutalist execution. Interactive elements like buttons should not "lift," but rather change fill color or border weight to indicate state, reinforcing the hardened, physical-terminal metaphor.

## Shapes

The shape language is strictly **Sharp (0px)**. All containers, buttons, inputs, and tags must have 90-degree corners. This lack of curvature reinforces the institutional, unyielding nature of the vault architecture. 

The only exception to the "square" rule is for data visualizations (circles in pie charts) or specific status pips. All structural UI components must adhere to a rigid, rectangular geometry to maintain alignment with the underlying grid.

## Components

- **Buttons**: Rectangular with a 1px solid border. Primary buttons use Sovereign Blue fill with White text. Secondary buttons use White fill with a 1px Slate border and Slate text. Hover states trigger a subtle background fill shift to #F1F5F9.
- **Input Fields**: Hard-edged boxes with Surface-Bright backgrounds. Labels are always positioned above the input in `label-caps` typography. The focus state is indicated by a 2px Sovereign Blue bottom border.
- **Data Tables**: High-density rows with 1px horizontal dividers. Header cells use Surface-Dim with uppercase monospace text. Alignment is strictly tabular.
- **Status Chips**: Small, rectangular blocks. Use Sovereign Blue for "active," Slate for "idle," and high-contrast red/green only for critical binary states (e.g., Fail/Pass).
- **Terminal Readouts**: Contained in Surface-Dim blocks with a monospaced font stack. These components often include a "Scanline" subtle overlay pattern or a 2px left-accent border in Sovereign Blue to denote active processing.
- **The UTS-1300 Header**: A persistent top-bar containing the system version, current epoch/time in monospace, and a "Secure Connection" indicator. It acts as the anchor for the entire interface.