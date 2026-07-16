# NityaGeeta — Design System & Layout Reference

## Color Palette
| Token          | Hex       | Usage                                  |
|----------------|-----------|----------------------------------------|
| Deep Night     | `#07060e` | Page background                        |
| Panel Dark     | `#0c0b16` | Form panels, alt backgrounds           |
| Sacred Gold    | `#d4a847` | Primary accent, headings, CTA gradient |
| Gold Light     | `#f0c96a` | Hover states, shimmer animation        |
| Gold Dark      | `#9a7530` | Tertiary text, verse references        |
| Divine Orange  | `#e8823a` | Gradient endpoint, warmth accent       |
| Lotus Cream    | `#f5e6c8` | Primary body text                      |
| Cream Dim      | `#b0a78e` | Secondary text, subtitles              |
| Temple Teal    | `#1a8080` | Highlight accent (sparingly used)      |

## Typography
| Role         | Font                    | Weight     | Use Case                |
|--------------|-------------------------|------------|-------------------------|
| Headings     | Cinzel (Google Fonts)   | 400–900    | All h1–h4, buttons, nav |
| Body         | Crimson Pro             | 300–600    | Paragraphs, descriptions|
| Sanskrit     | Noto Sans Devanagari    | 300–600    | Verse text, taglines    |

## Animation Techniques Used
| Technique                       | File         | What it does                                        |
|---------------------------------|--------------|-----------------------------------------------------|
| Canvas Particle System          | landing.html | Sacred geometry shapes (dots, diamonds, triangles)   |
| Cursor Divine Light             | All pages    | Golden radial gradient follows the mouse             |
| Intersection Observer Reveals   | landing.html | Elements animate in only when scrolled into view     |
| Magnetic Button Physics         | landing.html | CTA buttons subtly pull toward cursor position       |
| Parallax Background             | landing.html | Hero image scrolls at 40% speed creating depth      |
| Loading Ceremony                | landing.html | Om symbol pulses before page reveals                 |
| Sacred Geometry SVG Rotation    | signin/up    | Concentric rings + Star of David rotate independently|
| Slow Background Drift           | signin/up    | Background image slowly pans creating life           |
| Floating Om Animation           | signin/up    | Om symbol levitates with shadow depth change         |
| Floating Form Labels            | signin/up    | Labels float up into the border on focus             |
| Password Strength Meter         | signup.html  | 4-bar live meter: Weak/Fair/Good/Strong              |
| Success Ring + Pulse            | signup.html  | Concentric ring animation on successful registration |
| Staggered Benefits List         | signup.html  | Each benefit slides in with increasing delay         |
| Shimmer Gradient on Headings    | landing.html | Gold text has moving gradient highlight              |
| Error Shake Animation           | signin/up    | Error message shakes horizontally on validation fail |
| Text Reveal with delay          | landing.html | Hero text elements appear sequentially               |

## Page Layouts
### Landing Page (landing.html)
- Full-viewport hero with parallax + particle canvas
- Verse banner with decorative gold line borders
- 3-column feature grid (glass cards)
- 4-step horizontal process with connecting line
- Ambient glow CTA section

### Sign In Page (signin.html)
- Two-panel split: 55% visual / 45% form
- Left: Vishnu temple image + sacred geometry rings + Om + verse
- Right: Google OAuth button → divider → email/password form
- Decorative gold border line between panels

### Sign Up Page (signup.html)
- Two-panel split: 47% visual / 53% form
- Left: Krishna battlefield image + sacred geometry + Om + verse
- Right: Benefits list → Google OAuth → email form with password strength
- Success state: animated ring + namaste emoji

## Assets
| File                              | Description                              |
|-----------------------------------|------------------------------------------|
| `assets/images/hero_krishna.png`  | AI-generated Kurukshetra battlefield art  |
| `assets/images/bg_vishnu.png`     | AI-generated Vishnu cosmic serpent art    |
