# SignMind UI Overhaul PRD

## 1. Document Control

- Product: SignMind Web App
- Scope: End-to-end user interface and visual experience overhaul
- Date: 2026-03-27
- Status: In implementation

## 2. Problem Statement

The current UI is functionally rich but visually inconsistent and overly dependent on a common AI-style palette (purple/blue neon dark mode). This reduces trust, perceived product maturity, and emotional comfort for the core DHH audience. We need a complete visual reset with realistic graphics, better interaction quality, and a premium product feel while preserving existing core workflows.

## 3. Product Goals

1. Deliver a fully redesigned interface with cohesive visual language across all screens.
2. Replace current palette direction with a warmer, more human, less synthetic aesthetic.
3. Improve button hierarchy, affordance, and interaction states for better usability.
4. Preserve and clarify DHH-first workflows, especially no-audio pathways and crisis entry.
5. Ship responsive desktop and mobile layouts with parity of key tasks.

## 4. Non-Goals

1. No backend architecture rewrite.
2. No feature expansion requiring new backend services in this phase.
3. No changes to legal/compliance policy content beyond UI presentation.

## 5. Users and Core Scenarios

### Primary Users

- Deaf and Hard-of-Hearing users seeking visual-first mental wellness tools.
- Users requiring non-voice crisis escalation support.

### Core Scenarios

1. Daily check-in from dashboard.
2. Recording sign-language journal sessions.
3. Starting visual therapy modules.
4. Reviewing AI insights and recommendations.
5. Reading/posting in DHH community.
6. Entering crisis mode quickly and safely.

## 6. Requirements

### Functional Requirements

1. Redesign app shell, navigation, and global header.
2. Redesign all key screens: Dashboard, Journaling, Therapy, Insights, Community, Crisis modal.
3. Redesign controls: primary/secondary/ghost/destructive buttons with full state set.
4. Introduce reusable visual system tokens (color, spacing, radius, elevation, motion).
5. Maintain existing tab navigation logic for this phase unless migration is explicitly approved.

### UX Requirements

1. Clear hierarchy of primary actions on every screen.
2. Strong readability and low cognitive load in data-dense views.
3. Visual reassurance for sensitive flows (crisis, therapy, journaling).
4. Visual consistency between desktop and mobile.

### Accessibility Requirements

1. Keyboard focus visibility across interactive controls.
2. Adequate contrast for text and UI surfaces.
3. Reduced-motion support for major animations.
4. No audio-only instruction dependencies.

### Performance Requirements

1. Avoid heavy visual effects in scroll-critical surfaces.
2. Keep interaction animations smooth on low/mid hardware.
3. Control image sizes and background effects to avoid frame drops.

## 7. Design Direction

- Selected direction: Soft 3D Glass
- Adaptation for SignMind: warm-neutral glass surfaces, realistic depth, subtle textures, tactile controls, restrained motion
- Explicit constraint: avoid purple/blue-first visual identity

## 8. Success Metrics

1. Visual QA pass for all core screens across desktop and mobile.
2. Accessibility checks pass for contrast, focus, keyboard traversal.
3. User flow completion parity with baseline for all existing tasks.
4. Improved subjective visual score in internal review (target >= 8/10).
5. No critical regressions in crisis access flow.

## 9. Milestones

1. M1: PRD + design spec complete and approved.
2. M2: Global token/theme system and core button/card components shipped.
3. M3: Dashboard + Journaling redesign shipped.
4. M4: Therapy + Insights + Community redesign shipped.
5. M5: Crisis flow polish, responsive QA, accessibility and performance pass.

## 10. Risks and Mitigation

1. Risk: Visual inconsistency while migrating screen by screen.

- Mitigation: lock token system and reusable component rules first.

2. Risk: Over-animated UI causes distraction.

- Mitigation: strict motion guidelines and reduced-motion fallback.

3. Risk: Responsive regressions due to inline styles.

- Mitigation: incrementally replace with reusable CSS classes and breakpoints.

4. Risk: Perceived realism depends on asset quality.

- Mitigation: define graphics guidelines and fallback assets per screen.

## 11. Acceptance Criteria

1. Every core screen uses the new visual system and control hierarchy.
2. Primary actions are obvious and consistent.
3. Crisis path remains one-step discoverable from app shell.
4. Desktop and mobile versions are both production-usable.
5. Purple/blue-dominant appearance is fully removed from default UI.
