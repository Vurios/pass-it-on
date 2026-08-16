# Pass It On Design System

## Visual foundation

- Cream `#FFF8ED`: app canvas.
- Ink `#1A1A1A`: text, borders, and hard shadows.
- Primary/corrective coral `#D93F45`: main action and incorrect state with an X icon.
- Secondary ocean `#236C8C`: supporting action and informational state.
- Correct green `#5D9E36`: correct state with a check icon.
- Warning amber `#B97700`: warnings paired with text or an icon.
- Sunshine `#FFC53D`: highlights and neutral emphasis.

All state colors require an icon or text label. Color never carries meaning alone.

## Type scale

- Display: `clamp(3rem, 10vw, 6rem)` for the menu wordmark.
- Heading: fluid Fredoka headings with tight tracking and balanced wrapping.
- Body: Space Grotesk, minimum 16px on phones and larger on shared displays.
- Label: bold Fredoka for actions, tags, and short interface labels.
- Caption: Space Grotesk with enough contrast and size for its viewing context.

## Layout tokens

Spacing, motion, colors, and shadow constants live in `src/design/tokens.js` and CSS custom properties in `src/styles.css`. Full-screen game views use `dvh`; the How to Play reference is the only intentionally scrollable route.

## Components

- `BigButton`: primary and secondary actions with a 48px minimum target, thick border, and pressed shadow state.
- `Card`: flat cream or paper surface with thick ink border and hard shadow.
- `BrandMark` / `BrandLockup`: responsive identity mark and wordmark.
- `AvatarBadge`: eight preset animal avatars rendered as high-contrast squircles.
- `TopRail`: compact app frame with screen title, session controls, and back navigation.
- `HostToast`: two-second host callout that avoids answer regions.
- `LeaveConfirmModal`: reusable confirmation pattern for destructive exits and one-player starts.
- `CountdownBar`: host and single-screen timing only; never shown on player phones.
- `RecapCard`: paginated in-app learning summary plus 4:5 PNG export.

## Motion

- Fast `100ms`: hover and press feedback.
- Medium `250ms`: screen and toast entrances.
- Slow `500ms`: podium and celebratory reveals.
- Ambient dots drift over 20 seconds. `prefers-reduced-motion` disables drift, bounce, podium movement, and confetti motion.

## Copy

Follow `COPY_STYLE.md`. Headings and short labels use title case; sentences, questions, explanations, and feedback use sentence case.
