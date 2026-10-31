import { Scene } from '@babylonjs/core';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF'; // Registers the glTF/GLB plugin
import '@babylonjs/core/Meshes/Builders/boxBuilder';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { mat } from './helpers';

export async function loadModel(
  scene: Scene,
  filename: string, 
  fallbackDims: { w: number, h: number, d: number },
  fallbackColor: [number, number, number]
): Promise<any> {
  try {
    // Loads from /public/models/your-file.glb
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