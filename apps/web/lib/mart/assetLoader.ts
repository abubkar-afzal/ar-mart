import { Color3, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF'; // Registers the glTF/GLB plugin
import '@babylonjs/core/Meshes/Builders/boxBuilder';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { mat } from './helpers';

/**
 * Normalize a model path coming from the API (`models/products/x.glb`), an
 * absolute public path (`/models/...`) or a bare filename (`x.glb`) into a
 * root-relative URL served from apps/web/public.
 */
export function normalizeModelPath(p: string): string {
  if (p.startsWith('/')) return p;
  return `/models/${p.replace(/^models\//, '')}`;
}

/** World-space bounding size of a loaded root mesh (children included). */
export function measureMesh(root: AbstractMesh): { w: number; h: number; d: number } {
  let min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
  let max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
  const meshes: AbstractMesh[] = [root, ...root.getChildMeshes()];
  for (const m of meshes) {
    try {
      m.computeWorldMatrix(true);
      const bb = m.getBoundingInfo().boundingBox;
      min = Vector3.Minimize(min, bb.minimumWorld);
      max = Vector3.Maximize(max, bb.maximumWorld);
    } catch {
      /* skip meshes without geometry (e.g. transform nodes) */
    }
  }
  const s = max.subtract(min);
  return { w: Math.max(s.x, 0.01), h: Math.max(s.y, 0.01), d: Math.max(s.z, 0.01) };
}

/**
 * Load a GLB by full/relative path. Returns null when the file is missing or
 * contains no meshes — callers decide on a fallback.
 */
export async function loadGlb(scene: Scene, path: string): Promise<AbstractMesh | null> {
  const url = normalizeModelPath(path);
  try {
    const result = await SceneLoader.ImportMeshAsync('', url, '', scene);
    const root = result.meshes.find((m) => m.name === '__root__') ?? result.meshes[0];
    if (!root || result.meshes.length === 0) return null;
    return root;
  } catch {
    return null;
  }
}

/**
 * Load a product/display asset and auto-scale it so its largest horizontal
 * dimension matches `targetSize` metres, then reposition so the given
 * `anchor` ("bottom" sits on targetY) is respected. On failure returns a
 * coloured fallback box with the requested dims.
 */
export async function loadModelScaled(
  scene: Scene,
  path: string,
  targetSize: number,
  color: [number, number, number],
  name: string,
): Promise<{ mesh: AbstractMesh; scaled: boolean }> {
  const root = await loadGlb(scene, path);
  if (!root) {
    const box = MeshBuilder.CreateBox(`${name}_fallback`, { width: targetSize, height: targetSize, depth: targetSize }, scene);
    box.material = mat(scene, `${name}_mat`, color);
    box.checkCollisions = true;
    box.isPickable = true;
    return { mesh: box, scaled: false };
  }
  const dims = measureMesh(root);
  const horiz = Math.max(dims.w, dims.d);
  const k = horiz > 0 ? targetSize / horiz : 1;
  if (Math.abs(k - 1) > 0.01) root.scaling.scaleInPlace(k);
  root.computeWorldMatrix(true);
  const bb = root.getBoundingInfo().boundingBox;
  const minY = bb.minimumWorld.y;
  // keep X/Z where authored, lift/lower so bottom sits at y = 0 plane locally
  root.position.y -= minY;
  root.checkCollisions = true;
  root.isPickable = true;
  for (const child of root.getChildMeshes()) {
    child.isPickable = true;
    child.checkCollisions = true;
    try {
      const cbb = child.getBoundingInfo().boundingBox;
      const th = Math.min(cbb.maximumWorld.y - cbb.minimumWorld.y, 0.2);
      (child as any).collisionRetryDistance = Math.max(0.6, th * 1.5); // avoid tunnelling thin slabs
    } catch { /* noop */ }
  }
  return { mesh: root, scaled: true };
}

/** Legacy loader kept for structural assets (shelves etc.) — loads from /models/<filename>. */
export async function loadModel(
  scene: Scene,
  filename: string,
  fallbackDims: { w: number; h: number; d: number },
  fallbackColor: [number, number, number],
): Promise<any> {
  try {
    const result = await SceneLoader.ImportMeshAsync('', '/models/', filename, scene);
    const root = result.meshes[0];
    if (!root) throw new Error(`GLB ${filename} contained no meshes`);
    root.checkCollisions = true;
    root.isPickable = true;
    return root;
  } catch (e) {
    // Fallback if the .glb files are missing
    const box = MeshBuilder.CreateBox(filename, { width: fallbackDims.w, height: fallbackDims.h, depth: fallbackDims.d }, scene);
    box.material = mat(scene, `${filename}_mat`, fallbackColor);
    box.checkCollisions = true;
    box.isPickable = true;
    return box;
  }
}
