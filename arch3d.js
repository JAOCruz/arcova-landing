/* =====================================================================
   Arcova — 3D hero: glass rings → blueprint → stone arch → portal.
   Three.js r169 (importmap). Scroll-scrubbed with GSAP ScrollTrigger,
   degrades to the static hero (glass.webp + SVG arc) when WebGL or the
   module fails. All geometry/textures are procedural (no downloads).
   ===================================================================== */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const hero = document.querySelector('.hero');
const host = document.querySelector('.hero .arch3d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mobile = innerWidth < 820 || !fine;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const motion = hasGsap && !reduced;

/* ---------- i18n ---------- */
const T = {
  es: { steps: ['Visión', 'Estructura', 'Realidad'], lab: ['radio 1.00', 'luz 2.00', 'clave', 'altura 2.96'] },
  en: { steps: ['Vision', 'Structure', 'Reality'], lab: ['radius 1.00', 'span 2.00', 'keystone', 'height 2.96'] },
};
const lang = () => (document.documentElement.lang || 'es').startsWith('en') ? 'en' : 'es';

/* ---------- GLSL helpers ---------- */
const NOISE = /* glsl */`
float ah3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float an3(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(ah3(i), ah3(i + vec3(1,0,0)), f.x), mix(ah3(i + vec3(0,1,0)), ah3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(ah3(i + vec3(0,0,1)), ah3(i + vec3(1,0,1)), f.x), mix(ah3(i + vec3(0,1,1)), ah3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float afbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < ${mobile ? 3 : 4}; i++) { s += a * an3(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
`;

function main() {
  if (!hero || !host) return;
  if (!window.WebGL2RenderingContext) throw new Error('no webgl2');
  const canvas = document.createElement('canvas');
  canvas.className = 'arch3d__canvas';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance', stencil: false });
  const gl = renderer.getContext();
  if (!gl) throw new Error('no context');
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setClearColor(0x07070b, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(canvas);

  /* ---------- DOM: labels, steps, flash ---------- */
  host.insertAdjacentHTML('beforeend', `
    <div class="arch3d__labels"></div>
    <div class="arch3d__flash"></div>
    <div class="arch3d__steps">${[0, 1, 2].map(i => `<span data-i="${i}"><b>0${i + 1}</b><i></i></span>`).join('<em>→</em>')}<u><s></s></u></div>`);
  const stepsEl = host.querySelector('.arch3d__steps');
  const stepSpans = [...stepsEl.querySelectorAll('span')];
  const stepBar = stepsEl.querySelector('s');
  const labelsEl = host.querySelector('.arch3d__labels');
  const flashEl = host.querySelector('.arch3d__flash');
  const labelEls = T.es.lab.map(() => { const d = document.createElement('span'); labelsEl.appendChild(d); return d; });
  const applyLang = () => { const t = T[lang()]; stepSpans.forEach((s, i) => (s.querySelector('i').textContent = t.steps[i])); labelEls.forEach((l, i) => (l.textContent = t.lab[i])); };
  applyLang();
  addEventListener('arcova:lang', applyLang);

  /* ---------- Scene ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mobile ? 42 : 38, 1, 0.1, 60);
  const clock = new THREE.Clock();

  // Environment: a "brand room" baked with PMREM (zero download weight)
  const pmrem = new THREE.PMREMGenerator(renderer);
  {
    const env = new THREE.Scene();
    const sky = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP; void main(){ vec3 n = normalize(vP); float h = n.y * 0.5 + 0.5;
        vec3 c = mix(vec3(0.02,0.02,0.04), vec3(0.10,0.06,0.22), smoothstep(0.0,0.45,h));
        c = mix(c, vec3(0.05,0.12,0.30), smoothstep(0.45,0.8,h));
        c += vec3(0.25,0.10,0.55) * smoothstep(0.6,1.0,-n.x) * 0.6;
        c += vec3(0.05,0.55,0.70) * smoothstep(0.6,1.0,n.x) * 0.6;
        gl_FragColor = vec4(c, 1.0); }`
    }));
    env.add(sky);
    const panel = (w, h, col, i, pos, rot) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.material.color.multiplyScalar(i); m.position.set(...pos); m.rotation.set(...rot); env.add(m); };
    panel(12, 4, 0xffffff, 9, [0, 9, 2], [Math.PI / 2, 0, 0]);          // top softbox
    panel(1.2, 14, 0xffffff, 14, [-4, 4, 6], [0, 0.6, 0.2]);
    panel(0.8, 14, 0xffffff, 12, [2, 6, 8], [0, -0.2, 0.5]);           // thin strip (glass highlights)
    panel(1.2, 14, 0xffffff, 12, [5, 3, 5], [0, -0.6, -0.3]);
    panel(8, 8, 0x8b3dff, 3, [-11, 3, -2], [0, Math.PI / 2, 0]);        // purple left
    panel(8, 8, 0x22d3ee, 3, [11, 3, -2], [0, -Math.PI / 2, 0]);        // cyan right
    panel(10, 6, 0x2563eb, 1.5, [0, 3, -12], [0, 0, 0]);                // blue back
    scene.environment = pmrem.fromScene(env, 0.035).texture;
    env.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  }

  /* ---------- Aurora background (screen-space shader plane) ---------- */
  const auroraU = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };
  const aurora = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: auroraU, depthWrite: false, depthTest: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: `uniform float uTime; uniform vec2 uRes;
      float blob(vec2 uv, vec2 c, float r, float asp){ vec2 d = (uv - c) * vec2(asp, 1.0); return exp(-dot(d, d) / (r * r)); }
      void main(){ vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y; float t = uTime * 0.06;
        vec3 c = vec3(0.027, 0.027, 0.043);
        c += vec3(0.36, 0.13, 0.71) * 0.55 * blob(uv, vec2(0.18 + 0.10 * sin(t * 1.3), 0.40 + 0.08 * cos(t)), 0.45, asp);
        c += vec3(0.11, 0.31, 0.85) * 0.50 * blob(uv, vec2(0.86 + 0.10 * cos(t * 0.9), 0.88 + 0.08 * sin(t * 1.1)), 0.45, asp);
        c += vec3(0.02, 0.71, 0.83) * 0.40 * blob(uv, vec2(0.84 + 0.08 * sin(t * 1.7), 0.10 + 0.06 * cos(t * 1.4)), 0.34, asp);
        c += vec3(0.66, 0.33, 0.97) * 0.30 * blob(uv, vec2(0.52 + 0.12 * cos(t * 0.7), 0.58 + 0.1 * sin(t * 0.8)), 0.24, asp);
        c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
        gl_FragColor = vec4(c, 1.0); }`
  }));
  aurora.frustumCulled = false; aurora.renderOrder = -10;
  scene.add(aurora);

  /* ---------- Lights ---------- */
  const key = new THREE.DirectionalLight(0xfff4ea, 1.4); key.position.set(3, 7, 4);
  key.castShadow = !mobile; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -3.2, right: 3.2, top: 4.5, bottom: -1, near: 1, far: 20 });
  scene.add(key, new THREE.AmbientLight(0x6a5bb0, 0.35));
  const rimL = new THREE.SpotLight(0x8b3dff, 0, 20, 0.7, 0.6, 1); rimL.position.set(-4.5, 3.5, -2.5); rimL.target.position.set(0, 1.5, 0);
  const rimR = new THREE.SpotLight(0x22d3ee, 0, 20, 0.7, 0.6, 1); rimR.position.set(4.5, 3.2, -2.5); rimR.target.position.set(0, 1.5, 0);
  const fill = new THREE.PointLight(0x2563eb, 0, 12, 1.6); fill.position.set(0, 1.4, 3.5);
  const keyLight = new THREE.PointLight(0xdff9ff, 0, 8, 1.5); keyLight.position.set(0, 2.5, 0.6);
  scene.add(rimL, rimL.target, rimR, rimR.target, fill, keyLight);

  /* ---------- Arch geometry ---------- */
  const A = { Ri: 1.0, Ro: 1.36, depth: 0.6, pierH: 1.5, N: 15, key: 7 };
  const seed = mulberry(7);
  const stones = [];
  const stoneMats = [];
  const glowCol = new THREE.Color(0x67e8f9);
  const lineCol = new THREE.Color(0x22d3ee);

  function makeStoneMaterial() {
    const u = { uBuild: { value: 0 }, uSeed: { value: new THREE.Vector3(seed() * 10, seed() * 10, seed() * 10) } };
    const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.22, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.15, envMapIntensity: 0.7, iridescence: 0.35, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 420], emissive: 0x000000 });
    m.userData.u = u;
    m.customProgramCacheKey = () => 'arcova-marble';
    m.onBeforeCompile = sh => {
      sh.uniforms.uBuild = u.uBuild; sh.uniforms.uSeed = u.uSeed; sh.uniforms.uGlow = { value: glowCol };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos; uniform float uBuild; uniform vec3 uSeed; uniform vec3 uGlow;\n' + NOISE)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
          vec3 P = vObjPos + uSeed;
          float dn = afbm(P * 2.6);
          float thr = uBuild * 1.25 - 0.12;
          if (dn > thr) discard;
          float glowEdge = smoothstep(thr - 0.14, thr, dn) * (1.0 - step(0.999, uBuild));`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float m = afbm(P * 1.5);
          float v1 = 1.0 - abs(sin((P.x * 0.8 + P.y * 1.3 + P.z * 0.5) * 2.1 + m * 7.5));
          float vein = smoothstep(0.80, 1.0, v1);
          float v2 = 1.0 - abs(sin((P.y * 1.2 - P.z * 0.9 + P.x * 0.3) * 4.2 + m * 9.0));
          float vein2 = smoothstep(0.90, 1.0, v2);
          vec3 base = mix(vec3(0.80, 0.80, 0.86), vec3(0.58, 0.59, 0.70), m * 0.9);
          vec3 veinCol = mix(vec3(0.42, 0.34, 0.70), vec3(0.28, 0.42, 0.82), m);
          diffuseColor.rgb = mix(base, veinCol, clamp(vein * 0.75 + vein2 * 0.4, 0.0, 1.0));`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + vein * 0.22 + m * 0.08, 0.0, 1.0);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlow * glowEdge * 5.0;');
    };
    stoneMats.push(m);
    return m;
  }
  const lineMat = new THREE.LineBasicMaterial({ color: lineCol.clone().multiplyScalar(mobile ? 1 : 1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const lineMatSoft = new THREE.LineBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });

  const extrude = (shape, depth, bevel) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel, bevelThickness: 0.02, bevelSize: 0.018, bevelSegments: mobile ? 1 : 2, curveSegments: 14 });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const addStone = (shape, depth, center, kind, order) => {
    const g = extrude(shape, depth, true);
    const gLine = extrude(shape, depth, false);
    g.computeBoundingBox();
    const c = g.boundingBox.getCenter(new THREE.Vector3());
    g.translate(-c.x, -c.y, -c.z); gLine.translate(-c.x, -c.y, -c.z);
    const mesh = new THREE.Mesh(g, makeStoneMaterial());
    mesh.castShadow = mesh.receiveShadow = !mobile;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(gLine, 12), lineMat);
    gLine.dispose();
    mesh.add(edges);
    const home = new THREE.Vector3(center.x + c.x, center.y + c.y, center.z + c.z);
    stones.push({ mesh, edges, home, kind, order, u: 0 });
    scene.add(mesh);
    return mesh;
  };
  const rect = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.closePath(); return s; };
  // piers
  const pierX = (A.Ri + A.Ro) / 2, pierW = A.Ro - A.Ri + 0.06;
  const plinthH = 0.16, capH = 0.18, shaftH = A.pierH - plinthH - capH;
  const pierOrder = [];
  [-1, 1].forEach((s, i) => {
    pierOrder.push(addStone(rect(pierW + 0.22, plinthH), A.depth + 0.16, new THREE.Vector3(s * pierX, plinthH / 2, 0), 'plinth', 0 + i));
    pierOrder.push(addStone(rect(pierW, shaftH), A.depth, new THREE.Vector3(s * pierX, plinthH + shaftH / 2, 0), 'shaft', 2 + i));
    pierOrder.push(addStone(rect(pierW + 0.16, capH), A.depth + 0.12, new THREE.Vector3(s * pierX, plinthH + shaftH + capH / 2, 0), 'capital', 4 + i));
  });
  // voussoirs
  const keyF = 1.35, aw = Math.PI / (A.N - 1 + keyF), gap = 0.004;
  const C = new THREE.Vector3(0, A.pierH, 0);
  let a0 = 0, keystone = null;
  const vOrder = []; // build order bottom → top alternating
  for (let i = 0; i < A.N; i++) {
    const isKey = i === A.key;
    const a1 = a0 + aw * (isKey ? keyF : 1);
    const ri = isKey ? A.Ri - 0.05 : A.Ri, ro = isKey ? A.Ro + 0.15 : A.Ro;
    const s = new THREE.Shape();
    s.moveTo(ri * Math.cos(a0 + gap), ri * Math.sin(a0 + gap));
    s.absarc(0, 0, ri, a0 + gap, a1 - gap, false);
    s.lineTo(ro * Math.cos(a1 - gap), ro * Math.sin(a1 - gap));
    s.absarc(0, 0, ro, a1 - gap, a0 + gap, true);
    s.closePath();
    const m = addStone(s, isKey ? A.depth + 0.1 : A.depth, C, isKey ? 'keystone' : 'voussoir', 0);
    if (isKey) keystone = stones[stones.length - 1];
    else vOrder.push({ st: stones[stones.length - 1], rank: Math.min(i, A.N - 1 - i) * 2 + (i > A.key ? 1 : 0) });
    a0 = a1;
  }
  vOrder.sort((a, b) => a.rank - b.rank).forEach((o, i) => (o.st.order = 6 + i));
  keystone.order = 99;
  const total = stones.length;

  // scatter poses (exploded diagram) + keystone drop pose
  stones.forEach(st => {
    const r = 2.6 + seed() * 2.2, th = seed() * Math.PI * 2, ph = (seed() - 0.2) * 1.4;
    st.scatter = new THREE.Vector3(Math.cos(th) * Math.cos(ph) * r, 1.4 + Math.sin(ph) * r * 0.8 + 0.4, Math.sin(th) * Math.cos(ph) * r * 0.7 + 0.6);
    st.qScatter = new THREE.Quaternion().setFromEuler(new THREE.Euler((seed() - 0.5) * 3, (seed() - 0.5) * 3, (seed() - 0.5) * 3));
    st.qHome = new THREE.Quaternion();
    st.spin = new THREE.Vector3((seed() - 0.5) * 0.4, (seed() - 0.5) * 0.4, (seed() - 0.5) * 0.4);
    st.ph = seed() * Math.PI * 2;
    if (st.kind === 'keystone') { st.scatter.set(0, 5.4, 0.15); st.qScatter.setFromEuler(new THREE.Euler(0, 0, 0)); }
  });

  /* ---------- Blueprint guides ---------- */
  const guides = new THREE.Group();
  {
    const dashed = new THREE.LineDashedMaterial({ color: 0x9fdcff, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0, depthWrite: false });
    const thin = new THREE.LineBasicMaterial({ color: 0x8b3dff, transparent: true, opacity: 0, depthWrite: false });
    const circle = (r, n = 96) => { const p = []; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; p.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); } return new THREE.BufferGeometry().setFromPoints(p); };
    const line = (pts) => new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
    const addL = (g, m, pos) => { const l = new THREE.Line(g, m); l.computeLineDistances(); if (pos) l.position.copy(pos); guides.add(l); return l; };
    addL(circle(A.Ri), dashed, C); addL(circle(A.Ro), dashed, C); addL(circle(A.Ro + 0.5), dashed, C);
    addL(line([[0, -0.3, 0], [0, 3.6, 0]]), dashed);
    addL(line([[-3.2, A.pierH, 0], [3.2, A.pierH, 0]]), dashed);
    // radial joints
    let a = 0; const segs = [];
    for (let i = 0; i <= A.N; i++) { segs.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * (A.Ro + 0.5), Math.sin(a) * (A.Ro + 0.5), 0)); a += aw * (i === A.key ? keyF : 1); }
    const rad = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), thin); rad.position.copy(C); guides.add(rad);
    // dimension lines
    const dim = new THREE.LineSegments(line([[-A.Ri, -0.32, 0], [A.Ri, -0.32, 0], [-A.Ri, -0.4, 0], [-A.Ri, -0.24, 0], [A.Ri, -0.4, 0], [A.Ri, -0.24, 0],
      [-2.2, 0, 0], [-2.2, A.pierH + A.Ro + 0.15, 0], [-2.28, 0, 0], [-2.12, 0, 0], [-2.28, A.pierH + A.Ro + 0.15, 0], [-2.12, A.pierH + A.Ro + 0.15, 0]]), thin);
    guides.add(dim);
    guides.userData.mats = [dashed, thin];
  }
  scene.add(guides);
  const labelAnchors = [new THREE.Vector3(0.55, A.pierH + 0.55, 0), new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0.05, A.pierH + A.Ro + 0.45, 0), new THREE.Vector3(-2.35, A.pierH + 0.4, 0)];

  /* ---------- Floor ---------- */
  const floorU = { uGrid: { value: 0 }, uGlow: { value: 0 } };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshPhysicalMaterial({ color: 0x0b0b13, roughness: 0.28, metalness: 0.15, envMapIntensity: 0.55, transparent: true }));
  floor.material.onBeforeCompile = sh => {
    sh.uniforms.uGrid = floorU.uGrid; sh.uniforms.uGlow = floorU.uGlow;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; uniform float uGrid; uniform float uGlow;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec2 gv = abs(fract(vWp.xz * 2.0 - 0.5) - 0.5) / fwidth(vWp.xz * 2.0);
        float gl = 1.0 - min(min(gv.x, gv.y), 1.0);
        float rad = length(vWp.xz);
        totalEmissiveRadiance += vec3(0.25, 0.75, 0.95) * gl * uGrid * 0.35 * smoothstep(6.0, 1.0, rad);
        totalEmissiveRadiance += mix(vec3(0.45, 0.20, 0.95), vec3(0.10, 0.55, 0.85), clamp(vWp.x * 0.3 + 0.5, 0.0, 1.0)) * uGlow * 0.16 * smoothstep(3.6, 0.4, rad);`)
      .replace('#include <opaque_fragment>', `#include <opaque_fragment>
        gl_FragColor.a *= smoothstep(9.0, 2.0, length(vWp.xz)) * max(uGrid, uGlow);`);
  };
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !mobile; floor.position.y = -0.001;
  scene.add(floor);

  /* ---------- Glass rings (hero centerpiece) ---------- */
  const rings = new THREE.Group();
  const ringItems = [];
  {
    const stadium = (L, W) => { const s = new THREE.Shape(); const r = W / 2, hx = (L - W) / 2; s.moveTo(-hx, -r); s.lineTo(hx, -r); s.absarc(hx, 0, r, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-hx, r); s.absarc(-hx, 0, r, Math.PI / 2, Math.PI * 1.5, false); return s; };
    const ringGeo = (L, W, wall, h) => {
      const s = stadium(L, W); const holeS = stadium(L - wall * 2, W - wall * 2); const hole = new THREE.Path(); hole.curves = holeS.curves; s.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: mobile ? 2 : 4, curveSegments: mobile ? 18 : 32 });
      g.translate(0, 0, -h / 2); g.computeVertexNormals(); return g;
    };
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8f9ff, roughness: 0.2, metalness: 0, transmission: 1, thickness: 0.5, ior: 1.5, dispersion: mobile ? 0 : 0.55,
      iridescence: 0.55, iridescenceIOR: 1.35, iridescenceThicknessRange: [140, 520], clearcoat: 1, clearcoatRoughness: 0.05,
      envMapIntensity: 2.4, specularIntensity: 1, transparent: true, opacity: 1, side: THREE.DoubleSide, attenuationColor: new THREE.Color(0xd9dcff), attenuationDistance: 1.6
    });
    glassMat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObjPos; varying vec3 vObjN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position; vObjN = normal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vObjPos; varying vec3 vObjN;\n' + NOISE)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          float frost = 1.0 - smoothstep(0.35, 0.75, abs(vObjN.z));
          float grain = ah3(floor(vObjPos * 150.0));
          roughnessFactor = mix(0.05, 0.36 + 0.34 * grain, frost);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(0.9, 0.95, 1.0) * step(0.985, grain) * frost * 0.5;`)
        .replace('material.transmission = transmission;', 'material.transmission = transmission * (1.0 - frost * 0.72);');
    };
    const specs = [[1.05, 1.0], [1.65, 1.0], [2.25, 1.0], [1.75, 1.0], [1.1, 1.0]];
    specs.forEach(([L, W], i) => {
      const t = i / (specs.length - 1);
      const mesh = new THREE.Mesh(ringGeo(L, W, 0.11, 0.55), glassMat);
      const piv = new THREE.Group(); piv.add(mesh); rings.add(piv);
      piv.position.set(0, 0, (t - 0.5) * 4.4);
      mesh.rotation.set(0, 0, -0.35);
      ringItems.push({ piv, mesh, base: piv.position.clone(), ph: seed() * 6.28, dir: new THREE.Vector3(0, 0, (t - 0.5) * 2).normalize() });
    });
    rings.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0.62, -0.5, 0.6).normalize());
    rings.userData.q0 = rings.quaternion.clone();
    rings.position.set(mobile ? 0 : 0.9, mobile ? 2.4 : 1.9, mobile ? 1.6 : 2.3);
    rings.scale.setScalar(mobile ? 0.5 : 0.8);
    scene.add(rings);
  }

  /* ---------- Particles ---------- */
  const dustCount = mobile ? 220 : 650;
  const dust = (() => {
    const pos = new Float32Array(dustCount * 3), rnd = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) { pos.set([(seed() - 0.5) * 9, seed() * 4.2 - 0.2, (seed() - 0.5) * 6], i * 3); rnd.set([seed(), seed(), seed()], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 3));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPr: { value: renderer.getPixelRatio() } },
      vertexShader: `attribute vec3 aRnd; uniform float uTime; uniform float uPr; varying float vA;
        void main(){ vec3 p = position; p.x += sin(uTime * 0.25 + aRnd.x * 6.28) * 0.35; p.y += sin(uTime * 0.18 + aRnd.y * 6.28) * 0.25 + mod(uTime * 0.05 * (0.4 + aRnd.z), 4.4) - 2.2; p.z += cos(uTime * 0.21 + aRnd.z * 6.28) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.2 + aRnd.x * 2.4) * uPr * 12.0 / max(-mv.z, 0.5);
          vA = (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.0 + aRnd.y * 2.0) + aRnd.z * 6.28))) * smoothstep(14.0, 4.0, -mv.z); }`,
      fragmentShader: `varying float vA; uniform float uOpacity; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.05, d); gl_FragColor = vec4(mix(vec3(0.6,0.55,1.0), vec3(0.6,0.95,1.0), vA), a * vA * uOpacity); }` });
    const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return p;
  })();
  const burstCount = mobile ? 180 : 420;
  const burst = (() => {
    const pos = new Float32Array(burstCount * 3), vel = new Float32Array(burstCount * 3), rnd = new Float32Array(burstCount);
    for (let i = 0; i < burstCount; i++) {
      const th = seed() * 6.28, ph = (seed() - 0.5) * Math.PI, sp = 0.8 + seed() * 2.6;
      vel.set([Math.cos(th) * Math.cos(ph) * sp, Math.sin(ph) * sp * 0.6 - 0.4, Math.sin(th) * Math.cos(ph) * sp], i * 3); rnd[i] = seed();
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: -1 }, uOrigin: { value: new THREE.Vector3(0, A.pierH + A.Ri - 0.05, 0) }, uPr: { value: renderer.getPixelRatio() } },
      vertexShader: `attribute vec3 aVel; attribute float aRnd; uniform float uT; uniform vec3 uOrigin; uniform float uPr; varying float vA;
        void main(){ float life = 1.1 + aRnd * 0.9; float t = clamp(uT, 0.0, life); vec3 p = uOrigin + aVel * t * (1.0 - 0.35 * t / life) + vec3(0.0, -2.2, 0.0) * t * t * 0.5;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          float k = 1.0 - t / life; vA = (uT < 0.0 || uT > life) ? 0.0 : k * k;
          gl_PointSize = (2.0 + aRnd * 3.5) * uPr * 12.0 * (0.4 + 0.6 * k) / max(-mv.z, 0.5); }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.1, d); gl_FragColor = vec4(mix(vec3(1.0), vec3(0.45,0.9,1.0), 0.5), a * vA); }` });
    const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return p;
  })();

  /* ---------- Post ---------- */
  let composer = null, bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.6, 0.92);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ---------- Camera keyframes ---------- */
  const KF = mobile ? [
    { p: 0.00, pos: [0.0, 1.9, 10.4], tgt: [0, 1.5, 0], sx: 0, sy: -0.7 },
    { p: 0.22, pos: [1.2, 2.2, 9.6], tgt: [0, 1.5, 0], sx: 0, sy: -0.4 },
    { p: 0.50, pos: [2.2, 1.9, 8.6], tgt: [0, 1.5, 0], sx: 0, sy: 0 },
    { p: 0.74, pos: [0.6, 1.7, 8.0], tgt: [0, 1.5, 0], sx: 0, sy: 0 },
    { p: 0.87, pos: [0.0, 1.5, 6.4], tgt: [0, 1.45, 0], sx: 0, sy: 0 },
    { p: 1.00, pos: [0.0, 1.35, -1.6], tgt: [0, 1.3, -7], sx: 0, sy: 0 },
  ] : [
    { p: 0.00, pos: [0.0, 1.9, 7.6], tgt: [0, 1.55, 0], sx: -1.3, sy: 0 },
    { p: 0.22, pos: [1.4, 2.3, 6.9], tgt: [0, 1.55, 0], sx: -1.0, sy: 0 },
    { p: 0.50, pos: [2.6, 2.0, 5.8], tgt: [0, 1.5, 0], sx: 0, sy: 0 },
    { p: 0.74, pos: [0.9, 1.8, 5.3], tgt: [0, 1.5, 0], sx: 0, sy: 0 },
    { p: 0.87, pos: [0.0, 1.55, 4.7], tgt: [0, 1.45, 0], sx: 0, sy: 0 },
    { p: 1.00, pos: [0.0, 1.35, -1.4], tgt: [0, 1.3, -7], sx: 0, sy: 0 },
  ];
  const ss = x => x * x * (3 - 2 * x);
  const camState = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), sx: 0, sy: 0 };
  function camAt(p) {
    let i = 0; while (i < KF.length - 2 && p > KF[i + 1].p) i++;
    const a = KF[i], b = KF[i + 1], t = ss(THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1));
    camState.pos.fromArray(a.pos).lerp(new THREE.Vector3().fromArray(b.pos), t);
    camState.tgt.fromArray(a.tgt).lerp(new THREE.Vector3().fromArray(b.tgt), t);
    camState.sx = a.sx + (b.sx - a.sx) * t; camState.sy = a.sy + (b.sy - a.sy) * t;
  }

  /* ---------- Story state ---------- */
  const S = { p: 0, intro: 0, ringsOn: 1, lastP: 0, impactAt: -1, shake: 0, view: true };
  window.__arch = S;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = { on: false, x: 0, y: 0, vx: 0, vy: 0, rx: 0, ry: 0, moved: 0 };
  const rng = (a, b, x) => THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeIn = x => x * x * x;
  const BUILD0 = 0.24, BUILD1 = 0.66, WLEN = 0.11, KEY0 = 0.665, KEY1 = 0.745;
  const stagger = (BUILD1 - BUILD0 - WLEN) / (total - 2);
  const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), right = new THREE.Vector3(), upV = new THREE.Vector3(0, 1, 0), tmpV2 = new THREE.Vector3();

  function update(dt, t) {
    const p = S.p;
    const intro = motion ? S.intro : 1;
    // --- rings
    const ringsK = rng(0.0, 0.2, p);
    const ringsVis = 1 - ringsK;
    rings.visible = ringsVis > 0.001 && intro > 0.001;
    if (rings.visible) {
      drag.vx *= 0.94; drag.vy *= 0.94; drag.ry += drag.vx; drag.rx += drag.vy; drag.rx = THREE.MathUtils.clamp(drag.rx, -1, 1);
      tmpQ.setFromEuler(new THREE.Euler(Math.sin(t * 0.14) * 0.06 - ptr.y * 0.22 + drag.rx, Math.sin(t * 0.18) * 0.1 + ptr.x * 0.3 + drag.ry, (1 - easeOut(intro)) * -0.5 + ringsK * 0.6));
      rings.quaternion.copy(tmpQ).multiply(rings.userData.q0);
      const sIn = 0.7 + 0.3 * easeOut(intro);
      rings.scale.setScalar((mobile ? 0.5 : 0.8) * sIn * (1 - 0.2 * ringsK));
      ringItems.forEach((r, i) => {
        const fly = easeIn(ringsK) * 7;
        r.piv.position.copy(r.base).addScaledVector(r.dir, fly);
        r.piv.position.y += Math.sin(t * 0.7 + r.ph) * 0.05; r.piv.position.x += Math.cos(t * 0.5 + r.ph) * 0.04;
        r.mesh.rotation.z = -0.35 + Math.sin(t * 0.3 + r.ph) * 0.05 + ringsK * (i % 2 ? 1.6 : -1.3);
        r.mesh.rotation.x = Math.cos(t * 0.35 + r.ph) * 0.04 + ringsK * 0.8;
      });
      ringItems[0].mesh.material.opacity = intro * (1 - ss(rng(0.35, 1, ringsK)));
    }
    // --- blueprint
    const bp = rng(0.06, 0.22, p) * intro;                  // blueprint in
    const bpOut = 1 - rng(0.5, 0.68, p);                     // blueprint out
    const guideA = bp * bpOut;
    guides.userData.mats[0].opacity = 0.55 * guideA; guides.userData.mats[1].opacity = 0.35 * guideA;
    guides.visible = guideA > 0.002;
    floorU.uGrid.value = bp * (1 - rng(0.62, 0.8, p));
    const real = rng(0.7, 0.86, p);
    floorU.uGlow.value = real;
    floor.visible = (floorU.uGrid.value + real) > 0.002;
    // --- stones
    let lit = 0;
    stones.forEach(st => {
      const isKey = st.kind === 'keystone';
      const w0 = isKey ? KEY0 : BUILD0 + st.order * stagger, w1 = isKey ? KEY1 : w0 + WLEN;
      const u = rng(w0, w1, p);
      st.u = u;
      const e = isKey ? easeIn(u) : easeOut(u);
      const idle = (1 - u) * bp;
      // position
      tmpV.copy(st.scatter).lerp(st.home, e);
      if (!isKey) tmpV.y += Math.sin(u * Math.PI) * 0.35;
      tmpV.x += Math.sin(t * 0.5 + st.ph) * 0.08 * idle; tmpV.y += Math.sin(t * 0.7 + st.ph * 1.3) * 0.1 * idle; tmpV.z += Math.cos(t * 0.6 + st.ph) * 0.06 * idle;
      // pre-blueprint: stones sit further out and are invisible
      tmpV.addScaledVector(tmpV2.copy(st.scatter).sub(C).normalize(), (1 - bp) * 2.5 * (1 - u));
      st.mesh.position.copy(tmpV);
      tmpQ.setFromEuler(new THREE.Euler(st.spin.x * t * idle, st.spin.y * t * idle, st.spin.z * t * idle));
      st.mesh.quaternion.copy(st.qScatter).multiply(tmpQ).slerp(st.qHome, e);
      if (isKey && u >= 1) st.mesh.quaternion.copy(st.qHome);
      const build = ss(rng(0.55, 1, u));
      st.mesh.material.userData.u.uBuild.value = isKey ? (u >= 1 ? 1 : 0.0) + (u < 1 ? ss(rng(0.7, 0.98, u)) * 0.98 : 0) : build;
      st.mesh.visible = bp > 0.001 && (st.mesh.material.userData.u.uBuild.value > 0.001 || bp > 0);
      st.mesh.castShadow = !mobile && build > 0.6;
      st.edges.visible = bp > 0.001;
      st.edges.material = (build > 0.02) ? lineMat : lineMat;
      const lineA = bp * (1 - build) * (0.9 - 0.25 * (1 - bpOut));
      st.edges.userData.a = lineA;
      lit += build;
    });
    lineMat.opacity = Math.max(...stones.map(s => s.edges.userData.a)); // shared; per-stone handled via visibility below
    stones.forEach(st => { st.edges.visible = st.edges.userData.a > 0.01 && bp > 0.001; });
    // impact
    const ku = keystone.u;
    if (ku >= 1 && S.lastP < KEY1 && p >= KEY1 && motion) triggerImpact(t);
    if (p < KEY1 - 0.01) S.impactAt = -1;
    const since = S.impactAt >= 0 ? t - S.impactAt : -1;
    burst.material.uniforms.uT.value = since;
    keyLight.intensity = since >= 0 ? 40 * Math.exp(-since * 4) : 0;
    // lights ramp
    const pre = rng(0.3, 0.7, p) * 0.35;
    rimL.intensity = (pre + real) * 30; rimR.intensity = (pre + real) * 30; fill.intensity = real * 4 + pre * 2;
    key.intensity = 0.7 + 0.9 * (pre / 0.35 * 0.5 + real * 0.5);
    stoneMats.forEach(m => (m.envMapIntensity = 0.5 + real * 0.5));
    // dust
    dust.material.uniforms.uOpacity.value = 0.55 * intro * (0.5 + 0.5 * bp) * (1 - rng(0.9, 1, p));
    dust.material.uniforms.uTime.value = t;
    // --- camera
    camAt(p);
    camera.position.copy(camState.pos);
    camera.lookAt(camState.tgt);
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    const shift = camState.sx * (1 - 0.15 * (1 - intro));
    camera.position.addScaledVector(right, shift).addScaledVector(upV, camState.sy);
    // parallax + shake + idle drift
    const par = 1 - rng(0.9, 1, p);
    camera.position.addScaledVector(right, ptr.x * 0.35 * par).addScaledVector(upV, -ptr.y * 0.22 * par);
    camera.position.x += Math.sin(t * 0.23) * 0.05 * par; camera.position.y += Math.sin(t * 0.31) * 0.03 * par;
    if (since >= 0 && since < 0.8) { const k = Math.exp(-since * 6) * 0.06; camera.position.x += (Math.random() - 0.5) * k; camera.position.y += (Math.random() - 0.5) * k; }
    tmpV.copy(camState.tgt).addScaledVector(right, shift).addScaledVector(upV, camState.sy);
    camera.lookAt(tmpV);
    // final portal fade
    const fade = 1 - rng(0.93, 1, p);
    host.style.opacity = motion ? fade.toFixed(3) : 1;
    // aurora
    auroraU.uTime.value = t;
    // bloom breathing with reality
    if (bloom) bloom.strength = 0.35 + real * 0.2 + (since >= 0 ? Math.exp(-since * 3) * 0.7 : 0);
    // DOM: labels + steps
    updateDom(p, guideA);
  }

  function triggerImpact(t) {
    S.impactAt = t;
    if (window.gsap) {
      gsap.fromTo(flashEl, { opacity: 0.7 }, { opacity: 0, duration: 0.7, ease: 'power2.out' });
    }
  }

  let stepIdx = -1;
  function updateDom(p, guideA) {
    const idx = p < 0.24 ? 0 : p < 0.72 ? 1 : 2;
    if (idx !== stepIdx) { stepIdx = idx; stepSpans.forEach((s, i) => s.classList.toggle('is-on', i === idx)); }
    stepBar.style.transform = `scaleX(${p.toFixed(3)})`;
    labelsEl.style.opacity = guideA.toFixed(3);
    if (guideA > 0.01) {
      const w = host.clientWidth, h = host.clientHeight;
      labelAnchors.forEach((a, i) => {
        tmpV.copy(a).project(camera);
        labelEls[i].style.transform = `translate(${((tmpV.x + 1) / 2 * w).toFixed(1)}px, ${((1 - tmpV.y) / 2 * h).toFixed(1)}px)`;
      });
    }
  }

  /* ---------- Sizing / render loop ---------- */
  function resize() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    composer && composer.setSize(w, h);
    const dpr = renderer.getPixelRatio();
    auroraU.uRes.value.set(w * dpr, h * dpr);
    dust.material.uniforms.uPr.value = burst.material.uniforms.uPr.value = dpr;
  }
  resize();
  addEventListener('resize', resize);

  let raf = 0, running = false;
  const frame = () => {
    raf = 0;
    if (!S.view || document.hidden) { running = false; return; }
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    update(dt, t);
    composer ? composer.render() : renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame); } };
  const io = new IntersectionObserver(en => { S.view = en[0].isIntersecting; if (S.view) start(); }, { threshold: 0 });
  io.observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

  /* ---------- Pointer ---------- */
  if (fine) {
    hero.addEventListener('pointermove', e => { ptr.tx = e.clientX / innerWidth - 0.5; ptr.ty = e.clientY / innerHeight - 0.5; if (drag.on) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.vx = dx * 0.004; drag.vy = dy * 0.003; drag.moved += Math.abs(dx) + Math.abs(dy); } });
    hero.addEventListener('pointerdown', e => { if (e.button !== 0 || e.target.closest('a,button') || !rings.visible) return; drag.on = true; drag.x = e.clientX; drag.y = e.clientY; drag.moved = 0; hero.classList.add('is-dragging'); });
    const up = () => { if (drag.on) { drag.on = false; hero.classList.remove('is-dragging'); } };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
  }

  /* ---------- Scroll story ---------- */
  hero.classList.add('has-3d');
  // Retire the 2D hero bits (SVG arc from arc.js, parallax tweens from main.js)
  document.querySelectorAll('.hero .hero-arc').forEach(el => el.remove());
  if (hasGsap) {
    ScrollTrigger.getAll().forEach(st => { if (st.trigger === hero) { st.animation && st.animation.kill(); st.kill(); } });
    gsap.set(['.hero__title', '.hero__glass'], { clearProps: 'transform,opacity' });
  }
  if (motion) {
    const pinLen = () => Math.round(innerHeight * (mobile ? 2.4 : 2.9));
    // title & copy leave as the blueprint takes over (first ~30% of the pin)
    const tl = gsap.timeline({ paused: true });
    tl.to('.hero__title', { yPercent: -18, opacity: 0, scale: 0.94, ease: 'power2.in', duration: 1 }, 0)
      .to('.hero__top, .hero__bottom', { opacity: 0, y: -20, ease: 'power2.in', duration: 0.8 }, 0)
      .to({}, { duration: 2.4 });
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: () => '+=' + pinLen(), pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 5,
      animation: tl,
      onUpdate: self => { S.lastP = S.p; S.p = self.progress; start(); },
      onRefresh: self => { S.p = self.progress; },
    });
    // intro after the loader (or immediately if it's already gone)
    const introGo = () => gsap.to(S, { intro: 1, duration: 2.4, ease: 'expo.out', delay: 0.1 });
    if (document.body.classList.contains('is-loading')) {
      const mo = new MutationObserver(() => { if (!document.body.classList.contains('is-loading')) { mo.disconnect(); introGo(); } });
      mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      setTimeout(() => { mo.disconnect(); if (S.intro === 0 && !gsap.isTweening(S)) introGo(); }, 5000);
    } else introGo();
    ScrollTrigger.refresh();
  } else {
    // Reduced motion / no GSAP: finished arch, static, title stays legible
    S.p = 0.8; S.intro = 1;
    KF.forEach(k => { k.sx = mobile ? 0 : -1.3; k.sy = mobile ? -0.5 : 0; });
    stepSpans[2].classList.add('is-on');
  }
  // warm up shaders before the loader lifts
  update(0, 0);
  renderer.compile(scene, camera);
  start();
  return true;
}

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

try {
  main();
} catch (e) {
  console.warn('[arcova/arch3d] falling back to the static hero:', e && e.message ? e.message : e);
  hero && hero.classList.remove('has-3d');
  host && (host.innerHTML = '');
}
