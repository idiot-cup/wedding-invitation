# Wedding Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first static wedding invitation page for 张世鑫 and 周慧萍 with core information visible first, selected polished photos, and deployable static assets.

**Architecture:** The page is a static site at the repository root. `index.html` owns semantic content, `styles.css` owns the red-gold visual system and responsive layout, `script.js` owns small progressive enhancements, and `assets/images/` contains optimized image derivatives generated from the source photos without overwriting originals.

**Tech Stack:** HTML, CSS, vanilla JavaScript, PowerShell/.NET image processing, Node.js static validation script.

---

### Task 1: Static Validation Harness

**Files:**
- Create: `tests/validate-site.js`

- [ ] **Step 1: Write the failing validation script**

Create `tests/validate-site.js` with this content:

```javascript
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const cssPath = path.join(root, 'styles.css');
const scriptPath = path.join(root, 'script.js');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${path.relative(root, filePath)}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

const html = read(indexPath);
const css = read(cssPath);
read(scriptPath);

const requiredText = [
  '婚礼邀请函',
  '张世鑫',
  '周慧萍',
  '公历 2026 年 7 月 5 日',
  '农历 2026 年 5 月 21 日',
  '张文祥家电制冷维修中心',
  '父母 张家祝 王艳 敬邀'
];

for (const text of requiredText) {
  if (!html.includes(text)) fail(`index.html missing required text: ${text}`);
}

const imageRefs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:jpg|jpeg|png|webp))"/gi)].map((match) => match[1]);
if (imageRefs.length < 6) fail(`Expected at least 6 image references, found ${imageRefs.length}`);

for (const ref of imageRefs) {
  const cleanRef = ref.split('#')[0].split('?')[0];
  const assetPath = path.join(root, cleanRef);
  if (!fs.existsSync(assetPath)) fail(`Missing referenced asset: ${cleanRef}`);
}

if (!html.includes('name="viewport"')) fail('Missing mobile viewport meta tag');
if (!html.includes('loading="lazy"')) fail('Expected lazy loading for non-hero images');
if (!css.includes('@media')) fail('Expected responsive CSS media query');
if (!css.includes('prefers-reduced-motion')) fail('Expected reduced motion handling');

if (process.exitCode) process.exit(process.exitCode);
console.log('Static site validation passed');
```

- [ ] **Step 2: Run validation and verify it fails**

Run:

```powershell
node tests\validate-site.js
```

Expected: fails because `index.html`, `styles.css`, and `script.js` do not exist yet.

- [ ] **Step 3: Commit validation harness**

Run:

```powershell
git -c safe.directory='D:/DCIM/婚礼请帖制作' add tests/validate-site.js
git -c safe.directory='D:/DCIM/婚礼请帖制作' commit -m "test: add static invite validation"
```

Expected: commit succeeds if git identity is configured.

### Task 2: Optimized Image Assets

**Files:**
- Create: `assets/images/hero-red.jpg`
- Create: `assets/images/formal-red.jpg`
- Create: `assets/images/white-studio.jpg`
- Create: `assets/images/portrait-close.jpg`
- Create: `assets/images/garden-couple.jpg`
- Create: `assets/images/veil-garden.jpg`
- Create: `assets/images/map-location.jpg`
- Create: `assets/images/reference-invite.jpg`

- [ ] **Step 1: Generate optimized JPG assets**

Run this PowerShell command:

```powershell
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path 'assets\images' | Out-Null

function Save-Jpeg($source, $dest, $maxWidth, $quality) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $source))
  try {
    $scale = [Math]::Min(1, $maxWidth / $img.Width)
    $width = [Math]::Round($img.Width * $scale)
    $height = [Math]::Round($img.Height * $scale)
    $bmp = [System.Drawing.Bitmap]::new($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $params = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $params.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
    $bmp.Save((Join-Path (Get-Location) $dest), $encoder, $params)
    $g.Dispose()
    $bmp.Dispose()
    $params.Dispose()
  } finally {
    $img.Dispose()
  }
}

Save-Jpeg '微信图片_20260614130014_126_59.jpg' 'assets\images\hero-red.jpg' 1600 86
Save-Jpeg '微信图片_20260614130010_124_59.jpg' 'assets\images\formal-red.jpg' 1400 84
Save-Jpeg '微信图片_20260614130000_119_59.jpg' 'assets\images\white-studio.jpg' 1400 84
Save-Jpeg '微信图片_20260614130042_132_59.jpg' 'assets\images\portrait-close.jpg' 1200 84
Save-Jpeg '微信图片_20260614130035_130_59.jpg' 'assets\images\garden-couple.jpg' 1400 84
Save-Jpeg '微信图片_20260614130054_138_59.jpg' 'assets\images\veil-garden.jpg' 1400 84
Save-Jpeg '地点.jpg' 'assets\images\map-location.jpg' 1200 88
Save-Jpeg '张世鑫-周慧萍-婚礼邀请函_第一版-20260614.png' 'assets\images\reference-invite.jpg' 1000 84
```

Expected: eight optimized image files exist under `assets/images/`.

- [ ] **Step 2: Inspect generated asset sizes**

Run:

```powershell
Get-ChildItem assets\images | Select-Object Name,Length
```

Expected: files are materially smaller than original full-resolution photos.

- [ ] **Step 3: Commit optimized assets**

Run:

```powershell
git -c safe.directory='D:/DCIM/婚礼请帖制作' add assets/images
git -c safe.directory='D:/DCIM/婚礼请帖制作' commit -m "chore: add optimized wedding images"
```

Expected: commit succeeds if git identity is configured.

### Task 3: HTML Content Structure

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create semantic page content**

Create `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="description" content="张世鑫与周慧萍婚礼邀请函，公历 2026 年 7 月 5 日，诚邀您携家人光临。" />
    <title>张世鑫 & 周慧萍 婚礼邀请函</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="invite-shell">
      <section class="hero" aria-labelledby="invite-title">
        <img class="hero__image" src="assets/images/hero-red.jpg" alt="张世鑫与周慧萍婚纱照" width="1067" height="1600" />
        <div class="hero__shade" aria-hidden="true"></div>
        <div class="hero__content reveal">
          <p class="eyebrow">吾家有喜 爱子结婚</p>
          <h1 id="invite-title">婚礼邀请函</h1>
          <p class="names">张世鑫 <span>&</span> 周慧萍</p>
          <div class="date-card" aria-label="婚礼日期">
            <p>公历 2026 年 7 月 5 日</p>
            <p>农历 2026 年 5 月 21 日</p>
          </div>
          <p class="scroll-cue">诚邀您携家人光临</p>
        </div>
      </section>

      <section class="section invitation reveal" aria-labelledby="invitation-heading">
        <p class="section-kicker">Wedding Invitation</p>
        <h2 id="invitation-heading">良辰已定 吉日待访</h2>
        <p class="invitation__copy">
          谨定于公历 2026 年 7 月 5 日，为爱子张世鑫先生与周慧萍女士举行结婚庆典。
        </p>
        <p class="invitation__copy">
          敬备喜宴，诚邀您携家人光临，共赴这份团圆与喜悦。
        </p>
        <div class="info-grid" aria-label="婚礼信息">
          <div>
            <span>新人</span>
            <strong>张世鑫 & 周慧萍</strong>
          </div>
          <div>
            <span>时间</span>
            <strong>2026 年 7 月 5 日</strong>
          </div>
          <div>
            <span>地点</span>
            <strong>张文祥家电制冷维修中心</strong>
          </div>
        </div>
      </section>

      <section class="section gallery reveal" aria-labelledby="gallery-heading">
        <p class="section-kicker">Selected Photos</p>
        <h2 id="gallery-heading">与君同喜</h2>
        <div class="gallery__lead">
          <img src="assets/images/formal-red.jpg" alt="红底正式婚纱合照" width="933" height="1400" loading="lazy" />
        </div>
        <div class="photo-pair">
          <img src="assets/images/white-studio.jpg" alt="白底棚拍新人合照" width="933" height="1400" loading="lazy" />
          <img src="assets/images/portrait-close.jpg" alt="新娘手捧鲜花肖像" width="933" height="1400" loading="lazy" />
        </div>
        <figure class="wide-photo">
          <img src="assets/images/veil-garden.jpg" alt="户外头纱婚纱照" width="933" height="1400" loading="lazy" />
          <figcaption>喜今日赤绳系定，珠联璧合。</figcaption>
        </figure>
        <div class="gallery__lead gallery__lead--quiet">
          <img src="assets/images/garden-couple.jpg" alt="户外绿植新人合照" width="933" height="1400" loading="lazy" />
        </div>
      </section>

      <section class="section location reveal" aria-labelledby="location-heading">
        <p class="section-kicker">Wedding Location</p>
        <h2 id="location-heading">喜宴地点</h2>
        <p class="location__name">张文祥家电制冷维修中心</p>
        <img class="location__map" src="assets/images/map-location.jpg" alt="张文祥家电制冷维修中心地图截图" width="1128" height="955" loading="lazy" />
      </section>

      <section class="finale reveal" aria-labelledby="finale-heading">
        <p class="section-kicker">With Sincere Invitation</p>
        <h2 id="finale-heading">敬候光临</h2>
        <p>愿与您共贺良辰，同沾喜气。</p>
        <p class="parents">父母 张家祝 王艳 敬邀</p>
      </section>
    </main>
    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Run validation and verify expected CSS failure remains**

Run:

```powershell
node tests\validate-site.js
```

Expected: fails because `styles.css` and `script.js` are still missing.

### Task 4: Visual Styling

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Create responsive red-gold styling**

Create `styles.css` implementing:

```css
:root {
  --red-900: #3d0505;
  --red-800: #640b0b;
  --red-700: #8f1712;
  --gold-500: #d7a84f;
  --gold-300: #f1d68d;
  --ivory: #fff8e8;
  --paper: #f8efe0;
  --ink: #2e1711;
  --green-900: #10241c;
  --shadow: 0 22px 70px rgba(48, 5, 5, 0.32);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--red-900);
  color: var(--ivory);
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(241, 214, 141, 0.16), transparent 32rem),
    linear-gradient(180deg, var(--red-900), #1c0303 72%);
}

img {
  display: block;
  max-width: 100%;
}

.invite-shell {
  width: min(100%, 520px);
  margin: 0 auto;
  overflow: hidden;
  background: var(--red-800);
  box-shadow: var(--shadow);
}

.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-items: end;
  padding: max(24px, env(safe-area-inset-top)) 18px 32px;
  isolation: isolate;
  border: 10px solid transparent;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  inset: 14px;
  border: 1px solid rgba(241, 214, 141, 0.72);
  pointer-events: none;
  z-index: 2;
}

.hero::after {
  inset: 22px;
  border-color: rgba(215, 168, 79, 0.38);
}

.hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  z-index: -2;
}

.hero__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(43, 2, 2, 0.02) 30%, rgba(48, 4, 4, 0.84) 72%, rgba(40, 3, 3, 0.98)),
    radial-gradient(circle at 50% 64%, transparent 0, rgba(66, 5, 5, 0.42) 58%, rgba(36, 2, 2, 0.82) 100%);
  z-index: -1;
}

.hero__content {
  position: relative;
  z-index: 3;
  text-align: center;
  padding: 180px 10px 0;
  text-shadow: 0 2px 18px rgba(31, 0, 0, 0.7);
}

.eyebrow,
.section-kicker {
  margin: 0 0 10px;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-300);
}

h1,
h2 {
  margin: 0;
  font-family: "STKaiti", "KaiTi", "SimSun", serif;
  font-weight: 700;
  letter-spacing: 0;
}

h1 {
  font-size: clamp(3.4rem, 18vw, 5.8rem);
  line-height: 0.98;
  color: var(--gold-300);
  text-shadow: 0 2px 0 #7a3f13, 0 12px 28px rgba(0, 0, 0, 0.42);
}

.names {
  margin: 18px 0 14px;
  font-size: clamp(1.45rem, 7vw, 2.1rem);
  font-family: "SimSun", "STSong", serif;
  color: #fff3ce;
}

.names span {
  display: inline-block;
  margin: 0 0.2em;
  color: var(--gold-500);
}

.date-card {
  display: inline-grid;
  gap: 4px;
  min-width: min(100%, 300px);
  padding: 12px 18px;
  border-block: 1px solid rgba(241, 214, 141, 0.62);
  color: #fff8dd;
  font-size: 1rem;
}

.date-card p,
.scroll-cue,
.invitation__copy,
.location p,
.finale p {
  margin: 0;
}

.scroll-cue {
  margin-top: 16px;
  color: rgba(255, 248, 232, 0.86);
  font-size: 0.95rem;
}

.section {
  padding: 56px 22px;
}

.invitation,
.location {
  color: var(--ink);
  background:
    linear-gradient(180deg, rgba(255, 248, 232, 0.98), rgba(248, 239, 224, 0.96)),
    var(--paper);
}

.section h2,
.finale h2 {
  font-size: clamp(2rem, 10vw, 3.2rem);
  line-height: 1.1;
  color: var(--red-700);
}

.invitation__copy {
  margin-top: 18px;
  font-size: 1.05rem;
  line-height: 2;
}

.info-grid {
  display: grid;
  gap: 10px;
  margin-top: 28px;
}

.info-grid div {
  padding: 14px 16px;
  border: 1px solid rgba(143, 23, 18, 0.18);
  background: rgba(255, 255, 255, 0.44);
}

.info-grid span {
  display: block;
  margin-bottom: 5px;
  color: rgba(46, 23, 17, 0.62);
  font-size: 0.82rem;
}

.info-grid strong {
  font-size: 1.05rem;
  font-weight: 600;
}

.gallery {
  background:
    linear-gradient(180deg, var(--red-800), #240404 58%, var(--green-900));
}

.gallery h2 {
  color: var(--gold-300);
}

.gallery__lead,
.wide-photo,
.photo-pair img {
  overflow: hidden;
  border: 1px solid rgba(241, 214, 141, 0.44);
  background: rgba(255, 248, 232, 0.06);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
}

.gallery__lead {
  margin-top: 24px;
}

.gallery__lead img,
.photo-pair img,
.wide-photo img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.photo-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.wide-photo {
  margin: 10px 0 0;
}

.wide-photo figcaption {
  padding: 13px 16px 15px;
  color: var(--gold-300);
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 1.2rem;
  text-align: center;
}

.gallery__lead--quiet {
  margin-top: 10px;
}

.location__name {
  margin-top: 16px;
  color: var(--red-700);
  font-size: 1.22rem;
  font-weight: 700;
}

.location__map {
  width: 100%;
  margin-top: 20px;
  border: 1px solid rgba(143, 23, 18, 0.2);
  box-shadow: 0 18px 46px rgba(70, 28, 12, 0.18);
}

.finale {
  padding: 60px 22px 72px;
  text-align: center;
  background:
    radial-gradient(circle at center top, rgba(241, 214, 141, 0.18), transparent 24rem),
    var(--red-900);
}

.finale h2 {
  color: var(--gold-300);
}

.finale p {
  margin-top: 18px;
  line-height: 1.9;
  color: rgba(255, 248, 232, 0.88);
}

.parents {
  display: inline-block;
  margin-top: 26px;
  padding: 12px 20px;
  border-block: 1px solid rgba(241, 214, 141, 0.56);
  color: var(--gold-300) !important;
  font-family: "SimSun", "STSong", serif;
  font-size: 1.16rem;
}

.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 720ms ease, transform 720ms ease;
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (min-width: 700px) {
  body {
    padding: 28px 0;
  }

  .invite-shell {
    border-radius: 6px;
  }
}

@media (max-width: 380px) {
  .section {
    padding-inline: 18px;
  }

  .hero__content {
    padding-top: 150px;
  }

  .photo-pair {
    gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Run validation and verify script failure remains**

Run:

```powershell
node tests\validate-site.js
```

Expected: fails because `script.js` is still missing.

### Task 5: Progressive Enhancement Script

**Files:**
- Create: `script.js`

- [ ] **Step 1: Create reveal behavior**

Create `script.js` with:

```javascript
const revealItems = document.querySelectorAll('.reveal');

if (!('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
```

- [ ] **Step 2: Run static validation and verify pass**

Run:

```powershell
node tests\validate-site.js
```

Expected: `Static site validation passed`.

### Task 6: Local Preview and Visual QA

**Files:**
- Inspect: `index.html`
- Inspect: `styles.css`

- [ ] **Step 1: Start a static server**

Run:

```powershell
python -m http.server 8080
```

Expected: server starts at `http://localhost:8080`.

- [ ] **Step 2: Capture mobile and desktop screenshots**

Use the available browser tooling or local preview to inspect:

```text
Mobile viewport: 390 x 844
Desktop viewport: 900 x 1200
URL: http://localhost:8080
```

Expected:
- hero shows the couple without covering faces with text
- first viewport includes invitation title, names, and date
- no text overflows on mobile
- map section shows the corrected location name
- finale shows parent invitation line

- [ ] **Step 3: Adjust spacing if visual QA finds issues**

If the hero text covers faces, modify `.hero__content` padding or `.hero__shade`. If gallery crops an important face, modify the related `object-position` rule or swap to a better source image.

### Task 7: Final Verification and Commit

**Files:**
- Modify as needed: `index.html`
- Modify as needed: `styles.css`
- Modify as needed: `script.js`
- Modify as needed: `assets/images/*`
- Modify as needed: `docs/superpowers/specs/2026-06-14-wedding-invitation-design.md`
- Modify as needed: `docs/superpowers/plans/2026-06-14-wedding-invitation.md`

- [ ] **Step 1: Run final validation**

Run:

```powershell
node tests\validate-site.js
```

Expected: `Static site validation passed`.

- [ ] **Step 2: Check git status**

Run:

```powershell
git -c safe.directory='D:/DCIM/婚礼请帖制作' status --short
```

Expected: only intentional new project files and source assets are listed.

- [ ] **Step 3: Commit final site**

Run:

```powershell
git -c safe.directory='D:/DCIM/婚礼请帖制作' add index.html styles.css script.js assets docs tests
git -c safe.directory='D:/DCIM/婚礼请帖制作' commit -m "feat: build mobile wedding invitation"
```

Expected: commit succeeds if git identity is configured.

## Plan Self-Review

- Spec coverage: covered core information first, selected photos, map/location, parent invitation line, mobile-first responsiveness, and static deployability.
- Placeholder scan: no placeholder requirements remain in this plan.
- Type and file consistency: file names and asset references are consistent across validation, generation, HTML, CSS, and final verification.
