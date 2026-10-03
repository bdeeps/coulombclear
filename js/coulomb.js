// Shared parts for CoulombClear: constants, Coulomb's law, the field of point charges and a tracer
// that follows it to make field lines (nothing is drawn by eye), fat lines with arrow heads, charged
// balls, chart boards, force arrows, a person, and small layout helpers.
// +x right, +y up, +z towards the viewer. Each chapter says what one scene unit is.
import { THREE, M, box, beam, sphere, torus, arrow, clamp } from './kit.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

// ---------------------------------------------------------------- constants
// Coulomb constant k = 1 ÷ (4π ε0) = 8.987 551 79 × 10⁹ N m²/C² (CODATA 2018/2022; since the 2019 SI
// it is a measured number, no longer exact). ε0 = 8.854 187 8 × 10⁻¹² F/m.
export const K = 8.9875517862e9;
export const EPS0 = 8.8541878188e-12;
export const QE = 1.602176634e-19;          // C, elementary charge: exact in the SI since 20 May 2019
export const GN = 6.6743e-11;               // N m²/kg², CODATA
export const MP = 1.67262192e-27;           // kg, proton (CODATA)
export const ME = 9.1093837e-31;            // kg, electron (CODATA)
export const KB = 1.380649e-23;             // J/K, Boltzmann constant (exact)
export const G0 = 9.81;
// Dry air at sea level breaks down (sparks) at about 3 × 10⁶ V/m in a uniform field: the usual
// textbook figure (e.g. Halliday, Resnick & Walker; Paschen-law fits give 3.0–3.3 MV/m for gaps of
// a centimetre or so, more for very small gaps).
export const E_AIR = 3e6;
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;

export const coulomb = (q1, q2, r) => (K * q1 * q2) / (r * r);   // + repels, − attracts

// ---------------------------------------------------------------- formatting
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');
export const fmt0 = (v) => Math.round(v).toLocaleString('en-IN');
const sig = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2));
const neg = (t) => t.replace(/^-/, '−');
export function sci(v, d = 2) { return neg(sci0(v, d)); }
function sci0(v, d = 2) {
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
  if (e >= -2 && e <= 4) return Math.abs(v) >= 1000 ? fmt0(v) : v.toFixed(Math.max(0, d - Math.max(0, e)));
  let ms = m.toFixed(d), ee = e;
  if (ms.startsWith('10')) { ms = (1).toFixed(d); ee = e + 1; }
  return `${ms} × 10${sup(ee)}`;
}
// A value with SI prefixes: 2.2 mN, 35 kV, 6.4 fC.
const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f']];
export function si(v, unit) {
  const a = Math.abs(v);
  if (a === 0) return '0 ' + unit;
  if (a >= 1e12 || a < 1e-15) return sci(v, 2) + ' ' + unit;
  for (const [m, p] of PRE) if (a >= m * 0.9995) return neg(sig(v / m)) + ' ' + p + unit;
  return sci(v, 2) + ' ' + unit;
}
export const fmtN = (F) => si(F, 'N');
export const fmtQ = (q) => si(q, 'C');
export const fmtV = (v) => (Math.abs(v) >= 1000 ? si(v, 'V') : Math.round(v) + ' V');
export const fmtE = (E) => si(E, 'V/m');
// A mass whose weight on Earth equals force F.
export function asWeight(F) {
  const kg = Math.abs(F) / G0;
  if (kg >= 1000) return sig(kg / 1000) + ' t';
  if (kg >= 1) return sig(kg) + ' kg';
  if (kg >= 1e-3) return sig(kg * 1e3) + ' g';
  if (kg >= 1e-6) return sig(kg * 1e6) + ' mg';
  if (kg >= 1e-9) return sig(kg * 1e9) + ' µg';
  return sci(kg * 1e9, 1) + ' µg';
}

// ---------------------------------------------------------------- the field of point charges
// charges: [{ x, y, q }] in one plane. Returns [Ex, Ey] in units of q ÷ length²: multiply by K (and
// the unit conversions) for V/m. This is Coulomb's law added up, one charge at a time (superposition).
export function fieldAt(charges, x, y) {
  let ex = 0, ey = 0;
  for (const c of charges) {
    const dx = x - c.x, dy = y - c.y, r2 = dx * dx + dy * dy + 1e-12, r = Math.sqrt(r2);
    const k = c.q / (r2 * r);
    ex += k * dx; ey += k * dy;
  }
  return [ex, ey];
}
// Follow the field from (x0, y0) with midpoint steps. dir = +1 goes along E, −1 against it.
export function traceLine(charges, x0, y0, { step = 0.05, max = 900, dir = 1, stop = () => false, bounds = [-6, 6, -4, 4] } = {}) {
  const pts = [[x0, y0]];
  let x = x0, y = y0;
  for (let i = 0; i < max; i++) {
    const [f1, g1] = fieldAt(charges, x, y), n1 = Math.hypot(f1, g1);
    if (n1 < 1e-9) break;                                  // a null point: the line stops
    const xm = x + (dir * step * f1) / n1 / 2, ym = y + (dir * step * g1) / n1 / 2;
    const [f2, g2] = fieldAt(charges, xm, ym), n2 = Math.hypot(f2, g2) || 1;
    x += (dir * step * f2) / n2; y += (dir * step * g2) / n2;
    pts.push([x, y]);
    if (stop(x, y) || x < bounds[0] || x > bounds[1] || y < bounds[2] || y > bounds[3]) break;
  }
  return pts;
}
// Field lines for a set of charges, as lists of [x, y] points running along E.
// Each charge sends out (or takes in) a number of lines in proportion to its size: `per` lines per
// unit of charge, spread evenly round it. Lines start on positive charges and are followed until
// they reach a negative charge or leave the picture. Lines that come in from far away to a negative
// charge are found by walking backwards from it and keeping the ones that leave the picture.
// The picture is a flat slice through a 3D field, so the spacing of lines is a guide to strength,
// not an exact measure.
export function fieldLinesFor(charges, { per = 8, r0 = 0.12, step = 0.05, bounds = [-6, 6, -4, 4], max = 900, minN = 0, clip = null } = {}) {
  const live = charges.filter((c) => Math.abs(c.q) > 1e-9);
  // Charges marked `image` (mirror charges standing in for a conducting surface) shape the field
  // but are not real, so no lines start or end on them.
  const pos = live.filter((c) => c.q > 0 && !c.image), neg = live.filter((c) => c.q < 0 && !c.image);
  const hit = (list) => (x, y) => list.some((c) => Math.hypot(x - c.x, y - c.y) < (c.r0 ?? r0) * 0.9) || (clip ? clip(x, y) : false);
  const out = [];
  const count = (c) => Math.max(minN, Math.round(Math.abs(c.q) * per));
  for (const c of pos) {
    const n = count(c), rr = c.r0 ?? r0;
    for (let i = 0; i < n; i++) { const t = ((i + 0.5) / n) * TAU + (c.phase || 0); out.push(traceLine(live, c.x + Math.cos(t) * rr, c.y + Math.sin(t) * rr, { step, max, bounds, stop: hit(neg) })); }
  }
  const [bx0, bx1, by0, by1] = bounds;
  for (const c of neg) {
    const n = count(c), rr = c.r0 ?? r0;
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) / n) * TAU + (c.phase || 0);
      const pts = traceLine(live, c.x + Math.cos(t) * rr, c.y + Math.sin(t) * rr, { step, max, bounds, dir: -1, stop: hit(pos) });
      const e = pts[pts.length - 1];
      if (e[0] < bx0 || e[0] > bx1 || e[1] < by0 || e[1] > by1 || (clip && clip(e[0], e[1]))) out.push(pts.reverse());
    }
  }
  return out;
}

// ---------------------------------------------------------------- field lines on screen
// Fat lines (screen-pixel width) that can be rewritten when the field changes, with arrow heads.
export function fatLines(stage, color = 0x8ef0ff, { width = 2.2, opacity = 0.85, heads = 120, headSize = 0.16 } = {}) {
  const g = new THREE.Group();
  const mat = stage.lineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false });
  let obj = null;
  const cone = new THREE.ConeGeometry(headSize * 0.42, headSize, 10); cone.rotateZ(-Math.PI / 2);   // points along +x
  const hm = new THREE.InstancedMesh(cone, M.glow(color, { transparent: true, opacity }), heads);
  hm.frustumCulled = false; hm.count = 0; g.add(hm);
  const o = new THREE.Object3D(), d = new THREE.Vector3(), X = new THREE.Vector3(1, 0, 0);
  // lines: arrays of [x, y, z]; each gets a head at `at` (0..1) of its length, pointing along it.
  g.set = (lines, at = 0.5) => {
    const arr = [];
    let n = 0;
    for (const L of lines) {
      if (L.length < 2) continue;
      for (let i = 0; i < L.length - 1; i++) arr.push(L[i][0], L[i][1], L[i][2] || 0, L[i + 1][0], L[i + 1][1], L[i + 1][2] || 0);
      if (n < heads && L.length > 6) {
        const i = Math.floor((L.length - 2) * at), p = L[i], q = L[i + 1];
        d.set(q[0] - p[0], q[1] - p[1], (q[2] || 0) - (p[2] || 0)).normalize();
        o.position.set(p[0], p[1], p[2] || 0); o.quaternion.setFromUnitVectors(X, d); o.updateMatrix(); hm.setMatrixAt(n++, o.matrix);
      }
    }
    hm.count = n; hm.instanceMatrix.needsUpdate = true;
    if (obj) { g.remove(obj); obj.geometry.dispose(); obj = null; }
    if (arr.length) { const geo = new LineSegmentsGeometry(); geo.setPositions(arr); obj = new LineSegments2(geo, mat); obj.frustumCulled = false; g.add(obj); }
  };
  return g;
}

// ---------------------------------------------------------------- charged things
export const POS = 0xff5a5a, NEG = 0x4d8dff, NEUTRAL = 0x9aa3b2;
export const chargeHex = (q) => (q > 0 ? POS : q < 0 ? NEG : NEUTRAL);
// A flat sign (+ or −) that always faces the camera.
export function sign(txt, size = 0.3, color = '#ffffff') {
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const g = c.getContext('2d'); g.fillStyle = color; g.font = 'bold 84px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 48, 52);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, toneMapped: false }));
  s.scale.setScalar(size); s.renderOrder = 12;
  return s;
}
// A ball that shows its charge: red for +, blue for −, grey for none, with the sign on it.
export function chargeBall(r = 0.2, seg = 40) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: NEUTRAL, roughness: 0.35, metalness: 0.25, emissive: 0x000000 });
  const b = sphere(r, mat, seg); g.add(b);
  const plus = sign('+', r * 1.5), minus = sign('−', r * 1.5); g.add(plus, minus);
  g.setCharge = (q) => { const h = chargeHex(q); mat.color.setHex(h); mat.emissive.setHex(h); mat.emissiveIntensity = q ? 0.25 : 0; plus.visible = q > 0; minus.visible = q < 0; };
  g.setCharge(0);
  g.ball = b;
  return g;
}
// An insulating stand: a glassy rod on a dark base, top at height h.
export function stand(h, r = 0.025) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), M.clear(0xcfe8ff, 0.45)); p.position.y = h / 2; g.add(p);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.05, 24), M.matte(0x3a3f4b)); base.position.y = 0.025; base.receiveShadow = true; g.add(base);
  return g;
}

// ---------------------------------------------------------------- boards
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function title(g, text, sub = '') {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
// Axes with a grid. Returns X(x) and Y(y). logX / logY take exponents for min and max.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', logX = false, logY = false }) {
  const X = logX ? (x) => x0 + ((Math.log10(x) - xMin) / (xMax - xMin)) * (x1 - x0) : (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = logY ? (y) => y0 - ((Math.log10(y) - yMin) / (yMax - yMin)) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function text(g, s, x, y, col = 'rgba(255,255,255,.75)', font = '18px sans-serif') { g.fillStyle = col; g.font = font; g.fillText(s, x, y); }
export const COL = { pos: '#ff7a7a', neg: '#6aa6ff', field: '#8ef0ff', force: '#ffd166', hot: '#ffb547', good: '#7be08c', grav: '#c49bff', red: '#ff5a8a', soft: 'rgba(255,255,255,.55)' };
export const HEX = { pos: POS, neg: NEG, field: 0x8ef0ff, force: 0xffd166, hot: 0xffb547, good: 0x7be08c, grav: 0xc49bff, red: 0xff5a8a };

// ---------------------------------------------------------------- stage helpers
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.2 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Views are framed to dodge the readout in the upper left of a wide stage. On a phone-width stage the
// readout fills the top half, so re-centre the view on the model (v.cx, v.cy) and let fitNarrow slide
// the picture down into the free space below it.
export function pickView(stage, v) {
  if (v.cx === undefined || stage.host.clientWidth >= 560 || inReel()) return v;
  const dx = v.cx - v.target[0], dy = (v.cy ?? v.target[1]) - v.target[1], k = v.nz || 1;                 // nz: stand further back on a phone
  const t = [v.cx, v.target[1] + dy, v.target[2]], p = [v.pos[0] + dx, v.pos[1] + dy, v.pos[2]];
  return { pos: p.map((c, i) => t[i] + (c - t[i]) * k), target: t };
}
// The small print under a readout. Left out on a phone, where the readout must stay short.
export const note = (html) => ((document.getElementById('stage')?.clientWidth || 999) < 560 ? '' : `<small>${html}</small>`);
// Boards sit beside the model on a wide screen. In the tall reel video they move to 'reelPos'.
export function reelBoards(list) {
  const r = inReel();
  list.forEach(([b, pos, scale = 1]) => {
    if (!b.home) b.home = { p: b.mesh.position.clone(), r: b.mesh.rotation.clone() };
    if (r) { b.mesh.position.set(...pos); b.mesh.scale.setScalar(scale); b.mesh.rotation.set(0, 0, 0); }
    else { b.mesh.position.copy(b.home.p); b.mesh.scale.setScalar(1); b.mesh.rotation.copy(b.home.r); }
  });
}
// Show one group per focus and fly the camera to its view.
export function focusSwitch(stage, groups, views) {
  let cur = '';
  return (f) => {
    if (f === cur) return false;
    cur = f;
    for (const k in groups) groups[k].visible = k === f;
    if (!inReel()) { const v = pickView(stage, views[f]); stage.setView(v.pos, v.target, 1.0); }
    return true;
  };
}

// ---------------------------------------------------------------- arrows
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
// A kit arrow that can point any way and draws on top: aim(from, dir, len).
export function force(color, r = 0.035, head = 0.2) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-16) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.03) a.visible = false;
  };
  return a;
}

// ---------------------------------------------------------------- bodies
// Deterministic pseudo-random numbers so every run (and every video frame) looks the same.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// A person standing with feet at the origin, facing +x. pose({ arm, lean }).
export function makePerson({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const hipY = 0.92 * s;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16 * s, 0.38 * s, 6, 14), cloth); torso.position.y = 0.3 * s; torso.scale.z = 1.25; torso.castShadow = true; body.add(torso);
  const head = sphere(0.11 * s, sk, 24); head.position.y = 0.74 * s; body.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.115 * s, 20, 10, 0, TAU, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.z = 0.35; body.add(hairM);
  const limb = (len, r, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10), mat); m.position.y = -len / 2; m.castShadow = true; p.add(m); return p; };
  const arms = [-1, 1].map((z) => { const a = limb(0.62 * s, 0.05 * s, cloth); a.position.set(0, 0.52 * s, z * 0.22 * s); body.add(a); const hand = sphere(0.05 * s, sk, 12); hand.position.y = -0.62 * s; a.add(hand); return a; });
  const legs = [-1, 1].map((z) => { const l = limb(0.88 * s, 0.065 * s, jeans); l.position.set(0, hipY, z * 0.1 * s); g.add(l); const shoe = box(0.22 * s, 0.07 * s, 0.1 * s, M.matte(0x1b1d22)); shoe.position.set(0.05 * s, -0.88 * s, 0); l.add(shoe); return l; });
  body.position.y = hipY;
  g.arms = arms; g.legs = legs; g.body = body; g.head = head;
  return g;
}

// Many small glowing dots. place(i, x, y, z, s) then done().
export function dots(n, r, color = 0xffffff, seg = 8, opacity = 0.9) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity }), n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; };
  return mesh;
}
// A jagged spark between two points: setEnds(a, b, seed) rewrites it. A thin glowing line.
export function spark(color = 0xcfe8ff, n = 14) {
  const pos = new Float32Array(n * 3), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1, toneMapped: false }));
  l.frustumCulled = false;
  l.setEnds = (a, b, seed = 1, jag = 0.15) => {
    const r = rng(seed), len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), e = i === 0 || i === n - 1 ? 0 : jag * len;
      pos[i * 3] = a[0] + (b[0] - a[0]) * t + (r() - 0.5) * e; pos[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + (r() - 0.5) * e; pos[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + (r() - 0.5) * e;
    }
    g.attributes.position.needsUpdate = true;
  };
  return l;
}
// Solve f(x) = 0 on [a, b] by bisection (f(a) and f(b) must differ in sign).
export function bisect(f, a, b, n = 50) {
  let fa = f(a);
  for (let i = 0; i < n; i++) { const m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; }
  return (a + b) / 2;
}
export { clamp, THREE, M, box, beam, sphere, torus };
