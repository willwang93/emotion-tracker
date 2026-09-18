---
name: Warm Radiant Wellness
colors:
  surface: '#fef9ee'
  surface-dim: '#dedacf'
  surface-bright: '#fef9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3e8'
  surface-container: '#f2ede3'
  surface-container-high: '#ece8dd'
  surface-container-highest: '#e7e2d7'
  on-surface: '#1d1c15'
  on-surface-variant: '#574235'
  inverse-surface: '#323029'
  inverse-on-surface: '#f5f0e5'
  outline: '#8b7263'
  outline-variant: '#dec1af'
  surface-tint: '#964900'
  primary: '#964900'
  on-primary: '#ffffff'
  primary-container: '#f57c00'
  on-primary-container: '#572800'
  inverse-primary: '#ffb786'
  secondary: '#194be2'
  on-secondary: '#ffffff'
  secondary-container: '#3e66fb'
  on-secondary-container: '#fffbff'
  tertiary: '#1b6c40'
  on-tertiary: '#ffffff'
  tertiary-container: '#61ad7b'
  on-tertiary-container: '#003e20'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc6'
  primary-fixed-dim: '#ffb786'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001354'
  on-secondary-fixed-variant: '#0036bb'
  tertiary-fixed: '#a5f4bc'
  tertiary-fixed-dim: '#8ad7a1'
  on-tertiary-fixed: '#00210e'
  on-tertiary-fixed-variant: '#00522c'
  background: '#fef9ee'
  on-background: '#1d1c15'
  surface-variant: '#e7e2d7'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 52px
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system is built around radiant empathy, mindful simplicity, and joyful grounding. Tailored for individuals seeking sanctuary from digital exhaustion, anxiety, and daily overwhelm, the experience acts as an exhale—gentle, warm, non-judgmental, and deeply human.

The aesthetic blends warm organic minimalism with tactile playfulness:
- **Atmospheric Warmth:** Sun-drenched cream bases replace stark sterile white, evoking early morning daylight and comforting reassurance.
- **Organic Softness:** Pillowy contours, generous radiuses, and zero razor-sharp corners eliminate interface tension.
- **Emotional Tone-on-Tone Zoning:** Content spaces adapt fluidly to affective mental states through comforting pastel washes (moss sage, soft peach, gentle periwinkle, and buttercup gold).
- **Playful Character:** Approachable geometric typography paired with tactile, squishy buttons builds a welcoming, habit-forming digital sanctuary.

## Colors

The palette is tuned to calm the nervous system while sustaining optimism and delight.

### Palette Architecture
- **Primary (`#F57C00` / `#FA8C16`):** Amber Warmth. Represents vitality, morning sun, and emotional optimism. Used for focal primary actions, progression rings, and active accents.
- **Secondary (`#3E66FB`):** Clear Sky & Deep Focus. A vibrant, reassuring royal blue for audio session playback, cognitive focus, and primary audio triggers.
- **Tertiary (`#5EAA78`):** Lichen & Meadow Green. Calming, botanical grounding for restoration, breathing milestones, and stress-release modules.
- **Neutrals (`#FEF9EE`, `#FFF5E4`, `#2D2319`):** 
  - Canvas Base: `#FEF9EE` (Warm Butter Linen)
  - Card & Container Surface: `#FFF5E4` (Warm Cream Glow) and pure `#FFFFFF`
  - High-Contrast Text: Deep warm charcoal-espresso (`#2D2319`), avoiding harsh pitch black to preserve soft visual comfort.

### Emotional State Pastels
- **Rest & Sleep:** Soft twilight indigo/periwinkle wash (`#E6ECFE`).
- **Anxiety & Tension Relief:** Breathable moss sage tint (`#EAF5EE`).
- **Joy & Play:** Sunbeam buttercup tint (`#FFF0D0`).
- **Kindness & Self-Compassion:** Gentle baked peach blush (`#FEEAE1`).

## Typography

Plus Jakarta Sans brings friendly, rounded geometry, wide apertures, and reassuring stability. Its organic curves reflect warmth without losing clinical authority.

- **Headlines:** Set bold (`700`) to extra-bold (`800`) with snug line heights, conveying warmth, optimism, and gentle guidance.
- **Body Copy:** Generous line heights ensure cognitive ease when reading during heightened stress or before sleep.
- **Pacing & Readability:** Tight tracking is avoided entirely. Headings use subtle negative spacing (`-0.01em`) only at display sizes; body and labels stay natural (`0` to `+0.01em`).

## Layout & Spacing

The layout model favors expansive, clutter-free breathing room. Visual noise is minimized to preserve a meditative rhythm across screens.

- **Responsive Grid:** 
  - **Mobile (under 600px):** Single-column fluid stack with `1.25rem` screen margins and `0.75rem` card gutters.
  - **Tablet (600px - 1024px):** 6-column fluid grid, `1.5rem` canvas margins, accommodating dual-column session cards.
  - **Desktop (over 1024px):** 12-column grid capped at `1200px` max-width with centered balance and `2rem` margins.
- **Spacing Rhythm:** Based on an organic 6px/8px hybrid scale. Card interiors prioritize high vertical padding (`space-md` to `space-lg`) to give illustrations and typography open space to breathe.

## Elevation & Depth

Visual depth is achieved through gentle tonal layers and warm, ambient drop shadows rather than hard structural lines.

- **Zero Harsh Borders:** Eliminate crisp 1px borders. Layer hierarchy is established through contrasting pastel surface fills and subtle light diffusion.
- **Sun-Kissed Diffused Shadows:** Shadows feature wide blur radiuses with warm undertones rather than cold grays:
  - *Resting Surface:* `0px 4px 20px rgba(189, 137, 72, 0.08)`
  - *Floating / Active Card:* `0px 12px 36px rgba(189, 137, 72, 0.14)`
  - *Primary Button Hover:* `0px 8px 24px rgba(245, 124, 0, 0.28)`
- **Atmospheric Clouds & Hills:** Decorative backdrop waves and sky-glow zones use overlapping radial and organic gradient shapes to provide depth behind interface cards.

## Shapes

The shape system is hyper-rounded, soft, and organic. Sharp 90-degree corners are strictly prohibited.

- **Full Pill (`9999px`):** Used universally for all action buttons, interactive chips, category tags, search capsules, and audio time scrubbers.
- **Large Content Cards (`24px` to `32px`):** Meditation tiles, mindfulness journeys, and feature modules use generous radii that mimic smooth river stones.
- **Overlays & Bottom Sheets (`32px` on top edges):** Modals emerge with pill-like friendly contours, reinforcing tactile calmness.

## Components

### Buttons
- **Primary CTA:** Full pill shape, filled with radiant Amber Orange (`#F57C00`) or Focus Blue (`#3E66FB`), bold white label, and warm diffused hover elevation.
- **Secondary CTA:** Full pill, butter-cream or tinted pastel container fill, matched saturated text color, with zero border outline.
- **Floating Audio Control:** Circular pill (`56px × 56px` to `64px × 64px`) floating button with soft squish press feedback (`scale(0.96)`).

### Cards & Tiles
- Radii set strictly between `24px` and `32px`.
- Rendered on tone-on-tone tinted backgrounds (e.g., buttercup, soft sage, warm peach) or pure white elevated over warm butter linen (`#FEF9EE`).
- Contains friendly, rounded illustrations, character art, and clear visual tags.

### Chips & Filters
- Compact pill silhouettes (`padding: 8px 18px`).
- Inactive state: Off-white cream with deep warm charcoal text.
- Active state: Saturated amber, sage, or periwinkle wash with prominent bold weight.

### Form Inputs & Search Fields
- Enclosed in full pill or `20px` rounded rectangular capsules.
- Warm cream background (`#FFF5E4`) with subtle warm focus glow instead of sharp outline boxes.
- Large, legible placeholder text with warm muted earth tones.

### Progress & Habit Trackers
- Rounded, soft-ended track bars (`height: 10px` to `14px`) with soft pastel background rails and vibrant amber or blue progression fills.
- Daily streak counters styled as circular badges with cheerful sun icons and warm glowing accents.