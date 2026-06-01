---
name: Taruca Educational Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006243'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d57'
  on-tertiary-container: '#bdffdc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Roboto Flex
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Roboto Flex
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Roboto Flex
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Roboto Flex
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Roboto Flex
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 280px
  gutter: 24px
  margin_mobile: 16px
  margin_desktop: 32px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
---

## Brand & Style
The design system is engineered for high-stakes educational environments, prioritizing clarity, institutional trust, and cognitive ease. The brand personality is authoritative yet supportive, functioning as a reliable partner for educators managing complex data.

The visual style is **Corporate / Modern**, characterized by a rigorous adherence to hierarchy and functional aesthetics. It utilizes a structured layout with high-contrast navigation to delineate system-level actions from content-heavy grading workspaces. The interface avoids unnecessary ornamentation, ensuring that the student data remains the focal point while providing a sense of stability through solid color blocks and precise geometry.

## Colors
The palette is rooted in a professional "Slate" scale to provide a neutral foundation for educational data. 

- **Primary Blue** is used for core interactions and brand presence.
- **Success, Warning, and Danger** colors are strictly reserved for grading status, performance indicators, and critical alerts.
- **Sidebar/Nav** uses a deep Slate-900 to create a "command center" feel, visually separating navigation from the slate-100 workspace.
- **Surface colors** are pure white to ensure that the "elevated card" metaphor is distinct against the light grey background.

## Typography
This design system utilizes a variable font approach to maintain high legibility across dense data tables and administrative forms. 

- **Headlines:** Use tighter letter spacing and heavier weights to command attention in hero sections.
- **Body:** Set to standard weights for long-form reading and instructions.
- **Labels:** Small caps or uppercase are used for table headers and form labels to differentiate them from user-inputted data.
- **Data Tabular:** A specific scale for the gradebook grid, optimized for vertical and horizontal scanning within cells.

## Layout & Spacing
The layout follows a **Fixed Sidebar / Fluid Content** model. 

- **Sidebar:** Fixed at 280px. It remains docked on desktop and collapses into a drawer on mobile devices.
- **Main Content:** A fluid area that uses a 12-column grid. For the gradebook module, the content area allows for horizontal scrolling while keeping the student name column "sticky."
- **Hero Sections:** Utilize a linear gradient background (#1e3a5f to #2563eb) spanning the full width of the content area with 48px vertical padding.
- **Grid:** Gutters are fixed at 24px to ensure distinct separation between data cards.

## Elevation & Depth
Depth is used functionally to indicate interactivity and importance. This design system employs **Tonal Layers** combined with **Ambient Shadows**.

- **Level 0 (Canvas):** The Slate-100 background. 
- **Level 1 (Cards):** White surfaces with a "sm" shadow (0 1px 2px 0 rgba(0,0,0,0.05)). Used for standard data displays.
- **Level 2 (Interactive):** Hover states for cards or dropdowns use a "md" shadow (0 4px 6px -1px rgba(0,0,0,0.1)).
- **Level 3 (Modals):** Large overlays use a "lg" shadow (0 10px 15px -3px rgba(0,0,0,0.1)) to push the background into the distance.
- **Sticky Elements:** Headers in tables use a 1px solid border (#e2e8f0) at the bottom to maintain a "planar" feel without heavy shadows.

## Shapes
The shape language is "Rounded" to soften the professional aesthetic and make the interface more approachable for daily use.

- **Standard Elements:** Buttons, input fields, and small chips use an 8px (0.5rem) radius.
- **Large Containers:** Dashboard cards and modal containers use a 12px (0.75rem) radius to feel more modern and substantial.
- **Form Inputs:** Must maintain consistent 8px corners to match primary buttons.

## Components
Consistent implementation of these components ensures the system remains intuitive.

- **Buttons:** Primary buttons are solid Blue-600 with white text. Secondary buttons are outlined in Slate-200 with Slate-800 text.
- **Input Fields:** Use a 1px outline (#e2e8f0). On focus, the border shifts to Blue-600 with a subtle blue outer glow.
- **Gradebook Grid:** 
    - Sticky headers and the first column (Student Name).
    - Alternating row stripes are not used; instead, use 1px horizontal dividers.
    - Status-based cell backgrounds (e.g., light red for "Missing") should use 10% opacity of the functional color.
- **Chips:** Used for "Course Tags" or "Status." Use a pill shape (full radius) with light tinted backgrounds and dark text.
- **Cards:** Always elevated (Level 1) with 24px internal padding.
- **Hero Sections:** Feature a gradient background, white H1 typography, and a "Glass" effect search bar or primary action for high-impact module landing pages.
