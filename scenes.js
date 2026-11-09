import * as THREE from './assets/vendor/three.module.js';
import { OrbitControls } from './assets/vendor/OrbitControls.js';

// Original illustrative miniatures; all geometry and interface textures are local.
const C = { white: 0xf9fcff, porcelain: 0xe6eff8, blue: 0x5598e4, pale: 0xc8def6, glass: 0x89b8e9, ink: 0x234d79, floor: 0xdcecff };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .04, ...extra });
function roundedGeometry(w, h, d, r = .07) {
  r = Math.min(r, w / 2, h / 2);
  const x = -w / 2, y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 5, steps: 1 });
  g.translate(0, 0, -d / 2); return g;
}
function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
const box = (p, w, h, d, m, x = 0, y = 0, z = 0, r = .04) => mesh(p, roundedGeometry(w, h, d, r), m, x, y, z);
const sphere = (p, r, m, x = 0, y = 0, z = 0) => mesh(p, new THREE.SphereGeometry(r, 24, 16), m, x, y, z);
function cylinder(p, r, h, m, x = 0, y = 0, z = 0) { return mesh(p, new THREE.CylinderGeometry(r, r, h, 40), m, x, y, z); }
function rod(p, a, b, radius, material) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
  const m = mesh(p, new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 12), material);
  m.position.copy(start.clone().add(end).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize()); return m;
}
function base(p, w, d, materials) { box(p, w, .2, d, materials.porcelain, 0, -.04, 0, .2); box(p, w -.12, .06, d -.12, materials.white, 0, .09, 0, .18); }
function materials() { return { white: mat(C.white), porcelain: mat(C.porcelain), blue: mat(C.blue), pale: mat(C.pale), glass: mat(C.glass, { metalness: .3, roughness: .25 }), ink: mat(C.ink) }; }

function campus() {
  const group = new THREE.Group(), m = materials(), picks = [], buildings = [];
  base(group, 6.25, 4.65, m);
  box(group, 5.9, .015, .32, m.porcelain, 0, .13, .72);
  box(group, .34, .015, 4.2, m.porcelain, .15, .13, 0);
  function building(name, x, z, w, d, floors) {
    const b = new THREE.Group(); b.position.set(x, .14, z); b.userData.action = name; group.add(b); picks.push(b);
    const bodyMat = m.white.clone(); buildings.push({ b, bodyMat, name });
    const height = floors * .36;
    box(b, w, height, d, bodyMat, 0, height / 2, 0, .07);
    // Repeating recessed glazing and roof cornices give the maquette an architectural scale.
    for (let f = 0; f < floors; f++) {
      const y = .19 + f * .36;
      for (let i = 0; i < Math.floor(w / .25); i++) box(b, .13, .21, .018, m.glass, -w / 2 + .15 + i * .25, y, d / 2 + .011, .008);
      for (let i = 0; i < Math.floor(d / .25); i++) box(b, .018, .21, .13, m.glass, w / 2 + .011, y, -d / 2 + .15 + i * .25, .008);
      box(b, w + .045, .025, d + .04, m.porcelain, 0, (f + 1) * .36, 0, .015);
    }
    box(b, w + .11, .08, d + .11, m.white, 0, height + .06, 0, .06);
    box(b, w * .7, .06, d * .65, m.porcelain, 0, height + .13, 0, .04);
    box(b, .23, .3, .025, m.ink, 0, .15, d / 2 + .03, .015);
    return b;
  }
  building('Library', -1.85, -.72, 1.45, 1.45, 5);
  building('Learning hub', .1, -1.2, 1.6, 1.05, 3);
  building('Research block', 1.9, -.4, 1.2, 1.9, 4);
  // A skybridge connects two blocks above the pedestrian level.
  box(group, 1.03, .25, .36, m.white, -.87, 1.13, -.78, .03);
  box(group, .99, .15, .018, m.glass, -.87, 1.14, -.59, .01);
  for (const [x, z] of [[-2.55, 1.4], [-1.4, 1.65], [-.7, 1.65], [1.25, 1.65], [2.65, 1.2], [2.55, -1.8]]) {
    cylinder(group, .17, .1, m.porcelain, x, .18, z);
    cylinder(group, .025, .28, m.ink, x, .35, z);
    const tree = sphere(group, .2, m.pale, x, .58, z); tree.scale.y = 1.35;
  }
  for (const x of [-1.85, 1.45]) { box(group, .65, .055, .2, m.white, x, .32, 1.35); for (const dx of [-.23, .23]) box(group, .035, .17, .14, m.ink, x + dx, .22, 1.35); }
  // A sculptural sundial in the courtyard, with a circular inset plaza.
  cylinder(group, .58, .02, m.porcelain, -.2, .15, .4);
  const sundial = mesh(group, new THREE.TorusGeometry(.28, .025, 10, 48), m.blue, -.2, .54, .4); sundial.rotation.y = .4; sundial.rotation.z = -.35;
  rod(group, [-.2, .18, .4], [-.2, .34, .4], .035, m.white);
  const route = new THREE.Group(); group.add(route);
  const doors = { Library: [-1.85, .19, .05], 'Learning hub': [.1, .19, -.61], 'Research block': [1.9, .19, .6] };
  function select(name) {
    for (const item of buildings) item.bodyMat.color.setHex(item.name === name ? 0xe1efff : C.white);
    while (route.children.length) { const old = route.children[0]; route.remove(old); old.geometry?.dispose(); }
    const end = doors[name], points = [[.15, .19, 2.15], [.15, .19, .72], [end[0], .19, .72], end].map(p => new THREE.Vector3(...p));
    mesh(route, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, 'catmullrom', .05), 50, .025, 8, false), m.blue);
    sphere(route, .065, m.blue, ...points[0].toArray()); sphere(route, .07, m.blue, ...end);
    return `Route to ${name.toLowerCase()} · illustrative campus model`;
  }
  select('Library');
  return { group, picks, height: 7.15, width: 8.5, target: .85, label: 'Interactive 3D campus maquette. Select a building to change the route.', actions: ['Library', 'Learning hub', 'Research block'], action: select };
}

function interfaceTexture(mode = 'Evidence') {
  const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 600;
  const c = canvas.getContext('2d'); c.fillStyle = '#f8fbff'; c.fillRect(0, 0, 960, 600);
  c.fillStyle = '#e7f0fc'; c.fillRect(0, 0, 195, 600);
  c.fillStyle = '#285b92'; c.font = '600 27px sans-serif'; c.fillText('EvoScreen', 25, 58);
  c.font = '19px sans-serif'; ['Overview', 'Video review', 'Evidence', 'Report'].forEach((s, i) => { c.fillStyle = i === 2 ? '#337fd0' : '#647f9c'; c.fillText(s, 27, 135 + i * 60); });
  c.fillStyle = '#183b62'; c.font = '600 34px sans-serif'; c.fillText(mode === 'Agents' ? 'Specialist consultation' : 'Evidence, in context', 235, 65);
  if (mode === 'Agents') {
    ['Development', 'Communication', 'Behavior', 'Caregiver support'].forEach((s, i) => {
      const x = 235 + (i % 2) * 340, y = 110 + Math.floor(i / 2) * 210;
      c.fillStyle = '#eaf3ff'; c.fillRect(x, y, 310, 180); c.fillStyle = '#5b98de'; c.beginPath(); c.arc(x + 36, y + 40, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#234f7e'; c.font = '600 22px sans-serif'; c.fillText(s, x + 20, y + 90); c.fillStyle = '#aac7e6'; c.fillRect(x + 20, y + 116, 240, 6); c.fillRect(x + 20, y + 137, 170, 6);
    });
  } else {
    c.fillStyle = '#bad7f4'; c.fillRect(235, 105, 390, 250); c.fillStyle = '#eef6ff'; c.beginPath(); c.arc(430, 207, 42, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(418, 185); c.lineTo(451, 207); c.lineTo(418, 229); c.fillStyle = '#588dc4'; c.fill();
    c.font = '20px sans-serif'; c.fillStyle = '#406d9e'; c.fillText('Video observation', 258, 327);
    c.fillStyle = '#e8f1fc'; c.fillRect(650, 105, 265, 250); c.fillStyle = '#234f7e'; c.font = '600 23px sans-serif'; c.fillText('Linked evidence', 670, 145);
    for (let i = 0; i < 5; i++) { c.fillStyle = i === 1 ? '#74a8e3' : '#bed4ed'; c.fillRect(670, 175 + i * 32, i % 2 ? 177 : 215, 8); }
    c.fillStyle = '#d9e9fa'; c.fillRect(235, 397, 680, 12); c.fillStyle = '#4e93dd'; c.fillRect(235, 397, 260, 12);
    for (let i = 0; i < 5; i++) { c.fillStyle = '#78a9df'; c.fillRect(265 + i * 128, 385, 3, 36); }
    c.fillStyle = '#486c93'; c.font = '21px sans-serif'; c.fillText('Observe', 235, 465); c.fillText('Review', 500, 465); c.fillText('Report', 790, 465);
  }
  c.font = '17px sans-serif'; c.fillStyle = '#829bb6'; c.fillText('Illustrative interface study', 235, 560);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
function workspace() {
  const group = new THREE.Group(), m = materials(); base(group, 5.4, 3.8, m);
  // A substantial worktop, metal legs, main display, and a second open laptop.
  box(group, 4.65, .12, 2.65, m.white, 0, .93, -.1, .16);
  for (const x of [-1.95, 1.95]) for (const z of [-1.05, .85]) cylinder(group, .045, .76, m.porcelain, x, .49, z);
  const monitor = new THREE.Group(); monitor.position.set(.1, 1.02, -.67); group.add(monitor); monitor.userData.action = 'Evidence';
  box(monitor, .7, .07, .4, m.porcelain, 0, .02, .1); box(monitor, .13, .5, .12, m.porcelain, 0, .27, 0);
  box(monitor, 2.8, 1.82, .12, m.ink, 0, 1.25, 0, .1);
  const displayMat = new THREE.MeshBasicMaterial({ map: interfaceTexture() });
  mesh(monitor, new THREE.PlaneGeometry(2.62, 1.64), displayMat, 0, 1.25, .065);
  box(group, 1.8, .035, .56, m.porcelain, .1, 1.02, .65, .06);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 12; i++) box(group, .105, .015, .075, m.white, -.64 + i * .13, 1.045, .48 + j * .11, .01);
  const mouse = sphere(group, .15, m.porcelain, 1.45, 1.04, .7); mouse.scale.set(.7, .28, 1);
  const laptop = new THREE.Group(); laptop.position.set(-1.67, 1.02, .06); laptop.rotation.y = .25; group.add(laptop); laptop.userData.action = 'Agents';
  box(laptop, 1.05, .05, .76, m.porcelain, 0, 0, .12, .05);
  const lid = new THREE.Group(); lid.position.set(0, .035, -.22); lid.rotation.x = -.16; laptop.add(lid);
  box(lid, 1.05, .77, .045, m.ink, 0, .38, 0, .045);
  const laptopMaterial = new THREE.MeshBasicMaterial({ map: interfaceTexture('Agents') });
  mesh(lid, new THREE.PlaneGeometry(.95, .65), laptopMaterial, 0, .38, .025);
  // A porcelain assistant on the desk makes the human–AI theme tangible.
  const bot = new THREE.Group(); bot.position.set(1.78, 1.03, -.08); group.add(bot); bot.userData.action = 'Agents';
  const botBody = sphere(bot, .22, m.white, 0, .22, 0); botBody.scale.y = 1.15;
  box(bot, .49, .34, .34, m.white, 0, .58, 0, .12); box(bot, .35, .16, .025, m.glass, 0, .6, .177, .06);
  for (const x of [-.09, .09]) sphere(bot, .025, m.ink, x, .6, .197);
  cylinder(bot, .11, .025, m.blue, 0, .015, 0); rod(bot, [0, .74, 0], [0, .86, 0], .013, m.porcelain); sphere(bot, .035, m.blue, 0, .89, 0);
  // A report folio and pen beside the screen.
  box(group, .57, .045, .74, m.pale, 1.8, 1.02, .83, .035); box(group, .5, .02, .64, m.white, 1.8, 1.053, .83, .02);
  rod(group, [1.64, 1.08, .75], [1.91, 1.08, 1.03], .018, m.blue);
  return { group, picks: [monitor, laptop, bot], height: 5.8, width: 7.4, target: 1.1, label: 'Interactive 3D research workspace with a monitor, laptop, and assistant. Select evidence or agents to change the screen.', actions: ['Evidence', 'Agents'], action(mode) { displayMat.map.dispose(); displayMat.map = interfaceTexture(mode); displayMat.needsUpdate = true; monitor.userData.action = mode === 'Evidence' ? 'Agents' : 'Evidence'; return `${mode === 'Evidence' ? 'Video-linked evidence' : 'Four specialist agents'} · illustrative interface study`; } };
}

function avatar() {
  const group = new THREE.Group(), m = materials();
  cylinder(group, 1.48, .14, m.porcelain, 0, .02, 0); cylinder(group, 1.39, .035, m.white, 0, .11, 0);
  const ring = mesh(group, new THREE.TorusGeometry(1.22, .015, 8, 80), m.blue, 0, .135, 0); ring.rotation.x = Math.PI / 2;
  const person = new THREE.Group(); person.position.y = .15; person.userData.action = 'Wave'; group.add(person);
  // A volumetric articulated mannequin, with joint pivots rather than a line skeleton.
  const torso = mesh(person, new THREE.LatheGeometry([new THREE.Vector2(.25, 1.45), new THREE.Vector2(.31, 1.55), new THREE.Vector2(.34, 1.8), new THREE.Vector2(.46, 2.25), new THREE.Vector2(.4, 2.38), new THREE.Vector2(.18, 2.5)], 40), m.white);
  torso.scale.z = .68;
  const pelvis = sphere(person, .32, m.porcelain, 0, 1.45, 0); pelvis.scale.set(1.1, .65, .68);
  cylinder(person, .115, .17, m.porcelain, 0, 2.55, 0);
  const head = sphere(person, .36, m.white, 0, 2.97, .015); head.scale.set(.84, 1.14, .88);
  const visor = box(person, .46, .13, .075, m.glass, 0, 3, .303, .065);
  for (const x of [-.1, .1]) sphere(person, .025, m.ink, x, 3, .348);
  sphere(person, .045, m.porcelain, 0, 2.86, .333).scale.set(.5, .6, .4);
  const limbs = {};
  function limb(side, type, x, y, length, radius) {
    const joint = new THREE.Group(); joint.position.set(x, y, 0); person.add(joint);
    sphere(joint, radius * 1.03, m.blue);
    mesh(joint, new THREE.CapsuleGeometry(radius, length - 2 * radius, 8, 16), m.white, 0, -length / 2, 0);
    const lower = new THREE.Group(); lower.position.y = -length; joint.add(lower); sphere(lower, radius * .8, m.pale);
    const lowerLength = type === 'arm' ? .49 : .64;
    mesh(lower, new THREE.CapsuleGeometry(radius * .77, lowerLength - radius * 1.54, 8, 16), m.white, 0, -lowerLength / 2, 0);
    if (type === 'arm') { const hand = sphere(lower, radius * .85, m.porcelain, 0, -lowerLength - .04, .015); hand.scale.y = 1.35; }
    else box(lower, .25, .13, .43, m.porcelain, 0, -lowerLength, .1, .065);
    limbs[side + type] = { joint, lower };
  }
  limb('left', 'arm', -.47, 2.3, .58, .14); limb('right', 'arm', .47, 2.3, .58, .14);
  limb('left', 'leg', -.21, 1.4, .61, .18); limb('right', 'leg', .21, 1.4, .61, .18);
  // A miniature motion-capture camera accompanies the avatar.
  const camera = new THREE.Group(); camera.position.set(-1.15, .2, .45); camera.rotation.y = -.4; group.add(camera);
  rod(camera, [0, 0, 0], [0, .92, 0], .025, m.ink);
  for (const [x, z] of [[-.24, .18], [.24, .18], [0, -.25]]) rod(camera, [0, .55, 0], [x, 0, z], .018, m.porcelain);
  box(camera, .32, .22, .22, m.ink, 0, 1.04, 0, .045); const lens = cylinder(camera, .075, .14, m.blue, .04, 1.04, .16); lens.rotation.x = Math.PI / 2;
  let state = 'Idle';
  return { group, picks: [person], height: 4.65, width: 4.35, target: 1.65, label: 'Interactive articulated 3D digital human and capture camera. Choose idle, wave, or walk.', actions: ['Idle', 'Wave', 'Walk'], action(name) { state = name; return `${name === 'Idle' ? 'Standing' : name === 'Wave' ? 'Waving' : 'Walking'} · articulated avatar study`; }, tick(t) {
    const wave = state === 'Wave', walk = state === 'Walk';
    person.position.y = .15 + (walk ? Math.abs(Math.sin(t * 3.5)) * .035 : .008 * Math.sin(t * 1.5));
    limbs.rightarm.joint.rotation.z = wave ? 2.1 : -.08; limbs.rightarm.lower.rotation.z = wave ? .65 + Math.sin(t * 5) * .2 : .08;
    limbs.leftarm.joint.rotation.z = .08;
    limbs.leftleg.joint.rotation.x = walk ? Math.sin(t * 3.5) * .45 : 0;
    limbs.rightleg.joint.rotation.x = walk ? -Math.sin(t * 3.5) * .45 : 0;
    limbs.leftleg.lower.rotation.x = walk ? Math.max(0, -Math.sin(t * 3.5)) * .5 : 0;
    limbs.rightleg.lower.rotation.x = walk ? Math.max(0, Math.sin(t * 3.5)) * .5 : 0;
    limbs.leftarm.joint.rotation.x = walk ? -Math.sin(t * 3.5) * .3 : 0;
    limbs.rightarm.joint.rotation.x = walk ? Math.sin(t * 3.5) * .3 : 0;
  } };
}

const builders = { campus, workspace, avatar };
class SceneView {
  constructor(element) {
    this.element = element; this.models = {}; this.visible = true; this.kind = element.dataset.scene;
    this.scene = new THREE.Scene(); this.dirty = true;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.18;
    this.canvas = this.renderer.domElement; this.canvas.tabIndex = 0; this.canvas.setAttribute('role', 'img'); element.append(this.canvas);
    this.camera = new THREE.OrthographicCamera(-4, 4, 4, -4, .1, 50);
    this.controls = new OrbitControls(this.camera, this.canvas); this.controls.enableDamping = true; this.controls.dampingFactor = .09;
    this.controls.addEventListener('change', () => { this.dirty = true; });
    this.controls.enablePan = false; this.controls.enableZoom = false; this.controls.minZoom = .65; this.controls.maxZoom = 1.85;
    this.controls.minPolarAngle = .25; this.controls.maxPolarAngle = Math.PI / 2.1;
    this.canvas.style.touchAction = 'pan-y';
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9dbfe2, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.4); key.position.set(-3, 8, 5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .5, far: 20 }); key.shadow.normalBias = .025; key.shadow.bias = -.0002; this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xb2d6ff, 1.7); rim.position.set(4, 4, -4); this.scene.add(rim);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .08 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.16; ground.receiveShadow = true; this.scene.add(ground);
    this.createUI(); this.switch(this.kind);
    new ResizeObserver(() => this.resize()).observe(element);
    this.canvas.addEventListener('pointerdown', e => { this.start = [e.clientX, e.clientY]; this.canvas.focus({ preventScroll: true }); this.controls.enableZoom = true; });
    this.canvas.addEventListener('blur', () => { this.controls.enableZoom = false; });
    this.canvas.addEventListener('pointerup', e => {
      if (!this.start || Math.hypot(e.clientX - this.start[0], e.clientY - this.start[1]) > 6) return;
      const rect = this.canvas.getBoundingClientRect(); const pointer = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      const ray = new THREE.Raycaster(); ray.setFromCamera(pointer, this.camera);
      const hit = ray.intersectObjects(this.active.picks, true)[0]; if (!hit) return;
      let target = hit.object; while (target && !target.userData.action) target = target.parent;
      if (target) this.perform(target.userData.action);
    });
    this.canvas.addEventListener('keydown', e => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); this.active.group.rotation.y += e.key === 'ArrowLeft' ? -.15 : .15; }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); this.camera.zoom = Math.min(1.85, this.camera.zoom + .1); this.camera.updateProjectionMatrix(); }
      if (e.key === '-') { e.preventDefault(); this.camera.zoom = Math.max(.65, this.camera.zoom - .1); this.camera.updateProjectionMatrix(); }
      if (e.key.toLowerCase() === 'r') this.reset();
      this.dirty = true;
    });
    this.canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.renderer.setAnimationLoop(null); element.dataset.ready = 'false'; this.status.textContent = '3D preview paused. Reload to try again.'; });
    this.renderer.setAnimationLoop(time => {
      if (!this.visible || document.hidden) return;
      const changed = this.controls.update();
      const animated = this.kind === 'avatar' && !reducedMotion.matches;
      if (animated) this.active.tick?.(time / 1000);
      if (this.dirty || changed || animated) { this.renderer.render(this.scene, this.camera); this.dirty = false; }
    });
    element.dataset.ready = 'true';
  }
  createUI() {
    const toolbar = document.createElement('div'); toolbar.className = 'scene-toolbar'; toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', '3D scene controls');
    this.actionBar = document.createElement('div'); this.actionBar.className = 'scene-actions'; toolbar.append(this.actionBar);
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'scene-reset'; reset.textContent = 'Reset view'; reset.addEventListener('click', () => this.reset()); toolbar.append(reset);
    this.element.after(toolbar); this.toolbar = toolbar;
    const hint = document.createElement('p'); hint.className = 'scene-hint mono'; hint.textContent = 'DRAG TO ORBIT · SELECT TO EXPLORE'; toolbar.after(hint);
    this.status = document.createElement('p'); this.status.className = 'scene-status'; this.status.setAttribute('role', 'status'); hint.after(this.status);
  }
  switch(kind) {
    if (this.active) this.scene.remove(this.active.group);
    this.kind = kind; this.element.dataset.scene = kind;
    this.active = this.models[kind] ||= builders[kind](); this.scene.add(this.active.group);
    this.canvas.setAttribute('aria-label', this.active.label + ' Arrow keys rotate, plus and minus zoom, R resets.');
    this.actionBar.replaceChildren();
    this.active.actions.forEach(name => { const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.setAttribute('aria-pressed', String(name === this.active.actions[0])); b.addEventListener('click', () => this.perform(name)); this.actionBar.append(b); });
    this.perform(this.active.actions[0]); this.reset();
  }
  perform(name) { this.dirty = true; this.status.textContent = this.active.action(name); this.actionBar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === name))); this.element.dataset.action = name; this.active.tick?.(0); }
  reset() {
    this.active.group.rotation.set(0, 0, 0); this.camera.position.set(6, 5.1, 7); this.camera.zoom = 1;
    this.controls.target.set(0, this.active.target, 0); this.camera.lookAt(this.controls.target); this.controls.update(); this.resize();
  }
  resize() {
    const w = this.element.clientWidth, h = this.element.clientHeight; if (!w || !h) return;
    const aspect = w / h, half = Math.max(this.active.height / 2, this.active.width / (2 * aspect)); Object.assign(this.camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half });
    this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h, false); this.dirty = true;
  }
}
const instances = new Map();
const observer = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    let view = instances.get(target);
    if (isIntersecting && !view && target.dataset.failed !== 'true') {
      try { view = new SceneView(target); instances.set(target, view); }
      catch (error) { target.dataset.ready = 'false'; target.dataset.failed = 'true'; console.warn('3D preview unavailable:', error.message); }
    }
    if (view) { view.visible = isIntersecting; if (isIntersecting) view.dirty = true; }
  });
}, { rootMargin: '250px' });
document.querySelectorAll('.scene-viewport').forEach(el => observer.observe(el));
const heroElement = document.querySelector('[data-hero]');
const diagramButtons = [...document.querySelectorAll('[data-diagram]')];
const scenes = { 'human-ai': ['workspace', '01', 'A workspace for people, evidence, and specialist agents.'], spatial: ['campus', '02', 'An architectural study. Select a building to trace a route.'], avatar: ['avatar', '03', 'An articulated digital human. Try a wave or a walk.'] };
document.querySelector('.diagram-controls').hidden = false;
diagramButtons.forEach(button => button.addEventListener('click', () => {
  const [kind, index, caption] = scenes[button.dataset.diagram]; const view = instances.get(heroElement); if (view) view.switch(kind);
  else heroElement.dataset.scene = kind;
  diagramButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  document.querySelector('.visual-index').textContent = `STUDY ${index}`; document.querySelector('.diagram-caption').textContent = caption;
}));
document.addEventListener('visibilitychange', () => { instances.forEach(v => { v.dirty = true; if (document.hidden) v.controls.enableZoom = false; }); });
reducedMotion.addEventListener('change', () => instances.forEach(v => { v.active.tick?.(0); v.dirty = true; }));
