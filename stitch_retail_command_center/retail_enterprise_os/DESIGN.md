---
name: Retail Enterprise OS
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#1f1f21'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e4e2e4'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e4e2e4'
  inverse-on-surface: '#303032'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#b9c7e0'
  on-secondary: '#233144'
  secondary-container: '#3c4a5e'
  on-secondary-container: '#abb9d2'
  tertiary: '#dec29a'
  on-tertiary: '#3e2d11'
  tertiary-container: '#231500'
  on-tertiary-container: '#957d5a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#131315'
  on-background: '#e4e2e4'
  surface-variant: '#353436'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  component-gap-xs: 4px
  component-gap-sm: 8px
  component-gap-md: 16px
---

## Brand & Style
The design system is engineered for the high-stakes environment of retail operations, where clarity and speed of thought are paramount. It follows a **Modern Corporate** aesthetic with a heavy emphasis on information density and data integrity. The brand personality is authoritative and stoic, positioning the software as a reliable infrastructure rather than a mere tool. 

The visual style leverages a "Data-First" philosophy, where UI chrome recedes into the background using deep, professional tones, allowing vibrant semantic accents to highlight critical business intelligence. It prioritizes functional minimalism to ensure that even the most complex inventory or logistics dashboards remain scannable and actionable.

## Colors
The palette is anchored in a sophisticated Dark Mode by default to reduce eye strain during long shifts. 
- **Primary & Secondary:** Deep Navy (`#0F172A`) and Slate (`#334155`) form the core surfaces, creating a sense of depth and permanence.
- **Accents:** Vibrant tones are reserved strictly for utility. **Clear Blue** drives primary actions; **Emerald Green** signals positive growth, stock increases, or successful transactions; **Amber** is used for low-stock warnings and pending logistics.
- **Surface Logic:** Backgrounds use the deepest navy, while cards and interactive panels use slightly lighter slate tones to establish hierarchy through value rather than color.

## Typography
This design system utilizes **Inter** exclusively for its exceptional legibility in high-density environments. 
- **Data-Tabular:** A specialized style for table cells using tabular num features to ensure columns of numbers align perfectly for rapid comparison.
- **Label-Caps:** Used for table headers and small metadata categories to differentiate organizational text from user data.
- **Hierarchy:** Contrast is achieved through weight (Medium to Bold) rather than excessive size differences to maintain high information density.

## Layout & Spacing
The system employs a **Fluid Grid** with a 4px base unit to allow for surgical precision in high-density layouts. 
- **Dashboards:** Utilize a 12-column system with 16px gutters, allowing modules to stack and span dynamically.
- **Density:** Padding inside data tables and lists is compressed (8px vertical) to maximize the "above the fold" data visibility. 
- **Safe Areas:** 24px margins are maintained at the screen edges to provide "visual breathing room" against the heavy data within the core UI.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Subtle Ambient Shadows**. 
- **Z-0 (Base):** Deep Navy background.
- **Z-1 (Panels):** Slate surfaces with 1px low-opacity borders (`rgba(255,255,255,0.05)`) to define edges without adding bulk.
- **Z-2 (Interactive):** Elements like dropdowns or active cards use a subtle, diffused shadow (0px 4px 12px) with a 20% black tint to lift them from the primary interface.
- **Overlay:** Modals use a backdrop blur (8px) to maintain the context of the underlying data while focusing the user on the task at hand.

## Shapes
The shape language is disciplined and geometric. A **Soft (0.25rem)** border radius is the standard for most components (buttons, inputs, cards) to provide a modern feel that isn't overly "playful." 
- **Status Indicators:** Small circular pips for live status.
- **Containers:** Larger dashboard widgets may use a `rounded-lg` (0.5rem) to distinguish major section containers from individual UI components.

## Components
- **Buttons:** Primary buttons use the Action Blue; secondary buttons use a ghost style with a slate border. Square edges with minimal rounding reinforce the professional tone.
- **Data Tables:** The backbone of the OS. Features include sticky headers, zebra-striping using subtle tonal shifts, and "hover-state" row highlighting.
- **Status Chips:** Small, high-contrast badges with background tints derived from the accent colors (e.g., light emerald background with dark emerald text).
- **Input Fields:** Inset appearance with 1px slate borders. The focus state uses a 2px glow of the Action Blue.
- **KPI Cards:** Large-format typography for metrics, featuring a small sparkline visualization for 24-hour trends using the Emerald or Amber accent colors.
- **Inventory Tags:** Monospaced, high-visibility labels for SKU and barcode data.