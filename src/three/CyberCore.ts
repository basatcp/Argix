import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { drawIconCanvas, radialGlowCanvas, type ModuleIcon } from './icons';

/**
 * 3D Hexagonal Cyber Core
 *
 * Layer metaphor:
 *   inner core (energy cube)        -> Development
 *   inner rings                     -> AI + Cloud
 *   outer structure (rims + plate)  -> Infrastructure
 *   outer shield (glass panels)     -> Cybersecurity
 *   orbiting modules                -> Monitoring + Compliance (and the other service lines)
 *
 * The opening sequence is a single GSAP timeline driving a plain state object;
 * the render loop reads that state every frame. Nothing is swapped, every
 * stage is real geometry transitioning between states.
 */

export interface CyberCoreOptions {
  reducedMotion: boolean;
  quality: 'high' | 'low';
  onFirstFrame?: () => void;
}

export interface CyberCoreHandle {
  dispose: () => void;
}

const COLORS = {
  primary: new THREE.Color('#3B82F6'),
  electric: new THREE.Color('#1EA7FF'),
  cyan: new THREE.Color('#39D7FF'),
  steel: new THREE.Color('#2a4466'),
  glass: new THREE.Color('#0d2440'),
};

const R_OUT = 2.0; // outer hex circumradius
const R_IN = 1.62; // inner opening circumradius
const DEPTH = 0.62; // prism depth
const RIM = 0.1; // rim thickness
const ORBIT_R = 2.82;
const FIT_RADIUS = 3.35;
const FOV = 32;

const MODULE_ICONS: ModuleIcon[] = ['development', 'ai', 'cloud', 'security', 'compliance', 'monitoring'];

const hexAngle = (k: number) => Math.PI / 2 + (k * Math.PI) / 3;
const hexVertex = (k: number, r: number) => new THREE.Vector2(Math.cos(hexAngle(k)) * r, Math.sin(hexAngle(k)) * r);

function hexShape(r: number): THREE.Shape {
  const s = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const v = hexVertex(k, r);
    if (k === 0) s.moveTo(v.x, v.y);
    else s.lineTo(v.x, v.y);
  }
  s.closePath();
  return s;
}

function shrink(points: THREE.Vector2[], f: number): THREE.Vector2[] {
  const c = points.reduce((a, p) => a.add(p), new THREE.Vector2()).divideScalar(points.length);
  return points.map((p) => c.clone().add(p.clone().sub(c).multiplyScalar(f)));
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export function createCyberCore(canvas: HTMLCanvasElement, opts: CyberCoreOptions): CyberCoreHandle {
  const low = opts.quality === 'low';
  const container = canvas.parentElement ?? canvas;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.75;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.set(0, 0.35, 12);
  camera.lookAt(0, 0, 0);
  let baseZ = 12;

  // Lighting: cool key, cyan rim and a light at the heart of the core.
  const key = new THREE.DirectionalLight(0xdbe8ff, 1.4);
  key.position.set(-4, 5, 6);
  const rim = new THREE.DirectionalLight(0x39d7ff, 1.1);
  rim.position.set(5, -2, -4);
  const coreLight = new THREE.PointLight(0x39d7ff, 0, 6, 1.6);
  scene.add(key, rim, coreLight, new THREE.AmbientLight(0x3b82f6, 0.25));

  // Shared resources -------------------------------------------------------
  const glowTex = new THREE.CanvasTexture(radialGlowCanvas(128));
  glowTex.colorSpace = THREE.SRGBColorSpace;

  const metalMat = new THREE.MeshStandardMaterial({ color: COLORS.steel, metalness: 0.85, roughness: 0.28 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: '#0b1626', metalness: 0.7, roughness: 0.45 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: COLORS.glass,
    metalness: 0.3,
    roughness: 0.12,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0.32 });
  const indicatorMat = new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.1 });

  // Scene graph ------------------------------------------------------------
  const root = new THREE.Group(); // overall attitude + float
  const chassis = new THREE.Group(); // slow roll: shell, plate, circuits
  root.add(chassis);
  scene.add(root);

  // Ambient halo behind the object
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: COLORS.primary, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  halo.scale.setScalar(8.5);
  halo.position.z = -1.2;
  root.add(halo);

  // 1. Outer hexagonal glass-metal frame (6 panels) -------------------------
  const panels: { group: THREE.Group; dir: THREE.Vector2; iris: THREE.Group }[] = [];
  const irisMat = new THREE.MeshStandardMaterial({
    color: '#0a1a2e',
    metalness: 0.5,
    roughness: 0.2,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const irisEdgeMat = new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0.35 });

  for (let k = 0; k < 6; k++) {
    const group = new THREE.Group();
    const mid = hexAngle(k) + Math.PI / 6;
    const dir = new THREE.Vector2(Math.cos(mid), Math.sin(mid));

    const trap = shrink([hexVertex(k, R_OUT), hexVertex(k + 1, R_OUT), hexVertex(k + 1, R_IN), hexVertex(k, R_IN)], 0.985);
    const rimGeo = new THREE.ExtrudeGeometry(new THREE.Shape(trap), {
      depth: RIM,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.012,
      bevelSegments: 1,
    });
    const rimEdges = new THREE.EdgesGeometry(rimGeo, 25);
    for (const z of [DEPTH / 2 - RIM / 2, -DEPTH / 2 - RIM / 2]) {
      const m = new THREE.Mesh(rimGeo, metalMat);
      m.position.z = z;
      const e = new THREE.LineSegments(rimEdges, edgeMat);
      e.position.z = z;
      group.add(m, e);
    }

    // Side wall (glass) spanning the prism depth
    const [a, b] = shrink([hexVertex(k, R_OUT * 0.995), hexVertex(k + 1, R_OUT * 0.995)], 0.97);
    const wallGeo = new THREE.BufferGeometry();
    const hz = DEPTH / 2 - 0.02;
    wallGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([a.x, a.y, hz, b.x, b.y, hz, b.x, b.y, -hz, a.x, a.y, hz, b.x, b.y, -hz, a.x, a.y, -hz], 3),
    );
    wallGeo.computeVertexNormals();
    group.add(new THREE.Mesh(wallGeo, glassMat));

    // Indicator strip on the front rim
    const apOut = R_OUT * Math.cos(Math.PI / 6);
    const ind = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.012), indicatorMat);
    ind.position.set(dir.x * (apOut - 0.1), dir.y * (apOut - 0.1), DEPTH / 2 + RIM / 2 + 0.02);
    ind.rotation.z = mid + Math.PI / 2;
    group.add(ind);

    // Iris sector (front lens). Pivots on its outer edge and retracts into the rim.
    const apIn = R_IN * Math.cos(Math.PI / 6);
    const iris = new THREE.Group();
    iris.position.set(dir.x * apIn, dir.y * apIn, DEPTH / 2 - RIM / 2 - 0.03);
    iris.rotation.z = mid + Math.PI / 2;
    const tri = shrink([new THREE.Vector2(-R_IN / 2, 0), new THREE.Vector2(R_IN / 2, 0), new THREE.Vector2(0, apIn)], 0.97);
    const triGeo = new THREE.ShapeGeometry(new THREE.Shape(tri));
    iris.add(new THREE.Mesh(triGeo, irisMat));
    iris.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(tri), irisEdgeMat));
    group.add(iris);

    chassis.add(group);
    panels.push({ group, dir, iris });
  }

  // 2. Back plate + circuit lines (outer structure / infrastructure) --------
  const plate = new THREE.Mesh(new THREE.ShapeGeometry(hexShape(R_IN + 0.06)), darkMetalMat);
  plate.position.z = -DEPTH / 2 + 0.02;
  chassis.add(plate);

  const circuitUniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uColor: { value: COLORS.electric.clone() },
    uPR: { value: renderer.getPixelRatio() },
  };
  const circuit = buildCircuits(low ? 12 : 22, circuitUniforms);
  circuit.position.z = -DEPTH / 2 + 0.035;
  chassis.add(circuit);

  // 3. Inner rings (AI + Cloud) ---------------------------------------------
  const rings = new THREE.Group();
  root.add(rings);
  const ringMat = new THREE.MeshStandardMaterial({
    color: '#1b3558',
    metalness: 0.8,
    roughness: 0.25,
    emissive: COLORS.electric,
    emissiveIntensity: 0.15,
  });
  const ringSeg = low ? 96 : 180;

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.022, 8, ringSeg), ringMat);
  // Tick ring (instanced)
  const tickCount = low ? 48 : 72;
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.07, 0.012), ringMat, tickCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < tickCount; i++) {
    const a = (i / tickCount) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 1.11, Math.sin(a) * 1.11, 0);
    dummy.rotation.z = a + Math.PI / 2;
    dummy.scale.y = i % 6 === 0 ? 1.8 : 1;
    dummy.updateMatrix();
    ticks.setMatrixAt(i, dummy.matrix);
  }
  const ringAGroup = new THREE.Group();
  ringAGroup.add(ringA, ticks);

  // Segmented gyroscope ring
  const ringBGroup = new THREE.Group();
  ringBGroup.rotation.x = 1.15;
  const ringB = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.02, 8, ringSeg / 3, (Math.PI * 2) / 3 - 0.32), ringMat);
    arc.rotation.z = (i * Math.PI * 2) / 3;
    ringB.add(arc);
  }
  ringBGroup.add(ringB);

  const ringCGroup = new THREE.Group();
  ringCGroup.rotation.y = 1.05;
  ringCGroup.rotation.x = 0.35;
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.012, 6, ringSeg), ringMat);
  ringCGroup.add(ringC);

  rings.add(ringAGroup, ringBGroup, ringCGroup);

  // 4. Central energy cube (Development) ------------------------------------
  const coreGroup = new THREE.Group();
  root.add(coreGroup);
  const cubeMat = new THREE.MeshStandardMaterial({
    color: '#0a2342',
    metalness: 0.4,
    roughness: 0.25,
    emissive: COLORS.cyan,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.92,
  });
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), cubeMat);
  const cubeEdgeMat = new THREE.LineBasicMaterial({ color: '#bff3ff', transparent: true, opacity: 0.6 });
  cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), cubeEdgeMat));
  const innerCubeMat = new THREE.MeshBasicMaterial({ color: '#e8fbff', transparent: true, opacity: 0.5 });
  const innerCube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), innerCubeMat);
  cube.add(innerCube);
  const frameCube = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.66, 0.66, 0.66)),
    new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0.3 }),
  );
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: COLORS.cyan,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(glowMat);
  coreGroup.add(cube, frameCube, glow);

  // Energy pulse ring (activation)
  const pulseMat = new THREE.MeshBasicMaterial({
    color: COLORS.cyan,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96), pulseMat);
  root.add(pulse);

  // 5. Cyber nodes on spokes ------------------------------------------------
  const nodes = new THREE.Group();
  root.add(nodes);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: '#0d2a4a',
    emissive: COLORS.cyan,
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.3,
  });
  const nodeGeo = new THREE.OctahedronGeometry(0.05, 0);
  const spokePts: THREE.Vector3[] = [];
  for (let k = 0; k < 6; k++) {
    const a = hexAngle(k);
    const n = new THREE.Mesh(nodeGeo, nodeMat);
    n.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0);
    nodes.add(n);
    spokePts.push(new THREE.Vector3(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0), n.position.clone());
  }
  const spokeMat = new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0.4 });
  nodes.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(spokePts), spokeMat));

  // 6. Orbital paths + floating modules (Monitoring + Compliance) -----------
  const orbitTilt = new THREE.Group();
  orbitTilt.rotation.x = 0.32;
  root.add(orbitTilt);
  const orbit = new THREE.Group();
  orbitTilt.add(orbit);

  const orbitSegs = 160;
  const orbitMat = new THREE.LineBasicMaterial({ color: COLORS.primary, transparent: true, opacity: 0.38 });
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(
    new THREE.EllipseCurve(0, 0, ORBIT_R, ORBIT_R, 0, Math.PI * 2, false, 0).getPoints(orbitSegs),
  );
  orbitGeo.setDrawRange(0, 0);
  orbitTilt.add(new THREE.Line(orbitGeo, orbitMat));

  const orbit2Tilt = new THREE.Group();
  orbit2Tilt.rotation.set(1.18, 0.32, 0);
  root.add(orbit2Tilt);
  const orbit2Geo = new THREE.BufferGeometry().setFromPoints(
    new THREE.EllipseCurve(0, 0, 2.55, 2.55, 0, Math.PI * 2, false, 0).getPoints(orbitSegs),
  );
  orbit2Geo.setDrawRange(0, 0);
  const orbit2Mat = new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0.2 });
  orbit2Tilt.add(new THREE.Line(orbit2Geo, orbit2Mat));
  const travellers = new THREE.Group();
  orbit2Tilt.add(travellers);
  const travellerMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: COLORS.cyan,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Sprite(travellerMat);
    s.scale.setScalar(0.22);
    s.userData.phase = (i / 3) * Math.PI * 2;
    travellers.add(s);
  }

  const moduleShape = hexShape(0.34);
  const moduleGeo = new THREE.ExtrudeGeometry(moduleShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 1,
  });
  moduleGeo.translate(0, 0, -0.02);
  const moduleMat = new THREE.MeshStandardMaterial({
    color: '#0c1d33',
    metalness: 0.6,
    roughness: 0.25,
    transparent: true,
    opacity: 0,
  });
  const moduleEdgeMat = new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0 });
  const moduleEdgeGeo = new THREE.BufferGeometry().setFromPoints(moduleShape.getPoints());
  const iconPlane = new THREE.PlaneGeometry(0.34, 0.34);
  const modules: { group: THREE.Group; angle: number; iconMat: THREE.MeshBasicMaterial }[] = [];

  MODULE_ICONS.forEach((icon, k) => {
    const g = new THREE.Group();
    const plateMesh = new THREE.Mesh(moduleGeo, moduleMat);
    const edge = new THREE.LineLoop(moduleEdgeGeo, moduleEdgeMat);
    edge.position.z = 0.032;
    const tex = new THREE.CanvasTexture(drawIconCanvas(icon, low ? 96 : 128));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const iconMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    const iconMesh = new THREE.Mesh(iconPlane, iconMat);
    iconMesh.position.z = 0.036;
    g.add(plateMesh, edge, iconMesh);
    g.visible = false;
    orbit.add(g);
    modules.push({ group: g, angle: hexAngle(k) + Math.PI / 6, iconMat });
  });

  // 7. Particles -------------------------------------------------------------
  const particleCount = low ? 70 : 220;
  const pPos = new Float32Array(particleCount * 3);
  const pSize = new Float32Array(particleCount);
  const pSeed = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const r = 1.8 + Math.random() * 3;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.8;
    pPos[i * 3 + 2] = r * Math.cos(ph) * 0.6 - 0.6;
    pSize[i] = 1.5 + Math.random() * 2.5;
    pSeed[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1));
  const particleUniforms = {
    uTime: { value: 0 },
    uPR: { value: renderer.getPixelRatio() },
    uOpacity: { value: 0.35 },
    uColor: { value: new THREE.Color('#7fd8ff') },
  };
  const particles = new THREE.Points(
    pGeo,
    new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aSeed;
        uniform float uTime;
        uniform float uPR;
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.22 + aSeed * 6.2831) * 0.14;
          p.x += cos(uTime * 0.17 + aSeed * 4.0) * 0.09;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * uPR * (7.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
          vAlpha = (0.3 + 0.7 * abs(sin(uTime * 0.4 + aSeed * 12.0))) * uOpacity;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, a * vAlpha);
        }
      `,
    }),
  );
  scene.add(particles);

  // State + timeline ------------------------------------------------------------
  const S = {
    glow: 0.16,
    circuit: 0,
    indicator: 0.1,
    pulse: 0,
    ringSpin: 0,
    unlock: 0,
    open: 0,
    iris: 0,
    reveal: 0,
    nodes: 0,
    orbit: 0,
    yaw: 0,
    cam: 1.14,
  };
  const moduleState = modules.map(() => ({ v: 0 }));

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  // STATE 1 - CLOSED (0 - 1.2s): soft glow, slow float and rotation
  tl.to(S, { glow: 0.28, duration: 1.2, ease: 'sine.inOut' }, 0)
    // FRAME 8 - camera settles over the whole sequence
    .to(S, { cam: 1, duration: 7.4, ease: 'power3.out' }, 0)
    // STATE 2 - ACTIVATION (1.2 - 2.5s)
    .to(S, { glow: 0.72, duration: 1.3 }, 1.2)
    .to(S, { circuit: 1, duration: 1.3, ease: 'power1.inOut' }, 1.2)
    .to(S, { indicator: 0.9, duration: 0.8 }, 1.5)
    .fromTo(S, { pulse: 0 }, { pulse: 1, duration: 1.4, ease: 'power2.out' }, 1.35)
    .to(S, { ringSpin: 0.35, duration: 1.3 }, 1.2)
    // STATE 3 - OUTER PANELS OPEN (2.5 - 4s): unlock, then slide radially
    .to(S, { unlock: 1, duration: 0.45, ease: 'power2.out' }, 2.5)
    .to(S, { iris: 1, duration: 1.2, ease: 'power3.inOut' }, 2.65)
    .to(S, { open: 1, duration: 1.3, ease: 'power3.inOut' }, 2.7)
    // STATE 4 - INNER SYSTEM REVEAL (4 - 5.5s)
    .to(S, { reveal: 1, ringSpin: 1, duration: 1.5 }, 4)
    .to(S, { nodes: 1, duration: 1.2 }, 4.1)
    .to(S, { glow: 1, duration: 1.4 }, 4)
    .to(S, { orbit: 1, duration: 1.5, ease: 'power1.inOut' }, 4.2)
    // STATE 5 - FULL CYBER CORE (5.5 - 7s): modules appear; FRAME 7 slight rotation
    .to(S, { yaw: 1, duration: 1.6, ease: 'power2.inOut' }, 5.6);
  moduleState.forEach((m, i) => {
    tl.to(m, { v: 1, duration: 0.7, ease: 'power3.out' }, 5.5 + i * 0.13);
  });

  // Interaction (subtle pointer parallax, desktop only) -----------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  if (!opts.reducedMotion && !low) window.addEventListener('pointermove', onPointer, { passive: true });

  // Resize -------------------------------------------------------------------
  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    baseZ = FIT_RADIUS / (Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * Math.min(1, camera.aspect));
    camera.updateProjectionMatrix();
    if (!running || opts.reducedMotion) renderFrame(0);
  };
  const ro = new ResizeObserver(resize);

  // Per-frame update -----------------------------------------------------------
  const qTmp = new THREE.Quaternion();
  let elapsed = 0;
  let idle = 0; // time used for continuous idle motion
  let first = true;

  function renderFrame(dt: number) {
    const motion = opts.reducedMotion ? 0 : 1;
    elapsed += dt;
    idle += dt * motion;
    const t = idle;
    const breathe = 1 + 0.07 * Math.sin(t * 1.3) * motion;

    // Camera
    camera.position.z = baseZ * S.cam;
    camera.position.y = 0.35 * S.cam;
    camera.lookAt(0, 0, 0);

    // Attitude & float
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    root.rotation.y = -0.46 + S.yaw * 0.24 + Math.sin(t * 0.13) * 0.07 + pointer.x * 0.12;
    root.rotation.x = 0.14 + Math.sin(t * 0.17) * 0.025 + pointer.y * 0.07;
    root.position.y = Math.sin(t * 0.55) * 0.06;
    chassis.rotation.z = t * 0.035;
    orbit.rotation.z = -t * 0.045;

    // Core
    const g = S.glow * breathe;
    cubeMat.emissiveIntensity = 0.25 + g * 1.5;
    innerCubeMat.opacity = 0.35 + g * 0.65;
    cubeEdgeMat.opacity = 0.35 + g * 0.6;
    glowMat.opacity = 0.18 + g * 0.55;
    glow.scale.setScalar(1.3 + g * 1.7);
    coreLight.intensity = g * 7;
    halo.material.opacity = 0.06 + g * 0.1;
    cube.rotation.x += dt * 0.32 * motion;
    cube.rotation.y += dt * 0.46 * motion;
    frameCube.rotation.x -= dt * 0.18 * motion;
    frameCube.rotation.z += dt * 0.12 * motion;

    // Activation pulse
    pulse.scale.setScalar(0.25 + S.pulse * 1.35);
    pulseMat.opacity = S.pulse > 0 && S.pulse < 1 ? (1 - S.pulse) * 0.55 : 0;

    // Circuits
    circuitUniforms.uProgress.value = S.circuit * 1.04;
    circuitUniforms.uTime.value = t;
    indicatorMat.opacity = S.indicator * (0.75 + 0.25 * Math.sin(t * 2.1) * motion);

    // Panels
    const openDist = R_OUT * 0.12 * S.open;
    for (const p of panels) {
      p.group.position.set(p.dir.x * openDist, p.dir.y * openDist, S.unlock * 0.07);
      p.iris.scale.y = Math.max(0.001, 1 - S.iris);
      p.iris.visible = S.iris < 0.995;
    }
    irisMat.opacity = 0.62 * (1 - S.iris);
    irisEdgeMat.opacity = 0.35 * (1 - S.iris * 0.9);

    // Rings
    const ringScale = 0.84 + 0.16 * S.reveal;
    rings.scale.setScalar(ringScale);
    ringMat.emissiveIntensity = 0.12 + 0.55 * S.reveal * breathe;
    ringAGroup.rotation.z += dt * 0.22 * S.ringSpin * motion;
    ringB.rotation.z -= dt * 0.34 * S.ringSpin * motion;
    ringC.rotation.z += dt * 0.5 * S.ringSpin * motion;
    ringBGroup.rotation.y = Math.sin(t * 0.2) * 0.12 * S.ringSpin;

    // Nodes
    nodes.scale.setScalar(1 + 0.24 * S.nodes);
    nodeMat.emissiveIntensity = 0.4 + 1.1 * S.nodes * breathe;
    spokeMat.opacity = 0.15 + 0.45 * S.nodes;

    // Orbits
    orbitGeo.setDrawRange(0, Math.floor((orbitSegs + 1) * S.orbit));
    orbit2Geo.setDrawRange(0, Math.floor((orbitSegs + 1) * S.orbit));
    travellerMat.opacity = 0.8 * S.orbit;
    travellers.children.forEach((s) => {
      const a = s.userData.phase + t * 0.35;
      s.position.set(Math.cos(a) * 2.55, Math.sin(a) * 2.55, 0);
    });

    // Modules (billboarded towards the camera)
    orbit.getWorldQuaternion(qTmp).invert();
    let mOpacity = 0;
    modules.forEach((m, i) => {
      const v = moduleState[i].v;
      m.group.visible = v > 0.001;
      if (!m.group.visible) return;
      const r = ORBIT_R - 0.45 * (1 - v);
      m.group.position.set(Math.cos(m.angle) * r, Math.sin(m.angle) * r, Math.sin(t * 0.8 + i) * 0.05 * motion);
      m.group.scale.setScalar(0.4 + 0.6 * v);
      m.group.quaternion.copy(qTmp).multiply(camera.quaternion);
      m.iconMat.opacity = v;
      mOpacity = Math.max(mOpacity, v);
    });
    moduleMat.opacity = 0.9 * mOpacity;
    moduleEdgeMat.opacity = 0.7 * mOpacity;

    particleUniforms.uTime.value = t;

    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onFirstFrame?.();
    }
  }

  // Loop control: pause when tab hidden or hero offscreen ----------------------
  let raf = 0;
  let running = false;
  let last = 0;
  let inView = true;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    renderFrame(dt);
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running || opts.reducedMotion || document.hidden || !inView) return;
    running = true;
    last = performance.now();
    tl.resume();
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (!running) return;
    running = false;
    tl.pause();
    cancelAnimationFrame(raf);
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    },
    { threshold: 0.01 },
  );

  ro.observe(container);
  resize();
  if (opts.reducedMotion) {
    // Final state, no opening sequence, no continuous motion.
    tl.progress(1);
    renderFrame(0);
  } else {
    io.observe(container);
    tl.play(0);
    start();
  }

  return {
    dispose() {
      stop();
      tl.kill();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => {
          const mm = m as THREE.MeshBasicMaterial;
          mm.map?.dispose();
          m.dispose();
        });
      });
      glowTex.dispose();
      envRT.dispose();
      renderer.dispose();
      // Release the WebGL context now rather than at garbage collection: returning to the
      // homepage creates a new one, and browsers cap how many can be alive at once.
      renderer.forceContextLoss();
    },
  };
}

/** Circuit traces radiating from the core across the back plate, with 45 degree bends. */
function buildCircuits(
  count: number,
  uniforms: Record<string, { value: unknown }>,
): THREE.Group {
  const LIMIT = 1.3;
  const R0 = 0.34;
  const seg: number[] = [];
  const dist: number[] = [];
  const seed: number[] = [];
  const pads: number[] = [];
  const padDist: number[] = [];
  const paths: { pts: THREE.Vector2[]; s: number }[] = [];
  let maxLen = 0;

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
    const u = new THREE.Vector2(Math.cos(a), Math.sin(a));
    const turn = (Math.random() < 0.5 ? -1 : 1) * (Math.PI / 4);
    const v = u.clone().rotateAround(new THREE.Vector2(), turn);
    const pts = [u.clone().multiplyScalar(R0)];
    let p = pts[0].clone().add(u.clone().multiplyScalar(0.18 + Math.random() * 0.3));
    pts.push(p.clone());
    p = p.clone().add(v.clone().multiplyScalar(0.12 + Math.random() * 0.28));
    pts.push(p.clone());
    p = p.clone().add(u.clone().multiplyScalar(0.15 + Math.random() * 0.45));
    pts.push(p.clone());
    // Clamp inside the opening
    for (let j = 1; j < pts.length; j++) {
      if (pts[j].length() > LIMIT) {
        const prev = pts[j - 1];
        const dir = pts[j].clone().sub(prev);
        let lo = 0;
        let hi = 1;
        for (let n = 0; n < 12; n++) {
          const m = (lo + hi) / 2;
          if (prev.clone().add(dir.clone().multiplyScalar(m)).length() > LIMIT) hi = m;
          else lo = m;
        }
        pts[j] = prev.clone().add(dir.multiplyScalar(lo));
        pts.length = j + 1;
        break;
      }
    }
    let len = R0;
    for (let j = 1; j < pts.length; j++) len += pts[j].distanceTo(pts[j - 1]);
    maxLen = Math.max(maxLen, len);
    paths.push({ pts, s: Math.random() });
  }

  for (const { pts, s } of paths) {
    let acc = R0;
    for (let j = 1; j < pts.length; j++) {
      const d0 = acc / maxLen;
      acc += pts[j].distanceTo(pts[j - 1]);
      const d1 = acc / maxLen;
      seg.push(pts[j - 1].x, pts[j - 1].y, 0, pts[j].x, pts[j].y, 0);
      dist.push(d0, d1);
      seed.push(s, s);
    }
    const end = pts[pts.length - 1];
    pads.push(end.x, end.y, 0.002);
    padDist.push(acc / maxLen);
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  lineGeo.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
  lineGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));

  const lineMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aDist;
      attribute float aSeed;
      varying float vDist;
      varying float vSeed;
      void main() {
        vDist = aDist;
        vSeed = aSeed;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying float vDist;
      varying float vSeed;
      void main() {
        float on = 1.0 - smoothstep(uProgress - 0.05, uProgress, vDist);
        float head = exp(-pow((vDist - uProgress) * 22.0, 2.0)) * step(uProgress, 1.0);
        float travel = fract(uTime * 0.11 + vSeed);
        float pulse = exp(-pow((vDist - travel * 1.25) * 12.0, 2.0)) * on;
        float a = on * 0.3 + pulse * 0.85 + head * 0.9;
        gl_FragColor = vec4(uColor * (1.0 + pulse * 0.8 + head), a * uOpacity);
      }
    `,
  });

  const padGeo = new THREE.BufferGeometry();
  padGeo.setAttribute('position', new THREE.Float32BufferAttribute(pads, 3));
  padGeo.setAttribute('aDist', new THREE.Float32BufferAttribute(padDist, 1));
  const padMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aDist;
      uniform float uPR;
      varying float vDist;
      void main() {
        vDist = aDist;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 5.0 * uPR * (9.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vDist;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float ring = smoothstep(0.5, 0.38, d);
        float on = step(vDist, uProgress);
        gl_FragColor = vec4(uColor * 1.3, ring * on * 0.85 * uOpacity);
      }
    `,
  });

  const group = new THREE.Group();
  group.add(new THREE.LineSegments(lineGeo, lineMat), new THREE.Points(padGeo, padMat));
  return group;
}
