// Chapter 1: F = k q₁ q₂ ÷ r², Coulomb's law (Coulomb, first memoir on electricity, Paris, 1785).
// Two scenes:
// 1. Two charged metal balls, 12 cm across, on glass stands. Sliders set both charges (−1 to +1 µC)
//    and the centre-to-centre distance (0.2 to 1.5 m). The readout computes the force with
//    k = 8.988 × 10⁹ N m²/C². A 6 cm ball holding 1 µC has a surface field k q ÷ R² = 2.5 MV/m, just
//    under the 3 MV/m at which air sparks, so 1 µC is about as much as such a ball can hold: that is
//    why the sliders stop there. Field lines are traced from the two charges by following the summed
//    field (coulomb.js), 12 lines per microcoulomb. Arrows are on a log scale (forces run from
//    millionths of a newton to 0.22 N). 1 scene unit = 0.5 m; the balls are drawn a little big.
// 2. Coulomb's torsion balance. A glass cylinder 12 pouces (32.5 cm) across and high, a 24 pouce
//    (65 cm) tube above it, and a silver wire 28 pouces (76 cm) long carrying a waxed needle with an
//    elder-pith ball 2–3 lignes across (Coulomb 1785, as translated at skullsinthestars.com and
//    described by the Flensburg "histolab" replica). His three readings: balls 36° apart with the
//    micrometer at 0°; 18° apart with it turned 126°; 8.5° apart with it turned 567°. The wire's
//    twist is micrometer + separation: 36°, 144°, 575.5°, close to 1 : 4 : 16 while the distance
//    goes 1 : ½ : ¼. Here the needle's angle is SOLVED from the law: wire torque κ(φ + θ) balances
//    the push F × a cos(θ/2), with the balls a chord 2a sin(θ/2) apart and F ∝ 1 ÷ chord². Calibrated
//    on the first reading, an exact inverse-square law predicts 18.1° and 9.1°; Coulomb read 18° and
//    8.5° and blamed the charge leaking away during the minutes the readings took.
//    Force scale: Coulomb wrote that twisting his wire a full turn took 1/340 grain at the ball
//    (French grain = 53.115 mg), which is 1.53 µN per 360°. The needle arm is drawn about 11 cm
//    and the pith balls are drawn 3× too big to be seen. 1 scene unit = 0.2 m.
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  K, E_AIR, TAU, D2R, coulomb, fieldLinesFor, fatLines, chargeBall, stand, board, panelBg, title, axes, dot, line, text, COL, HEX,
  force, fitNarrow, focusSwitch, reelBoards, inReel, fmtN, fmtQ, asWeight, sci, si, bisect,
  note,
} from '../coulomb.js';

const S = 2;                       // scene units per metre in scene 1
const RV = 0.15;                   // drawn ball radius (scene units)
const RB = 0.06;                   // ball radius, m
const Y0 = 1.7;
const CX = 40;
const UC = 1e-6;
const law = (s) => coulomb(s.q1 * UC, s.q2 * UC, s.r);
const alen = (F) => (F <= 0 ? 0 : clamp(0.25 + (Math.log10(F) + 6) * 0.15, 0.15, 0.95));
// Coulomb's balance.
const COU = { data: [[0, 36, 36], [126, 18, 18], [567, 8.5, 8.5]], perTurn: (53.115e-6 / 340) * 9.80665 };
COU.A = 36 * Math.sin(18 * D2R) ** 2 / Math.cos(18 * D2R);
const twistFor = (th) => (COU.A * Math.cos((th / 2) * D2R)) / Math.sin((th / 2) * D2R) ** 2;   // total wire twist (deg) that holds the balls th degrees apart
export const sepFor = (phi) => bisect((th) => twistFor(th) - th - phi, 0.5, 179);
const VIEWS = {
  law: { pos: [1.5, 2.8, 6.2], target: [1.5, 2.4, 0], cx: -0.3, cy: 1.6 },
  balance: { pos: [CX - 1.6, 3.6, 6.8], target: [CX - 2.05, 2.5, 0], cx: CX, cy: 3.4, nz: 1.3 },
};
const fq = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + ' µC';

export default {
  id: 'idea',
  short: 'Charges push and pull',
  title: 'Like charges repel, unlike charges attract',
  subtitle: 'Double a charge, double the force. Double the distance, a quarter of the force.',
  view: VIEWS.law,
  learn: `<p>Rub a balloon on your hair and it sticks to the wall. That is <b>electric charge</b> at work. Charge comes in two kinds, <b>positive</b> and <b>negative</b>. <b>Like charges repel</b> and <b>unlike charges attract</b>. In 1785 the French engineer <b>Charles-Augustin de Coulomb</b> measured how strong the push is:</p>
    <p><b>F = k × q₁ × q₂ ÷ r²</b></p>
    <p>F is the force in <b>newtons</b>, q₁ and q₂ are the charges in <b>coulombs</b>, and r is the distance between their centres in metres. <b>k</b> is <b>Coulomb's constant</b>, 8.99 × 10⁹ N m²/C². That is a huge number. Two charges of one coulomb each, a metre apart, would push with nine billion newtons, the weight of about 900,000 tonnes. So real static charges are tiny: <b>millionths of a coulomb</b> (µC) or less.</p>
    <p>The r² makes it an <b>inverse-square law</b>. Twice as far apart, the force is a <b>quarter</b>. Three times as far, a <b>ninth</b>. Gravity has exactly the same shape (see GravityClear), but gravity only pulls. Electric force can pull <b>or</b> push, and the sign of q₁ × q₂ tells you which.</p>
    <p>The curved lines are <b>field lines</b>. They show which way a small positive charge would be pushed. They start on positive charges and end on negative ones. Here they are computed from the two charges, not drawn by hand.</p>
    <p>How did Coulomb measure such a small force? With a <b>torsion balance</b>. A light needle hangs on a hair-thin silver wire. A charged ball on the needle is pushed away by a fixed charged ball, and the wire twists. Coulomb then turned the top of the wire to force the balls closer. At <b>half the distance</b> he needed <b>four times the twist</b>. At a quarter, about sixteen times.</p>
    <p class="tip"><b>Try it:</b> press "Double the distance" and watch the force fall to a quarter. Flip one charge and see the lines join up. Then open Coulomb's balance and turn the micrometer to his three settings.</p>`,
  terms: [
    { t: 'Electric charge', d: 'A property of matter that makes it push or pull other charged things. It is positive or negative.' },
    { t: 'Coulomb (C)', d: 'The unit of charge: the charge of about 6.24 × 10¹⁸ protons. One ampere flowing for one second carries one coulomb.' },
    { t: 'Coulomb’s constant (k)', d: '8.99 × 10⁹ N m²/C²: the force between two 1 C charges 1 m apart.' },
    { t: 'Inverse-square law', d: 'A force that falls with the square of the distance: twice as far, a quarter as strong.' },
    { t: 'Field line', d: 'A line that follows the direction a small positive charge would be pushed.' },
    { t: 'Torsion balance', d: 'A needle hung on a thin wire. A tiny sideways force twists the wire, and the twist measures the force.' },
  ],
  defaults: { focus: 'law', q1: 1, q2: 1, r: 0.5, twist: 0 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'law', label: 'Two charges' }, { v: 'balance', label: 'Coulomb’s balance' }] },
    { key: 'q1', type: 'range', label: 'Charge 1 (left ball)', min: -1, max: 1, step: 0.05, ends: ['−1 µC', '+1 µC'], fmt: fq },
    { key: 'q2', type: 'range', label: 'Charge 2 (right ball)', min: -1, max: 1, step: 0.05, ends: ['−1 µC', '+1 µC'], fmt: fq },
    { key: 'r', type: 'range', label: 'Distance between centres', min: 0.2, max: 1.5, step: 0.01, ends: ['0.2 m', '1.5 m'], fmt: (v) => v.toFixed(2) + ' m' },
    { key: 'go', type: 'buttons', label: 'Try these', items: [
      { label: 'Double the distance', act: (s) => { s.focus = 'law'; s.r = clamp(+(s.r * 2).toFixed(2), 0.2, 1.5); } },
      { label: 'Halve the distance', act: (s) => { s.focus = 'law'; s.r = clamp(+(s.r / 2).toFixed(2), 0.2, 1.5); } },
      { label: 'Flip charge 2', act: (s) => { s.focus = 'law'; s.q2 = -s.q2; } },
      { label: 'Halve charge 1', act: (s) => { s.focus = 'law'; s.q1 = +(s.q1 / 2).toFixed(2); } },
    ] },
    { key: 'twist', type: 'range', label: 'Balance: micrometer turned', min: 0, max: 567, step: 1, ends: ['0°', '567°'], fmt: (v) => Math.round(v) + '°' },
    { key: 'cou', type: 'buttons', label: 'Coulomb’s three settings', items: [
      { label: '0°', act: (s) => { s.focus = 'balance'; s.twist = 0; } },
      { label: '126°', act: (s) => { s.focus = 'balance'; s.twist = 126; } },
      { label: '567°', act: (s) => { s.focus = 'balance'; s.twist = 567; } },
    ] },
  ],
  onChange(s, key) {
    if (['q1', 'q2', 'r'].includes(key)) s.focus = 'law';
    if (key === 'twist') s.focus = 'balance';
  },
  quiz: [
    { q: 'Two charged balls repel with 8 mN. You move them to twice the distance apart. What is the force now?', options: ['16 mN', '4 mN', '2 mN', '8 mN'], answer: 2, why: 'Coulomb’s law is an inverse-square law: twice the distance gives 1/2² = 1/4 of the force, so 8 mN becomes 2 mN.' },
    { q: 'One ball has +1 µC and the other −1 µC. What happens?', options: ['They repel', 'They attract', 'Nothing: the charges cancel', 'They spin'], answer: 1, why: 'Unlike charges attract. The product q₁ × q₂ is negative, which means a pull. The size of the force is the same as for two like charges.' },
    { q: 'In Coulomb’s balance, what measured the force between the two balls?', options: ['The weight of the needle', 'How far the thin wire was twisted', 'A spring scale', 'The brightness of a spark'], answer: 1, why: 'A wire resists twisting in proportion to the angle. The twist needed to hold the balls at a set distance tells you the force between them.' },
  ],
  reel: [
    { ms: 5600, caption: 'Like charges repel: F = k q₁ q₂ ÷ r². Double the distance and the push drops to a quarter.', set: { focus: 'law', q1: 1, q2: 1, r: 0.4 }, anim: { r: [0.3, 1.2] }, view: { pos: [0, 3.9, 5.4], target: [0, 3.6, 0] }, spin: 0 },
    { ms: 5400, caption: 'In 1785 Coulomb measured it with a twisting silver wire. Half the distance took four times the twist.', set: { focus: 'balance', twist: 0 }, anim: { twist: [0, 567] }, view: { pos: [CX + 1.2, 4.6, 5.0], target: [CX, 3.9, 0] }, spin: 0.4 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gL = new THREE.Group(), gB = new THREE.Group();
    gB.position.x = CX; root.add(gL, gB);

    // ================================================================ two charges
    const balls = [0, 1].map(() => { const b = chargeBall(RV, 48); gL.add(b); return b; });
    const stands = [0, 1].map(() => { const st = stand(Y0 - RV, 0.02); gL.add(st); return st; });
    const lines = fatLines(stage, HEX.field, { width: 2, opacity: 0.75, headSize: 0.13 }); gL.add(lines);
    const aL = force(HEX.force, 0.03, 0.14), aR = force(HEX.force, 0.03, 0.14); gL.add(aL, aR);
    const lQ1 = stage.label('', [0, 0, 0], gL), lQ2 = stage.label('', [0, 0, 0], gL), lF = stage.label('', [0, 0, 0], gL, 'hot');
    lF.element.style.setProperty('--c', COL.force);
    const glow = M.glow(0xffffff, { transparent: true, opacity: 0.5 });
    const ruler = box(1, 0.012, 0.012, glow); gL.add(ruler);
    const ticks = [0, 1].map(() => { const t = box(0.012, 0.12, 0.012, glow); gL.add(t); return t; });
    const lRuler = stage.label('', [0, 0, 0], gL);
    let cur = null;
    const chart = board(gL, 3.4, 1.5, 1000, 440, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const { q1, q2, r } = cur, kind = q1 * q2 > 0 ? 'push' : q1 * q2 < 0 ? 'pull' : 'no force';
      title(g, 'Force against distance', 'F = k q₁ q₂ ÷ r²');
      const f = (x) => Math.abs(coulomb(q1 * UC, q2 * UC, x)), Fmax = Math.max(f(0.2), 1e-9);
      const { X, Y } = axes(g, w, h, { x0: 118, x1: 600, xMax: 1.5, yMax: 1, xTicks: [0, 0.5, 1, 1.5], yTicks: [0, 0.25, 0.5, 0.75, 1], xFmt: (v) => v + ' m', yFmt: (v) => (v === 0 ? '0' : si(v * Fmax, 'N')), xLabel: 'distance r →', yLabel: `${kind}, N ↑` });
      const pts = []; for (let x = 0.2; x <= 1.501; x += 0.01) pts.push([x, f(x) / Fmax]);
      line(g, pts, X, Y, COL.force, 5);
      [1, 2, 3].forEach((k) => { const x = r * k; if (x > 1.5) return; const y = f(x) / Fmax; g.strokeStyle = 'rgba(255,255,255,.3)'; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x), Y(y)); g.stroke(); g.setLineDash([]); dot(g, X(x), Y(y), k === 1 ? COL.hot : '#fff', k === 1 ? 10 : 7); text(g, k === 1 ? 'F' : `F ÷ ${k * k}`, X(x) + 10, Y(y) - 10, k === 1 ? COL.hot : '#fff', 'bold 18px sans-serif'); });
      // why 1/r²: lines from a point charge spread over 1, 4, 9 squares
      const ox = 650, oy = h / 2 + 20;
      text(g, 'Why 1 ÷ r²?', 650, 74, '#e8eef8', 'bold 20px sans-serif');
      const sq = [[1, 752], [2, 836], [3, 920]];
      g.strokeStyle = 'rgba(142,240,255,.4)'; g.lineWidth = 1.5;
      for (const sy of [-1, -1 / 3, 1 / 3, 1]) { g.beginPath(); g.moveTo(ox, oy); g.lineTo(sq[2][1], oy + sy * 3 * 26); g.stroke(); }
      dot(g, ox, oy, COL.pos, 8);
      sq.forEach(([n, x]) => {
        const half = n * 26;
        g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.strokeRect(x - 6, oy - half, 12, half * 2);
        for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(x - 6, oy - half + i * 52); g.lineTo(x + 6, oy - half + i * 52); g.stroke(); }
        text(g, `${n}r`, x - 12, oy + half + 24, 'rgba(255,255,255,.7)', '16px sans-serif');
        text(g, `${n * n}□`, x - 12, oy - half - 10, COL.hot, 'bold 16px sans-serif');
      });
      text(g, 'Same lines, spread over', 650, h - 44, 'rgba(255,255,255,.65)', '16px sans-serif');
      text(g, '1, 4, 9 times the area', 650, h - 22, 'rgba(255,255,255,.65)', '16px sans-serif');
    }, [3.35, 2.0, -0.4]);
    chart.mesh.rotation.y = -0.25;

    // ================================================================ Coulomb's balance
    const U = 5;                                                     // scene units per metre here
    const glass = () => M.clear(0xcfe8ff, 0.16), brass = M.metal(0xc9a24a, { roughness: 0.35 }), wood = M.matte(0x7a5533, { roughness: 0.7 });
    const BASE = 0.12, CYL_R = 0.1625 * U, CYL_H = 0.325 * U, TOP = BASE + CYL_H, TUBE_H = 0.65 * U, NY = BASE + CYL_H * 0.5, ARM = 0.108 * U;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(CYL_R + 0.12, CYL_R + 0.16, BASE, 48), wood); base.position.y = BASE / 2; base.receiveShadow = true; gB.add(base);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(CYL_R, CYL_R, CYL_H, 64, 1, true), glass()); cyl.position.y = BASE + CYL_H / 2; gB.add(cyl);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(CYL_R + 0.02, CYL_R + 0.02, 0.03, 64), glass()); lid.position.y = TOP; gB.add(lid);
    const tubeG = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, TUBE_H, 24, 1, true), glass()); tubeG.position.y = TOP + TUBE_H / 2; gB.add(tubeG);
    // micrometer: a fixed dial and a knob with a pointer that turns
    const HEAD = TOP + TUBE_H;
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 40), brass); dial.position.y = HEAD; gB.add(dial);
    const knob = new THREE.Group(); knob.position.y = HEAD + 0.05; gB.add(knob);
    const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 24), brass); knob.add(kn);
    const ptr = box(0.2, 0.012, 0.02, M.glow(0xff3b30)); ptr.position.set(0.1, -0.02, 0); knob.add(ptr);
    gB.add(beam([0, HEAD, 0], [0, NY, 0], 0.004, M.metal(0xe6ebf2)));              // the silver wire
    // the needle: waxed thread, pith ball at one end, paper vane at the other
    const needle = new THREE.Group(); needle.position.y = NY; gB.add(needle);
    needle.add(beam([-ARM * 0.55, 0, 0], [ARM, 0, 0], 0.006, M.matte(0x8a2f2a)));
    const vane = box(0.11, 0.11, 0.004, M.matte(0xe9e2cf)); vane.position.x = -ARM * 0.55; needle.add(vane);
    const bMove = chargeBall(0.045, 24); bMove.position.x = ARM; needle.add(bMove); bMove.setCharge(1);
    // the fixed ball on a shellac rod through a hole in the lid
    const bFix = chargeBall(0.045, 24); bFix.position.set(ARM, NY, 0); gB.add(bFix); bFix.setCharge(1);
    gB.add(beam([ARM, NY + 0.045, 0], [ARM, TOP + 0.25, 0], 0.008, M.matte(0x9c5a2a)));
    // paper scale round the cylinder at the needle's height: a tick every 5°, long every 30°
    const tk = M.glow(0xffffff, { transparent: true, opacity: 0.75 });
    for (let a = 0; a < 360; a += 5) { const long = a % 30 === 0, t = box(0.008, long ? 0.1 : 0.05, 0.004, tk); const A = a * D2R; t.position.set(Math.cos(A) * (CYL_R + 0.005), NY, -Math.sin(A) * (CYL_R + 0.005)); t.rotation.y = A + Math.PI / 2; gB.add(t); }
    const ring = torus(CYL_R + 0.005, 0.004, tk, 80); ring.rotation.x = Math.PI / 2; ring.position.y = NY - 0.05; ring.castShadow = false; gB.add(ring);
    const aC = [force(HEX.force, 0.012, 0.07), force(HEX.force, 0.012, 0.07)]; gB.add(...aC);
    const lTh = stage.label('', [0, 0, 0], gB, 'hot'); lTh.element.style.setProperty('--c', COL.force);
    const lWire = stage.label('silver wire, 76 cm: it twists', [0.1, TOP + TUBE_H * 0.55, 0], gB);
    const lMic = stage.label('', [0.3, HEAD + 0.25, 0], gB);
    const lFix = stage.label('fixed ball', [ARM + 0.1, TOP + 0.4, 0], gB), lNeedle = stage.label('needle on the wire', [-0.5, NY - 0.35, 0.4], gB);
    let bal = { th: 36, phi: 0 };
    const balBoard = board(gB, 3.0, 1.82, 760, 460, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Twist in the wire', 'against how far apart the balls sit');
      const { X, Y } = axes(g, w, h, { x0: 96, xMax: 40, yMax: 640, xTicks: [0, 9, 18, 27, 36], yTicks: [0, 144, 288, 432, 576], xFmt: (v) => v + '°', yFmt: (v) => v + '°', xLabel: 'separation of the balls →', yLabel: 'total twist ↑' });
      const pts = []; for (let th = 8; th <= 40; th += 0.25) { const t = twistFor(th); if (t <= 640) pts.push([th, t]); }
      line(g, pts, X, Y, COL.force, 4);
      COU.data.forEach(([phi, th]) => { g.strokeStyle = '#fff'; g.lineWidth = 3; const x = X(th), y = Y(phi + th); g.beginPath(); g.moveTo(x - 9, y - 9); g.lineTo(x + 9, y + 9); g.moveTo(x - 9, y + 9); g.lineTo(x + 9, y - 9); g.stroke(); });
      dot(g, X(bal.th), Y(Math.min(640, bal.phi + bal.th)), COL.hot, 9);
      text(g, 'gold line: the law, twist ∝ 1 ÷ distance²', 330, 96, COL.force, '17px sans-serif');
      text(g, '✕ Coulomb’s three readings, 1785', 330, 122, '#fff', '17px sans-serif');
      text(g, '36° apart → 36° of twist', 330, 170, 'rgba(255,255,255,.7)', '17px sans-serif');
      text(g, '18° apart → 144°  (4 times)', 330, 194, 'rgba(255,255,255,.7)', '17px sans-serif');
      text(g, '8.5° apart → 575.5°  (16 times)', 330, 218, 'rgba(255,255,255,.7)', '17px sans-serif');
    }, [-3.75, 1.35, 0.2]);
    balBoard.mesh.rotation.y = 0.2;

    // ================================================================ state
    const show = focusSwitch(stage, { law: gL, balance: gB }, VIEWS);
    let kP = '', kB = '', th = 36;
    const v3 = new THREE.Vector3();
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lWire, lFix, lNeedle, lRuler]);
        reelBoards([[chart, [0, 7.0, -0.3], 1.6], [balBoard, [0, 7.4, -0.5], 1.5]]);
        show(s.focus);

        if (s.focus === 'law') {
          const F = law(s), R = RV, d = s.r * S, yL = inReel() ? Y0 + 0.9 : Y0;
          const cx = inReel() ? 0 : narrow ? -0.3 : -0.4 + Math.max(0, d - 1.6) * 0.1, xL = cx - d / 2, xR = cx + d / 2;
          gL.position.y = 0;
          [[balls[0], stands[0], xL, s.q1], [balls[1], stands[1], xR, s.q2]].forEach(([b, st, x, q]) => { b.position.set(x, yL, 0); b.setCharge(q); st.position.x = x; st.scale.y = (yL - R) / (Y0 - R); });
          const L = alen(Math.abs(F));
          if (F > 0) { aL.aim([xL - R, yL, 0], [-1, 0, 0], L); aR.aim([xR + R, yL, 0], [1, 0, 0], L); }
          else if (F < 0) { const m = Math.min(L, (d - 2 * R) / 2 - 0.02); aL.aim([xL + R, yL, 0], [1, 0, 0], m); aR.aim([xR - R, yL, 0], [-1, 0, 0], m); }
          else { aL.visible = aR.visible = false; }
          lQ1.position.set(xL, yL - R - 0.2, 0.3); lQ1.element.textContent = fq(s.q1);
          lQ2.position.set(xR, yL - R - 0.2, 0.3); lQ2.element.textContent = fq(s.q2);
          lF.position.set(cx, yL + R + 0.55, 0.3); lF.element.innerHTML = F === 0 ? 'no force: one ball has no charge' : `${F > 0 ? 'push' : 'pull'} <b>${fmtN(Math.abs(F))}</b> on each ball`;
          ruler.scale.x = d; ruler.position.set(cx, 0.1, 0.5);
          ticks[0].position.set(xL, 0.1, 0.5); ticks[1].position.set(xR, 0.1, 0.5);
          lRuler.position.set(cx, 0.32, 0.6); lRuler.element.textContent = `r = ${s.r.toFixed(2)} m`;
          const kk = `${s.q1}|${s.q2}|${s.r.toFixed(3)}|${cx}|${yL}|${narrow}`;
          if (kk !== kP) {
            kP = kk; cur = { q1: s.q1, q2: s.q2, r: s.r }; chart.redraw();
            const ch = [{ x: xL, y: yL, q: s.q1 }, { x: xR, y: yL, q: s.q2 }];
            const bounds = inReel() ? [-2.8, 2.8, 0.3, yL + 2.6] : narrow ? [-2.8, 2.2, 0.2, 3.3] : [-1.95, Math.min(cx + 2.4, 1.75), 0.2, 3.15];
            lines.set(fieldLinesFor(ch, { per: 12, minN: 2, r0: R * 1.05, step: 0.035, bounds }).map((l) => l.map(([x, y]) => [x, y, 0])), 0.45);
          }
        }

        if (s.focus === 'balance') {
          const target = sepFor(s.twist);
          th += (target - th) * (1 - Math.exp(-dt * 4));
          const a = th * D2R;
          needle.rotation.y = a; knob.rotation.y = -s.twist * D2R;
          // arrows: each ball pushed straight away from the other, along the chord
          bMove.getWorldPosition(v3); gB.worldToLocal(v3);
          const dx = v3.x - ARM, dz = v3.z, Ftot = ((s.twist + th) / 360) * COU.perTurn, Lr = clamp(0.16 + Math.log10(Ftot / 1.5e-7) * 0.22, 0.14, 0.5);
          aC[0].aim([v3.x, NY, v3.z], [dx, 0, dz], Lr); aC[1].aim([ARM, NY, 0], [-dx, 0, -dz], Lr);
          lTh.position.set(v3.x * 0.5 + ARM * 0.5, NY + 0.32, v3.z * 0.5 + 0.3); lTh.element.innerHTML = `balls <b>${th.toFixed(1)}°</b> apart`;
          lMic.element.textContent = `micrometer: ${Math.round(s.twist)}°`;
          const kk = `${Math.round(th * 10)}|${Math.round(s.twist)}`;
          if (kk !== kB) { kB = kk; bal = { th, phi: s.twist }; balBoard.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'balance') {
          const t = sepFor(s.twist), tot = s.twist + t, F = (tot / 360) * COU.perTurn;
          const m = COU.data.find(([p]) => p === Math.round(s.twist));
          return `<div class="big">Balls ${t.toFixed(1)}° apart</div>
            <div class="row"><span>Micrometer turned</span><b>${Math.round(s.twist)}°</b></div>
            <div class="row"><span>Total twist in the wire</span><b>${tot.toFixed(1)}°</b></div>
            <div class="row"><span>Force between the balls</span><b>about ${fmtN(F)}</b></div>
            <div class="row"><span>Force ÷ the first reading’s</span><b>${(tot / 36).toFixed(1)}×</b></div>
            <div class="row"><span>Distance ÷ the first reading’s</span><b>${(Math.sin((t / 2) * D2R) / Math.sin(18 * D2R)).toFixed(2)}×</b></div>
            ${m ? `<div class="row"><span>Coulomb read, in 1785</span><b>${m[1]}°</b></div>` : ''}
            ${note(`The angle is solved from the inverse-square law. Coulomb's last reading (8.5°) is a little under the 9.1° predicted: his balls were leaking charge. Balls drawn 3× too big.`)}`;
        }
        const F = law(s), a = Math.abs(F), Es = (K * Math.max(Math.abs(s.q1), Math.abs(s.q2)) * UC) / (RB * RB);
        return `<div class="big">F = ${fmtN(a)}${F > 0 ? ', a push' : F < 0 ? ', a pull' : ''}</div>
          <div class="row"><span>k × q₁ × q₂</span><b>${sci(K * s.q1 * UC * s.q2 * UC, 2)} N m²</b></div>
          <div class="row"><span>÷ r² (${s.r.toFixed(2)} m)²</span><b>÷ ${(s.r * s.r).toFixed(3)} m²</b></div>
          <div class="row"><span>Same as the weight of</span><b>${a ? asWeight(a) : 'nothing'}</b></div>
          <div class="row"><span>At twice the distance</span><b>${fmtN(a / 4)}, a quarter</b></div>
          <div class="row"><span>Field at the ball's surface</span><b>${si(Es, 'V/m')}</b></div>
          ${note(`Air sparks at about 3 MV/m, so a 12 cm ball cannot hold much more than 1 µC. Arrows are on a log scale.`)}`;
      },
    };
  },
};
