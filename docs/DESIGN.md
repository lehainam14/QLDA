---
name: Student Work Ecosystem
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
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  metric-wage:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '800'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

### Brand Personality & Philosophy
This design system powers a student-first job discovery platform tailored to Vietnamese university students seeking flexible, verified, and safe part-time, seasonal, or entry-level roles. The brand voice balances youthful vibrancy with steadfast institutional credibility. It addresses core student anxieties—scams, delayed wages, and rigid scheduling—by projecting safety, transparency, and accessible opportunity.

### Visual Aesthetic & Movement
The design language adopts a modern **Tactile Corporate** aesthetic infused with dynamic energy:
- **Clean Structural Modernism:** High legibility, crisp structural card layouts, and purposeful whitespace designed for rapid scanning on compact mobile displays.
- **Micro-tactile Feedback:** Subtle physical depth through soft surface tiers, feather-light strokes, and warm ambient elevation that feels friendly and dependable rather than cold or enterprise-heavy.
- **Safety & Clarity First:** Prominent safety indicators, labor transparency tags (e.g., wage per hour, shift flexibility, proximity), and high-contrast status feedback.

## Colors

### Color Strategy & System Tokens
The palette establishes trust and high energy while safeguarding critical transactional states across Vietnam's student job market:

- **Primary Teal (`#0D9488`):** The cornerstone of trust, growth, and legitimacy. Used for primary actions, verified badges, key navigation triggers, and legitimate company certifications.
- **Secondary Electric Blue (`#2563EB`):** Amplifies technical agility and clarity. Used for student application flows, job status counters ("Đã nộp"), active shift timers, and filters.
- **Tertiary Amber (`#F59E0B`):** Sparks motivation and calls attention. Reserved for high-value highlights, fast-action opportunities ("Cần gấp"), rating stars, and cautionary status tags ("Chờ duyệt").
- **Neutral Slate (`#64748B`):** Provides a cool, modern neutral base ranging from stark pure white canvases to deep slate text `#0F172A`, avoiding pure black to preserve organic balance.

### Semantic Status Matrix
- **Success / Verified (`#10B981`):** Applied to "Phù hợp", "Hồ sơ đã duyệt", and "Nhà tuyển dụng xác thực".
- **Pending / In Review (`#F59E0B`):** Applied to "Đang xét duyệt", "Nhà tuyển dụng đã xem hồ sơ", and shifts pending confirmation.
- **Applied / Processing (`#2563EB`):** Used for "Đã ứng tuyển", "Đang xếp lịch phỏng vấn".
- **Alert / Danger (`#EF4444`):** Flags high-risk jobs ("Cảnh báo lừa đảo", "Thu phí cọc bất thường") and application declines.

## Typography

### Architectural Rationale
**Plus Jakarta Sans** is employed across all typographic roles. Its clean neo-grotesque foundation provides high legibility on lower-dpi mobile screens, while its rounded terminals and open apertures offer an encouraging, youthful personality without sacrificing organizational rigor.

### Key Typographic Rules
- **Vietnamese Diacritic Support:** Generous line heights (1.3x to 1.5x) prevent stacked tone marks and horn accents (`ơ`, `ư`, `ẽ`, `ặ`) from overlapping adjacent lines.
- **Numbers & Metrics:** Monetary tokens (`metric-wage`) use an extra-bold weight to ensure that hourly rates (e.g., `28.000đ - 35.000đ/giờ`) stand out distinctly on compact listing cards.
- **Status & Meta Chips:** Labels are confined to `label-md` and `label-sm` with tight tracking and medium-to-bold weights to guarantee instant visual decoding during rapid scrolling.

## Layout & Spacing

### Mobile Grid & Spatial Rhythm
The core layout is designed for an 8pt-based fluid mobile grid running between 360px and 428px viewports:
- **Canvas Margins:** Set to `1rem` (16px) on mobile viewports to maximize usable screen real estate, expanding to `1.5rem` (24px) on tablet viewports.
- **Gutters:** Standard horizontal gutter between multi-column items (e.g., two-column job cards or metric chips) is `1rem` (16px), with a condensed `0.75rem` (12px) variant for segmented control filters.
- **Vertical Rhythm:** Components stack using `space-md` (12px) for related elements and `space-xl` (24px) for distinct structural sections (e.g., "Việc làm gần trường bạn" vs "Việc làm ca linh hoạt").

### Breakpoints & Adaptability
- **Compact Mobile (< 390px):** Single-column vertical stream, bottom sheet modals, horizontal overflow chips for tag filtering.
- **Standard Mobile (390px - 480px):** Single-column job cards with multi-line metadata grids (Wage, Distance, Shift tag).
- **Tablet / Large Handheld (481px - 768px):** Dual-column job list cards with persistent side filtering.

## Elevation & Depth

### Ambient Surface Architecture
The visual depth system uses soft, colored ambient shadows paired with low-contrast borders instead of heavy, muddy dropshadows. This keeps the mobile interface light, friendly, and clean.

- **Level 0 (Base Canvas):** `#F8FAFC` (Slate 50). A low-glare surface that makes pure white cards pop naturally.
- **Level 1 (Card & List Item Rest):** Pure `#FFFFFF` surface accompanied by a structural border of `1px solid #E2E8F0` and an ambient shadow: `0px 2px 8px -2px rgba(13, 148, 136, 0.04), 0px 4px 12px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Active Touch / Card Press):** Elevation drops slightly on mobile touch down, scaling to `0.985`, with border accent shifting to `#0D9488` at 30% opacity.
- **Level 3 (Floating Bars / Sticky Actions):** Applied to the fixed bottom action sheet ("Ứng tuyển ngay") and bottom navigation: `0px -4px 20px rgba(15, 23, 42, 0.08)` surrounded by a top border of `1px solid rgba(226, 232, 240, 0.8)` with a `backdrop-blur(12px)` glass layer.
- **Level 4 (Modals & Verification Drawers):** High-diffusion shadow `0px 20px 40px -8px rgba(15, 23, 42, 0.2)` with a tinted scrim overlay (`rgba(15, 23, 42, 0.4)`).

## Shapes

### Rounded Geometry Hierarchy
A standard roundedness level of `2` provides smooth curves that make the product feel friendly, accessible, and tactile for students:
- **Base Components (`rounded-md` - 8px):** Input text fields, system badges, nested operational tags (shift tokens, distance chips).
- **Primary Touch Points (`rounded-xl` - 16px):** Primary/secondary action buttons, status banners, quick-filter chips.
- **Structural Containers (`rounded-2xl` - 24px):** Job listing cards, company profile headers, bottom sheets, safety warning banners.
- **Full Pill (`rounded-full`):** Avatar containers, student verification pill indicators, numeric badge counters, and floating emergency alert triggers ("Báo cáo tin cậy").

## Components

### 1. Job Cards (Thẻ tin tuyển dụng)
- **Container:** Pure `#FFFFFF` background, `rounded-2xl` corners, `1px solid #F1F5F9`, with Level 1 ambient elevation. Inner padding is `1rem` (16px).
- **Header Row:** Top row houses the employer logo (44x44px `rounded-xl`), company name in `label-md` (`#64748B`), verified badge icon (teal shield check), and bookmark button.
- **Job Title:** Displayed in `headline-md` (`#0F172A`), maximum 2 lines with ellipsis.
- **Meta Indicator Grid:** 3 micro-chips styled as soft-tinted surfaces:
  - *Wage Chip:* Extra-bold text (`#0D9488`), surface tint (`rgba(13, 148, 136, 0.08)`), icon currency tag (e.g., `30.000đ/giờ`).
  - *Shift Tag:* Medium text (`#2563EB`), surface tint (`rgba(37, 99, 235, 0.08)`), icon calendar tag (e.g., `Ca gãy`, `Xoay ca`, `Part-time`).
  - *Distance Chip:* Medium text (`#64748B`), icon pin tag (e.g., `1.2 km từ ĐH Bách Khoa`).
- **Footer Row:** Posted time ago (`body-sm`, `#94A3B8`) paired with an instant "Ứng tuyển nhanh" or "Chi tiết" trigger.

### 2. Status Badges & Flags (Nhãn trạng thái)
Badges feature an internal padding of `4px 10px`, `rounded-full` contours, and `label-sm` typography:
- **Approved / Fit (Phù hợp / Đã duyệt):** Forest Green (`text-[#059669]`, `bg-[#ECFDF5]`, `border: 1px solid #A7F3D0`).
- **In Review / Viewed (Chờ duyệt / Đã xem):** Deep Amber (`text-[#D97706]`, `bg-[#FFFBEB]`, `border: 1px solid #FDE68A`).
- **Applied (Đã nộp):** Vibrant Blue (`text-[#1D4ED8]`, `bg-[#EFF6FF]`, `border: 1px solid #BFDBFE`).
- **Scam Alert / Declined (Cảnh báo / Từ chối):** Crimson Red (`text-[#DC2626]`, `bg-[#FEF2F2]`, `border: 1px solid #FECACA`).

### 3. Buttons & Action Elements
- **Primary CTA:** Solid Teal (`#0D9488`), text pure white, height 48px, `rounded-xl`, `label-lg`. Pressed state translates down with a deepened shade (`#0F766E`).
- **Secondary CTA:** Tinted Blue (`bg-[#EFF6FF]`, `text-[#2563EB]`), 48px height, `rounded-xl`, `label-lg`.
- **Urgent / Hot Highlight Button:** Amber tone (`#F59E0B`), white bold text, reserved for "Cần người gấp trong ngày".
- **Filter Chips:** 36px height, `rounded-xl`. Unselected: `#F8FAFC` background, `1px solid #E2E8F0`, `text-[#475569]`. Selected: `#0D9488` background, `text-white`, `border: none`.

### 4. Input Fields & Search Bars
- **Main Search Input:** 52px height, `rounded-2xl`, background `#FFFFFF`, border `1.5px solid #E2E8F0`. Focus state shifts border to `#0D9488` with a subtle focus ring (`0 0 0 4px rgba(13, 148, 136, 0.15)`).
- **Trailing Filters:** Embedded quick-filter toggle button inside the search field for instant location radius adjustment (1km - 5km - 10km).

### 5. Safety Banner (Thanh thông báo an toàn sinh viên)
- A persistent or contextual alert component highlighting student labor rights: `bg-[#FFFBEB]`, `border: 1px solid #FCD34D`, `rounded-xl`, padding `12px 16px`. Uses an amber shield icon with bold micro-copy: "Không đóng bất kỳ khoản phí đặt cọc nào khi nhận việc."