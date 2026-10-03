// Chapter 4: Coulomb's law at two very different sizes: a thundercloud and a laser printer.
// 1. Thundercloud. The simplest useful model is two point charges: the main negative charge, −Q, about
//    6 km up, and the upper positive charge, +Q, about 12 km up (heights and tens of coulombs are
//    typical textbook figures, e.g. Rakov & Uman, Lightning: Physics and Effects, 2003, ch. 3; the
//    small lower positive pocket is left out). The ground is a conductor, so its surface charge
//    rearranges until the field meets it at right angles. That is exactly the field you get by adding
//    a mirror-image charge under the ground for each real one (method of images: Griffiths §3.2).
//    At a point on the ground a distance d away, a charge Q at height h and its image give a vertical
//    field 2 k Q h ÷ (h² + d²)^1.5. Under the cloud the negative charge wins and the field points up;
//    further out the higher positive charge wins and it reverses (C.T.R. Wilson's observation). For
//    6 km and 12 km the reversal is 12.2 km out. Real ground fields under storms are 1–10 kV/m,
//    held down by "corona" charge leaking from grass, leaves and masts; the fair-weather field is
//    about 100 V/m, pointing down. Field lines are traced from the four charges (two real, two image)
//    and shown above ground only. A typical flash moves about 15 C (Wikipedia, "Coulomb").
//    1 km = 0.3 scene units.
// 2. Laser printer. Toner is fine plastic powder, about 8 µm across, charged by rubbing to roughly
//    10–30 µC per gram (the usual "tribo" window quoted in toner patents, e.g. US 6,140,003). The
//    drum is charged to about −700 V; where the laser hits it falls to about −150 V; the developer
//    roller sits at −400 V (the figures PrinterClear uses). Across a gap of about 0.25 mm (our
//    assumption for a "jumping" developer) the field is ΔV ÷ gap: 1 MV/m towards the drum over the
//    laser spots, 1.2 MV/m back to the roller elsewhere. Force F = q E, weight m g, with toner
//    density taken as 1,200 kg/m³ (typical for polyester or styrene-acrylic toner; assumption).
//    The crossing time ignores air drag, which in reality slows the grains. 1 scene unit = 78 µm, grains to scale.
import { THREE, M, box, clamp } from '../kit.js';
import {
  K, QE, E_AIR, G0, TAU, fieldLinesFor, fatLines, chargeBall, sign, board, panelBg, title, axes, dot, line, text, COL, HEX,
  force, fitNarrow, focusSwitch, reelBoards, inReel, fmtN, fmtE, fmtQ, asWeight, sci, si, bisect, dots, spark, rng,
  note,
} from '../coulomb.js';

const CX = 60;
const HN = 6000, HP = 12000;                                   // m
// Upward field (V/m) at the ground, d metres from the point under the cloud.
export const groundField = (Q, d) => 2 * K * Q * (HN / Math.pow(HN * HN + d * d, 1.5) - HP / Math.pow(HP * HP + d * d, 1.5));
export const reversal = () => bisect((d) => groundField(1, d), 1000, 40000);
// Laser printer numbers.
const DRUM = { charged: -700, exposed: -150, bias: -400 }, GAP = 0.25e-3, RHO = 1200;
export function toner(dia, qm) {
  const r = (dia * 1e-6) / 2, m = RHO * (4 / 3) * Math.PI * r ** 3, q = qm * 1e-3 * m;          // µC/g = 10⁻³ C/kg
  const Eon = (DRUM.exposed - DRUM.bias) / GAP, Eoff = (DRUM.bias - DRUM.charged) / GAP;
  const F = q * Eon, W = m * G0, a = F / m, t = Math.sqrt((2 * GAP) / a);
  return { m, q, Eon, Eoff, F, Fback: q * Eoff, W, a, t };
}
const vf = (v) => (v < 0 ? '−' : '') + Math.abs(v) + ' V';
const VIEWS = {
  cloud: { pos: [-2.4, 3.4, 7.6], target: [-2.4, 3.0, 0], cx: -2.4, cy: 2.9, nz: 1.1 },
  toner: { pos: [CX, 3.2, 8.4], target: [CX, 2.9, 0], cx: CX, cy: 1.55 },
};

export default {
  id: 'machines',
  short: 'Lightning and printers',
  title: 'From a thundercloud to a speck of toner',
  subtitle: 'The same law works across kilometres of sky and across a quarter of a millimetre.',
  view: VIEWS.cloud,
  learn: `<p>A <b>thundercloud</b> is a giant static machine. Inside it, ice crystals and soft hail collide and swap charge. The light crystals, mostly positive, ride the updraft to the top. The heavier hail, mostly negative, stays in the middle. The cloud ends up with tens of <b>coulombs</b> of negative charge about 6 km up and as much positive charge near 12 km. How the charging works is in StormClear.</p>
    <p>The ground is a <b>conductor</b>, so the cloud's negative charge pushes electrons in the soil away and leaves the ground below <b>positive</b>. Field lines run from that induced charge up to the cloud. Coulomb's law, added up over the cloud's charges, gives a field at the ground of thousands of volts per metre under the storm. Walk away and it weakens, passes through zero about 12 km out, and then points the other way, because the higher positive charge takes over.</p>
    <p>When the field somewhere grows strong enough to break down the air, a channel opens and <b>lightning</b> carries charge to the ground: about 15 coulombs in a typical flash. The pull between the cloud's two charge centres alone is hundreds of kilonewtons.</p>
    <p>Now shrink by a factor of ten million. In a <b>laser printer</b>, toner is a plastic dust with a little negative charge on every grain. The drum is charged all over, then a laser wipes the charge off wherever a dot should print. Across a gap thinner than a fingernail the field is about a <b>million volts per metre</b>. On a toner grain that force is thousands of times its weight, so the grains leap across to the laser spots, and are pushed back everywhere else. Every printed page is drawn by Coulomb's law. The full drum cycle is in PrinterClear.</p>
    <p>The same force is at work in a <b>condenser microphone</b> (MicClear), where sound moves a charged film; in an <b>X-ray tube</b> (XRayClear), where a high voltage hurls electrons at a metal target; in the <b>spark</b> of a gas lighter (ChimneyClear); and in the <b>electrostatic precipitators</b> that pull fly ash out of power-station smoke.</p>
    <p class="tip"><b>Try it:</b> walk the house away from the storm and find where the field flips. Press "Lightning strikes". Then open the printer and change the size of the toner grains: what happens to force ÷ weight?</p>`,
  terms: [
    { t: 'Induced charge', d: 'Charge that gathers on a conductor because another charge is nearby, like the positive ground under a storm.' },
    { t: 'Image charge', d: 'An imaginary mirror charge that gives the same field as the real charge spread over a flat conductor.' },
    { t: 'Volts per metre (V/m)', d: 'The unit of electric field. Dry air breaks down at about 3 million V/m.' },
    { t: 'Toner', d: 'Fine plastic powder, a few micrometres across, that carries charge and is melted onto the paper.' },
    { t: 'Photoconductor', d: 'The drum’s coating: an insulator in the dark that conducts where light falls, letting charge drain away.' },
    { t: 'Charge-to-mass ratio', d: 'How much charge each gram of powder carries. It sets how hard a field can throw the grains.' },
  ],
  defaults: { focus: 'cloud', Q: 40, d: 2, dia: 8, qm: 20 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'cloud', label: 'Thundercloud' }, { v: 'toner', label: 'Laser printer' }] },
    { key: 'Q', type: 'range', label: 'Cloud: charge in each centre', min: 5, max: 100, step: 1, ends: ['5 C', '100 C'], fmt: (v) => '±' + v + ' C' },
    { key: 'd', type: 'range', label: 'Cloud: how far away you stand', min: 0, max: 20, step: 0.1, ends: ['right under', '20 km'], fmt: (v) => v.toFixed(1) + ' km' },
    { key: 'go', type: 'buttons', label: 'Storm', items: [
      { label: 'Lightning strikes', act: (s, inst) => { s.focus = 'cloud'; inst.strike?.(); } },
      { label: 'Find the flip', act: (s) => { s.focus = 'cloud'; s.d = +(reversal() / 1000).toFixed(1); } },
    ] },
    { key: 'dia', type: 'range', label: 'Printer: toner grain size', min: 4, max: 12, step: 0.5, ends: ['4 µm', '12 µm'], fmt: (v) => v.toFixed(1) + ' µm' },
    { key: 'qm', type: 'range', label: 'Printer: charge per gram of toner', min: 5, max: 30, step: 1, ends: ['5 µC/g', '30 µC/g'], fmt: (v) => v + ' µC/g' },
  ],
  onChange(s, key) {
    if (key === 'Q' || key === 'd') s.focus = 'cloud';
    if (key === 'dia' || key === 'qm') s.focus = 'toner';
  },
  quiz: [
    { q: 'A thundercloud has negative charge low down. What does that do to the ground beneath it?', options: ['Makes it negative too', 'Makes it positive, by pushing electrons away', 'Nothing: soil cannot hold charge', 'Makes it magnetic'], answer: 1, why: 'The ground conducts. The cloud’s negative charge repels electrons in the ground, leaving the surface below positively charged. That is induction.' },
    { q: 'In a laser printer, why does toner stick only where the laser has hit the drum?', options: ['The laser melts it on', 'The laser removes charge there, so the field pulls the charged toner across', 'The laser makes the drum sticky', 'Toner is magnetic'], answer: 1, why: 'Light makes the drum’s coating conduct, so the charge drains away at those spots. The field between roller and drum then points the right way to carry toner across.' },
    { q: 'The electric force on a toner grain is thousands of times its weight. Why is it so large?', options: ['Toner is very heavy', 'The grain is tiny, so its weight is tiny, while the field is about a million V/m', 'Gravity is switched off inside a printer', 'The drum spins fast'], answer: 1, why: 'Weight shrinks with the cube of the grain’s size. A field of a million volts per metre on even a few femtocoulombs easily beats it.' },
  ],
  reel: [
    { ms: 5600, caption: 'A thundercloud holds tens of coulombs. The ground below turns positive, and the field builds until lightning strikes.', set: { focus: 'cloud', d: 2 }, anim: { Q: [10, 80] }, act: (s, inst) => inst.strike?.(3.6), view: { pos: [-1.2, 4.4, 5.6], target: [-1.2, 4.0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gT = new THREE.Group();
    gT.position.x = CX; root.add(gS, gT);

    // ================================================================ thundercloud (1 unit = 2 km)
    const KM = 0.3, YN = HN / 1000 * KM, YP = HP / 1000 * KM;
    const land = box(11, 0.06, 4, M.matte(0x3d5a3a, { roughness: 1 })); land.position.set(-2.4, -0.03, 0); gS.add(land);
    const cm = new THREE.MeshStandardMaterial({ color: 0x9aa3b5, transparent: true, opacity: 0.2, roughness: 1, depthWrite: false });
    const rc = rng(21);
    [[0, 1.6, 2.2], [-1.2, 2.0, 1.6], [1.3, 2.1, 1.7], [0, 3.2, 1.9], [-0.3, 4.5, 1.7], [0.2, 5.6, 1.9], [-1.6, 6.3, 1.5], [1.7, 6.4, 1.6], [0, 6.6, 1.8], [3.0, 6.6, 1.1], [-2.9, 6.5, 1.0]].forEach(([x, y, r]) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(r * 0.6, 24, 16), cm); b.position.set(x * 0.6, y * 0.6, -0.5 + (rc() - 0.5) * 0.3); b.scale.y = 0.62; gS.add(b);
    });
    const bN = chargeBall(0.24), bP = chargeBall(0.24); bN.position.set(0, YN, 0); bP.position.set(0, YP, 0); bN.setCharge(-1); bP.setCharge(1); gS.add(bN, bP);
    const linesS = fatLines(stage, HEX.field, { width: 1.8, opacity: 0.7, headSize: 0.16 }); gS.add(linesS);
    {
      const ch = [{ x: 0, y: YN, q: -1 }, { x: 0, y: YP, q: 1 }, { x: 0, y: -YN, q: 1, image: true }, { x: 0, y: -YP, q: -1, image: true }];
      const L = fieldLinesFor(ch, { per: 16, r0: 0.26, step: 0.04, max: 1600, bounds: [-6.6, 1.6, -0.01, 5.6], clip: (x, y) => y < 0 });
      linesS.set(L.map((l) => l.map(([x, y]) => [x, y, 0])), 0.5);
    }
    // induced charge on the ground: a sign every 1.5 km, sized by the local field
    const gSigns = [];
    for (let km = -4.5; km <= 21; km += 1.5) { const p = sign('+', 0.3, '#ff7a7a'), n = sign('−', 0.3, '#6aa6ff'); p.position.set(-km * KM, 0.12, 0.7); n.position.set(-km * KM, 0.12, 0.7); gS.add(p, n); gSigns.push({ km, p, n }); }
    const house = new THREE.Group(); gS.add(house);
    const hb = box(0.26, 0.2, 0.26, M.matte(0xe9dcc3)); hb.position.y = 0.1; house.add(hb);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 4), M.matte(0xb5523b)); roof.position.y = 0.28; roof.rotation.y = Math.PI / 4; house.add(roof);
    const aG = force(HEX.force, 0.03, 0.15); gS.add(aG);
    const lG = stage.label('', [0, 0, 0], gS, 'hot'); lG.element.style.setProperty('--c', COL.force);
    const lN = stage.label('', [0, 0, 0], gS), lP = stage.label('', [0, 0, 0], gS);
    const lInd = stage.label('ground charge, induced by the cloud', [-0.1, -0.22, 1.3], gS);
    const bolt = spark(0xffffff, 18), bolt2 = spark(0xbfdcff, 18); gS.add(bolt, bolt2); bolt.visible = bolt2.visible = false;
    const glowL = new THREE.PointLight(0xcfe3ff, 0, 30); glowL.position.set(-0.3, 1.2, 1.5); gS.add(glowL);
    let cs = { Q: 40, d: 2 };
    const sBoard = board(gS, 3.7, 1.85, 900, 450, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Field at the ground', 'as you walk away from the storm');
      const E0 = groundField(cs.Q, 0) / 1000, yM = Math.max(1, Math.ceil(E0 / 5) * 5);
      const { X, Y } = axes(g, w, h, { x0: 110, xMax: 20, yMin: -yM * 0.25, yMax: yM, xTicks: [0, 5, 10, 15, 20], yTicks: [0, yM / 2, yM], xFmt: (v) => v + ' km', yFmt: (v) => v + ' kV/m', xLabel: 'distance from the cloud →', yLabel: 'upward field ↑' });
      const pts = []; for (let x = 0; x <= 20.01; x += 0.2) pts.push([x, groundField(cs.Q, x * 1000) / 1000]);
      line(g, [[0, 0], [20, 0]], X, Y, 'rgba(255,255,255,.4)', 2);
      line(g, pts, X, Y, COL.force, 5);
      const rv = reversal() / 1000;
      g.strokeStyle = 'rgba(255,255,255,.4)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(rv), Y(yM * 0.45)); g.lineTo(X(rv), Y(0)); g.stroke(); g.setLineDash([]);
      text(g, `flips at ${rv.toFixed(1)} km`, X(rv) - 60, Y(yM * 0.45) - 10, '#fff', '17px sans-serif');
      text(g, 'beyond here the high + charge wins', X(rv) + 14, Y(yM * 0.2), 'rgba(255,255,255,.6)', '16px sans-serif');
      dot(g, X(cs.d), Y(groundField(cs.Q, cs.d * 1000) / 1000), COL.hot, 10);
    }, [-4.35, 1.75, -0.6]);
    sBoard.mesh.rotation.y = 0.12;

    // ================================================================ laser printer (1 unit = 50 µm)
    const GAPU = 3.2, HALFW = 3.6, SPOT = 1.5, UM = GAPU / 250;          // UM: scene units per micrometre
    const roller = box(HALFW * 2, 0.6, 2, M.metal(0x6d7380, { roughness: 0.5 })); roller.position.y = -0.3; gT.add(roller);
    const drumOff = box(HALFW * 2, 0.5, 2, M.plastic(0x2f6f66, { roughness: 0.4 })); drumOff.position.y = GAPU + 0.25; gT.add(drumOff);
    const drumOn = box(SPOT * 2, 0.52, 2.02, M.plastic(0x79d6c4, { roughness: 0.4 })); drumOn.position.y = GAPU + 0.25; gT.add(drumOn);
    const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), M.glow(0xff3b30, { transparent: true, opacity: 0.8 })); laser.position.set(0, GAPU + 1.3, 0); laser.rotation.z = 0.5; laser.position.x = -0.4; gT.add(laser);
    const N = 150, tn = dots(N, 0.05, 0xf2c14e, 10, 1); gT.add(tn);
    const rt = rng(4), grains = Array.from({ length: N }, (_, i) => ({ x: -HALFW + 0.3 + ((i + 0.5) / N) * (HALFW * 2 - 0.6), z: (rt() - 0.5) * 1.6, ph: rt(), y: 0 }));
    const fUp = [-0.8, 0.8].map((x) => { const a = force(HEX.force, 0.035, 0.2); a.aim([x, 0.9, 1.1], [0, 1, 0], 1.5); gT.add(a); return a; });
    const fDn = [-2.9, -2.1, 2.1, 2.9].map((x) => { const a = force(HEX.red, 0.035, 0.2); a.aim([x, 2.5, 1.1], [0, -1, 0], 1.7); gT.add(a); return a; });
    const lDrum = stage.label(`drum, charged: ${vf(DRUM.charged)}`, [-2.6, GAPU + 0.25, 1.1], gT), lSpot = stage.label(`laser spot: ${vf(DRUM.exposed)}`, [0, GAPU + 0.25, 1.1], gT, 'hot'); lSpot.element.style.setProperty('--c', COL.good);
    const lRoll = stage.label(`developer roller: ${vf(DRUM.bias)}`, [0, -0.32, 1.1], gT), lGap = stage.label('gap 0.25 mm', [-HALFW + 0.75, GAPU / 2 + 0.6, 1.1], gT);
    const lTn = stage.label('', [0, 0, 0], gT, 'hot'); lTn.element.style.setProperty('--c', COL.force);
    const lBack = stage.label('pushed back: stays white', [2.5, 0.55, 1.1], gT);
    let ct = toner(8, 20);
    const tBoard = board(gT, 3.0, 1.86, 760, 470, (g, w, h) => {
      panelBg(g, w, h); title(g, 'One toner grain', 'forces, on a log scale');
      const { X, Y } = axes(g, w, h, { x0: 120, xMax: 3, yMin: -14, yMax: -7, logY: true, xTicks: [], yTicks: [1e-14, 1e-12, 1e-10, 1e-8], yFmt: (v) => si(v, 'N'), yLabel: 'force ↑' });
      const bar = (i, v, col, lab) => { const x = X(0.55 + i * 1.25), y = Y(clamp(v, 1e-14, 1e-7)); g.fillStyle = col; g.fillRect(x, y, 110, Y(1e-14) - y); text(g, fmtN(v), x, y - 10, '#fff', 'bold 19px sans-serif'); text(g, lab, x - 6, Y(1e-14) + 28, 'rgba(255,255,255,.75)', '17px sans-serif'); };
      bar(0, ct.F, COL.force, 'electric pull'); bar(1, ct.W, COL.grav, 'its weight');
      text(g, `${fmt(ct.F / ct.W)} times stronger`, X(0.55), 74, COL.hot, 'bold 20px sans-serif');
    }, [2.75, 5.5, -0.3]);
    tBoard.mesh.rotation.y = -0.12;
    function fmt(v) { return Math.round(v).toLocaleString('en-IN'); }

    // ================================================================ state
    const show = focusSwitch(stage, { cloud: gS, toner: gT }, VIEWS);
    let kS = '', kT = '', strikeT = -1, strikeAt = -1, clock = 0, tc = 0;
    return {
      strike(delay = 0) { strikeAt = clock + delay; },
      update(dt, s) {
        dt = Math.max(0, dt); clock += dt;
        const narrow = fitNarrow(stage, [lInd, lP, lDrum, lRoll, lGap, lBack]);
        reelBoards([[sBoard, [-1.2, 7.3, -1], 1.3], [tBoard, [0, 6.6, -1], 1.7]]);
        show(s.focus);

        if (s.focus === 'cloud') {
          const E = groundField(s.Q, s.d * 1000), x = -s.d * KM;
          house.position.set(x, 0, 0.8);
          const L = clamp(0.25 + Math.log10(Math.max(Math.abs(E), 10) / 100) * 0.3, 0.2, 1.0);
          aG.aim([x, E > 0 ? 0.42 : 0.42 + L, 0.8], [0, E > 0 ? 1 : -1, 0], L);
          lG.position.set(x, L + 0.8, 0.8); lG.element.innerHTML = `field here <b>${fmtE(Math.abs(E))}</b>, pointing ${E > 0 ? 'up' : 'down'}`;
          lN.position.set(0.9, YN, 0.4); lN.element.innerHTML = `<b>−${s.Q} C</b>, 6 km up`;
          lP.position.set(0.9, YP, 0.4); lP.element.innerHTML = `<b>+${s.Q} C</b>, 12 km up`;
          const E0 = Math.abs(groundField(s.Q, 0));
          gSigns.forEach(({ km, p, n }) => { const e = groundField(s.Q, Math.abs(km) * 1000), k = clamp(Math.abs(e) / E0, 0, 1), sz = 0.1 + 0.26 * Math.sqrt(k) * clamp(s.Q / 40, 0.5, 1.4); p.visible = e > 0 && k > 0.01; n.visible = e < 0 && k > 0.004; p.scale.setScalar(sz); n.scale.setScalar(sz + 0.06); });
          const sc = clamp(Math.cbrt(s.Q / 40), 0.6, 1.4); bN.scale.setScalar(sc); bP.scale.setScalar(sc);
          // lightning: a short flash from the negative charge to the ground
          if (strikeAt >= 0 && clock >= strikeAt) { strikeT = 0; strikeAt = -1; }
          const on = strikeT >= 0 && strikeT < 0.7;
          if (on) { const seed = 3 + Math.floor(strikeT * 14); bolt.setEnds([-0.1, YN - 0.25, 0.3], [-0.55, 0, 0.5], seed, 0.25); bolt2.setEnds([-0.07, YN - 0.25, 0.3], [-0.52, 0, 0.5], seed, 0.25); glowL.intensity = 40 * (1 - strikeT / 0.7); strikeT += dt; } else { glowL.intensity = 0; if (strikeT >= 0.7) strikeT = -1; }
          bolt.visible = bolt2.visible = on;
          const kk = `${s.Q}|${s.d}`;
          if (kk !== kS) { kS = kk; cs = { Q: s.Q, d: s.d }; sBoard.redraw(); }
        }

        if (s.focus === 'toner') {
          const t = toner(s.dia, s.qm), r = (s.dia / 2) * UM;                 // grain radius in scene units
          // slow motion: one crossing takes about 1.2 s on screen, then the grains wait and the cycle restarts
          tc = (tc + dt) % 4.2;
          grains.forEach((gr, i) => {
            const inSpot = Math.abs(gr.x) < SPOT - 0.15, t0 = gr.ph * 0.9, k = clamp((tc - t0) / 1.2, 0, 1);
            const top = GAPU - r, y = inSpot ? r + (top - r) * Math.min(1, k * k) : r + Math.abs(Math.sin((tc + gr.ph * 4) * 5)) * 0.12 * (1 - Math.min(1, (tc % 1.4))) ;
            gr.y = tc > 3.7 && inSpot ? top : y;
            tn.place(i, gr.x, gr.y, gr.z, r / 0.05);
          });
          tn.done();
          const g0 = grains[Math.floor(N / 2)];
          lTn.position.set(0, 1.9, 1.2); lTn.element.innerHTML = `each toner grain, −${si(t.q, 'C')}: pulled up with <b>${fmtN(t.F)}</b>`;
          laser.visible = tc < 0.9;
          const kk = `${s.dia}|${s.qm}`;
          if (kk !== kT) { kT = kk; ct = t; tBoard.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'toner') {
          const t = toner(s.dia, s.qm);
          return `<div class="big">Pull = ${fmt(t.F / t.W)} × its weight</div>
            <div class="row"><span>Charge on one grain</span><b>${si(t.q, 'C')}, ${fmt(t.q / QE)} electrons</b></div>
            <div class="row"><span>Field over a laser spot (250 V ÷ 0.25 mm)</span><b>${fmtE(t.Eon)}</b></div>
            <div class="row"><span>Electric force, q × E</span><b>${fmtN(t.F)}</b></div>
            <div class="row"><span>Weight of the grain (${si(t.m * 1000, 'g')})</span><b>${fmtN(t.W)}</b></div>
            <div class="row"><span>Time to cross the gap, no air</span><b>${(t.t * 1000).toFixed(2)} ms</b></div>
            ${note(`Where the drum is still at ${vf(DRUM.charged)} the field points the other way (${fmtE(t.Eoff)}) and pushes toner back to the roller. Gap and toner density are typical values.`)}`;
        }
        const E = groundField(s.Q, s.d * 1000), Fc = (K * s.Q * s.Q) / (HP - HN) ** 2, Emid = (2 * K * s.Q) / ((HP - HN) / 2) ** 2;
        return `<div class="big">${fmtE(Math.abs(E))} at the ground</div>
          <div class="row"><span>Direction, ${s.d.toFixed(1)} km away</span><b>${E > 0 ? 'up, to the cloud' : 'down'}</b></div>
          <div class="row"><span>Fair-weather field</span><b>about 100 V/m, down</b></div>
          <div class="row"><span>Pull between the two charge centres</span><b>${fmtN(Fc)} (${asWeight(Fc)})</b></div>
          <div class="row"><span>Field midway between them</span><b>${fmtE(Emid)}</b></div>
          <div class="row"><span>Electrons out of place</span><b>${sci(s.Q / QE, 1)}</b></div>
          ${note(`Two point charges and their mirror images in the ground. Real storms read 1–10 kV/m at the ground: charge leaking from grass and trees screens part of it. Air needs about 3 MV/m to spark: how lightning starts is still studied.`)}`;
      },
    };
  },
};
