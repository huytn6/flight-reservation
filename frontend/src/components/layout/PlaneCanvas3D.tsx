import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LIVERY_BLUE = 0x0a2f6b;

/** Soft radial-gradient sprite texture, generated on a 2D canvas — no external asset needed. */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Lumpy cumulus-puff sprite texture — a few overlapping soft blobs instead of one plain glow dot. */
function makeCloudTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const puff = (cx: number, cy: number, r: number, alpha: number) => {
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.55})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  puff(size * 0.5, size * 0.55, size * 0.32, 0.95);
  puff(size * 0.32, size * 0.6, size * 0.24, 0.85);
  puff(size * 0.68, size * 0.58, size * 0.26, 0.85);
  puff(size * 0.42, size * 0.42, size * 0.2, 0.8);
  puff(size * 0.6, size * 0.4, size * 0.18, 0.75);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Tapered, swept wing panel (flat, extruded), spanning outward along +Z once mounted at a +Z position. */
function buildWingGeometry(span: number, sweep: number, rootChord: number, tipChord: number, thickness: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(-sweep, span);
  shape.lineTo(-sweep - tipChord, span);
  shape.lineTo(-rootChord, 0);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  geometry.translate(0, 0, -thickness / 2);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** Small upturned winglet, meant to sit at a wing tip and angle upward. */
function buildWingletGeometry(height: number, chord: number, thickness: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(-chord * 0.35, height);
  shape.lineTo(-chord * 0.75, height);
  shape.lineTo(-chord, 0);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

function buildLandingGear(wheelMat: THREE.Material, strutMat: THREE.Material) {
  const gear = new THREE.Group();
  const strutGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.55, 8);
  const strut = new THREE.Mesh(strutGeo, strutMat);
  strut.position.y = -0.27;
  gear.add(strut);

  const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
  wheelGeo.rotateX(Math.PI / 2);
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.position.y = -0.55;
  gear.add(wheel);

  return gear;
}

function buildAirplane(): THREE.Group {
  const plane = new THREE.Group();

  const bodyWhite = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: 0.35, roughness: 0.35 });
  const liveryMat = new THREE.MeshStandardMaterial({ color: LIVERY_BLUE, metalness: 0.2, roughness: 0.55 });
  const darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.6, roughness: 0.3 });
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x2b2f36, metalness: 0.55, roughness: 0.4 });
  const engineCowlMat = new THREE.MeshStandardMaterial({ color: 0xe7eaee, metalness: 0.5, roughness: 0.3 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14151a, metalness: 0.1, roughness: 0.7 });
  const strutMat = new THREE.MeshStandardMaterial({ color: 0xc7cbd1, metalness: 0.6, roughness: 0.35 });

  // ---- Fuselage: white base + dark-blue upper-half livery shell ----
  const bodyLength = 6.4;
  const bodyRadius = 0.5;
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 32, 1, false);
  bodyGeo.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyWhite);
  plane.add(body);

  // Cylinder vertices are (r*sin(theta), height, r*cos(theta)) before rotation, and
  // rotateZ(90°) maps pre-rotation X straight onto local Y, so theta in (0, PI) —
  // where sin(theta) > 0 — is exactly the resulting top half.
  const upperShellGeo = new THREE.CylinderGeometry(
    bodyRadius + 0.01, bodyRadius + 0.01, bodyLength - 0.1, 32, 1, true, 0, Math.PI
  );
  upperShellGeo.rotateZ(Math.PI / 2);
  const upperShell = new THREE.Mesh(upperShellGeo, liveryMat);
  plane.add(upperShell);

  // Nose: blunt, rounded radome — an airliner nose is an ellipsoid, not a spike.
  const noseLength = 1.35;
  const noseGeo = new THREE.SphereGeometry(bodyRadius, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  noseGeo.scale(1, noseLength / bodyRadius, 1);
  noseGeo.rotateZ(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, liveryMat);
  nose.position.x = bodyLength / 2 - 0.02;
  plane.add(nose);

  const tailConeGeo = new THREE.ConeGeometry(bodyRadius, 1.3, 32);
  tailConeGeo.rotateZ(-Math.PI / 2);
  const tailCone = new THREE.Mesh(tailConeGeo, liveryMat);
  tailCone.position.x = -bodyLength / 2 - 1.3 / 2 + 0.05;
  plane.add(tailCone);

  // Cockpit windshield (dark, glossy) just behind the nose taper
  const cockpitGeo = new THREE.SphereGeometry(bodyRadius * 0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.4);
  cockpitGeo.scale(1, 0.55, 0.85);
  cockpitGeo.rotateZ(-Math.PI / 2);
  cockpitGeo.rotateY(Math.PI);
  const cockpit = new THREE.Mesh(cockpitGeo, darkGlassMat);
  cockpit.position.set(bodyLength / 2 - 0.1, 0.1, 0);
  plane.add(cockpit);

  // Passenger window strip, along the white lower half
  const windowStripGeo = new THREE.BoxGeometry(bodyLength - 1.7, 0.06, 0.03);
  const windowStrip = new THREE.Mesh(windowStripGeo, darkGlassMat);
  windowStrip.position.set(0.1, -0.06, bodyRadius - 0.015);
  plane.add(windowStrip);
  const windowStrip2 = windowStrip.clone();
  windowStrip2.position.z = -(bodyRadius - 0.015);
  plane.add(windowStrip2);

  // ---- Wings (white, swept, tapered, with upturned winglets) ----
  // Wider tip chord + less sweep than a delta so the planform reads as an airliner
  // wing from directly above, not a dart.
  // Airliner proportions: span roughly 2.8x the root chord, so from above the pair
  // reads as two long swept blades rather than one stubby diamond.
  const wingSpan = 4.2;
  const wingSweep = 1.5;
  const wingGeo = buildWingGeometry(wingSpan, wingSweep, 1.5, 0.45, 0.1);
  const wingletGeo = buildWingletGeometry(0.7, 0.55, 0.1);

  const wingRootX = 0.95;
  [1, -1].forEach((side) => {
    const wing = new THREE.Mesh(wingGeo.clone(), bodyWhite);
    if (side < 0) wing.scale.z = -1;
    wing.position.set(wingRootX, -0.18, side * (bodyRadius - 0.05));
    plane.add(wing);

    const winglet = new THREE.Mesh(wingletGeo.clone(), bodyWhite);
    if (side < 0) winglet.scale.z = -1;
    winglet.rotation.x = side * 1.15;
    winglet.position.set(
      wingRootX - wingSweep - 0.1,
      -0.18 + 0.05,
      side * (bodyRadius - 0.05 + wingSpan - 0.05)
    );
    plane.add(winglet);
  });

  // Horizontal stabilizers (small tail wings, white)
  const stabGeo = buildWingGeometry(1.5, 0.55, 0.62, 0.25, 0.07);
  [1, -1].forEach((side) => {
    const stab = new THREE.Mesh(stabGeo.clone(), bodyWhite);
    if (side < 0) stab.scale.z = -1;
    stab.position.set(-bodyLength / 2 + 0.5, 0.02, side * (bodyRadius - 0.15));
    plane.add(stab);
  });

  // Vertical tail fin (livery blue, swept)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(-0.6, 1.6);
  finShape.lineTo(-1.15, 1.65);
  finShape.lineTo(-1.2, 0);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.12, bevelEnabled: false });
  finGeo.translate(0, 0, -0.06);
  const fin = new THREE.Mesh(finGeo, liveryMat);
  fin.position.set(-bodyLength / 2 + 0.7, bodyRadius - 0.05, 0);
  plane.add(fin);

  // ---- Engines: large turbofan nacelles mounted forward/below the wings ----
  const engineLength = 1.3;
  const engineRadius = 0.33;
  const engineGeo = new THREE.CylinderGeometry(engineRadius * 0.9, engineRadius, engineLength, 24, 1, true);
  engineGeo.rotateZ(Math.PI / 2);
  const cowlGeo = new THREE.TorusGeometry(engineRadius, 0.07, 12, 28);
  cowlGeo.rotateY(Math.PI / 2);

  const contrailTexture = makeGlowTexture();
  const contrailMat = new THREE.MeshBasicMaterial({
    map: contrailTexture,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  [1, -1].forEach((side) => {
    // Slung just ahead of and under the wing's leading edge at this span station,
    // so from above the nacelles peek out in front of the wing rather than floating
    // alongside the fuselage.
    const engineZ = side * 1.45;
    const engineX = wingRootX - (wingSweep * (1.45 - (bodyRadius - 0.05))) / wingSpan - 0.15;
    const engineY = -0.62;

    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.set(engineX, engineY, engineZ);
    plane.add(engine);

    const cowl = new THREE.Mesh(cowlGeo, engineCowlMat);
    cowl.position.set(engineX + engineLength / 2, engineY, engineZ);
    plane.add(cowl);

    // Pylon connecting engine to wing
    const pylonGeo = new THREE.BoxGeometry(0.5, 0.35, 0.08);
    const pylon = new THREE.Mesh(pylonGeo, bodyWhite);
    pylon.position.set(engineX - 0.1, engineY + 0.5, engineZ);
    plane.add(pylon);

    const contrail = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.35), contrailMat);
    contrail.position.set(engineX - 1.3, engineY, engineZ);
    plane.add(contrail);

    // Main landing gear, deployed (just after takeoff)
    const mainGear = buildLandingGear(wheelMat, strutMat);
    mainGear.position.set(engineX + 0.3, -0.5, engineZ * 0.55);
    mainGear.rotation.z = side * 0.12;
    plane.add(mainGear);
  });

  // Nose landing gear, deployed
  const noseGear = buildLandingGear(wheelMat, strutMat);
  noseGear.scale.setScalar(0.8);
  noseGear.position.set(bodyLength / 2 - 1.1, -0.5, 0);
  noseGear.rotation.x = 0.25;
  plane.add(noseGear);

  // The model is authored at a comfortable working scale; shrink it down so it
  // reads as a small aircraft crossing the sky instead of filling the screen.
  plane.scale.setScalar(0.55);

  return plane;
}

interface PlaneCanvas3DProps {
  durationMs: number;
}

export const PlaneCanvas3D: React.FC<PlaneCanvas3DProps> = ({ durationMs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.5, 13);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // The aircraft is seen from above, so its lit surfaces face the camera (+Z):
    // the key light needs a strong +Z component or the whole top reads as flat grey.
    const hemi = new THREE.HemisphereLight(0xdcebff, 0x24334d, 1.0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff6e8, 1.9);
    sun.position.set(5, 7, 9);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xa8ccff, 0.7);
    fill.position.set(-7, -4, 5);
    scene.add(fill);

    const plane = buildAirplane();
    scene.add(plane);

    const cloudTexture = makeCloudTexture();
    const cloudMat = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.8, depthWrite: false });
    const clouds: THREE.Sprite[] = [];
    const cloudSpecs = [
      { x: -9, y: 3.2, z: -4, s: 8 },
      { x: -4, y: -2.6, z: -6, s: 10 },
      { x: 0, y: 3.6, z: -3, s: 7 },
      { x: 5, y: -2.2, z: -5, s: 9 },
      { x: 9, y: 3, z: -6, s: 7 },
      { x: -6, y: -3.8, z: -7, s: 6 },
      { x: 3, y: -4, z: -4, s: 5 },
    ];
    cloudSpecs.forEach((c) => {
      const sprite = new THREE.Sprite(cloudMat.clone());
      sprite.position.set(c.x, c.y, c.z);
      sprite.scale.set(c.s, c.s * 0.55, 1);
      scene.add(sprite);
      clouds.push(sprite);
    });

    let halfW = 10;
    let halfH = 6;
    const margin = 4;

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || window.innerWidth;
      const height = parent?.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const dist = camera.position.z;
      halfH = dist * Math.tan((camera.fov * Math.PI) / 360);
      halfW = halfH * camera.aspect;
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    // Timed from the first frame that actually renders, not from mount: creating the
    // GL context and compiling shaders can stall for a few hundred ms, and anchoring
    // to mount would silently eat that much of the flight (the plane appears already
    // half-way across).
    let startTime = 0;
    const CLOUD_FADE_MS = 260;
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = () => {
      const now = performance.now();
      if (startTime === 0) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeInOutCubic(t);

      // Straight, level pass across the screen, seen from above: rotating +90° about
      // X turns the aircraft's local up-axis toward the camera, so the whole top of
      // the plane faces the viewer and the full wingspan is visible, with the nose
      // pointing right — exactly the direction of travel. The small offset keeps a
      // touch of perspective so it doesn't read as a flat 2D cutout.
      plane.position.set(THREE.MathUtils.lerp(-(halfW + margin), halfW + margin, eased), halfH * 0.05, 0);
      plane.rotation.set(Math.PI / 2 - 0.16, 0, 0);

      // Clouds drift, then clear out the moment the plane has passed.
      const cloudFade = t < 1 ? 1 : Math.max(0, 1 - (elapsed - durationMs) / CLOUD_FADE_MS);
      clouds.forEach((c, i) => {
        c.position.x -= 0.01 * (i + 1);
        (c.material as THREE.SpriteMaterial).opacity = 0.8 * cloudFade;
      });

      renderer.render(scene, camera);
      if (elapsed < durationMs + CLOUD_FADE_MS) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
          obj.geometry?.dispose?.();
          const material = obj.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose?.();
        }
      });
      renderer.dispose();
    };
  }, [durationMs]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
