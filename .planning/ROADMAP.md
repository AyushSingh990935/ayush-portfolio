# Roadmap: Ayush Singh Portfolio

## Overview

Building a premium, interactive personal portfolio website for Ayush Singh from the ground up, starting with a robust UI foundation featuring deep obsidian dark mode and glassmorphism, followed by populating his professional timeline and MBA journey, and finishing with highly polished "anti-gravity" animations and contact details.

## Phases

- [x] **Phase 1: Foundation & UI System** - Setup the project, routing, and core premium aesthetics.
- [x] **Phase 2: Core Content Sections** - Build the Hero, Experience, and Education sections based on his LinkedIn.
- [x] **Phase 3: Polish & Interactivity** - Refine the "anti-gravity" animations, parallax scrolling, and finalize contact elements.
- [x] **Phase 4: 3D & Animation Overhaul (Peachweb Inspiration)** - Introduce Spline 3D scenes, GSAP scroll triggers, and spatial interactions.

## Phase Details

### Phase 1: Foundation & UI System
**Goal**: Establish the base codebase, dark mode theme, and reusable glassmorphic components.
**Depends on**: Nothing
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. The application loads with the Deep Obsidian and Cyan color palette.
  2. Reusable glassmorphism card components are implemented and responsive.
**Plans**: 1 plan

Plans:
- [x] 01-01: Initialize web framework, CSS variables, and core layouts.

### Phase 2: Core Content Sections
**Goal**: Populate the site with Ayush's professional background and current status.
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, EXP-01, EXP-02, EXP-03, EDU-01, EDU-02, EDU-03
**Success Criteria** (what must be TRUE):
  1. The Hero section clearly displays his MBA '27 status and B.Tech background.
  2. An interactive timeline displays his experience at Nayara Energy and My Equation.
  3. Education details (IIT Kharagpur, VIT) are visible and properly formatted.
**Plans**: 2 plans

Plans:
- [x] 02-01: Build the Hero section and main landing view.
- [x] 02-02: Implement the Experience timeline and Education section.

### Phase 3: Polish & Interactivity
**Goal**: Apply the final coat of premium polish with animations and contact hooks.
**Depends on**: Phase 2
**Requirements**: UI-03, CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
  1. Elements exhibit subtle floating "anti-gravity" animations on scroll/hover.
  2. Contact links (LinkedIn, Email) are functional and styled correctly.
**Plans**: 1 plan

Plans:
- [x] 03-01: Add Framer Motion/CSS animations and contact footer.

### Phase 4: 3D & Animation Overhaul
**Goal**: Elevate the portfolio into an immersive, interactive 3D web experience inspired by Peachweb.
**Depends on**: Phase 3
**Requirements**: UI-04
**Success Criteria** (what must be TRUE):
  1. Spline 3D objects are integrated into the Hero and Contact sections.
  2. GSAP scroll triggers replace basic CSS animations.
  3. Vanilla-Tilt.js adds spatial depth to project/experience cards.
  4. Custom trailing cursor is implemented.
**Plans**: 1 plan

Plans:
- [x] 04-01: Implement 3D assets, GSAP animations, and custom cursor.

### Phase 5: Immersive 3D Staircase Background
**Goal**: Create a procedural 3D staircase using Three.js where the camera walks down the stairs synchronized to the user's scroll.
**Depends on**: Phase 4
**Requirements**: UI-05
**Success Criteria** (what must be TRUE):
  1. A fixed Three.js canvas renders a 3D staircase in the background.
  2. The camera moves down the stairs accurately based on scroll progress via GSAP.
  3. Existing UI sections have translucent backgrounds so the staircase is visible.
**Plans**: 1 plan

Plans:
- [ ] 05-01: Implement Three.js environment, procedural stairs, and GSAP ScrollTrigger camera logic.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & UI System | 1/1 | Complete | Yes |
| 2. Core Content Sections | 2/2 | Complete | Yes |
| 3. Polish & Interactivity | 1/1 | Complete | Yes |
| 4. 3D & Animation Overhaul | 1/1 | Complete | Yes |
| 5. Immersive 3D Staircase | 0/1 | Not Started | No |
