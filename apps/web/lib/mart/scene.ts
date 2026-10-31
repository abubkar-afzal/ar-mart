import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  FreeCamera,
  HemisphericLight,
  Matrix,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput';
import '@babylonjs/core/Cameras/Inputs/freeCameraKeyboardMoveInput';
import '@babylonjs/core/Cameras/Inputs/freeCameraMouseInput';
import type { Product } from '@armart/shared';
import { mat, makeFloor, makeCeiling, makeCeilingLights } from './helpers';
import { loadModel, loadGlb, loadModelScaled, normalizeModelPath } from './assetLoader';

/** Target horizontal size (metres) for each department's product models. */
const DEPT_MODEL_SIZE: Record<string, number> = {
  grocery: 0.35,
  clothing: 0.8,
  electronics: 0.45,
  furniture: 1.8,
};

export type MartFloor = 0 | 1 | 2 | 3;
export type MartStage = 'exterior' | 'entering' | 'inside';
export type QualityLevel = 'low' | 'medium' | 'high';
export type Hint = { productId: string; name: string; price: number };
export type MartProductsByDept = { grocery: Product[], clothing: Product[], electronics: Product[], furniture: Product[] };

export type MartHooks = {
  onHoverProduct: (hint: Hint | null) => void;
  onPickProduct: (productId: string) => void;
  onStageChange: (stage: MartStage) => void;
  onFloorChange: (floor: MartFloor) => void;
  onProgress: (pct: number) => void;
};

export type MartHandle = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
  enterBuilding: () => void;
  goToFloor: (floor: MartFloor) => void;
  setMoveVector: (x: number, z: number) => void;
  enterPointerLock: () => void;
  startInspection: (product: Product) => void;
  stopInspection: () => void;
};

const FLOOR_HEIGHT = 6;
const BUILDING_WIDTH = 40;
const BUILDING_DEPTH = 44;
const FLOOR_Y_OFFSET = 0.4; // Thickness of the slab

export function createMartScene(
  canvas: HTMLCanvasElement,
  productsByDept: MartProductsByDept,
  hooks: MartHooks,
  quality: QualityLevel,
): MartHandle {
  const engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.6, 0.8, 1, 1);
  scene.collisionsEnabled = true;
  
  // --- FIX GRAVITY ---
  scene.gravity = new Vector3(0, -0.5, 0);

  // Lights
  const hemi = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
  hemi.intensity = 1.2; // Brighter store
  hemi.groundColor = new Color3(0.5, 0.5, 0.5);
  const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.4), scene);
  sun.intensity = 0.5;

  // Main Player Camera
  const camera = new FreeCamera('camera', new Vector3(0, 1.7, -28), scene);
  camera.setTarget(new Vector3(0, 3, 0));
  camera.speed = 0.2;
  camera.inertia = 0.75;
  camera.angularSensibility = 3500;
  camera.minZ = 0.1;
  camera.ellipsoid = new Vector3(0.5, 0.9, 0.5); // Player width/height
  camera.checkCollisions = true;
  camera.applyGravity = true; // --- FIX FLYING ---
  camera.keysUp = [87]; camera.keysDown = [83]; camera.keysLeft = [65]; camera.keysRight = [68];

  let stage: MartStage = 'exterior';
  let currentFloor: MartFloor = 0;
  let paused = false;
  let isMobile = matchMedia('(pointer: coarse)').matches;
  const moveVector = { x: 0, z: 0 };
  const productMeshes: Mesh[] = [];
  
  const highlightMat = mat(scene, 'highlightMat', [1, 1, 1]);
  highlightMat.emissiveColor = new Color3(1, 0.85, 0.2);

  hooks.onStageChange(stage);
  hooks.onFloorChange(currentFloor);
  hooks.onProgress(5);

  // --- Exterior ---
  const slab = MeshBuilder.CreateBox('slab', { width: BUILDING_WIDTH, height: FLOOR_Y_OFFSET, depth: BUILDING_DEPTH }, scene);
  slab.position.y = FLOOR_Y_OFFSET / 2;
  slab.material = mat(scene, 'slabMat', [0.4, 0.4, 0.4]);
  slab.checkCollisions = true;

  const facade = MeshBuilder.CreateBox('facade', { width: BUILDING_WIDTH, height: FLOOR_HEIGHT * 4, depth: BUILDING_DEPTH }, scene);
  facade.position.y = (FLOOR_HEIGHT * 4) / 2 + FLOOR_Y_OFFSET;
  facade.material = mat(scene, 'facadeMat', [0.3, 0.3, 0.35]);
  facade.isVisible = false; // Hide exterior shell once inside

  // --- Generate All 4 Floors ---
  const floorColors: [number, number, number][] = [
    [0.92, 0.90, 0.87], // 0 Grocery: Warm tile
    [0.85, 0.85, 0.90], // 1 Clothing: Light blue-grey
    [0.80, 0.82, 0.85], // 2 Electronics: Cool grey
    [0.85, 0.75, 0.65], // 3 Furniture: Wood tone
  ];

  function buildFloor(floorIndex: number) {
    const yBase = floorIndex * FLOOR_HEIGHT + FLOOR_Y_OFFSET;

    // Floor & Ceiling
    const floor = MeshBuilder.CreateGround(`floor_${floorIndex}`, { width: BUILDING_WIDTH, height: BUILDING_DEPTH }, scene);
    floor.position.y = yBase;
    floor.material = mat(scene, `floorMat_${floorIndex}`, floorColors[floorIndex]!);
    floor.checkCollisions = true;
    floor.isPickable = true;

    const ceiling = MeshBuilder.CreateBox(`ceiling_${floorIndex}`, { width: BUILDING_WIDTH, height: 0.2, depth: BUILDING_DEPTH }, scene);
    ceiling.position.y = yBase + FLOOR_HEIGHT - 0.5;
    ceiling.material = mat(scene, `ceilMat_${floorIndex}`, [0.9, 0.9, 0.9]);

    // Lights
    for (let x = -15; x <= 15; x += 10) {
      for (let z = -15; z <= 15; z += 10) {
        const lightMesh = MeshBuilder.CreateBox(`light_${floorIndex}_${x}_${z}`, { width: 1, height: 0.1, depth: 3 }, scene);
        lightMesh.position = new Vector3(x, yBase + FLOOR_HEIGHT - 0.6, z);
        lightMesh.material = mat(scene, `lightMat_${floorIndex}_${x}_${z}`, [1, 1, 0.9]);
        (lightMesh.material as StandardMaterial).emissiveColor = new Color3(1, 1, 0.8);
      }
    }

    // Walls (excluding front gap for entrance)
    const wallMat = mat(scene, `wall_${floorIndex}`, [0.9, 0.9, 0.95]);
    const wallL = MeshBuilder.CreateBox(`wl_${floorIndex}`, { width: 0.4, height: FLOOR_HEIGHT, depth: BUILDING_DEPTH }, scene);
    wallL.position = new Vector3(-BUILDING_WIDTH / 2, yBase + FLOOR_HEIGHT / 2, 0);
    wallL.material = wallMat; wallL.checkCollisions = true;

    const wallR = MeshBuilder.CreateBox(`wr_${floorIndex}`, { width: 0.4, height: FLOOR_HEIGHT, depth: BUILDING_DEPTH }, scene);
    wallR.position = new Vector3(BUILDING_WIDTH / 2, yBase + FLOOR_HEIGHT / 2, 0);
    wallR.material = wallMat; wallR.checkCollisions = true;

    const wallB = MeshBuilder.CreateBox(`wb_${floorIndex}`, { width: BUILDING_WIDTH, height: FLOOR_HEIGHT, depth: 0.4 }, scene);
    wallB.position = new Vector3(0, yBase + FLOOR_HEIGHT / 2, BUILDING_DEPTH / 2);
    wallB.material = wallMat; wallB.checkCollisions = true;

    if (floorIndex !== 0) {
      // Front wall only on upper floors
      const wallF = MeshBuilder.CreateBox(`wf_${floorIndex}`, { width: BUILDING_WIDTH, height: FLOOR_HEIGHT, depth: 0.4 }, scene);
      wallF.position = new Vector3(0, yBase + FLOOR_HEIGHT / 2, -BUILDING_DEPTH / 2);
      wallF.material = wallMat; wallF.checkCollisions = true;
    }
  }

  for (let i = 0; i < 4; i++) buildFloor(i);
  hooks.onProgress(50);

  // --- Load Blender-authored per-floor interiors (fallback: primitives above) ---
  let interiorLoaded = 0;
  const onInterior = (ok: boolean) => {
    if (ok) interiorLoaded++;
    hooks.onProgress(Math.min(90, 50 + interiorLoaded * 10));
  };
  if (quality !== 'low') {
    for (let fi = 0; fi < 4; fi++) {
      loadGlb(scene, `models/structure/mall_interior_f${fi}.glb`).then((root) => {
        if (!root) { onInterior(false); return; }
        root.position = new Vector3(0, FLOOR_Y_OFFSET + fi * FLOOR_HEIGHT, 0);
        root.checkCollisions = true;
        root.isPickable = false; // structure is not a product target
        for (const child of root.getChildMeshes()) {
          child.isPickable = false;
          child.checkCollisions = true;
          try {
            const th = Math.min(
              child.getBoundingInfo().boundingBox.maximumWorld.y - child.getBoundingInfo().boundingBox.minimumWorld.y,
              0.2,
            );
            (child as any).collisionRetryDistance = Math.max(0.6, th * 1.5);
          } catch { /* noop */ }
        }
        // Interior GLB contains its own floor plate/walls: hide the primitive duplicates
        scene.getMeshByName(`floor_${fi}`)?.dispose();
        scene.getMeshByName(`ceiling_${fi}`)?.dispose();
        scene.getMeshByName(`wl_${fi}`)?.dispose();
        scene.getMeshByName(`wr_${fi}`)?.dispose();
        scene.getMeshByName(`wb_${fi}`)?.dispose();
        scene.getMeshByName(`wf_${fi}`)?.dispose();
        onInterior(true);
      });
    }
    // Exterior shell + city environment (visible from outside / through glass)
    loadGlb(scene, 'models/structure/mall_shell.glb').then((root) => {
      if (!root) return;
      root.position.y = FLOOR_Y_OFFSET;
      root.checkCollisions = false;
      root.isPickable = false;
    });
    loadGlb(scene, 'models/environment/city_ground.glb').then((root) => {
      if (!root) return;
      root.checkCollisions = false;
      root.isPickable = false;
    });
    loadGlb(scene, 'models/environment/neighbourhood.glb').then((root) => {
      if (!root) return;
      root.checkCollisions = false;
      root.isPickable = false;
    });
  } else {
    onInterior(false); onInterior(false); onInterior(false); onInterior(false);
  }

  // --- Populate Floors ---
  
  // Floor 0: Grocery (Shelves)
  const shelfPositions = [
    { x: -10, z: -8 }, { x: 0, z: -8 }, { x: 10, z: -8 },
    { x: -10, z: 2 },  { x: 0, z: 2 },  { x: 10, z: 2 },
    { x: -10, z: 12 }, { x: 0, z: 12 }, { x: 10, z: 12 },
  ];

  // Shelves are 2.2m tall. Center Y = floorBase + (2.2 / 2)
  loadModel(scene, 'shelf.glb', { w: 4, h: 2.2, d: 1.2 }, [0.8, 0.8, 0.8]).then((template) => {
    shelfPositions.forEach((sp) => {
      const inst = template.clone('shelfInst');
      inst.position = new Vector3(sp.x, FLOOR_Y_OFFSET + 1.1, sp.z);
      inst.checkCollisions = true;
    });
    template.isVisible = false;
  });

  productsByDept.grocery.slice(0, 36).forEach((p, i) => {
    const sp = shelfPositions[Math.floor(i / 4) % 9]!;
    const slot = i % 4;
    const tier = Math.floor(slot / 2); // 0 or 1
    
    // Place on shelf tiers (yBase + 0.6 for tier 0, yBase + 1.4 for tier 1)
    const pos = new Vector3(sp.x - 1 + (slot % 2) * 1.5, FLOOR_Y_OFFSET + 0.6 + tier * 0.8, sp.z - 0.2);
    createProductMesh(scene, p, pos, [0.9, 0.2, 0.2], productMeshes);
  });

  // Floor 1: Clothing
  productsByDept.clothing.slice(0, 10).forEach((p, i) => {
    const pos = new Vector3(-10 + (i % 5) * 5, FLOOR_Y_OFFSET + FLOOR_HEIGHT + 1.2, -10 + Math.floor(i / 5) * 10);
    createProductMesh(scene, p, pos, [0.2, 0.6, 0.9], productMeshes);
  });

  // Floor 2: Electronics
  productsByDept.electronics.slice(0, 10).forEach((p, i) => {
    const pos = new Vector3(-10 + (i % 5) * 5, FLOOR_Y_OFFSET + (FLOOR_HEIGHT * 2) + 1.2, -10 + Math.floor(i / 5) * 10);
    createProductMesh(scene, p, pos, [0.1, 0.1, 0.1], productMeshes);
  });

  // Floor 3: Furniture
  productsByDept.furniture.slice(0, 10).forEach((p, i) => {
    const pos = new Vector3(-10 + (i % 5) * 5, FLOOR_Y_OFFSET + (FLOOR_HEIGHT * 3) + 1.2, -10 + Math.floor(i / 5) * 10);
    createProductMesh(scene, p, pos, [0.6, 0.4, 0.2], productMeshes);
  });

  hooks.onProgress(100);

  // --- Interaction & Hover ---
  let hoverMesh: Mesh | null = null;
  function setHover(mesh: Mesh | null) {
    if (hoverMesh === mesh) return;
    if (hoverMesh) {
      const originalMat = (hoverMesh.metadata as any)?.originalMat;
      if (originalMat) hoverMesh.material = originalMat;
    }
    hoverMesh = mesh;
    if (mesh) {
      if (!mesh.metadata.originalMat) mesh.metadata.originalMat = mesh.material;
      mesh.material = highlightMat;
    }
    const meta = mesh?.metadata as any;
    hooks.onHoverProduct(meta?.productId ? { productId: meta.productId, name: meta.name, price: meta.price } : null);
  }

  scene.onBeforeRenderObservable.add(() => {
    if (paused || stage !== 'inside') return;
    
    if (isMobile) {
      if (Math.abs(moveVector.x) > 0.01 || Math.abs(moveVector.z) > 0.01) {
        const fwd = camera.getDirection(Vector3.Forward()); fwd.y = 0; fwd.normalize();
        const right = camera.getDirection(Vector3.Right()); right.y = 0; right.normalize();
        camera.cameraDirection.addInPlace(fwd.scale(moveVector.z * 0.1).add(right.scale(moveVector.x * 0.1)));
      }
    } else {
      if (document.pointerLockElement !== canvas) { setHover(null); return; }
      const ray = scene.createPickingRay(canvas.clientWidth / 2, canvas.clientHeight / 2, Matrix.Identity(), camera);
      const hit = scene.pickWithRay(ray, (m) => m.isPickable && m.isEnabled() && !!m.metadata?.productId);
      setHover(hit?.pickedMesh as Mesh ?? null);
    }
  });

  // --- INSPECTION SYSTEM ---
  let inspectCamera: ArcRotateCamera | null = null;
  let inspectMesh: Mesh | null = null;

  const startInspection = (product: Product) => {
    paused = true;
    if (document.pointerLockElement === canvas) document.exitPointerLock();

    const originalMesh = productMeshes.find(m => m.metadata?.productId === product._id);
    inspectCamera = new ArcRotateCamera('inspectCam', Math.PI / 2, Math.PI / 3, 2, new Vector3(0, 1.5, 0), scene);
    inspectCamera.lowerRadiusLimit = 0.8;
    inspectCamera.upperRadiusLimit = 4;
    inspectCamera.attachControl(canvas, true);

    if (originalMesh) {
      inspectMesh = originalMesh.clone(`inspect_${product._id}`);
      inspectMesh.position = new Vector3(0, 1.5, 0);
      inspectMesh.parent = null; // Detach from original transform
      originalMesh.isVisible = false;
    } else {
      inspectMesh = MeshBuilder.CreateBox(`inspect_${product._id}`, { width: 0.6, height: 0.8, depth: 0.6 }, scene);
      inspectMesh.position = new Vector3(0, 1.5, 0);
      inspectMesh.material = mat(scene, 'inspectMat', [0.2, 0.6, 0.9]);
    }

    scene.activeCamera = inspectCamera;
  };

  const stopInspection = () => {
    if (inspectCamera) { inspectCamera.dispose(); inspectCamera = null; }
    if (inspectMesh) { inspectMesh.dispose(); inspectMesh = null; }
    productMeshes.forEach(m => m.isVisible = true);
    scene.activeCamera = camera;
    paused = false;
    if (!isMobile) engine.enterPointerlock();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (paused || stage !== 'inside') return;
    if (e.key.toLowerCase() === 'e' && hoverMesh) {
      const pid = (hoverMesh.metadata as any)?.productId;
      if (pid) hooks.onPickProduct(pid);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  const onPointerDown = (e: PointerEvent) => {
    if (inspectCamera || paused || stage !== 'inside') return;
    
    if (!isMobile && document.pointerLockElement !== canvas) {
      engine.enterPointerlock();
      return;
    }

    if (isMobile) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.clientWidth;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.clientHeight;
      const hit = scene.pickWithRay(scene.createPickingRay(x, y, Matrix.Identity(), camera), (m) => !!m.metadata?.productId);
      if (hit?.pickedMesh?.metadata?.productId) hooks.onPickProduct(hit.pickedMesh.metadata.productId);
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  let orbitAngle = Math.PI;
  scene.onBeforeRenderObservable.add(() => {
    if (stage !== 'exterior') return;
    orbitAngle += 0.0015;
    camera.position = new Vector3(Math.sin(orbitAngle) * 34, 8, -28 + Math.cos(orbitAngle) * 6);
    camera.setTarget(new Vector3(0, 4, -BUILDING_DEPTH / 2));
  });

  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());

  return {
    dispose: () => { scene.dispose(); engine.dispose(); },
    setPaused: (p: boolean) => { paused = p; if (p && document.pointerLockElement === canvas) document.exitPointerLock(); },
    enterBuilding: () => {
      if (stage !== 'exterior') return;
      stage = 'entering';
      hooks.onStageChange('entering');
      // Move camera to entrance
      camera.position = new Vector3(0, 1.7, -BUILDING_DEPTH / 2 - 3);
      camera.setTarget(new Vector3(0, 1.7, -BUILDING_DEPTH / 2 + 5));
      if (!isMobile) camera.attachControl(canvas, true);
      setTimeout(() => { 
        stage = 'inside'; 
        hooks.onStageChange('inside');
        // Walk inside
        camera.position.z = -BUILDING_DEPTH / 2 + 2;
      }, 1000);
    },
    goToFloor: (f: MartFloor) => { 
      if (stage === 'inside') { 
        camera.position = new Vector3(0, f * FLOOR_HEIGHT + 1.7, 0); 
        currentFloor = f; 
        hooks.onFloorChange(f); 
        setHover(null); 
      } 
    },
    setMoveVector: (x: number, z: number) => { moveVector.x = x; moveVector.z = z; },
    enterPointerLock: () => { if (!isMobile && !inspectCamera && document.pointerLockElement !== canvas) engine.enterPointerlock(); },
    startInspection,
    stopInspection
  };
}

// Helper to create visible products synchronously
function createProductMesh(scene: Scene, p: Product, pos: Vector3, color: [number, number, number], collection: Mesh[]) {
  const name = p.name.toLowerCase();
  let dims = { width: 0.4, height: 0.5, depth: 0.4 };
  let filename = 'product_box.glb';

  if (name.includes('cola') || name.includes('can')) { dims = { width: 0.2, height: 0.4, depth: 0.2 }; filename = 'product_can.glb'; }
  if (name.includes('water') || name.includes('oil') || name.includes('juice') || name.includes('milk')) { dims = { width: 0.2, height: 0.5, depth: 0.2 }; filename = 'product_bottle.glb'; }

  const fallbackBox = MeshBuilder.CreateBox(`p_${p._id}`, dims, scene);
  fallbackBox.position = pos;
  fallbackBox.material = mat(scene, `mat_${p.sku}`, color);
  fallbackBox.metadata = { productId: p._id, name: p.name, price: p.price, sku: p.sku, originalMat: fallbackBox.material };
  fallbackBox.isPickable = true;
  fallbackBox.checkCollisions = true;
  collection.push(fallbackBox);

  // Try to upgrade to the product's authored GLB (from API modelUrl), auto-scaled.
  const modelPath = p.modelUrl ?? filename;
  const targetSize = DEPT_MODEL_SIZE[p.department] ?? Math.max(dims.width, dims.depth);
  loadModelScaled(scene, modelPath, targetSize, color, `p_${p._id}`).then(({ mesh: glb }) => {
    glb.position.addInPlace(pos); // models are bottom-anchored at y=0 by loader
    glb.metadata = fallbackBox.metadata;
    glb.isPickable = true;
    glb.checkCollisions = true;

    // Swap in collection
    const idx = collection.indexOf(fallbackBox);
    if (idx > -1) collection[idx] = glb as Mesh;

    fallbackBox.dispose();
  });
}