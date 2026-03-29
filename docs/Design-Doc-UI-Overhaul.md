# SignMind UI Overhaul Design Document

## 1. Overview

This document defines the target visual system, component behavior, interaction model, and responsive patterns for the SignMind UI overhaul.

## 2. Visual Language

### Principles

1. Human and grounded, not synthetic neon.
2. Calm but premium with realistic depth.
3. Tactile controls with clear action hierarchy.
4. Visual-first accessibility for DHH users.

### Style Direction

- Soft 3D Glass adapted for mental wellness context.
- Warm-neutral dark surfaces with subtle texture and depth layers.
- Selective accent use for status and actions only.

## 3. Color System

### Intent

Replace existing purple/blue identity with warm neutral base and nature-inspired accents.

### Token Families

1. Surfaces: bg-primary, bg-secondary, bg-card, bg-glass.
2. Typography: text-primary, text-secondary, text-muted.
3. Brand/action: brand, brand-dim, brand-glow.
4. Feedback: success, warning, danger.
5. Border/elevation: border, border-strong, semantic glows.

### Palette Rules

1. Accent color cannot dominate more than one major section at a time.
2. Alerts use danger family only.
3. Success and recommendation statuses use emerald/teal family.
4. No default purple-blue gradients in shell backgrounds.

## 4. Typography

### Families

- Heading: Sora
- Body/UI: Manrope

### Scale

1. Display/hero: 32-40 px
2. Section headings: 20-28 px
3. Card titles: 15-18 px
4. Body: 13-16 px
5. Captions/labels: 11-13 px

### Rules

1. Heading line-height tight, body line-height relaxed.
2. Avoid long all-caps runs except tiny utility labels.

## 5. Layout and Responsive Model

### Breakpoints

1. Mobile: <= 767 px
2. Tablet: 768-1023 px
3. Desktop: >= 1024 px

### App Shell

1. Desktop: side navigation + top context header.
2. Mobile: compact top bar + bottom tab navigation for core destinations.
3. Crisis action remains persistent and highly discoverable in both modes.

## 6. Interaction and Motion

### Motion Principles

1. Motion explains state change, never decorative noise.
2. Stagger only on first reveal, not on every interaction.
3. Use eased transitions 150-350 ms for UI controls.

### Required States

For all interactive components: default, hover, focus, active, disabled, loading, success/error where applicable.

### Reduced Motion

- Disable non-essential loops and large parallax/ambient effects when reduced-motion is enabled.

## 7. Component System

### Buttons

1. Primary: high-contrast, elevated, clear call to action.
2. Secondary/Ghost: lower emphasis, stronger border cues.
3. Destructive: danger-tinted with clear warning context.
4. Icon buttons: consistent hit-area >= 36 px.

### Core Primitives

1. Card (default, elevated, glass).
2. Badge/chip (status, category, neutral).
3. Input and text field patterns.
4. Tooltip and helper text containers.
5. Modal shell with clear header/actions.
6. Data tiles and chart blocks.

## 8. Screen Specifications

### Dashboard

- Hero with reassuring copy, clear primary CTA.
- High-legibility stats row.
- Chart card with readable legend and axis labels.
- Quick actions with stronger tactile hover/press feedback.

### Journaling

- Camera stage with cleaner overlays and safer contrast.
- Recording controls with unmistakable state changes.
- AI helper panel visually secondary to user recording task.

### Therapy

- Module browse cards with richer hierarchy.
- Session mode with immersive but low-distraction canvas.
- Persistent session controls with clear timing cues.

### Insights

- Better data grouping and trend readability.
- Recommendation cards prioritized by urgency/value.

### Community

- Feed readability improvements.
- Strong moderation/trust indicators.
- Resource module discoverability uplift.

### Crisis Modal

- Urgent but emotionally stable tone.
- Immediate clarity of status, counselor connection state, and available actions.

## 9. Graphics and Texture Strategy

1. Use subtle gradient meshes and soft depth shadows.
2. Keep grain/noise layer very low opacity.
3. Avoid high-saturation neon effects in default shell.
4. Image overlays must preserve text readability and emotional safety.

## 10. ReactBits Usage Plan

### Candidate Patterns

1. Border Glow style interactions for selected cards only.
2. Background Studio inspired ambient backgrounds tuned to low intensity.

### Constraints

1. No heavy animated effects on dense data views.
2. Effects should never interfere with readability or accessibility.

## 11. Implementation Order

1. Token and typography foundation.
2. Core control primitives.
3. App shell and navigation.
4. Dashboard and Journaling.
5. Therapy, Insights, Community.
6. Crisis flow and final polish.

## 12. QA Checklist

1. Responsive layout behavior verified at each breakpoint.
2. Contrast and focus indicators validated.
3. Motion behavior tested with reduced-motion setting.
4. Performance checked during chart and modal interactions.
5. Visual consistency pass across all screens.
