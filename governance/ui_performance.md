# Smriti Retail OS — UI & Performance Governance
# Authoritative Source: Cashier Ergonomics v1.2

## 1. FOCUS & INTERACTION CONTINUITY
- **Absolute Focus**: Barcode focus continuity is mandatory. Focus interruption is a regression.
- **Keyboard-First**: Workflows MUST be mouse-independent. Minimal cashier friction is the primary UX goal.
- **Ref Forwarding**: Child interaction components MUST use `React.forwardRef` to support focus orchestration.

## 2. RENDER PERFORMANCE
- **Render Isolation**: Monolithic components MUST be atomized into operationally isolated atoms (e.g., `CartRow`, `ProductSearch`).
- **Memoization**: Rapidly updating components MUST use `React.memo()` with explicit `displayName`.
- **Selector-Based**: Zustand subscriptions MUST use specific selectors to avoid broad rerenders.

## 3. COMPONENT DECOMPOSITION
- **Operational Ownership**: Split UI by operational responsibility (e.g., `PaymentWorkflow`, `ShortcutHandler`), not visual layout.
- **Side-Effect Isolation**: Components MUST NOT orchestrate complex async workflows. Use services or Zustand actions.

## 4. VIRTUALIZATION
- **Threshold**: Item lists exceeding safe rendering thresholds MUST use `react-virtual`.
- **Navigation Safety**: Arrow-key navigation MUST synchronize with virtualized scrolling to prevent focus drift.
