// Chapter 2: the electric field and superposition, then why a charged comb lifts neutral paper.
// 1. Field explorer. Two point charges 1 m apart (−2 to +2 µC each), or two rows of 13 charges
//    (±0.15 µC, 10 cm apart, rows 60 cm apart) standing in for parallel plates. The field at any
//    point is the vector sum of Coulomb's law for every charge: E = Σ k q ÷ r², each pointing away
//    from a + or towards a −. Field lines are traced through that summed field (coulomb.js). A +1 nC
//    test charge shows the two contributions tip to tail and their sum, on one linear scale, so the
//    triangle you see is the real vector addition. 1 scene unit = 0.5 m.
// 2. Comb and paper. A plastic comb run through dry hair picks up electrons (hair sits near the
//    positive end of the triboelectric series, plastics near the negative end). Its charge is modelled
//    as 5 equal point charges along 6 cm of comb. A scrap of paper is neutral, but the field shifts
//    its charges a little (polarisation): the near side becomes slightly +, the far side slightly −.
//    The near side is pulled harder than the far side is pushed, because the field is not uniform.
//    Treating the scrap as a small ball of radius a and relative permittivity εr, its dipole moment is
//    p = 4π ε0 a³ (εr − 1)/(εr + 2) E and the force is F = ½ α ∇(E²) (Griffiths, Introduction to
//    Electrodynamics, §4.1 and problem 4.4; Jackson §4.4). Under a single point charge that is
//    F = 2 k q² a³ (εr − 1)/(εr + 2) ÷ r⁵: it falls with the FIFTH power of distance. Numbers: a
//    5 mm square of 80 g/m² paper weighs 2.0 mg (1.96 × 10⁻⁵ N); a = 2.5 mm; εr ≈ 3 for dry paper
//    (handbook values 2–4). The ball is a rough stand-in for a flat scrap, and the comb's charge of
//    tens of nanocoulombs is an order-of-magnitude figure. 1 scene unit = 2.5 cm.
import { THREE, M, box, clamp } from '../kit.js';
import {
  K, EPS0, E_AIR, G0, TAU, fieldAt, fieldLinesFor, fatLines, chargeBall, stand, sign, board, panelBg, title, axes, dot, line, text, COL, HEX,
  force, fitNarrow, focusSwitch, reelBoards, inReel, fmtN, fmtE, asWeight, si, rng, chargeHex,
  note,
} from '../coulomb.js';

const S = 2, Y0 = 1.8, UC = 1e-6, HALF = 0.5;        // charges sit ±0.5 m from the centre
const CX = 40;
const PLATE = { n: 13, dx: 0.1, y: 0.3, q: 0.15 };
// All source charges in metres (x, y from the centre) and microcoulombs, tagged by group.
function sources(s) {
  if (s.setup === 'plates') {
    const out = [];
    for (let i = 0; i < PLATE.n; i++) { const x = (i - (PLATE.n - 1) / 2) * PLATE.dx; out.push({ x, y: PLATE.y, q: PLATE.q, g: 0 }, { x, y: -PLATE.y, q: -PLATE.q, g: 1 }); }
    return out;
  }
  return [{ x: -HALF, y: 0, q: s.qA, g: 0 }, { x: HALF, y: 0, q: s.qB, g: 1 }];
}
// Field in V/m at (x, y) metres from one group (or all when g is null).
function Efield(src, x, y, g = null) {
  const [ex, ey] = fieldAt(g === null ? src : src.filter((c) => c.g === g), x, y);
  return [ex * K * UC, ey * K * UC];
}
// Comb and paper.
const PAPER = { side: 0.005, gsm: 0.08, a: 0.0025, er: 3 };
PAPER.m = PAPER.side * PAPER.side * PAPER.gsm;                  // kg
PAPER.W = PAPER.m * G0;
PAPER.alpha = 4 * Math.PI * EPS0 * PAPER.a ** 3 * (PAPER.er - 1) / (PAPER.er + 2);
const COMB_L = 0.06;
const combCharges = (q, h) => [-2, -1, 0, 1, 2].map((i) => ({ x: (i * COMB_L) / 4, y: h, q: q / 5 }));
function E2at(ch, x, y) { const [ex, ey] = fieldAt(ch, x, y); return (ex * ex + ey * ey) * K * K; }
// Upward pull (N) on a paper scrap lying at (x, 0) under a comb with charge q (C) at height h (m).
export function paperPull(q, h, x = 0) {
  const ch = combCharges(q, h), d = 1e-5;
  return (PAPER.alpha / 2) * (E2at(ch, x, d) - E2at(ch, x, -d)) / (2 * d);
}
const combE = (q, h, x = 0) => Math.sqrt(E2at(combCharges(q, h), x, 0));
const VIEWS = {
  lines: { pos: [0, 2.8, 5.6], target: [0, 2.4, 0], cx: 0, cy: 1.65 },
  comb: { pos: [CX + 1.4, 2.6, 6.0], target: [CX + 1.4, 2.25, 0], cx: CX, cy: 1.4 },
};
const DIRS = ['to the right', 'up and right', 'straight up', 'up and left', 'to the left', 'down and left', 'straight down', 'down and right'];
const fq = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + ' µC';

export default {
  id: 'field',
  short: 'Fields add up',
  title: 'Many charges: add the pushes one by one',
  subtitle: 'Every charge obeys Coulomb’s law on its own. The total is the sum of the arrows.',
  view: VIEWS.lines,
  learn: `<p>Coulomb's law is written for <b>two</b> charges. What if there are three, or a million? The rule is simple: work out the push from <b>each charge by itself</b>, as if the others were not there, then <b>add the arrows</b>. This is called <b>superposition</b>.</p>
    <p>It helps to think of the space around charges as filled with an <b>electric field</b>, written <b>E</b>. The field at a point is the force a +1 coulomb charge would feel there, in newtons per coulomb (the same thing as <b>volts per metre</b>). A charge q placed in the field feels <b>F = q × E</b>.</p>
    <p>The yellow dot is a tiny <b>test charge</b>. The red and blue arrows are the pushes from the two charges, laid tip to tail. The gold arrow is their sum. <b>Field lines</b> follow that sum everywhere. Where the lines crowd together the field is strong.</p>
    <p>Two flat <b>plates</b> with opposite charges make something special: between them the lines run straight and evenly spaced, so the field is nearly the <b>same everywhere</b>. Laser printers, microphones and old picture-tube TVs all use that trick.</p>
    <p>Superposition also explains a puzzle. A charged <b>comb</b> picks up scraps of paper that have <b>no charge at all</b>. The comb's field tugs the charges inside the paper slightly apart: this is <b>polarisation</b>. The near side ends up opposite to the comb and is pulled; the far side is pushed, but it is further away, so the pull wins. This pull dies off very fast, as 1 ÷ r⁵, so the comb must come close.</p>
    <p class="tip"><b>Try it:</b> press "Opposite charges" and slide the test charge around. Then switch to plates and move it between them: the arrow hardly changes. Last, lower the comb until the paper jumps.</p>`,
  terms: [
    { t: 'Superposition', d: 'The total force from many charges is the vector sum of the forces from each one alone.' },
    { t: 'Electric field (E)', d: 'The force per unit charge at a point, in N/C or V/m. A charge q there feels F = q × E.' },
    { t: 'Test charge', d: 'A charge small enough not to disturb what it is measuring.' },
    { t: 'Dipole', d: 'A positive and a negative charge close together.' },
    { t: 'Polarisation', d: 'A slight shift of the charges inside a neutral object, caused by a nearby charge.' },
    { t: 'Uniform field', d: 'A field with the same strength and direction everywhere, as between two charged plates.' },
  ],
  defaults: { focus: 'lines', setup: 'two', qA: 1, qB: -1, tx: 0, ty: 0.3, comb: 60, h: 3.5 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'lines', label: 'Field lines' }, { v: 'comb', label: 'Comb and paper' }] },
    { key: 'setup', type: 'seg', label: 'Charges', options: [{ v: 'two', label: 'Two charges' }, { v: 'plates', label: 'Two plates' }] },
    { key: 'qA', type: 'range', label: 'Left charge', min: -2, max: 2, step: 0.5, ends: ['−2 µC', '+2 µC'], fmt: fq },
    { key: 'qB', type: 'range', label: 'Right charge', min: -2, max: 2, step: 0.5, ends: ['−2 µC', '+2 µC'], fmt: fq },
    { key: 'tx', type: 'range', label: 'Test charge: left and right', min: -0.9, max: 0.9, step: 0.01, fmt: (v) => (v * 100).toFixed(0) + ' cm' },
    { key: 'ty', type: 'range', label: 'Test charge: up and down', min: -0.5, max: 0.5, step: 0.01, fmt: (v) => (v * 100).toFixed(0) + ' cm' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Opposite charges', act: (s) => Object.assign(s, { focus: 'lines', setup: 'two', qA: 1, qB: -1 }) },
      { label: 'Two alike', act: (s) => Object.assign(s, { focus: 'lines', setup: 'two', qA: 1, qB: 1 }) },
      { label: '+2 and −1', act: (s) => Object.assign(s, { focus: 'lines', setup: 'two', qA: 2, qB: -1 }) },
      { label: 'One alone', act: (s) => Object.assign(s, { focus: 'lines', setup: 'two', qA: 1, qB: 0 }) },
    ] },
    { key: 'comb', type: 'range', label: 'Comb: charge', min: 10, max: 150, step: 1, ends: ['10 nC', '150 nC'], fmt: (v) => '−' + v + ' nC' },
    { key: 'h', type: 'range', label: 'Comb: height above the paper', min: 1, max: 6, step: 0.1, ends: ['1 cm', '6 cm'], fmt: (v) => v.toFixed(1) + ' cm' },
  ],
  onChange(s, key) {
    if (['setup', 'qA', 'qB', 'tx', 'ty'].includes(key)) s.focus = 'lines';
    if (key === 'comb' || key === 'h') s.focus = 'comb';
  },
  quiz: [
    { q: 'A test charge sits exactly midway between two equal positive charges. What is the net force on it?', options: ['Twice the force from one', 'Zero', 'The same as from one', 'It depends on the test charge'], answer: 1, why: 'The two pushes are equal and point in opposite directions, so the arrows add to zero. That is superposition.' },
    { q: 'Why does a charged comb pick up paper that has no charge?', options: ['The paper is secretly charged', 'The comb polarises the paper, and the near side is pulled harder than the far side is pushed', 'Air pressure pushes the paper up', 'Paper is magnetic'], answer: 1, why: 'The field shifts charges inside the paper. The opposite charge ends up nearer the comb, where the field is stronger, so the pull beats the push.' },
    { q: 'Between two large, oppositely charged plates the field is…', options: ['Zero', 'Strong near the plates, zero in the middle', 'Nearly the same everywhere', 'Circular'], answer: 2, why: 'The pushes from all the charges on both plates add up to a nearly uniform field: straight, evenly spaced lines from the + plate to the − plate.' },
  ],
  reel: [
    { ms: 5600, caption: 'With many charges, add the pushes one by one. Field lines trace the total, from plus to minus.', set: { focus: 'lines', setup: 'two', qA: 1, qB: -1, ty: 0.3 }, anim: { tx: [-0.8, 0.8] }, view: { pos: [0, 4.4, 5.4], target: [0, 4.0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gF = new THREE.Group(), gC = new THREE.Group();
    gC.position.x = CX; root.add(gF, gC);

    // ================================================================ field explorer
    const ballA = chargeBall(0.16, 40), ballB = chargeBall(0.16, 40); gF.add(ballA, ballB);
    const stA = stand(Y0 - 0.16, 0.02), stB = stand(Y0 - 0.16, 0.02); gF.add(stA, stB);
    const lines = fatLines(stage, HEX.field, { width: 2, opacity: 0.75, headSize: 0.13, heads: 160 }); gF.add(lines);
    // plates: two bars with a row of small charges on each
    const plates = new THREE.Group(); gF.add(plates);
    const pw = (PLATE.n - 1) * PLATE.dx * S + 0.3;
    const pTop = box(pw, 0.06, 0.4, M.metal(0xd98a8a, { roughness: 0.4 })), pBot = box(pw, 0.06, 0.4, M.metal(0x7fa3e6, { roughness: 0.4 }));
    plates.add(pTop, pBot);
    const pSigns = [];
    for (let i = 0; i < PLATE.n; i += 2) { const x = (i - (PLATE.n - 1) / 2) * PLATE.dx * S; const a = sign('+', 0.17, '#ff7a7a'), b = sign('−', 0.17, '#6aa6ff'); a.position.set(x, 0, 0.22); b.position.set(x, 0, 0.22); plates.add(a, b); pSigns.push(a, b); }
    const test = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), M.glow(0xffe066)); test.renderOrder = 11; gF.add(test);
    const aA = force(HEX.pos, 0.018, 0.1), aB = force(HEX.neg, 0.018, 0.1), aN = force(HEX.force, 0.03, 0.14); gF.add(aA, aB, aN);
    const lA = stage.label('', [0, 0, 0], gF), lB = stage.label('', [0, 0, 0], gF), lT = stage.label('', [0, 0, 0], gF, 'hot');
    lT.element.style.setProperty('--c', COL.force);
    const lTest = stage.label('test charge, +1 nC', [0, 0, 0], gF);

    // ================================================================ comb and paper
    const U = 40;                                                    // scene units per metre
    const table = box(7.2, 0.1, 3.2, M.matte(0x6b4a2e, { roughness: 0.8 })); table.position.set(0.6, -0.05, 0); gC.add(table);
    const comb = new THREE.Group(); gC.add(comb);
    const cm = M.plastic(0x1f8a70, { roughness: 0.35 });
    const spine = box(3.4, 0.24, 0.1, cm); spine.position.y = 0.44; comb.add(spine);
    for (let i = 0; i < 26; i++) { const t = box(0.045, 0.36, 0.08, cm); t.position.set(-1.62 + i * 0.13, 0.18, 0); comb.add(t); }
    const cSigns = [-1.2, -0.6, 0, 0.6, 1.2].map((x) => { const sg = sign('−', 0.26, '#cfe0ff'); sg.position.set(x, 0.45, 0.1); comb.add(sg); return sg; });
    const rr = rng(11);
    const bits = Array.from({ length: 9 }, (_, i) => {
      const m = box(0.2, 0.012, 0.2, M.matte(0xf3efe2)); m.castShadow = true;
      const x = i === 0 ? 0 : (rr() - 0.5) * 4.4, z = i === 0 ? 0.15 : (rr() - 0.5) * 1.1;
      m.userData = { x, z, rot: rr() * TAU, k: 0 }; m.rotation.y = m.userData.rot; gC.add(m); return m;
    });
    const bp = sign('+', 0.2, '#ff7a7a'), bm = sign('−', 0.2, '#6aa6ff'); gC.add(bp, bm);
    const aUp = force(HEX.force, 0.02, 0.1), aW = force(HEX.grav, 0.02, 0.1); gC.add(aUp, aW);
    const lComb = stage.label('', [0, 0, 0], gC), lBit = stage.label('', [0, 0, 0], gC, 'hot'); lBit.element.style.setProperty('--c', COL.force);
    const lPol = stage.label('inside the paper: + shifts up, − down', [2.3, 0.3, 1.2], gC);
    const rulerC = box(0.02, 1, 0.02, M.glow(0xffffff, { transparent: true, opacity: 0.5 })); gC.add(rulerC);
    const lH = stage.label('', [0, 0, 0], gC);
    let cc = { q: 60e-9, h: 0.035 };
    const combBoard = board(gC, 2.9, 1.76, 760, 460, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Pull on one scrap', 'against the comb’s height');
      const { X, Y } = axes(g, w, h, { x0: 112, xMin: 0, xMax: Math.log10(6), yMin: -8, yMax: -2, logX: true, logY: true, xTicks: [1, 2, 4, 6], yTicks: [1e-8, 1e-6, 1e-4, 1e-2], xFmt: (v) => v + ' cm', yFmt: (v) => si(v, 'N'), xLabel: 'height of the comb →', yLabel: 'upward pull ↑' });
      const pts = []; for (let x = 1; x <= 6.01; x += 0.1) pts.push([x, clamp(paperPull(cc.q, x / 100), 1e-8, 1e-2)]);
      line(g, pts, X, Y, COL.force, 5);
      line(g, [[1, PAPER.W], [6, PAPER.W]], X, Y, COL.grav, 3, [8, 6]);
      text(g, 'weight of the scrap: 2 mg', X(2.6), Y(PAPER.W) - 10, COL.grav, '17px sans-serif');
      const F = paperPull(cc.q, cc.h);
      dot(g, X(cc.h * 100), Y(clamp(F, 1e-8, 1e-2)), F > PAPER.W ? COL.good : COL.hot, 10);
      text(g, 'steep: the pull falls as 1 ÷ r⁵', X(1.25), Y(2e-3) + 4, 'rgba(255,255,255,.7)', '17px sans-serif');
    }, [3.2, 2.3, -0.3]);
    combBoard.mesh.rotation.y = -0.25;

    // ================================================================ state
    const show = focusSwitch(stage, { lines: gF, comb: gC }, VIEWS);
    let kL = '', kC = '';
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lTest, lPol, lH, lA, lB]);
        reelBoards([[combBoard, [0, 5.6, -1], 1.6]]);
        show(s.focus);

        if (s.focus === 'lines') {
          const yC = inReel() ? Y0 + 2.2 : Y0, cx = 0, two = s.setup === 'two';
          const src = sources(s);
          ballA.visible = ballB.visible = stA.visible = stB.visible = two; plates.visible = !two;
          ballA.position.set(cx - HALF * S, yC, 0); ballB.position.set(cx + HALF * S, yC, 0);
          ballA.setCharge(s.qA); ballB.setCharge(s.qB);
          [stA, stB].forEach((st, i) => { st.position.x = cx + (i ? 1 : -1) * HALF * S; st.scale.y = (yC - 0.16) / (Y0 - 0.16); });
          pTop.position.set(cx, yC + PLATE.y * S + 0.03, 0); pBot.position.set(cx, yC - PLATE.y * S - 0.03, 0);
          pSigns.forEach((sg, i) => { sg.position.y = yC + (i % 2 ? -1 : 1) * (PLATE.y * S + 0.17); });
          // the test charge and its arrows: components tip to tail, then the sum, all on one linear scale
          const tx = s.tx, ty = s.ty, px = cx + tx * S, py = yC + ty * S;
          const EA = Efield(src, tx, ty, 0), EB = Efield(src, tx, ty, 1), EN = [EA[0] + EB[0], EA[1] + EB[1]];
          const mA = Math.hypot(...EA), mB = Math.hypot(...EB), mN = Math.hypot(...EN), big = Math.max(mA, mB, mN, 1e-9), sc = 0.95 / big;
          test.position.set(px, py, 0.05);
          aA.traverse((o) => { if (o.material) o.material.color.setHex(two ? chargeHex(s.qA) : HEX.pos); });
          aB.traverse((o) => { if (o.material) o.material.color.setHex(two ? chargeHex(s.qB) : HEX.neg); });
          aA.aim([px, py, 0.05], [EA[0], EA[1], 0], mA * sc);
          aB.aim([px + EA[0] * sc, py + EA[1] * sc, 0.05], [EB[0], EB[1], 0], mB * sc);
          aN.aim([px, py, 0.08], [EN[0], EN[1], 0], mN * sc);
          lTest.position.set(px + (px > 0.5 ? 0.85 : -0.85), py - 0.12, 0.3);
          lT.position.set(px + (px > 0.5 ? -0.95 : 0.95), py + 0.3, 0.3); lT.element.innerHTML = `total field <b>${fmtE(mN)}</b>`;
          lA.visible = lB.visible = two && !narrow;
          lA.position.set(cx - HALF * S, yC - 0.4, 0.3); lA.element.textContent = fq(s.qA);
          lB.position.set(cx + HALF * S, yC - 0.4, 0.3); lB.element.textContent = fq(s.qB);
          const kk = `${s.setup}|${s.qA}|${s.qB}|${yC}`;
          if (kk !== kL) {
            kL = kk;
            const ch = src.map((c) => ({ x: cx + c.x * S, y: yC + c.y * S, q: c.q, r0: two ? 0.17 : 0.07 }));
            const bounds = inReel() ? [-2.8, 2.8, 0.3, yC + 3.4] : [cx - 2.95, cx + 2.95, 0.15, 3.1];
            const L = fieldLinesFor(ch, two ? { per: inReel() ? 12 : 8, step: 0.035, bounds } : { per: 2 / PLATE.q, step: 0.03, bounds });
            lines.set(L.map((l) => l.map(([x, y]) => [x, y, 0])), 0.5);
          }
        }

        if (s.focus === 'comb') {
          const q = s.comb * 1e-9, h = s.h / 100, hy = h * U;
          comb.position.set(0, hy, 0);                                  // tips of the teeth at height h
          lComb.position.set(-0.6, hy + 0.85, 0); lComb.element.innerHTML = `comb, <b>−${s.comb} nC</b> after combing dry hair`;
          rulerC.scale.y = hy; rulerC.position.set(1.95, hy / 2, 0.3); lH.position.set(2.35, hy / 2, 0.3); lH.element.textContent = `${s.h.toFixed(1)} cm`;
          bits.forEach((b, i) => {
            const ud = b.userData, F = paperPull(q, h, ud.x / U), up = F > PAPER.W && Math.abs(ud.x) < 1.65;
            ud.k = clamp(ud.k + (up ? 1 : -1) * dt * (up ? 3.5 : 2.2), 0, 1);
            const e = ud.k * ud.k * (3 - 2 * ud.k);
            b.position.set(ud.x, 0.02 + (hy - 0.03) * e, ud.z * (1 - e));
            b.rotation.set(e * 0.5 * (i % 2 ? 1 : -1), ud.rot, 0);
          });
          const F0 = paperPull(q, h, 0), b0 = bits[0].position;
          bp.position.set(b0.x - 0.02, b0.y + 0.14, b0.z); bm.position.set(b0.x + 0.02, b0.y - 0.12, b0.z + 0.16);
          const lift = F0 > PAPER.W;
          aUp.aim([b0.x + 0.3, b0.y + 0.05, b0.z], [0, 1, 0], clamp(0.25 + Math.log10(F0 / PAPER.W) * 0.3, 0.12, 0.9));
          aW.aim([b0.x - 0.3, b0.y + 0.32, b0.z], [0, -1, 0], 0.25);
          aW.visible = aUp.visible = bits[0].userData.k < 0.05 || bits[0].userData.k > 0.95;
          lBit.position.set(b0.x + 0.2, Math.max(0.75, b0.y + 0.75), b0.z + 0.5); lBit.element.innerHTML = lift ? `pull <b>${fmtN(F0)}</b> beats the weight: it jumps` : `pull <b>${fmtN(F0)}</b>: too weak to lift`;
          const kk = `${s.comb}|${s.h}`;
          if (kk !== kC) { kC = kk; cc = { q, h }; combBoard.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'comb') {
          const q = s.comb * 1e-9, h = s.h / 100, F = paperPull(q, h, 0), E = combE(q, h), F2 = paperPull(q, 2 * h, 0);
          return `<div class="big">${F > PAPER.W ? 'The paper jumps' : 'The paper stays put'}</div>
            <div class="row"><span>Comb’s field at the paper</span><b>${fmtE(E)}</b></div>
            <div class="row"><span>Pull on one scrap</span><b>${fmtN(F)}</b></div>
            <div class="row"><span>Weight of the scrap (2 mg)</span><b>${fmtN(PAPER.W)}</b></div>
            <div class="row"><span>Pull ÷ weight</span><b>${(F / PAPER.W).toFixed(F / PAPER.W < 10 ? 2 : 0)}×</b></div>
            <div class="row"><span>With the comb twice as high</span><b>${(F / F2).toFixed(0)} times weaker</b></div>
            ${note(`${E > E_AIR ? 'At this field the air itself would start to spark, so a real comb would lose charge. ' : ''}The scrap has no net charge. The pull comes from polarisation and needs a field that changes with distance. Scrap modelled as a 2.5 mm ball of paper.`)}`;
        }
        const src = sources(s), EA = Efield(src, s.tx, s.ty, 0), EB = Efield(src, s.tx, s.ty, 1), EN = [EA[0] + EB[0], EA[1] + EB[1]];
        const mN = Math.hypot(...EN), ang = (Math.atan2(EN[1], EN[0]) * 180) / Math.PI, two = s.setup === 'two';
        return `<div class="big">E = ${fmtE(mN)}</div>
          <div class="row"><span>From the ${two ? 'left charge' : '+ plate'}</span><b>${fmtE(Math.hypot(...EA))}</b></div>
          <div class="row"><span>From the ${two ? 'right charge' : '− plate'}</span><b>${fmtE(Math.hypot(...EB))}</b></div>
          <div class="row"><span>Direction of the total</span><b>${mN < 1 ? 'none' : DIRS[((Math.round(ang / 45) % 8) + 8) % 8]}</b></div>
          <div class="row"><span>Force on the +1 nC test charge</span><b>${fmtN(mN * 1e-9)}</b></div>
          ${note(`${two ? 'The two arrows are laid tip to tail; the gold arrow is their sum. Charges are 1 m apart.' : 'Each plate is a row of 13 charges of 0.15 µC. Between the plates the total barely changes as you move: a uniform field.'}`)}`;
      },
    };
  },
};
