const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'packs', 'ligue1-free');
const W = 812;
const H = 1414;

fs.mkdirSync(OUT, { recursive: true });

function svg(content) {
  return Buffer.from(`
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="38" stdDeviation="30" flood-color="#06101d" flood-opacity=".36"/>
      </filter>
      <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <linearGradient id="body" x1="116" y1="120" x2="730" y2="1300" gradientUnits="userSpaceOnUse">
        <stop stop-color="#07131f"/>
        <stop offset=".42" stop-color="#0e3337"/>
        <stop offset=".72" stop-color="#101a2b"/>
        <stop offset="1" stop-color="#1b132b"/>
      </linearGradient>
      <linearGradient id="rim" x1="120" y1="96" x2="760" y2="1318" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6af4e4"/>
        <stop offset=".45" stop-color="#243c50"/>
        <stop offset="1" stop-color="#f0c96b"/>
      </linearGradient>
      <linearGradient id="topFoil" x1="120" y1="115" x2="710" y2="280" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffffff" stop-opacity=".18"/>
        <stop offset=".5" stop-color="#dffdf7" stop-opacity=".08"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity=".14"/>
      </linearGradient>
      <linearGradient id="badge" x1="160" y1="1100" x2="652" y2="1100" gradientUnits="userSpaceOnUse">
        <stop stop-color="#31dec8"/>
        <stop offset="1" stop-color="#4b8fff"/>
      </linearGradient>
      <linearGradient id="crease" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#ffffff" stop-opacity=".12"/>
        <stop offset=".5" stop-color="#ffffff" stop-opacity=".025"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity=".08"/>
      </linearGradient>
      <clipPath id="packClip">
        <rect x="76" y="64" width="660" height="1286" rx="62"/>
      </clipPath>
    </defs>
    ${content}
  </svg>`);
}

async function render(name, content) {
  await sharp(svg(content)).png().toFile(path.join(OUT, `${name}.png`));
}

(async () => {
  await render('shadow', `
    <rect x="84" y="84" width="644" height="1260" rx="66" fill="#06101d" opacity=".34" filter="url(#softShadow)"/>
  `);

  await render('base', `
    <rect x="76" y="64" width="660" height="1286" rx="62" fill="url(#body)" stroke="#08111f" stroke-width="18"/>
    <rect x="96" y="84" width="620" height="1246" rx="48" stroke="url(#rim)" stroke-width="4" opacity=".42"/>
    <g clip-path="url(#packClip)">
      <rect x="112" y="116" width="588" height="156" rx="34" fill="url(#topFoil)"/>
      <path d="M-70 360 C120 262 258 242 406 288 C566 338 692 284 902 202" stroke="#1ddcca" stroke-width="10" opacity=".08"/>
      <path d="M-70 1016 C142 1190 378 1190 644 962 C728 890 804 828 922 800" stroke="#f1c867" stroke-width="10" opacity=".08"/>
      <path d="M306 -40 L514 -40 L248 1468 L78 1468 Z" fill="url(#crease)" opacity=".72"/>
      <path d="M566 -40 L668 -40 L406 1468 L318 1468 Z" fill="#ffffff" opacity=".035"/>
      <circle cx="406" cy="642" r="184" stroke="#ffffff" stroke-opacity=".16" stroke-width="5"/>
      <circle cx="406" cy="642" r="96" fill="#ffffff" fill-opacity=".045" stroke="#ffffff" stroke-opacity=".12" stroke-width="3"/>
    </g>
  `);

  await render('energy', `
    <g filter="url(#innerGlow)">
      <path d="M126 444 C254 330 472 298 686 514" stroke="#31dec8" stroke-width="14" stroke-linecap="round"/>
      <path d="M116 916 C270 1070 482 1074 690 808" stroke="#e4bc66" stroke-width="13" stroke-linecap="round"/>
      <path d="M174 392 C310 280 470 294 632 408" stroke="#9cf8ee" stroke-width="3" stroke-linecap="round" opacity=".75"/>
      <path d="M162 964 C292 1082 486 1104 642 900" stroke="#fff1a8" stroke-width="3" stroke-linecap="round" opacity=".65"/>
    </g>
  `);

  await render('shine', `
    <g clip-path="url(#packClip)">
      <path d="M132 -80 L236 -80 L-10 1494 L-110 1494 Z" fill="#ffffff" opacity=".13"/>
      <path d="M566 -80 L668 -80 L420 1494 L318 1494 Z" fill="#ffffff" opacity=".10"/>
      <path d="M96 156 C276 96 506 104 716 176 L716 306 C470 238 284 246 96 304 Z" fill="#ffffff" opacity=".045"/>
    </g>
  `);

  await render('foil', `
    <g clip-path="url(#packClip)" opacity=".46">
      <circle cx="148" cy="220" r="18" fill="#31dec8" opacity=".16"/>
      <circle cx="248" cy="286" r="14" fill="#e4bc66" opacity=".14"/>
      <circle cx="624" cy="256" r="16" fill="#8fb4ff" opacity=".16"/>
      <circle cx="682" cy="628" r="12" fill="#31dec8" opacity=".12"/>
      <circle cx="164" cy="782" r="14" fill="#8fb4ff" opacity=".12"/>
      <circle cx="602" cy="1044" r="18" fill="#e4bc66" opacity=".13"/>
      <circle cx="240" cy="1168" r="12" fill="#31dec8" opacity=".12"/>
    </g>
  `);
})();
