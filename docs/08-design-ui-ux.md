# JivniCare V1.0.0 — Design UI/UX Specification
# Document: 08-design-ui-ux.md
# Version: V1.0.0 FINAL
# For: Antigravity + Claude
# Tool Usage:
#   Antigravity → Implement design system exactly as specified
#   Claude      → Review any design decision before implementing

---

## ⚠ STRICT RULES

1. NEVER use dark colors — light, clean, trustworthy palette only
2. USE exact colors from JivniCare logo (blue + green dual tone)
3. NEVER deviate from logo colors for brand elements
4. ALL logo variants must be used in correct contexts (defined below)
5. REFERENCE SITE: www.jinnicare.com (124 pages, avg rating 4)
   Goal: Improve from 4.0 → 4.5 rating through better UX + trust signals
6. HEALTHCARE FEEL: Trust, life, safety — never clinical/cold
7. ASK NOTHING — execute exactly as specified

---

## 1. BRAND FEEL — CORE REQUIREMENT

```
JivniCare must feel:
  ✅ Trustworthy     — patients trust their health to this platform
  ✅ Life-affirming  — colors that represent health, life, growth
  ✅ Clean           — no clutter, easy to understand
  ✅ Warm            — approachable, not cold/clinical
  ✅ Professional    — doctors and patients both feel respected
  ✅ Local           — Bihar/Jharkhand people feel this is "their" platform

NOT:
  ❌ Dark/heavy (no dark mode as default)
  ❌ Clinical/cold (no sterile white-only design)
  ❌ Overly corporate (no stiff enterprise feel)
  ❌ Generic (no off-the-shelf healthcare template look)
```

---

## 2. LOGO ASSETS — ALL VARIANTS

```
Logos provided by founder (stored in public/brand/):

1. `logo-horizontal-wordmark.png`
   Use: Desktop header (primary), login page, footers, email headers, about page, marketing materials, og:image (social share).

2. `logo-icon-master-transparent.png` (2000×2000)
   Use: Master source for any custom export; also used in PDF templates (QR sticker branding, letterhead).

3. `logo-icon-512.png` and `logo-icon-192.png`
   Use: PWA manifest icons, PWA splash screen.

4. `logo-icon-180.png`
   Use: Apple touch icon.

5. `logo-icon-32.png` and `logo-icon-16.png`
   Use: Favicons, browser tab icon.

6. `logo-icon-circle.png`
   Use: Plain circle badge (avatar-style placements).

7. `logo-icon-circle-bordered.png`
   Use: Circle badge with blue ring (social profile picture, app store listing icon).

RULES:
  Light backgrounds → colored logo (blue+green)
  Dark/navy backgrounds → white version of logo
  Never stretch, rotate, or recolor
  Minimum sizes: wordmark 120px wide, icon 32px
  Clear space: 16px on all sides always
```

---

## 3. COLOR PALETTE — FROM LOGO

```
The following hex codes are confirmed as the final brand colors matching the actual extracted logo colors:

Primary Blue:    #5B9BD5  (logo icon left half — person/head)
Primary Green:   #4E9B5A  (logo icon right half — life/health)
Brand Navy:      #1B3F6B  (dark blue for admin, QR sticker, headers — note: Brand Navy is a UI-chrome accent only and does not appear in the logo artwork itself)

Color meaning:
  Blue  → Trust, reliability, medical professionalism
  Green → Life, health, growth, nature, healing
  White → Cleanliness, clarity, space to breathe
  Light backgrounds → Warmth, approachability
```

---

## 4. FULL COLOR SYSTEM

```
Built from logo colors:

PRIMARY (Blue family):
  Base:    #5B9BD5    → Buttons, links, CTAs
  Hover:   #4B8BC5    → Button hover
  Active:  #3B7BB5    → Button pressed
  Light:   #F0F7FC    → Blue bg sections, highlights

SUCCESS / HEALTH (Green family):
  Base:    #4E9B5A    → Verified, online, success, health
  Hover:   #3E8B4A
  Active:  #2E7B3A
  Light:   #F0F8F2    → Green bg sections

STATUS COLORS:
  Error:   #DC2626  → Validation errors, rejected, cancelled
  Warning: #F59E0B  → Pending, break status, attention needed
  Info:    #F0F7FC  → Informational (blue light)

NEUTRAL (Light only — NO DARK grays):
  Page BG:      #F8F9FA   → Main page background (off-white, easy on eyes)
  Card BG:      #FFFFFF   → Cards, modals, inputs
  Secondary BG: #F1F5F9   → Subtle sections, table rows
  Border:       #E2E8F0   → Card borders, dividers
  Text Primary: #0F172A   → Main text (very dark navy — not pure black)
  Text Secondary:#475569  → Supporting text
  Text Muted:   #94A3B8   → Timestamps, placeholders

DISABLED:
  Background:   #E5E7EB
  Text:         #9CA3AF
  Border:       #D1D5DB

FOCUS RING:
  Color:        #3B82F6   → Accessibility focus indicator

ADMIN PANEL ONLY:
  Header bg:   #1B3F6B (brand navy gradient)
  → All other admin colors same as above
```

---

## 5. TYPOGRAPHY

```
FONTS (Google Fonts — free):
  Display: Poppins
    → Hero headlines, token number, large CTAs
    → Weights: 600, 700
    → Feel: Friendly, modern, trustworthy

  Body: Inter
    → All body text, labels, inputs, navigation
    → Weights: 400, 500, 600
    → Feel: Clean, readable, professional

  Hindi: Noto Sans Devanagari
    → All Hindi language content
    → Weights: 400, 500, 600, 700
    → Feel: Respectful, clear, legible on small screens

TYPE SCALE (mobile-first):
  Hero:         40-48px  Poppins 700  → "Book Doctor Appointments"
  Page title:   28-36px  Poppins 600  → Section headings
  Card title:   18-20px  Poppins 600  → Doctor name on profile
  Body large:   16px     Inter 400    → Main content
  Body:         14px     Inter 400    → Supporting content
  Small:        12-13px  Inter 400    → Captions, badges
  Token number: 64-72px  Poppins 700  → Token status page hero
```

---

## 6. SPACING & LAYOUT

```
Base unit: 4px grid

Card padding:       16px mobile / 24px desktop
Page padding:       16px mobile / 32px desktop
Component gaps:     8-16px
Section gaps:       32-48px
Header height:      56px mobile / 64px desktop

Border radius:
  Buttons:    12px
  Cards:      16px
  Inputs:     12px
  Badges:     999px (pill)
  Modals:     20px
  Avatars:    50% (circle)
```

---

## 7. REFERENCE SITE ANALYSIS

```
Current site: www.jinnicare.com
Pages:        124
Current avg rating: ~4.0
Target rating:      4.5

What to KEEP from existing site:
  ✅ Overall color palette (blue + green brand)
  ✅ Card-based doctor display
  ✅ Live Queue badge style
  ✅ Verified doctor badge
  ✅ Split login screen concept
  ✅ Professional clean layout
  ✅ Fee display format

What to IMPROVE for 4.0 → 4.5:
  → Mobile responsiveness (current site issues on small screens)
  → Faster loading (skeleton loaders everywhere)
  → Clinic photos visible properly (OYO-style slider)
  → Token tracking page (new feature — clear, minimal)
  → Queue status real-time (30s polling — no stale data)
  → Empty states (current site shows blank — fix this)
  → Search (current: basic filter → new: symptom-aware)
  → Error messages (current: generic → new: helpful, specific)
  → Trust signals (more verification badges, patient count)
  → Hindi language support (current: English only)

Key insight: Bihar/Jharkhand users on mid-range Android phones.
Design must work perfectly on:
  - Chrome Android on 4G
  - Small screens (360px wide minimum)
  - Slow image loading (use blur placeholder)
  - Thumb-friendly tap targets (44px minimum)
```

---

## 8. DOCTOR STATUS VISUAL

```
AVAILABLE:
  Profile photo: Full color, no filter
  Indicator:     Green dot (12px) on avatar
  Feel:          Welcoming, ready

BREAK:
  Profile photo: CSS filter: saturate(0.7) brightness(0.95)
                 Subtle desaturation — warm, not harsh
  Indicator:     Amber dot (12px)
  Feel:          Temporarily away, coming back

BUSY (Queue Full):
  Profile photo: Full color (doctor still working)
  Indicator:     Orange dot (12px)
  Feel:          Active but at capacity

OFFLINE:
  Profile photo: CSS filter: saturate(0.2) brightness(0.92)
                 Noticeably desaturated (like closed restaurant on Zomato)
                 NOT black and white — too cold for healthcare
  Indicator:     Gray dot (12px)
  Feel:          Clinic closed, not abandoned
  Note:          Profile still fully visible — patient can still discover
```

---

## 9. LOGO PLACEMENT RULES

```
PATIENT PAGES:
  Header mobile:    logo-icon-circle.png (32px) — left side
  Header desktop:   logo-horizontal-wordmark.png (140px wide) — left side
  Login page:       logo-horizontal-wordmark.png (160px) — centered above form
  Footer:           logo-horizontal-wordmark.png
  Browser tab:      logo-icon-32.png as favicon

DOCTOR PAGES:
  Header:           logo-horizontal-wordmark.png — left side
  Dashboard:        Same as patient header

ADMIN PAGES:
  Header:           White version of logo-horizontal-wordmark.png (navy gradient background)
  Login:            logo-horizontal-wordmark.png (colored) on white right panel / white logo on navy left panel

PDF EXPORTS:
  Patient data PDF: logo-icon-master-transparent.png — top left (authority feel)
  QR Sticker:       logo-icon-master-transparent.png on navy background

PWA:
  Home screen icon: logo-icon-512.png / logo-icon-192.png
  Splash screen:    logo-icon-512.png centered on white

OG IMAGE (social share):
  logo-horizontal-wordmark.png on light blue background
  Size: 1200x630px

EMAIL:
  Header: logo-horizontal-wordmark.png (200px wide) on white background
```

---

## 10. COMPONENT FEEL — HEALTHCARE SPECIFIC

```
TRUST SIGNALS (show prominently everywhere):
  → "JivniCare Verified" badge on doctor cards
  → "Registration Verified" badge
  → Patient count: "X patients served via JivniCare"
  → "Pay at Clinic" — clear, no hidden charges
  → Secure OTP login badge on login page

LIFE + HEALTH FEEL:
  → Green used generously for positive states
  → Rounded corners (soft, approachable — not sharp/clinical)
  → White space used well (breathing room, not cluttered)
  → Subtle blue tints on informational sections
  → Warm off-white (#F8F9FA) for page backgrounds
    (pure white feels cold — off-white feels human)

BIHAR/JHARKHAND LOCAL FEEL:
  → Hindi text renders perfectly (Noto Sans Devanagari)
  → Simple language in UI — no jargon
  → Large tap targets (patients on mid-range phones)
  → Works on slow 4G (optimized images, skeleton loaders)
  → "Bihar Ka Trusted Healthcare Platform" in footer

ANIMATIONS — SUBTLE ONLY:
  → No flashy animations — healthcare = calm
  → Smooth transitions: 200ms ease (not jarring)
  → Skeleton loaders: soft shimmer (not aggressive flash)
  → Success states: gentle checkmark (not loud celebration)
  → Loading: skeleton preferred over spinner (feels faster)
```

---

## 11. WHAT NOT TO DO — DESIGN

```
❌ Dark mode as default (light only — healthcare trust)
❌ Pure black backgrounds anywhere (patient pages)
❌ Cold clinical white-only design (add warmth with off-white)
❌ Aggressive animations (calm = trust)
❌ Too many colors (blue + green + neutrals only)
❌ Small tap targets (< 44px) — Bihar users on mid-range phones
❌ Text over busy images. No text, labels, watermarks, or badges may be embedded in any uploaded photograph or logo image. All status badges (AVAILABLE/ON_BREAK/OFFLINE), verified checkmarks, fee tags, and emergency-service badges must be rendered as separate HTML/CSS components positioned over or beside the image — never baked into image pixels. This applies to all future doctor profile photos and clinic/hospital photos, not just the logo.
❌ Fonts other than Poppins/Inter/Noto Sans Devanagari
❌ Icons from any library other than Lucide React
❌ Gradients except: brand button, admin header, Early Partner badge
❌ Shadows that are too heavy (subtle card shadows only)
❌ Placeholder text as labels (always use proper labels)
❌ Color alone to convey meaning (always add text/icon too)
```

---

## 12. IMPROVEMENT TARGETS vs REFERENCE SITE

```
Reference: www.jinnicare.com (4.0 rating)
Target:    JivniCare V1 (4.5 rating)

Specific improvements:

Mobile first:
  Reference: Desktop designed, mobile adapted
  JivniCare: Mobile designed, desktop enhanced
  → Every pixel tested on 360px Android Chrome

Trust:
  Reference: Basic verified badge
  JivniCare: Multiple trust signals per page
             (Verified + Reg. Verified + patient count + secure OTP)

Speed feel:
  Reference: Loading spinners / blank states
  JivniCare: Skeleton loaders everywhere
             Blur placeholder on images
             Instant UI feedback

Queue clarity:
  Reference: Basic queue number
  JivniCare: Railway-style visualization
             "X patients ahead" clear language
             Live updating every 30s

Search:
  Reference: Filter-based only
  JivniCare: Symptom-aware (type "bukhar" → General Physician)
             Hindi + English both work

Empty states:
  Reference: Blank or basic text
  JivniCare: Helpful illustration + clear message + action button

Doctor profile:
  Reference: Information below fold
  JivniCare: All critical info above fold on mobile
             10 elements visible without scroll
```

---

Document complete. Design is requirement-based.
Logo files will be uploaded at development time.
Exact hex codes to be extracted from logo at that point.
Last updated: June 2026 | JivniCare V1.0.0

