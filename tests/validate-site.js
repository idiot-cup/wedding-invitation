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

const imageRefs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:jpg|jpeg|png|webp))"/gi)].map(
  (match) => match[1]
);
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

const locationSection = html.match(/<section class="section location[\s\S]*?<\/section>/);
if (!locationSection) {
  fail('Missing location section');
} else {
  if (!locationSection[0].includes('父母 张家祝 王艳 敬邀')) {
    fail('Expected parent invitation line inside the location section');
  }
}

const locationMapRule = css.match(/\.location__map\s*\{[\s\S]*?\}/);
if (!locationMapRule) {
  fail('Missing .location__map CSS rule');
} else {
  if (!/height:\s*auto\s*;/.test(locationMapRule[0])) {
    fail('Expected .location__map to preserve image ratio with height: auto');
  }
  if (!/aspect-ratio:\s*1128\s*\/\s*955\s*;/.test(locationMapRule[0])) {
    fail('Expected .location__map to declare the source image aspect ratio');
  }
}

const heroSection = html.match(/<section class="hero"[\s\S]*?<\/section>/);
const requiredHeroText = [
  '吾家有喜 爱子结婚',
  '良辰已定 吉日待访',
  '举行婚礼庆典',
  '敬备喜宴 诚邀您携家人光临'
];
if (!heroSection) {
  fail('Missing hero section');
} else {
  for (const text of requiredHeroText) {
    if (!heroSection[0].includes(text)) {
      fail(`Expected hero section to include: ${text}`);
    }
  }
  const heroMessage = heroSection[0].match(/<div class="hero-message"[\s\S]*?<\/div>/);
  if (!heroMessage) {
    fail('Missing compact hero message block');
  } else if (heroMessage[0].includes('谨定于公历2026年7月5日 农历2026年5月21日')) {
    fail('Hero message should not duplicate the original date card');
  }
}

const heroIndex = html.indexOf('<section class="hero"');
const locationIndex = html.indexOf('<section class="section location');
const invitationIndex = html.indexOf('<section class="section invitation');
const galleryIndex = html.indexOf('<section class="section gallery');
if (!(heroIndex !== -1 && locationIndex !== -1 && invitationIndex !== -1 && galleryIndex !== -1)) {
  fail('Expected hero, location, invitation, and gallery sections');
} else {
  if (!(heroIndex < locationIndex && locationIndex < invitationIndex && invitationIndex < galleryIndex)) {
    fail('Expected section order: hero, location, invitation, gallery');
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Static site validation passed');
