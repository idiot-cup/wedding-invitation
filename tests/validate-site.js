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

if (process.exitCode) process.exit(process.exitCode);
console.log('Static site validation passed');
