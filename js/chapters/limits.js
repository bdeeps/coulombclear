// Chapter 5: gravity's twin, how well the "2" is known, where the simple law needs help, and a myth.
// 1. Electric against gravity. For two particles both forces go as 1 ÷ r², so their ratio does not
//    depend on distance: k q₁ q₂ ÷ (G m₁ m₂). Two protons: 1.24 × 10³⁶. Two electrons: 4.17 × 10⁴².
//    Electron and proton: 2.27 × 10³⁹ (CODATA constants in coulomb.js). Also computed: a body of
//    mostly water has 0.555 mol of electrons per gram (10 electrons per 18 g), so 60 kg holds about
//    2 × 10²⁸; the push between two people 1 m apart with 1% extra electrons each (Feynman's famous
//    example, Lectures vol. II ch. 1, where he compares it to the "weight" of the Earth); and the
//    charge that would cancel the Earth–Moon pull, √(G M m ÷ k) = 5.7 × 10¹³ C (M = 5.972 × 10²⁴ kg,
//    m = 7.346 × 10²² kg, NASA fact sheets).
// 2. Inside a charged shell. For a force ∝ 1 ÷ rⁿ the net push on a charge at distance s (in shell
//    radii) from the centre of a uniformly charged shell is, in units of k Q q ÷ R²,
//    F = ½ ∫ (s − u) ÷ (1 + s² − 2 s u)^((n+1)/2) du for u from −1 to 1. It is exactly zero for
//    n = 2 and only for n = 2: the near patch is closer but smaller by exactly the same factor
//    (Newton's shell theorem; Priestley used it in 1767, Cavendish tested it in 1773). Bounds on
//    |n − 2|: Cavendish 1/50; Maxwell and MacAlister 1/21,600; Plimpton and Lawton (1936) 2 × 10⁻⁹;
//    Williams, Faller and Hill (1971) (2.7 ± 3.1) × 10⁻¹⁶.
// 3. Salt in water. Na⁺ and Cl⁻ touching in a crystal are 0.282 nm apart. Inside a material the
//    force is divided by its relative permittivity εr: vacuum 1, vegetable oil about 3, water 78.4 at
//    25 °C (CRC Handbook). Energy to pull the pair apart: k e² ÷ (εr r), compared with the thermal
//    energy k_B T = 4.11 × 10⁻²¹ J at 25 °C. Using the bulk εr at atomic distances is a rough
//    picture (real water molecules line up one by one), but it gets the story right.
//    1 scene unit = 0.25 nm in that scene.
import { THREE, M, sphere, torus, clamp } from '../kit.js';
import {
  K, GN, QE, MP, ME, KB, G0, TAU, chargeBall, sign, board, panelBg, title, axes, dot, line, text, COL, HEX, force, fitNarrow, focusSwitch,
  reelBoards, inReel, fmtN, sci, si, sup, dots, rng,
  note,
} from '../coulomb.js';

const SX = 40, WX = 80;
const PAIRS = {
  pp: { name: 'two protons', a: 'proton', b: 'proton', m1: MP, m2: MP, s: 1 },
  ee: { name: 'two electrons', a: 'electron', b: 'electron', m1: ME, m2: ME, s: 1 },
  ep: { name: 'electron and proton', a: 'electron', b: 'proton', m1: ME, m2: MP, s: -1 },
};
export const ratio = (p) => (K * QE * QE) / (GN * PAIRS[p].m1 * PAIRS[p].m2);
const E_BODY = 60e3 * (10 / 18.015) * 6.02214076e23;             // electrons in 60 kg of (mostly) water
const F_PEOPLE = (K * (0.01 * E_BODY * QE) ** 2) / 1;             // N, two people 1 m apart, 1% extra electrons each
const Q_MOON = Math.sqrt((GN * 5.972e24 * 7.346e22) / K);        // C on Earth and on Moon to cancel their gravity
// Net push on a charge inside a uniformly charged shell, for a 1 ÷ rⁿ law. Returns { near, far, net }
// in units of k Q q ÷ R²; positive = away from the centre. "near" is the cap beyond the charge.
export function shellForce(s, n, N = 3000) {
  let near = 0, far = 0;
  for (let i = 0; i < N; i++) {
    const u = -1 + ((i + 0.5) / N) * 2, d2 = 1 + s * s - 2 * s * u, f = ((s - u) / Math.pow(d2, (n + 1) / 2)) / N;
    if (u > s) near += f; else far += f;
  }
  return { near, far, net: near + far };
}
const MEDIA = { vac: { name: 'vacuum or air', er: 1 }, oil: { name: 'cooking oil', er: 3 }, water: { name: 'water', er: 78.4 } };
const KT = KB * 298.15;
const ion = (r, er) => { const F = (K * QE * QE) / (er * r * r), U = (K * QE * QE) / (er * r); return { F, U, kT: U / KT, eV: U / QE }; };
const VIEWS = {
  twins: { pos: [0, 3.0, 5.6], target: [0, 2.7, 0], cx: -1.2, cy: 1.7 },
  shell: { pos: [SX + 1.5, 3.0, 5.8], target: [SX + 1.5, 2.7, 0], cx: SX, cy: 1.62 },
  water: { pos: [WX + 0.6, 3.0, 6.2], target: [WX + 0.6, 2.6, 0], cx: WX, cy: 1.7 },
};
const rFmt = (v) => (v >= 1e-2 ? si(v, 'm') : v >= 1e-9 ? si(v, 'm') : sci(v, 1) + ' m');

export default {
  id: 'limits',
  short: 'Limits and a myth',
  title: 'Gravity’s giant twin, and the law’s limits',
  subtitle: 'Same shape as gravity, 10³⁶ times stronger, and tested to sixteen decimal places.',
  view: VIEWS.twins,
  learn: `<p>Coulomb's law and Newton's law of gravity have the <b>same shape</b>: a constant, times two "amounts of stuff", divided by distance squared (see GravityClear). So for any two particles the <b>ratio</b> of the two forces is the same at every distance. For two protons the electric push is <b>1.2 × 10³⁶</b> times their gravitational pull. That is a 1 followed by 36 zeros.</p>
    <p>Then why does gravity run the solar system? Because charge comes in <b>two signs that cancel</b>. A planet has almost exactly as many electrons as protons, so its electric pushes and pulls add to nearly nothing. Mass has only one sign, so gravity always adds up. If two people each had just <b>1% more electrons</b> than protons, the push between them could lift a fair slice of the Earth.</p>
    <p>Is the power really <b>exactly 2</b>? There is a beautiful test. If it is, a charge anywhere <b>inside a charged metal shell</b> feels no force at all: the nearby patch of shell is closer, but the far side has more charge, and the two cancel perfectly. Any other power leaves a force. Henry Cavendish tried it in 1773 and found the power was 2 to within 1 part in 50. James Clerk Maxwell pushed that to 1 in 21,600, Plimpton and Lawton in 1936 to 2 parts in a billion, and by 1971 the test had reached 16 decimal places.</p>
    <p>The law still needs help in three places. It is for charges that are <b>small or spherical, and standing still</b>. <b>Moving</b> charges also make magnetism (see MagnetismClear and FaradayClear). Inside a <b>material</b> the force is weaker, because the material's own charges shift and partly cancel it: water weakens it about <b>80 times</b>, which is why salt falls apart into ions in water but not in oil. And inside an <b>atom</b> the force is still Coulomb's, but the electron obeys quantum rules and does not spiral into the nucleus.</p>
    <p><b>Myth: a car is safe in a thunderstorm because of its rubber tyres.</b> A bolt that has just jumped kilometres of air is not stopped by a few centimetres of rubber. You are safe because the car is a <b>metal shell</b>. Charge stays on the outside of a conductor and the field inside is zero: the shell test again, here called a <b>Faraday cage</b>. Planes are hit about once a year each and fly on. A soft-top or a motorbike gives no such protection (see StormClear).</p>
    <p class="tip"><b>Try it:</b> change the distance between the two protons and watch the ratio stay put. In the shell, slide the power away from 2 and see a force appear. Then drop salt into water.</p>`,
  terms: [
    { t: 'Shell theorem', d: 'For an inverse-square force, a uniform shell pushes on nothing inside it, and acts on things outside as if all its charge were at the centre.' },
    { t: 'Faraday cage', d: 'A closed metal shell or mesh. Charge stays on its outside, so the field inside is zero.' },
    { t: 'Relative permittivity (εr)', d: 'How many times a material weakens the force between charges inside it. About 80 for water.' },
    { t: 'Ion', d: 'An atom with a net charge, such as Na⁺ (one electron missing) or Cl⁻ (one extra).' },
    { t: 'Thermal energy (k_B T)', d: 'The typical energy of random jiggling at temperature T: 4.1 × 10⁻²¹ J at room temperature.' },
    { t: 'Neutral', d: 'Having equal positive and negative charge, so the pushes and pulls on things far away cancel.' },
  ],
  defaults: { focus: 'twins', pair: 'pp', r: 1e-10, pos: 0.5, n: 2, medium: 'water', sep: 0.28 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'twins', label: 'Versus gravity' }, { v: 'shell', label: 'Inside a shell' }, { v: 'water', label: 'Salt in water' }] },
    { key: 'pair', type: 'seg', label: 'Versus gravity: particles', options: [{ v: 'pp', label: 'Two protons' }, { v: 'ee', label: 'Two electrons' }, { v: 'ep', label: 'Electron + proton' }] },
    { key: 'r', type: 'log', label: 'Versus gravity: distance apart', min: 1e-15, max: 1, ends: ['a nucleus', '1 m'], fmt: rFmt },
    { key: 'pos', type: 'range', label: 'Shell: where the charge sits', min: 0, max: 0.9, step: 0.01, ends: ['centre', 'near the wall'], fmt: (v) => Math.round(v * 100) + '% of the way out' },
    { key: 'n', type: 'range', label: 'Shell: the power in the law', min: 1.5, max: 2.5, step: 0.01, ends: ['1 ÷ r¹·⁵', '1 ÷ r²·⁵'], fmt: (v) => '1 ÷ r^' + v.toFixed(2) },
    { key: 'go', type: 'buttons', label: 'Shell', items: [
      { label: 'Exactly 2', act: (s) => { s.focus = 'shell'; s.n = 2; } },
      { label: 'Try 2.2', act: (s) => { s.focus = 'shell'; s.n = 2.2; } },
      { label: 'Try 1.8', act: (s) => { s.focus = 'shell'; s.n = 1.8; } },
    ] },
    { key: 'medium', type: 'seg', label: 'Salt: what surrounds the ions', options: [{ v: 'vac', label: 'Nothing' }, { v: 'oil', label: 'Oil' }, { v: 'water', label: 'Water' }] },
    { key: 'sep', type: 'range', label: 'Salt: distance between the ions', min: 0.28, max: 1, step: 0.01, ends: ['touching', '1 nm'], fmt: (v) => v.toFixed(2) + ' nm' },
  ],
  onChange(s, key) {
    if (key === 'pair' || key === 'r') s.focus = 'twins';
    if (key === 'pos' || key === 'n') s.focus = 'shell';
    if (key === 'medium' || key === 'sep') s.focus = 'water';
  },
  quiz: [
    { q: 'Two protons are moved ten times further apart. What happens to the ratio of their electric push to their gravitational pull?', options: ['It grows 100 times', 'It shrinks 100 times', 'It stays the same', 'It becomes zero'], answer: 2, why: 'Both forces fall as 1 ÷ r², so both drop 100 times and the ratio, about 1.2 × 10³⁶, does not change.' },
    { q: 'If the electric force is so much stronger than gravity, why does gravity rule the planets?', options: ['Electric force stops working over long distances', 'Planets are almost exactly neutral, so their electric forces cancel', 'Gravity gets stronger with distance', 'Planets have no charges in them'], answer: 1, why: 'Positive and negative charges cancel. Mass has only one sign, so the gravity of every atom adds up.' },
    { q: 'Why are you safe from lightning inside a metal car?', options: ['The rubber tyres insulate it', 'The metal body is a shell: charge stays outside and the field inside is zero', 'Lightning cannot hit moving things', 'The car is too low'], answer: 1, why: 'A closed conductor is a Faraday cage. The current runs round the outside of the body. Tyres make no difference to a bolt that has crossed kilometres of air.' },
  ],
  reel: [
    { ms: 5400, caption: 'Electric force has the same shape as gravity, but between two protons it is 10³⁶ times stronger.', set: { focus: 'twins', pair: 'pp' }, anim: { r: [1e-14, 1e-9, true] }, view: { pos: [0, 4.1, 5.0], target: [0, 3.8, 0] }, spin: 0 },
    { ms: 5600, caption: 'Inside a charged shell the pushes cancel exactly, but only if the power is exactly 2. It has been checked to 16 decimal places.', set: { focus: 'shell', pos: 0.55 }, anim: { n: [1.6, 2] }, view: { pos: [SX, 4.1, 5.2], target: [SX, 3.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gT = new THREE.Group(), gS = new THREE.Group(), gW = new THREE.Group();
    gS.position.x = SX; gW.position.x = WX; root.add(gT, gS, gW);

    // ================================================================ electric against gravity
    const Y0 = 1.7, XA = -2.0, XB = -0.45;
    const pa = chargeBall(0.26), pb = chargeBall(0.26); gT.add(pa, pb);
    const aE = [force(HEX.force, 0.03, 0.15), force(HEX.force, 0.03, 0.15)], aG = [force(HEX.grav, 0.02, 0.07), force(HEX.grav, 0.02, 0.07)]; gT.add(...aE, ...aG);
    const lA = stage.label('', [0, 0, 0], gT), lB = stage.label('', [0, 0, 0], gT);
    const lEl = stage.label('', [0, 0, 0], gT, 'hot'), lGr = stage.label('', [0, 0, 0], gT, 'hot');
    lEl.element.style.setProperty('--c', COL.force); lGr.element.style.setProperty('--c', COL.grav);
    const lR = stage.label('', [0, 0, 0], gT);
    let ct = { pair: 'pp', r: 1e-10 };
    const tBoard = board(gT, 2.6, 1.88, 720, 520, (g, w, h) => {
      panelBg(g, w, h); title(g, 'The two forces', 'log scale: each step is 10¹⁰');
      const p = PAIRS[ct.pair], Fe = (K * QE * QE) / ct.r ** 2, Fg = (GN * p.m1 * p.m2) / ct.r ** 2;
      const { X, Y } = axes(g, w, h, { x0: 120, xMax: 3, yMin: -80, yMax: 10, logY: true, xTicks: [], yTicks: [1e-80, 1e-70, 1e-60, 1e-50, 1e-40, 1e-30, 1e-20, 1e-10, 1, 1e10], yFmt: (v) => { const e = Math.round(Math.log10(v)); return e === 0 ? '1 N' : '10' + sup(e) + ' N'; }, yLabel: 'force ↑' });
      const bar = (i, v, col, lab) => { const x = X(0.5 + i * 1.3), y = Y(v); g.fillStyle = col; g.fillRect(x, y, 120, Y(1e-80) - y); text(g, sci(v, 1) + ' N', x - 8, y - 10, '#fff', 'bold 19px sans-serif'); text(g, lab, x + 8, Y(1e-80) + 28, 'rgba(255,255,255,.75)', '18px sans-serif'); };
      bar(0, Fe, COL.force, 'electric'); bar(1, Fg, COL.grav, 'gravity');
      const yA = Y(Fe), yB = Y(Fg), xm = X(0.5 + 1.3) + 60;
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(xm, yA); g.lineTo(xm, yB - 34); g.stroke(); g.setLineDash([]);
      text(g, `× ${sci(Fe / Fg, 2)}`, xm - 70, (yA + yB) / 2 - 8, COL.hot, 'bold 21px sans-serif');
      text(g, 'at every distance', xm - 62, (yA + yB) / 2 + 16, 'rgba(255,255,255,.65)', '16px sans-serif');
    }, [1.75, 2.2, -0.2]);
    tBoard.mesh.rotation.y = -0.2;

    // ================================================================ inside a shell
    const R = 1.35, YS = 1.62;
    const shellM = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), M.clear(0xd9b35a, 0.1)); shellM.position.y = YS; gS.add(shellM);
    const ringS = torus(R, 0.018, M.metal(0xd9b35a, { roughness: 0.3 }), 96); ringS.position.y = YS; ringS.castShadow = false; gS.add(ringS);
    const NS = 220, dN = dots(NS, 0.036, 0xff8a5c, 6, 0.95), dF = dots(NS, 0.036, 0x6aa6ff, 6, 0.95); gS.add(dN, dF);
    const pts = Array.from({ length: NS }, (_, i) => { const u = 1 - (2 * (i + 0.5)) / NS, a = i * 2.39996323, r = Math.sqrt(1 - u * u); return [u, r * Math.cos(a), r * Math.sin(a)]; });   // Fibonacci sphere; u is along x
    const tq = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 14), M.glow(0xffe066)); tq.renderOrder = 11; gS.add(tq);
    const aNear = force(0xff8a5c, 0.022, 0.11), aFar = force(0x6aa6ff, 0.022, 0.11), aNet = force(HEX.force, 0.033, 0.15); gS.add(aNear, aFar, aNet);
    const lNear = stage.label('near patch (orange): close, but small', [0, 0, 0], gS), lFar = stage.label('far side (blue): distant, but big', [0, 0, 0], gS);
    const lNet = stage.label('', [0, 0, 0], gS, 'hot'); lNet.element.style.setProperty('--c', COL.force);
    let cs = { pos: 0.5, n: 2 };
    const sBoard = board(gS, 2.75, 1.7, 760, 470, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Net force inside the shell', 'in units of k Q q ÷ R²');
      const { X, Y } = axes(g, w, h, { x0: 100, xMax: 0.9, yMin: -0.3, yMax: 0.3, xTicks: [0, 0.3, 0.6, 0.9], yTicks: [-0.3, -0.15, 0, 0.15, 0.3], xFmt: (v) => (v === 0 ? 'centre' : v + ' R'), yFmt: (v) => v.toFixed(2).replace('-', '−'), xLabel: 'distance from the centre →', yLabel: 'outward ↑   inward ↓' });
      line(g, [[0, 0], [0.9, 0]], X, Y, '#fff', 3);
      const c = []; for (let x = 0; x <= 0.9001; x += 0.02) c.push([x, clamp(shellForce(x, cs.n, 2400).net, -0.3, 0.3)]);
      line(g, c, X, Y, COL.force, 5);
      dot(g, X(cs.pos), Y(clamp(shellForce(cs.pos, cs.n).net, -0.3, 0.3)), COL.hot, 10);
      text(g, `power = ${cs.n.toFixed(2)}`, X(0.05), Y(0.24), COL.force, 'bold 20px sans-serif');
      text(g, 'white: power exactly 2, no force anywhere', X(0.05), Y(-0.25), '#fff', '16px sans-serif');
    }, [3.3, 2.1, -0.2]);
    sBoard.mesh.rotation.y = -0.22;

    // ================================================================ salt in water
    const YW = 1.7, NM = 4;                                           // NM: scene units per nanometre
    const na = chargeBall(0.3), cl = chargeBall(0.46); na.setCharge(1); cl.setCharge(-1); gW.add(na, cl);
    na.ball.material.color.setHex(0xb48cff); na.ball.material.emissive.setHex(0x6a3fd0); cl.ball.material.color.setHex(0x5fd08a); cl.ball.material.emissive.setHex(0x1f7a45);
    const lNa = stage.label('Na⁺', [0, 0, 0], gW), lCl = stage.label('Cl⁻', [0, 0, 0], gW);
    const aI = [force(HEX.force, 0.03, 0.14), force(HEX.force, 0.03, 0.14)]; gW.add(...aI);
    const NW = 130, wO = dots(NW, 0.12, 0xe5484d, 10, 0.92), wH = dots(NW * 2, 0.075, 0xf2f4f8, 8, 0.92); gW.add(wO, wH);
    const rw = rng(31), mol = Array.from({ length: NW }, () => ({ x: (rw() - 0.5) * 6.2, y: 0.5 + rw() * 2.45, z: (rw() - 0.5) * 1.5 - 0.2, a: rw() * TAU, ph: rw() * TAU }));
    const oilBox = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.7, 1.7), M.clear(0xe8c14a, 0.14)); oilBox.position.set(0, YW, -0.2); gW.add(oilBox);
    const lMed = stage.label('', [0.9, 0.55, 1.0], gW, 'hot'); lMed.element.style.setProperty('--c', COL.good);
    let cw = { medium: 'water', sep: 0.28 };
    const wBoard = board(gW, 2.7, 1.67, 760, 470, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Energy to pull the pair apart', 'against the jiggle of heat');
      const { X, Y } = axes(g, w, h, { x0: 110, xMax: 3.9, yMin: -1, yMax: 3, logY: true, xTicks: [], yTicks: [0.1, 1, 10, 100, 1000], yFmt: (v) => v + ' k_BT', yLabel: 'energy ↑' });
      Object.entries(MEDIA).forEach(([k, m], i) => { const v = ion(cw.sep * 1e-9, m.er).kT, x = X(0.35 + i * 1.2), y = Y(clamp(v, 0.1, 1000)); g.fillStyle = k === cw.medium ? COL.force : 'rgba(255,255,255,.28)'; g.fillRect(x, y, 110, Y(0.1) - y); text(g, v.toFixed(v < 10 ? 1 : 0), x + 30, y - 10, '#fff', 'bold 19px sans-serif'); text(g, m.name, x - 6, Y(0.1) + 28, 'rgba(255,255,255,.75)', '17px sans-serif'); });
      line(g, [[0, 1], [3.9, 1]], X, Y, COL.red, 3, [8, 6]);
      text(g, 'heat’s jiggle: 1 k_BT at 25 °C', X(1.75), Y(1) + 24, COL.red, '16px sans-serif');
    }, [2.55, 4.55, -0.3]);
    wBoard.mesh.rotation.y = -0.12;

    // ================================================================ state
    const show = focusSwitch(stage, { twins: gT, shell: gS, water: gW }, VIEWS);
    let kT = '', kS = '', kW = '', sepNow = 0.28;
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lNear, lFar, lA, lB, lR]);
        reelBoards([[tBoard, [0, 5.9, -0.5], 2.0], [sBoard, [0, 6.6, -0.5], 1.8], [wBoard, [0, 6.5, -1], 1.8]]);
        show(s.focus);

        if (s.focus === 'twins') {
          const p = PAIRS[s.pair], Fe = (K * QE * QE) / (s.r * s.r), Fg = (GN * p.m1 * p.m2) / (s.r * s.r);
          const yy = inReel() ? Y0 + 0.2 : Y0, xa = inReel() ? -0.9 : XA, xb = inReel() ? 0.9 : XB;
          const big = (name) => (name === 'proton' ? 1 : 0.6);
          pa.position.set(xa, yy, 0); pb.position.set(xb, yy, 0);
          pa.setCharge(p.a === 'proton' ? 1 : -1); pb.setCharge(p.b === 'proton' ? 1 : -1);
          pa.scale.setScalar(big(p.a)); pb.scale.setScalar(big(p.b));
          const ra = 0.26 * big(p.a), rb = 0.26 * big(p.b), L = p.s > 0 ? clamp(0.6 + Math.log10(Fe) * 0.008, 0.4, 0.62) : 0.5;
          if (p.s > 0) { aE[0].aim([xa - ra, yy, 0], [-1, 0, 0], L); aE[1].aim([xb + rb, yy, 0], [1, 0, 0], L); }
          else { aE[0].aim([xa + ra, yy, 0], [1, 0, 0], L); aE[1].aim([xb - rb, yy, 0], [-1, 0, 0], L); }
          aG[0].aim([xa + ra, yy - 0.45, 0], [1, 0, 0], 0.1); aG[1].aim([xb - rb, yy - 0.45, 0], [-1, 0, 0], 0.1);
          lA.position.set(xa, yy + 0.5, 0); lA.element.textContent = p.a; lB.position.set(xb, yy + 0.5, 0); lB.element.textContent = p.b;
          lEl.position.set((xa + xb) / 2, yy + 1.0, 0); lEl.element.innerHTML = `electric ${p.s > 0 ? 'push' : 'pull'} <b>${sci(Fe, 2)} N</b>`;
          lGr.position.set((xa + xb) / 2, yy - 0.85, 0); lGr.element.innerHTML = `gravity <b>${sci(Fg, 2)} N</b>: far too small to draw to scale`;
          lR.position.set((xa + xb) / 2, 0.35, 0.4); lR.element.textContent = `not to scale: ${rFmt(s.r)} apart`;
          const kk = `${s.pair}|${s.r.toExponential(3)}`;
          if (kk !== kT) { kT = kk; ct = { pair: s.pair, r: s.r }; tBoard.redraw(); }
        }

        if (s.focus === 'shell') {
          const f = shellForce(s.pos, s.n), x = s.pos * R;
          tq.position.set(x, YS, 0);
          pts.forEach(([u, a, b], i) => { const near = u > s.pos; dN.place(i, u * R, YS + a * R, b * R, near ? 1 : 0.0001); dF.place(i, u * R, YS + a * R, b * R, near ? 0.0001 : 1); }); dN.done(); dF.done();
          const big = Math.max(Math.abs(f.near), Math.abs(f.far), 1e-6), sc = 1.05 / big;
          aNear.aim([x, YS + 0.16, 0], [-1, 0, 0], Math.abs(f.near) * sc);
          aFar.aim([x, YS - 0.16, 0], [1, 0, 0], Math.abs(f.far) * sc);
          const net = f.net, tiny = Math.abs(net) < 1e-4;
          aNet.aim([x, YS, 0.1], [net > 0 ? 1 : -1, 0, 0], tiny ? 0 : Math.max(0.16, Math.abs(net) * sc));
          aNear.visible = aFar.visible = s.pos > 0.005;
          lNear.position.set(R * 0.35, YS + R * 0.62, 0.4); lFar.position.set(-R * 0.25, YS - R * 0.62, 0.4);
          lNet.position.set(x, YS + 0.6, 0.2); lNet.element.innerHTML = tiny ? 'pushes cancel: <b>no force</b>' : `left over: pushed ${net > 0 ? 'to the wall' : 'back to the centre'}`;
          const kk = `${s.pos}|${s.n.toFixed(3)}`;
          if (kk !== kS) { kS = kk; cs = { pos: s.pos, n: s.n }; sBoard.redraw(); }
        }

        if (s.focus === 'water') {
          const med = MEDIA[s.medium], I = ion(s.sep * 1e-9, med.er);
          sepNow += (s.sep - sepNow) * (1 - Math.exp(-dt * 5));
          // thermal jiggle: bigger when the bond is weak compared with k_B T
          const jig = clamp(0.2 / Math.sqrt(I.kT), 0.008, 0.14), jx = Math.sin(time * 7.1) * jig, jy = Math.cos(time * 5.3) * jig;
          const d = sepNow * NM, xa = -d * 0.62 + jx, xb = d * 0.38 - jx * 0.5;
          na.position.set(xa, YW + jy, 0); cl.position.set(xb, YW - jy * 0.5, 0);
          lNa.position.set(xa, YW + 0.55, 0.3); lCl.position.set(xb, YW + 0.72, 0.3);
          const L = clamp(0.2 + Math.log10(I.F / 1e-12) * 0.17, 0.14, 0.9);
          aI[0].aim([xa, YW, 0.5], [1, 0, 0], L); aI[1].aim([xb, YW, 0.62], [-1, 0, 0], L);
          const wet = s.medium === 'water';
          wO.visible = wH.visible = wet; oilBox.visible = s.medium === 'oil';
          if (wet) {
            mol.forEach((m, i) => {
              let x = m.x + Math.sin(time * 1.3 + m.ph) * 0.1, y = m.y + Math.cos(time * 1.1 + m.ph * 2) * 0.1, a = m.a + Math.sin(time * 0.8 + m.ph) * 0.6, hide = false;
              // keep clear of the ions, and turn to face them: O (slightly −) towards Na⁺, H (slightly +) towards Cl⁻
              for (const [ix, iy, ir, isNa] of [[xa, YW, 0.3, true], [xb, YW, 0.46, false]]) {
                const dx = x - ix, dy = y - iy, dz = m.z, dd = Math.hypot(dx, dy, dz), min = ir + 0.17;
                if (dd < min) { const k = min / Math.max(dd, 0.05); x = ix + dx * k; y = iy + dy * k; }
                if (dd < min + 0.5) a = Math.atan2(dy, dx) + (isNa ? 0 : Math.PI);
              }
              if (y < 0.12) hide = true;
              const sc = hide ? 0.0001 : 1, c = Math.cos(a), sn = Math.sin(a);
              wO.place(i, x, y, m.z, sc);
              // the two H sit 0.96 Å from O, 104.5° apart, pointing away along +a
              for (const k of [0, 1]) { const b = a + (k ? 1 : -1) * 0.912, hx = Math.cos(b) * 0.12, hy = Math.sin(b) * 0.12; wH.place(i * 2 + k, x + hx, y + hy, m.z, sc); }
            });
            wO.done(); wH.done();
          }
          lMed.position.x = narrow ? 0 : 0.9;
          lMed.element.innerHTML = I.kT < 5 ? `in ${med.name} heat knocks them apart: <b>salt dissolves</b>` : `in ${med.name}: held <b>${Math.round(I.kT)} times</b> harder than heat can shake`;
          const kk = `${s.medium}|${s.sep}`;
          if (kk !== kW) { kW = kk; cw = { medium: s.medium, sep: s.sep }; wBoard.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'shell') {
          const f = shellForce(s.pos, s.n), z = Math.abs(f.net) < 1e-4;
          return `<div class="big">${z ? 'No force inside' : 'A force appears'}</div>
            <div class="row"><span>Law being tried</span><b>F ∝ 1 ÷ r^${s.n.toFixed(2)}</b></div>
            <div class="row"><span>Push from the near patch</span><b>${Math.abs(f.near).toFixed(3)}</b></div>
            <div class="row"><span>Push from the far side</span><b>${Math.abs(f.far).toFixed(3)}</b></div>
            <div class="row"><span>What is left over</span><b class="${z ? 'ok' : 'no'}">${z ? '0.000' : Math.abs(f.net).toFixed(3) + (f.net > 0 ? ' outward' : ' inward')}</b></div>
            ${note(`Forces in units of k Q q ÷ R². Measured: the power is 2 to within about 3 parts in 10¹⁶ (Williams, Faller and Hill, 1971). This is also why a metal car body shields you.`)}`;
        }
        if (s.focus === 'water') {
          const m = MEDIA[s.medium], I = ion(s.sep * 1e-9, m.er), v = ion(s.sep * 1e-9, 1);
          return `<div class="big">Pull = ${fmtN(I.F)}</div>
            <div class="row"><span>In empty space it would be</span><b>${fmtN(v.F)}</b></div>
            <div class="row"><span>Weakened by ${m.name} (εr)</span><b>÷ ${m.er}</b></div>
            <div class="row"><span>Energy to pull them apart</span><b>${I.eV.toFixed(I.eV < 1 ? 3 : 2)} eV</b></div>
            <div class="row"><span>Compared with heat at 25 °C</span><b class="${I.kT < 5 ? 'ok' : 'no'}">${I.kT.toFixed(I.kT < 10 ? 1 : 0)} × k_BT</b></div>
            ${note(`Na⁺ and Cl⁻ sit 0.28 nm apart in a salt crystal. Water molecules are lopsided in charge and crowd round each ion, cancelling most of its pull. Using the bulk εr this close is a rough picture.`)}`;
        }
        const p = PAIRS[s.pair], Fe = (K * QE * QE) / (s.r * s.r), Fg = (GN * p.m1 * p.m2) / (s.r * s.r);
        return `<div class="big">Electric ÷ gravity = ${sci(Fe / Fg, 2)}</div>
          <div class="row"><span>Electric ${p.s > 0 ? 'push' : 'pull'}, k e² ÷ r²</span><b>${sci(Fe, 2)} N</b></div>
          <div class="row"><span>Gravity, G m₁ m₂ ÷ r²</span><b>${sci(Fg, 2)} N</b></div>
          <div class="row"><span>Distance (${p.name})</span><b>${rFmt(s.r)}</b></div>
          <div class="row"><span>Two people, 1 m apart, 1% extra electrons</span><b>${sci(F_PEOPLE, 1)} N</b></div>
          <div class="row"><span>Charge to cancel the Earth–Moon pull</span><b>${sci(Q_MOON, 1)} C each</b></div>
          ${note(`That push between two people could hold up ${sci(F_PEOPLE / G0, 0)} kg, about a sixth of the Earth. The Earth–Moon charge is the electrons in only about ${Math.round(Q_MOON / 96485 / 1e6 / 10) * 10} tonnes of hydrogen. Matter is neutral to astonishing precision.`)}`;
      },
    };
  },
};
