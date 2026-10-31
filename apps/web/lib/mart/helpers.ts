import '@babylonjs/core/Meshes/Builders/boxBuilder';
import '@babylonjs/core/Meshes/Builders/groundBuilder';
import '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import '@babylonjs/core/Meshes/Builders/sphereBuilder';

import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

export function mat(scene: Scene, name: string, rgb: [number, number, number]): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = new Color3(rgb[0], rgb[1], rgb[2]);
  return m;
}

export function glassMat(scene: Scene, name: string): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = new Color3(0.8, 0.9, 1);
  m.alpha = 0.25;
  m.specularColor = new Color3(1, 1, 1);
  return m;
}

export function makeFloor(scene: Scene, y: number, name: string): Mesh {
  const floor = MeshBuilder.CreateGround(name, { width: 39, height: 43 }, scene);
  floor.position.y = y;
  const m = mat(scene, `${name}Mat`, [0.85, 0.85, 0.85]);
  m.specularColor = new Color3(0.1, 0.1, 0.1);
  floor.material = m;
  floor.checkCollisions = true;
  floor.isPickable = true;
  return floor;
}

export function makeCeiling(scene: Scene, y: number): Mesh {
  const ceil = MeshBuilder.CreateBox('ceiling', { width: 39, height: 0.2, depth: 43 }, scene);
  ceil.position.y = y;
  ceil.material = mat(scene, 'ceilingMat', [0.95, 0.95, 0.95]);
  return ceil;
}

export function makeCeilingLights(scene: Scene, y: number): void {
  const lightMat = new StandardMaterial('lightMat', scene);
  lightMat.emissiveColor = new Color3(1, 1, 0.9);
  lightMat.disableLighting = true;

  for (let x = -12; x <= 12; x += 8) {
    for (let z = -16; z <= 16; z += 8) {
      const light = MeshBuilder.CreateBox('light', { width: 0.5, height: 0.1, depth: 4 }, scene);
      light.position = new Vector3(x, y - 0.15, z);
      light.material = lightMat;
    }
  }
}

export function makeShelf(scene: Scene, pos: Vector3, dims: { w: number; h: number; d: number }, m: StandardMaterial): Mesh {
  const root = new Mesh('shelfRoot', scene);
  root.position = pos;
  root.checkCollisions = true;

  const back = MeshBuilder.CreateBox('shelfBack', { width: dims.w, height: dims.h, depth: 0.1 }, scene);
  back.material = m;
  back.parent = root;
  back.position = new Vector3(0, 0, dims.d / 2);

  for (let i = 0; i <= 3; i++) {
    const tier = MeshBuilder.CreateBox('tier', { width: dims.w, height: 0.05, depth: dims.d }, scene);
    tier.material = m;
    tier.parent = root;
    tier.position = new Vector3(0, -dims.h / 2 + (i * dims.h) / 3, 0);
  }

  const left = MeshBuilder.CreateBox('left', { width: 0.1, height: dims.h, depth: dims.d }, scene);
  left.material = m; left.parent = root; left.position.x = -dims.w / 2;
  
  const right = MeshBuilder.CreateBox('right', { width: 0.1, height: dims.h, depth: dims.d }, scene);
  right.material = m; right.parent = root; right.position.x = dims.w / 2;

  return root;
}

export function makeCheckout(scene: Scene, pos: Vector3): Mesh {
  const root = new Mesh('checkout', scene);
  root.position = pos;
  root.checkCollisions = true;

  const counter = MeshBuilder.CreateBox('counter', { width: 3, height: 1, depth: 1.5 }, scene);
  counter.material = mat(scene, `checkoutMat_${pos.x}`, [0.9, 0.9, 0.9]);
  counter.parent = root;
  counter.position.y = 0.5;
  counter.isPickable = true;

  const belt = MeshBuilder.CreateBox('belt', { width: 1.5, height: 0.05, depth: 1.2 }, scene);
  belt.material = mat(scene, `beltMat_${pos.x}`, [0.2, 0.2, 0.2]);
  belt.parent = root;
  belt.position = new Vector3(-0.7, 1.02, 0);

  const register = MeshBuilder.CreateBox('register', { width: 0.5, height: 0.4, depth: 0.4 }, scene);
  register.material = mat(scene, `regMat_${pos.x}`, [0.3, 0.3, 0.3]);
  register.parent = root;
  register.position = new Vector3(1, 1.2, 0);

  return root;
}

export function makeTree(scene: Scene, pos: Vector3): Mesh {
  const trunk = MeshBuilder.CreateCylinder('trunk', { height: 1.6, diameter: 0.25 }, scene);
  trunk.position = new Vector3(pos.x, pos.y + 0.8, pos.z);
  trunk.material = mat(scene, `trunk_${pos.x}_${pos.z}`, [0.4, 0.25, 0.15]);
  trunk.checkCollisions = true;
  const foliage = MeshBuilder.CreateSphere('foliage', { diameter: 1.8, segments: 6 }, scene);
  foliage.material = mat(scene, `foliage_${pos.x}_${pos.z}`, [0.2, 0.55, 0.25]);
  foliage.parent = trunk;
  foliage.position = new Vector3(0, 1.5, 0);
  return trunk;
}

export function makeCar(scene: Scene, pos: Vector3, color: [number, number, number]): Mesh {
  const body = MeshBuilder.CreateBox('carBody', { width: 1.8, height: 0.6, depth: 4 }, scene);
  body.position = new Vector3(pos.x, pos.y + 0.5, pos.z);
  body.material = mat(scene, `car_${pos.x}_${pos.z}`, color);
  body.checkCollisions = true;
  const cabin = MeshBuilder.CreateBox('cabin', { width: 1.5, height: 0.55, depth: 2 }, scene);
  cabin.material = mat(scene, `cab_${pos.x}_${pos.z}`, [0.2, 0.25, 0.35]);
  cabin.parent = body;
  cabin.position = new Vector3(0, 0.55, -0.1);
  for (const [dx, dz] of [[-0.9, -1.3], [0.9, -1.3], [-0.9, 1.3], [0.9, 1.3]] as const) {
    const wheel = MeshBuilder.CreateCylinder('wheel', { height: 0.3, diameter: 0.6 }, scene);
    wheel.rotation.z = Math.PI / 2;
    wheel.material = mat(scene, `w_${pos.x}_${pos.z}_${dx}_${dz}`, [0.1, 0.1, 0.1]);
    wheel.parent = body;
    wheel.position = new Vector3(dx, -0.3, dz);
  }
  return body;
}

export function makeNeighborBuilding(scene: Scene, pos: Vector3, dims: { w: number; h: number; d: number }, seed: number): Mesh {
  const b = MeshBuilder.CreateBox('neighbor', { width: dims.w, height: dims.h, depth: dims.d }, scene);
  b.position = new Vector3(pos.x, pos.y + dims.h / 2, pos.z);
  const shade = 0.45 + ((seed * 37) % 30) / 100;
  b.material = mat(scene, `nb_${seed}`, [shade, shade, shade + 0.05]);
  b.checkCollisions = true;
  const windowMat = mat(scene, `nw_${seed}`, [0.9, 0.85, 0.6]);
  const cols = Math.max(2, Math.floor(dims.w / 2));
  const rows = Math.max(3, Math.floor(dims.h / 2));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const w = MeshBuilder.CreateBox('win', { width: 0.7, height: 0.7, depth: 0.05 }, scene);
      w.material = windowMat;
      w.parent = b;
      w.position = new Vector3(
        -dims.w / 2 + 1 + c * ((dims.w - 2) / Math.max(1, cols - 1)),
        -dims.h / 2 + 1 + r * ((dims.h - 2) / Math.max(1, rows - 1)),
        dims.d / 2 + 0.03,
      );
    }
  }
  return b;
}

export function makeTable(scene: Scene, pos: Vector3, dims: { w: number; h: number; d: number }, m: StandardMaterial): Mesh {
  const top = MeshBuilder.CreateBox('tableTop', { width: dims.w, height: 0.08, depth: dims.d }, scene);
  top.position = new Vector3(pos.x, pos.y + dims.h, pos.z);
  top.material = m;
  top.checkCollisions = true;
  top.isPickable = true;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = MeshBuilder.CreateBox('leg', { width: 0.08, height: dims.h, depth: 0.08 }, scene);
    leg.material = m;
    leg.parent = top;
    leg.position = new Vector3((dx * dims.w) / 2 - dx * 0.1, -dims.h / 2, (dz * dims.d) / 2 - dz * 0.1);
  }
  return top;
}

export function makeChair(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const seat = MeshBuilder.CreateBox('seat', { width: 0.5, height: 0.08, depth: 0.5 }, scene);
  seat.position = new Vector3(pos.x, pos.y + 0.45, pos.z);
  seat.material = m;
  seat.checkCollisions = true;
  seat.isPickable = true;
  const back = MeshBuilder.CreateBox('back', { width: 0.5, height: 0.5, depth: 0.08 }, scene);
  back.material = m;
  back.parent = seat;
  back.position = new Vector3(0, 0.25, -0.21);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = MeshBuilder.CreateBox('leg', { width: 0.06, height: 0.45, depth: 0.06 }, scene);
    leg.material = m;
    leg.parent = seat;
    leg.position = new Vector3(dx * 0.2, -0.22, dz * 0.2);
  }
  return seat;
}

export function makeSofa(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const base = MeshBuilder.CreateBox('sofaBase', { width: 2.4, height: 0.5, depth: 0.9 }, scene);
  base.position = new Vector3(pos.x, pos.y + 0.25, pos.z);
  base.material = m;
  base.checkCollisions = true;
  base.isPickable = true;
  const back = MeshBuilder.CreateBox('sofaBack', { width: 2.4, height: 0.7, depth: 0.2 }, scene);
  back.material = m;
  back.parent = base;
  back.position = new Vector3(0, 0.6, -0.35);
  const armL = MeshBuilder.CreateBox('armL', { width: 0.2, height: 0.55, depth: 0.9 }, scene);
  armL.material = m;
  armL.parent = base;
  armL.position = new Vector3(-1.1, 0.1, 0);
  const armR = armL.clone('armR');
  armR.parent = base;
  armR.position = new Vector3(1.1, 0.1, 0);
  return base;
}

export function makeBed(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const base = MeshBuilder.CreateBox('bedBase', { width: 1.6, height: 0.35, depth: 2.1 }, scene);
  base.position = new Vector3(pos.x, pos.y + 0.175, pos.z);
  base.material = m;
  base.checkCollisions = true;
  base.isPickable = true;
  const mattress = MeshBuilder.CreateBox('mattress', { width: 1.5, height: 0.25, depth: 2.0 }, scene);
  mattress.material = mat(scene, `bedMattress_${pos.x}_${pos.z}`, [0.92, 0.92, 0.95]);
  mattress.parent = base;
  mattress.position = new Vector3(0, 0.3, 0);
  const headboard = MeshBuilder.CreateBox('headboard', { width: 1.6, height: 0.9, depth: 0.1 }, scene);
  headboard.material = m;
  headboard.parent = base;
  headboard.position = new Vector3(0, 0.45, -1.05);
  return base;
}

export function makeWardrobe(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const body = MeshBuilder.CreateBox('wardrobe', { width: 1.8, height: 2.1, depth: 0.6 }, scene);
  body.position = new Vector3(pos.x, pos.y + 1.05, pos.z);
  body.material = m;
  body.checkCollisions = true;
  body.isPickable = true;
  return body;
}

export function makeTV(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const screen = MeshBuilder.CreateBox('tvScreen', { width: 1.2, height: 0.7, depth: 0.06 }, scene);
  screen.position = pos;
  screen.material = m;
  screen.checkCollisions = true;
  screen.isPickable = true;
  const bezel = MeshBuilder.CreateBox('tvBezel', { width: 1.24, height: 0.74, depth: 0.02 }, scene);
  bezel.material = mat(scene, `bezel_${pos.x}_${pos.y}_${pos.z}`, [0.05, 0.05, 0.05]);
  bezel.parent = screen;
  bezel.position = new Vector3(0, 0, -0.03);
  return screen;
}

export function makeLamp(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const base = MeshBuilder.CreateCylinder('lampBase', { height: 0.05, diameter: 0.25 }, scene);
  base.position = new Vector3(pos.x, pos.y + 0.025, pos.z);
  base.material = m;
  base.isPickable = true;
  base.checkCollisions = true;
  const stem = MeshBuilder.CreateCylinder('lampStem', { height: 0.5, diameter: 0.04 }, scene);
  stem.material = m;
  stem.parent = base;
  stem.position = new Vector3(0, 0.275, 0);
  const shade = MeshBuilder.CreateCylinder('lampShade', { height: 0.2, diameterTop: 0.25, diameterBottom: 0.35 }, scene);
  shade.material = mat(scene, `shade_${pos.x}_${pos.z}`, [0.95, 0.9, 0.75]);
  shade.parent = base;
  shade.position = new Vector3(0, 0.65, 0);
  return base;
}

export function makeBookshelf(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const body = MeshBuilder.CreateBox('bookshelf', { width: 1.2, height: 2.1, depth: 0.35 }, scene);
  body.position = new Vector3(pos.x, pos.y + 1.05, pos.z);
  body.material = m;
  body.checkCollisions = true;
  body.isPickable = true;
  return body;
}

export function makeRug(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const rug = MeshBuilder.CreateGround('rug', { width: 3, height: 2 }, scene);
  rug.position = pos;
  rug.material = m;
  rug.isPickable = true;
  return rug;
}

export function makeClothingRack(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const post1 = MeshBuilder.CreateBox('post', { width: 0.08, height: 1.8, depth: 0.08 }, scene);
  post1.position = new Vector3(pos.x - 1.2, pos.y + 0.9, pos.z);
  post1.material = m;
  post1.checkCollisions = true;
  const post2 = post1.clone('post2');
  post2.position.x = pos.x + 1.2;
  const bar = MeshBuilder.CreateBox('bar', { width: 2.5, height: 0.06, depth: 0.06 }, scene);
  bar.position = new Vector3(pos.x, pos.y + 1.8, pos.z);
  bar.material = m;
  const root = MeshBuilder.CreateBox('rackroot', { width: 2.6, height: 0.06, depth: 0.9 }, scene);
  root.position = pos;
  root.material = m;
  root.checkCollisions = true;
  root.isPickable = true;
  post1.parent = root;
  post2.parent = root;
  bar.parent = root;
  post1.position = new Vector3(-1.2, 0.9, 0);
  post2.position = new Vector3(1.2, 0.9, 0);
  bar.position = new Vector3(0, 1.8, 0);
  return root;
}

export function makeMannequin(scene: Scene, pos: Vector3, m: StandardMaterial): Mesh {
  const torso = MeshBuilder.CreateCylinder('torso', { height: 1.1, diameterTop: 0.55, diameterBottom: 0.4 }, scene);
  torso.position = new Vector3(pos.x, pos.y + 1.1, pos.z);
  torso.material = m;
  torso.checkCollisions = true;
  torso.isPickable = true;
  const stand = MeshBuilder.CreateCylinder('stand', { height: 0.6, diameter: 0.35 }, scene);
  stand.material = m;
  stand.parent = torso;
  stand.position = new Vector3(0, -0.85, 0);
  return torso;
}