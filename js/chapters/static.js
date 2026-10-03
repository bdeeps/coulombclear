// Chapter 3: static electricity you can try at home.
// 1. Two rubbed balloons hung from one hook. Each balloon (mass m, the rubber: about 3 g) hangs on a
//    thread of length L and carries charge q. Three forces balance on each: weight m g, the thread's
//    tension, and Coulomb's push F = k q² ÷ d², with d = 2 L sin θ between the centres. So
//    tan θ = F ÷ (m g), solved here by bisection. This is the classic school way to estimate the
//    charge on a balloon; results are typically 0.1 to 1 µC. A uniformly charged ball acts like a
//    point charge at its centre; a real rubbed patch is not uniform, so treat the numbers as
//    estimates. Rubber has about 0.56 mol of electrons per gram (isoprene C₅H₈: 38 electrons per
//    68 g/mol), which gives the "one electron in so many" figure. 1 scene unit = 0.4 m.
// 2. The winter zap. Walking on a carpet rubs your soles against it and charges your body. The body
//    behaves like a capacitor of about 150 pF (IEC 61000-4-2 human-body model: 150 pF, 330 Ω;
//    JEDEC uses 100 pF, 1.5 kΩ). Typical voltages from the ESD Association's widely quoted table:
//    walking across carpet 35,000 V at 10–25% relative humidity and 1,500 V at 65–90%; walking over
//    vinyl tile 12,000 V and 250 V. We join those two ends with a straight line on a log scale
//    between 20% and 75% humidity: the end points are the quoted figures, the curve between is our
//    interpolation. Charge Q = C V, energy ½ C V². People do not usually feel a discharge below about
//    3,000 V (Wikipedia, "Static electricity"). The spark jumps when the field in the gap reaches
//    about 3 MV/m, so the gap is roughly V ÷ 3 MV/m: a rough figure, since the field at a fingertip
//    is not uniform. The spark is drawn far bigger than life. 1 scene unit = 1 m.
import { THREE, M, box, beam, sphere, clamp } from '../kit.js';
import {
  K, QE, E_AIR, G0, coulomb, board, panelBg, title, axes, dot, line, text, COL, HEX, force, fitNarrow, focusSwitch, reelBoards, inReel,
  fmtN, fmtQ, fmtV, sci, si, bisect, makePerson, dots, spark, rng,
  note,
} from '../coulomb.js';

const CX = 40;
const RBAL = 0.12;                                   // balloon radius, m
// Angle (rad) each thread makes with the vertical.
export function hangAngle(q, L, m) {
  const c = (K * q * q) / (4 * L * L * m * G0);
  const th = c <= 0 ? 0 : bisect((t) => Math.sin(t) ** 2 * Math.tan(t) - c, 1e-6, 1.55);
  return Math.max(th, Math.asin(Math.min(1, RBAL / L)));          // they cannot pass through each other
}
const C_BODY = 150e-12;
const FLOORS = { carpet: { name: 'nylon carpet', hi: 35000, lo: 1500 }, vinyl: { name: 'vinyl tile', hi: 12000, lo: 250 } };
export function bodyVolts(rh, floor) {
  const f = FLOORS[floor], k = clamp((rh - 20) / 55, 0, 1);
  return f.hi * Math.pow(f.lo / f.hi, k);
}
const VIEWS = {
  balloons: { pos: [-2.05, 3.0, 6.6], target: [-2.05, 2.6, 0], cx: 0, cy: 2.9 },
  zap: { pos: [CX + 0.4, 1.9, 4.6], target: [CX + 0.4, 1.55, 0], cx: CX + 0.4, cy: 1.1 },
};

export default {
  id: 'static',
  short: 'Static at home',
  title: 'Balloons, jumpers and the winter zap',
  subtitle: 'Rubbing moves electrons. Coulomb’s law does the rest.',
  view: VIEWS.balloons,
  learn: `<p>Everything is made of atoms, and atoms hold equal amounts of positive and negative charge. Rub two different materials together and some <b>electrons</b> cross from one to the other. One side ends up with a few extra electrons (negative), the other with a few missing (positive). Nothing is created: charge is only <b>moved</b>. This is <b>static electricity</b>.</p>
    <p>Rub two balloons on your hair and hang them from one hook. Both took electrons from the hair, so both are negative, and <b>like charges repel</b>. They hang apart at the angle where Coulomb's push, the balloon's weight and the pull of the thread balance. Measure the gap and you can work out the charge: usually a few tenths of a <b>microcoulomb</b>. That is trillions of electrons, yet only a few out of every trillion in the rubber.</p>
    <p>Whether the charge <b>stays</b> depends on the material. In a <b>conductor</b>, such as a metal or your salty, watery body, charge moves freely. In an <b>insulator</b>, such as rubber, plastic, dry hair or dry air, it is stuck where it is put. That is why a balloon can hold its charge and a metal spoon in your hand cannot.</p>
    <p>Now the zap. In a dry <b>Delhi winter</b> you walk across a carpet in rubber-soled shoes, or pull off a polyester jumper. Your body, a conductor standing on insulating soles, collects charge it cannot get rid of. It can reach <b>tens of thousands of volts</b>. Reach for a metal door handle and, a few millimetres away, the air gives up: a <b>spark</b> jumps and all the charge flows out in a millionth of a second.</p>
    <p>In the monsoon it almost never happens. Damp air leaves a thin film of water on every surface, which turns poor insulators into slow conductors, so the charge <b>leaks away</b> as fast as you make it. The same breakdown of air, on a vastly bigger scale, is lightning (next chapter, and StormClear).</p>
    <p class="tip"><b>Try it:</b> rub more charge onto the balloons and watch the gap grow. Then walk to the door on a dry winter day and in the monsoon. Hold a key and see why it stops the sting.</p>`,
  terms: [
    { t: 'Static electricity', d: 'Charge that has built up on something and is not flowing away.' },
    { t: 'Electron', d: 'The tiny negative particle that moves when things are rubbed. Its charge is 1.602 × 10⁻¹⁹ C.' },
    { t: 'Conductor', d: 'A material that lets charge move freely: metals, salty water, the human body.' },
    { t: 'Insulator', d: 'A material that holds charge in place: rubber, plastic, glass, dry air.' },
    { t: 'Triboelectric effect', d: 'Charging by contact and rubbing. Which material gains electrons depends on the pair.' },
    { t: 'Breakdown', d: 'When a field is strong enough (about 3 million V/m in air) to turn an insulator into a conductor: a spark.' },
    { t: 'Conservation of charge', d: 'Charge is never made or destroyed, only moved from place to place.' },
  ],
  defaults: { focus: 'balloons', q: 500, L: 1, m: 3, rh: 25, floor: 'carpet', key: false },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'balloons', label: 'Two balloons' }, { v: 'zap', label: 'The winter zap' }] },
    { key: 'q', type: 'range', label: 'Balloons: charge on each', min: 0, max: 1000, step: 10, ends: ['none', '1 µC'], fmt: (v) => '−' + v + ' nC' },
    { key: 'L', type: 'range', label: 'Balloons: thread length', min: 0.5, max: 1.5, step: 0.05, ends: ['0.5 m', '1.5 m'], fmt: (v) => v.toFixed(2) + ' m' },
    { key: 'm', type: 'range', label: 'Balloons: mass of each', min: 2, max: 6, step: 0.5, ends: ['2 g', '6 g'], fmt: (v) => v.toFixed(1) + ' g' },
    { key: 'rh', type: 'range', label: 'Zap: humidity of the air', min: 10, max: 90, step: 1, ends: ['10% dry', '90% damp'], fmt: (v) => v + '%' },
    { key: 'floor', type: 'seg', label: 'Zap: floor', options: [{ v: 'carpet', label: 'Nylon carpet' }, { v: 'vinyl', label: 'Vinyl tile' }] },
    { key: 'key', type: 'toggle', label: 'Zap: hold a metal key', hint: 'The spark jumps to the key, not to one spot of skin.' },
    { key: 'go', type: 'buttons', label: 'Weather', items: [
      { label: 'Dry Delhi winter, 25%', act: (s) => Object.assign(s, { focus: 'zap', rh: 25 }) },
      { label: 'Monsoon, 85%', act: (s) => Object.assign(s, { focus: 'zap', rh: 85 }) },
    ] },
  ],
  onChange(s, key) {
    if (['q', 'L', 'm'].includes(key)) s.focus = 'balloons';
    if (['rh', 'floor', 'key'].includes(key)) s.focus = 'zap';
  },
  quiz: [
    { q: 'You rub a balloon on your hair and it becomes negatively charged. Where did the charge come from?', options: ['It was created by the rubbing', 'Electrons moved from the hair to the balloon', 'Protons left the balloon', 'It came from the air'], answer: 1, why: 'Rubbing only moves electrons. The balloon gains some and becomes negative; the hair loses the same number and becomes positive. Total charge is conserved.' },
    { q: 'Why are static shocks common in a dry winter and rare in the monsoon?', options: ['Cold makes more electrons', 'Damp air leaves a thin conducting film of water, so charge leaks away', 'Rain washes charge off', 'Carpets are thicker in winter'], answer: 1, why: 'Humidity makes surfaces slightly conducting. The charge drains away as it forms, so your body never reaches a high voltage.' },
    { q: 'Two charged balloons hang 40 cm apart. You double the charge on both. What happens to the push between them at that distance?', options: ['It doubles', 'It stays the same', 'It becomes four times as big', 'It halves'], answer: 2, why: 'F = k q₁ q₂ ÷ r². Doubling both charges multiplies q₁ × q₂ by four. (The balloons then swing further apart until the forces balance again.)' },
  ],
  reel: [
    { ms: 5200, caption: 'Rub two balloons on your hair. Both gain electrons, and like charges push apart.', set: { focus: 'balloons', L: 1, m: 3 }, anim: { q: [0, 900] }, view: { pos: [0, 4.4, 5.2], target: [0, 4.0, 0] }, spin: 0 },
    { ms: 5600, caption: 'On a dry winter day a walk across a carpet can charge you to 30,000 volts. Then: zap.', set: { focus: 'zap', rh: 25, floor: 'carpet', key: false }, act: (s, inst) => inst.restartZap(), view: { pos: [CX + 0.4, 2.2, 4.4], target: [CX + 0.4, 1.9, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gB = new THREE.Group(), gZ = new THREE.Group();
    gZ.position.x = CX; root.add(gB, gZ);

    // ================================================================ balloons
    const U = 2.5, HY = 4.7;                                            // scene units per metre; hook height
    const rail = beam([-1.3, HY, 0], [1.3, HY, 0], 0.03, M.metal(0x8c95a3)); gB.add(rail);
    const hook = sphere(0.05, M.metal(0xd8dde6), 16); hook.position.y = HY; gB.add(hook);
    const cols = [0xe0453a, 0x2f8fd6];
    const bal = [0, 1].map((i) => {
      const g = new THREE.Group();
      const b = sphere(RBAL * U, M.plastic(cols[i], { roughness: 0.25 }), 40); b.scale.y = 1.18; g.add(b);
      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 12), M.plastic(cols[i])); knot.position.y = RBAL * U * 1.18 + 0.03; g.add(knot);
      const sg = dots(14, 0.022, 0xffffff, 6, 0.9); g.add(sg); g.signs = sg;
      gB.add(g); return g;
    });
    const thr = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 6), M.matte(0xe8e8e8)); gB.add(m); return m; });
    const aE = [force(HEX.force, 0.022, 0.11), force(HEX.force, 0.022, 0.11)], aW = [force(HEX.grav, 0.022, 0.11), force(HEX.grav, 0.022, 0.11)], aT = [force(0xffffff, 0.016, 0.09), force(0xffffff, 0.016, 0.09)];
    gB.add(...aE, ...aW, ...aT);
    const lD = stage.label('', [0, 0, 0], gB, 'hot'); lD.element.style.setProperty('--c', COL.force);
    const lW = stage.label('weight', [0, 0, 0], gB), lT = stage.label('thread', [0, 0, 0], gB), lE = stage.label('electric push', [0, 0, 0], gB);
    const rs = rng(5), sp = Array.from({ length: 14 }, () => { const u = rs() * 2 - 1, a = rs() * Math.PI * 2, r = Math.sqrt(1 - u * u); return [r * Math.cos(a), u * 1.18, r * Math.sin(a)]; });
    let cb = { q: 500, L: 1, m: 3 };
    const bBoard = board(gB, 3.0, 1.82, 760, 460, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Gap between the balloons', 'against the charge on each');
      const { L, m, q } = cb, dOf = (qq) => 2 * L * Math.sin(hangAngle(qq * 1e-9, L, m / 1000));
      const { X, Y } = axes(g, w, h, { x0: 96, x1: w - 56, xMax: 1000, yMax: 1.6, xTicks: [0, 250, 500, 750, 1000], yTicks: [0, 0.4, 0.8, 1.2, 1.6], xFmt: (v) => v + ' nC', yFmt: (v) => v.toFixed(1) + ' m', xLabel: 'charge on each balloon →', yLabel: 'centre-to-centre gap ↑' });
      const pts = []; for (let x = 0; x <= 1000; x += 10) pts.push([x, dOf(x)]);
      line(g, pts, X, Y, COL.force, 5);
      line(g, [[0, 2 * RBAL], [1000, 2 * RBAL]], X, Y, 'rgba(255,255,255,.35)', 2, [6, 6]);
      text(g, 'touching', X(760), Y(2 * RBAL) - 8, 'rgba(255,255,255,.55)', '16px sans-serif');
      dot(g, X(q), Y(dOf(q)), COL.hot, 10);
    }, [-3.8, 1.35, 0.2]);
    bBoard.mesh.rotation.y = 0.2;

    // ================================================================ the zap
    const carpet = box(5.2, 0.06, 2.2, M.matte(0x7a3b46, { roughness: 1 })); carpet.position.set(0.4, 0.03, 0); gZ.add(carpet);
    const DOORX = 2.6, HX = DOORX - 0.2, HYZ = 1.16, HZ = 0.22;
    const door = box(0.08, 2.1, 1.1, M.matte(0x9a7b55, { roughness: 0.7 })); door.position.set(DOORX, 1.11, 0.1); gZ.add(door);
    const frame = box(0.12, 2.25, 0.08, M.matte(0x5d4630)); frame.position.set(DOORX, 1.18, -0.5); gZ.add(frame);
    gZ.add(beam([DOORX - 0.04, HYZ, HZ], [HX, HYZ, HZ], 0.02, M.metal(0xd8dde6)));
    const handle = sphere(0.045, M.metal(0xe6ebf2), 20); handle.position.set(HX, HYZ, HZ); gZ.add(handle);
    const you = makePerson({ shirt: 0xd9762b }); gZ.add(you);
    const keyM = box(0.14, 0.012, 0.035, M.metal(0xd9b35a)); you.arms[1].add(keyM); keyM.position.set(0, -0.72, 0); keyM.rotation.z = Math.PI / 2;
    const chg = dots(40, 0.028, 0xffe066, 6, 0.95); gZ.add(chg);
    const rc = rng(9), cpos = Array.from({ length: 40 }, () => [(rc() - 0.5) * 0.42, 0.25 + rc() * 1.45, (rc() - 0.5) * 0.5]);
    const zap = spark(0xdff3ff, 12), zap2 = spark(0x9fd8ff, 12); gZ.add(zap, zap2);
    const flash = new THREE.PointLight(0xbfe6ff, 0, 4); flash.position.set(HX - 0.1, HYZ, HZ); gZ.add(flash);
    const lV = stage.label('', [0, 0, 0], gZ, 'hot'); lV.element.style.setProperty('--c', COL.force);
    const lHandle = stage.label('metal handle: a conductor', [DOORX - 0.35, HYZ - 0.35, HZ + 0.3], gZ), lSole = stage.label('rubber soles: insulators', [0, 0, 0], gZ);
    let cz = { rh: 25, floor: 'carpet' };
    const zBoard = board(gZ, 2.25, 1.36, 760, 460, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Voltage on your body', 'after a walk');
      const { X, Y } = axes(g, w, h, { x0: 104, xMin: 10, xMax: 90, yMin: 2, yMax: 5, logY: true, xTicks: [10, 30, 50, 70, 90], yTicks: [100, 1000, 10000, 100000], xFmt: (v) => v + '%', yFmt: (v) => fmtV(v), xLabel: 'relative humidity →', yLabel: 'volts ↑' });
      for (const f of ['carpet', 'vinyl']) { const pts = []; for (let x = 10; x <= 90; x += 1) pts.push([x, bodyVolts(x, f)]); line(g, pts, X, Y, f === cz.floor ? COL.force : 'rgba(255,255,255,.3)', f === cz.floor ? 5 : 3); }
      text(g, 'carpet', X(12), Y(35000) - 12, cz.floor === 'carpet' ? COL.force : 'rgba(255,255,255,.5)', '17px sans-serif');
      text(g, 'vinyl tile', X(12), Y(12000) + 26, cz.floor === 'vinyl' ? COL.force : 'rgba(255,255,255,.5)', '17px sans-serif');
      line(g, [[10, 3000], [90, 3000]], X, Y, COL.red, 2, [8, 6]);
      text(g, 'below about 3,000 V you feel nothing', X(36), Y(3000) + 24, COL.red, '16px sans-serif');
      dot(g, X(cz.rh), Y(bodyVolts(cz.rh, cz.floor)), COL.hot, 10);
    }, [1.95, 3.05, -0.6]);
    zBoard.mesh.rotation.y = -0.15;

    // ================================================================ state
    const show = focusSwitch(stage, { balloons: gB, zap: gZ }, VIEWS);
    let kB = '', kZ = '', th = 0.1, zt = 0, lastV = 0;
    const X0 = -1.9, X1 = HX - 0.62;                                  // walk from, and stop where the fingertip is just short of the handle
    const restartZap = () => { zt = 0; };
    return {
      restartZap,
      update(dt, s) {
        dt = Math.max(0, dt);
        const narrow = fitNarrow(stage, [lW, lT, lE, lHandle, lSole]);
        reelBoards([[bBoard, [0, 7.3, -0.5], 1.5], [zBoard, [0.4, 3.8, -0.6], 1.85]]);
        show(s.focus);

        if (s.focus === 'balloons') {
          const q = s.q * 1e-9, m = s.m / 1000, target = hangAngle(q, s.L, m);
          th += (target - th) * (1 - Math.exp(-dt * 3.5));
          const F = coulomb(q, q, 2 * s.L * Math.sin(th)), W = m * G0, Lu = s.L * U;
          bal.forEach((b, i) => {
            const sg = i ? 1 : -1, x = sg * Lu * Math.sin(th), y = HY - Lu * Math.cos(th);
            b.position.set(x, y, 0); b.rotation.z = sg * th;
            // thread from the hook to the knot
            const kx = x - sg * Math.sin(th) * (RBAL * U * 1.18 + 0.07), ky = y + Math.cos(th) * (RBAL * U * 1.18 + 0.07);
            const len = Math.hypot(kx, HY - ky); thr[i].scale.y = len; thr[i].position.set(kx / 2, (HY + ky) / 2, 0); thr[i].rotation.z = sg * th;
            const nS = Math.round((s.q / 1000) * 14);
            sp.forEach((p, k) => b.signs.place(k, p[0] * RBAL * U * 1.01, p[1] * RBAL * U * 1.01, p[2] * RBAL * U * 1.01, k < nS ? 1 : 0.0001)); b.signs.done();
            const sc = 0.7 / W;
            aW[i].aim([x, y, 0.4], [0, -1, 0], 0.7);
            aE[i].aim([x, y, 0.4], [sg, 0, 0], Math.min(1.5, F * sc));
            aT[i].aim([x, y, 0.4], [-sg * Math.sin(th), Math.cos(th), 0], Math.min(1.7, Math.hypot(F, W) * sc));
          });
          const p1 = bal[1].position;
          lD.position.set(0, p1.y - 1.05, 0.5); lD.element.innerHTML = s.q ? `<b>${(2 * s.L * Math.sin(th)).toFixed(2)} m</b> apart, push <b>${fmtN(F)}</b>` : 'no charge: they hang together';
          lW.position.set(p1.x + 0.4, p1.y - 0.6, 0.5); lT.position.set(p1.x + 0.35, p1.y + 0.85, 0.5); lE.position.set(p1.x + Math.min(1.5, F * 0.7 / W) + 0.2, p1.y + 0.25, 0.5);
          lE.visible = !narrow && s.q > 0;
          const kk = `${s.q}|${s.L}|${s.m}`;
          if (kk !== kB) { kB = kk; cb = { q: s.q, L: s.L, m: s.m }; bBoard.redraw(); }
        }

        if (s.focus === 'zap') {
          // a loop: walk 3.2 s (charging), reach 0.9 s, spark 0.35 s, rest 1.6 s, then start again
          const Vmax = bodyVolts(s.rh, s.floor), T = 6.4;
          zt = (zt + dt) % T;
          const walk = clamp(zt / 3.2, 0, 1), reach = clamp((zt - 3.2) / 0.9, 0, 1), sparkT = zt - 4.1, after = sparkT > 0;
          const x = X0 + (X1 - X0) * walk;
          you.position.set(x, 0.06, 0);
          const sw = walk < 1 ? Math.sin(zt * 9) * 0.5 : 0;
          you.legs[0].rotation.z = sw; you.legs[1].rotation.z = -sw;
          you.arms[0].rotation.z = -sw * 0.6; you.arms[1].rotation.z = walk < 1 ? sw * 0.6 : 1.1 * (reach * reach * (3 - 2 * reach));
          keyM.visible = !!s.key;
          const V = after ? 0 : Vmax * (1 - Math.exp(-walk * 3.5)) / (1 - Math.exp(-3.5));
          lastV = V;
          const nC = Math.round(clamp(Math.log10(Math.max(V, 100) / 100) / Math.log10(350), 0, 1) * 40);
          cpos.forEach((p, i) => chg.place(i, x + p[0], 0.06 + p[1], p[2], i < nC ? 1 : 0.0001)); chg.done();
          const tip = [x + 0.62 + (s.key ? 0.07 : 0), HYZ, HZ], on = sparkT > 0 && sparkT < 0.3 && Vmax > 300;
          zap.visible = zap2.visible = on; flash.intensity = on ? Math.min(6, Vmax / 4000) * (1 - sparkT / 0.3) : 0;
          if (on) { const seed = 1 + Math.floor(sparkT * 40); const big = Math.min(1, Vmax / 20000); zap.setEnds([tip[0] - 0.1, tip[1] + 0.02, tip[2]], [HX - 0.03, HYZ, HZ], seed, 0.5 + big); zap2.setEnds([tip[0] - 0.1, tip[1] - 0.02, tip[2]], [HX - 0.03, HYZ, HZ], seed + 7, 0.3 + big); }
          lV.position.set(x, 2.0, 0); lV.element.innerHTML = after ? (Vmax >= 3000 ? (s.key ? 'spark to the key: no sting' : 'zap!') : 'too little to feel') : `your body: <b>${fmtV(V)}</b>`;
          lSole.position.set(x, -0.12, 0.5);
          const kk = `${s.rh}|${s.floor}`;
          if (kk !== kZ) { kZ = kk; cz = { rh: s.rh, floor: s.floor }; zBoard.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'zap') {
          const V = bodyVolts(s.rh, s.floor), Q = C_BODY * V, E = 0.5 * C_BODY * V * V, gap = (V / E_AIR) * 1000, feel = V >= 3000;
          return `<div class="big">Up to ${fmtV(V)} on you</div>
            <div class="row"><span>Right now</span><b>${fmtV(lastV)}</b></div>
            <div class="row"><span>Charge stored (150 pF body)</span><b>${fmtQ(Q)}</b></div>
            <div class="row"><span>Energy in the spark</span><b>${si(E, 'J')}</b></div>
            <div class="row"><span>Spark jumps a gap of about</span><b>${gap < 1 ? gap.toFixed(2) : gap.toFixed(1)} mm</b></div>
            <div class="row"><span>Do you feel it?</span><b class="${feel ? 'no' : 'ok'}">${feel ? (s.key ? 'the key takes it' : 'yes: ouch') : 'no, under 3,000 V'}</b></div>
            ${note(`Voltages at the dry and damp ends are the ESD Association’s typical figures for walking on ${FLOORS[s.floor].name}; the curve between is an estimate. High voltage, tiny charge: startling, not dangerous.`)}`;
        }
        const q = s.q * 1e-9, m = s.m / 1000, t = hangAngle(q, s.L, m), d = 2 * s.L * Math.sin(t), F = coulomb(q, q, d), n = q / QE, frac = n / (s.m * 0.56 * 6.022e23);
        return `<div class="big">${s.q ? d.toFixed(2) + ' m apart' : 'Hanging together'}</div>
          <div class="row"><span>Each thread leans</span><b>${((t * 180) / Math.PI).toFixed(1)}°</b></div>
          <div class="row"><span>Push, k q² ÷ d²</span><b>${fmtN(F)}</b></div>
          <div class="row"><span>Weight of a balloon</span><b>${fmtN(m * G0)}</b></div>
          <div class="row"><span>Extra electrons on each</span><b>${s.q ? sci(n, 1) : '0'}</b></div>
          <div class="row"><span>Share of the rubber’s electrons</span><b>${s.q ? '1 in ' + sci(1 / frac, 1) : 'none'}</b></div>
          ${note(`tan(lean) = push ÷ weight. Measure the gap at home and you can work backwards to the charge.`)}`;
      },
    };
  },
};
