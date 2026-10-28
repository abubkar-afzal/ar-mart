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
import '@babylonjs/core/Meshes/Builders/boxBuilder';
import '@babylonjs/core/Meshes/Builders/groundBuilder';
import '@babylonjs/core/Cameras/Inputs/freeCameraKeyboardMoveInput';
import '@babylonjs/core/Cameras/Inputs/freeCameraMouseInput';
import type { Product } from '@armart/shared';

export type Hint = { productId: string; name: string; price: number };

export type MartHooks = {
  onHoverProduct: (hint: Hint | null) => void;
  onPickProduct: (productId: string) => void;
};

export type MartHandle = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
};

export function createMartScene(canvas: HTMLCanvasElement, products: Product[], hooks: MartHooks): MartHandle {
  const engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.86, 0.92, 0.97, 1);
  scene.collisionsEnabled = true;

  const camera = new FreeCamera('camera', new Vector3(0, 1.7, -14), scene);
  camera.setTarget(new Vector3(0, 1.7, 0));
  camera.attachControl(canvas, true);
  camera.speed = 0.15;
  camera.inertia = 0.7;
  camera.angularSensibility = 3500;
  camera.minZ = 0.1;
  camera.ellipsoid = new Vector3(0.4, 0.9, 0.4);
  camera.checkCollisions = true;
  camera.keysUp = [87, 38];
  camera.keysDown = [83, 40];
  camera.keysLeft = [65, 37];
  camera.keysRight = [68, 39];

  // Lights
  new HemisphericLight('ambient', new Vector3(0, 1, 0), scene).intensity = 0.75;
  const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.4), scene);
  sun.intensity = 0.5;

  // Floor
  const floor = MeshBuilder.CreateGround('floor', { width: 40, height: 44 }, scene);
  const floorMat = new StandardMaterial('floorMat', scene);
  floorMat.diffuseColor = new Color3(0.92, 0.9, 0.87);
  floor.material = floorMat;
  floor.checkCollisions = true;
  floor.isPickable = true;

  // Walls
  const wallMat = new StandardMaterial('wallMat', scene);
  wallMat.diffuseColor = new Color3(0.96, 0.95, 0.93);
  const wallDefs = [
    { w: 40, d: 0.4, x: 0, z: 22 },
    { w: 40, d: 0.4, x: 0, z: -22 },
    { w: 0.4, d: 44, x: -20, z: 0 },
    { w: 0.4, d: 44, x: 20, z: 0 },
  ];
  for (const w of wallDefs) {
    const m = MeshBuilder.CreateBox('wall', { width: w.w, height: 5, depth: w.d }, scene);
    m.position = new Vector3(w.x, 2.5, w.z);
    m.material = wallMat;
    m.checkCollisions = true;
    m.isPickable = true;
  }

  // Entrance archway (visual landmark)
  const archMat = new StandardMaterial('archMat', scene);
  archMat.diffuseColor = new Color3(0.84, 0.15, 0.15);
  for (const x of [-3, 3]) {
    const pillar = MeshBuilder.CreateBox('pillar', { width: 0.6, height: 3, depth: 0.6 }, scene);
    pillar.position = new Vector3(x, 1.5, -20);
    pillar.material = archMat;
    pillar.checkCollisions = true;
    pillar.isPickable = true;
  }
  const lintel = MeshBuilder.CreateBox('lintel', { width: 7.2, height: 0.6, depth: 0.6 }, scene);
  lintel.position = new Vector3(0, 3.2, -20);
  lintel.material = archMat;
  lintel.checkCollisions = true;
  lintel.isPickable = true;

  // Shelves
  const shelfMat = new StandardMaterial('shelfMat', scene);
  shelfMat.diffuseColor = new Color3(0.62, 0.46, 0.32);
  const shelfPositions: { x: number; z: number }[] = [
    { x: -8, z: -6 },
    { x: 0, z: -6 },
    { x: 8, z: -6 },
    { x: -8, z: 2 },
    { x: 0, z: 2 },
    { x: 8, z: 2 },
    { x: -8, z: 10 },
    { x: 0, z: 10 },
    { x: 8, z: 10 },
  ];
  const shelfHeight = 2.2;
  const shelfWidth = 4;
  const shelfDepth = 1;
  for (const sp of shelfPositions) {
    const shelf = MeshBuilder.CreateBox(
      'shelf',
      { width: shelfWidth, height: shelfHeight, depth: shelfDepth },
      scene,
    );
    shelf.position = new Vector3(sp.x, shelfHeight / 2, sp.z);
    shelf.material = shelfMat;
    shelf.checkCollisions = true;
    shelf.isPickable = true;
  }

  // Products
  const productMaterials: Record<string, StandardMaterial> = {};
  const hint: { current: Mesh | null } = { current: null };
  const productMeshes: Mesh[] = [];

  const baseColors: [number, number, number][] = [
    [0.86, 0.24, 0.24],
    [0.22, 0.55, 0.86],
    [0.2, 0.7, 0.4],
    [0.9, 0.68, 0.2],
    [0.55, 0.35, 0.8],
    [0.85, 0.4, 0.65],
  ];

  products.forEach((p, i) => {
    const shelf = shelfPositions[i % shelfPositions.length]!;
    const slot = Math.floor(i / shelfPositions.length);
    const slotsPerShelf = 4;
    const slotIndex = slot % slotsPerShelf;
    const offsetX = -1.2 + slotIndex * 0.8;
    const box = MeshBuilder.CreateBox(
      `product_${p._id}`,
      { width: 0.45, height: 0.6, depth: 0.4 },
      scene,
    );
    box.position = new Vector3(shelf.x + offsetX, 0.6, shelf.z - shelfDepth / 2 - 0.35);
    const color = baseColors[i % baseColors.length]!;
    let mat = productMaterials[p._id];
    if (!mat) {
      mat = new StandardMaterial(`mat_${p._id}`, scene);
      mat.diffuseColor = new Color3(color[0], color[1], color[2]);
      productMaterials[p._id] = mat;
    }
    box.material = mat;
    box.isPickable = true;
    box.metadata = { productId: p._id, name: p.name, price: p.price };
    productMeshes.push(box);
  });

  // Hover highlight
  const highlightMat = new StandardMaterial('highlightMat', scene);
  highlightMat.emissiveColor = new Color3(1, 0.85, 0.2);
  highlightMat.diffuseColor = new Color3(1, 1, 1);

  function setHover(mesh: Mesh | null) {
    if (hint.current === mesh) return;
    if (hint.current) {
      const pid = hint.current.metadata?.productId as string | undefined;
      if (pid) hint.current.material = productMaterials[pid] ?? null;
    }
    hint.current = mesh;
    if (mesh) mesh.material = highlightMat;
    const meta = mesh?.metadata as { productId?: string; name?: string; price?: number } | undefined;
    hooks.onHoverProduct(
      meta?.productId && typeof meta.name === 'string' && typeof meta.price === 'number'
        ? { productId: meta.productId, name: meta.name, price: meta.price }
        : null,
    );
  }

  let paused = false;

  // Per-frame: pick product at screen center while pointer is locked
  scene.onBeforeRenderObservable.add(() => {
    if (paused) return;
    if (document.pointerLockElement !== canvas) {
      setHover(null);
      return;
    }
    const ray = scene.createPickingRay(canvas.clientWidth / 2, canvas.clientHeight / 2, Matrix.Identity(), camera);
    const hit = scene.pickWithRay(ray, (m) => m.isPickable && m.isEnabled());
    if (hit?.pickedMesh && hit.pickedMesh.metadata && (hit.pickedMesh.metadata as { productId?: string }).productId) {
      setHover(hit.pickedMesh as Mesh);
    } else {
      setHover(null);
    }
  });

  // E key: open the product card
  const onKeyDown = (e: KeyboardEvent) => {
    if (paused) return;
    if (e.key.toLowerCase() === 'e' && hint.current) {
      const meta = hint.current.metadata as { productId?: string } | undefined;
      if (meta?.productId) hooks.onPickProduct(meta.productId);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // Release pointer lock on Escape and reset hover
  const onPointerLockChange = () => {
    if (document.pointerLockElement !== canvas) setHover(null);
  };
  document.addEventListener('pointerlockchange', onPointerLockChange);

  engine.runRenderLoop(() => scene.render());

  const onResize = () => engine.resize();
  window.addEventListener('resize', onResize);

  return {
    dispose: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      scene.dispose();
      engine.dispose();
    },
    setPaused: (p: boolean) => {
      paused = p;
      if (p && document.pointerLockElement === canvas) document.exitPointerLock();
      if (!p) setHover(null);
    },
  };
}

// Keep unused imports from being tree-shaken warnings; ArcRotateCamera is
// imported for future floor-transition helpers (Part 2).
export { ArcRotateCamera };