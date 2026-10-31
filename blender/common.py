"""AR MART Blender pipeline — shared helpers.

Runs under stock Blender 4.x (``blender --background --python script.py``)
and under the headless ``bpy`` pip module (``python script.py``).
Units: 1 Blender unit = 1 metre. Z-up world, mall centred at origin.
Coordinate convention (must match Babylon scene.ts):
  X: building width (-20..20), Y: depth front(-22)..back(+22) in Blender
  (Babylon maps Blender +Y -> -Z), Z: up, floor height = 6m, slab top = 0.4m.
"""
import bpy
import math
import os
import sys
from mathutils import Vector, Matrix

FLOOR_H = 6.0
SLAB_TOP = 0.0          # products/furniture sit on z=0 per floor; slab handled in structure
BW, BD = 40.0, 44.0     # building width / depth

OUT_DIR = os.environ.get(
    "ARMART_OUT",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                 "apps", "web", "public", "models"),
)


def fresh_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def link(obj, coll=None):
    coll = coll or bpy.context.collection
    if obj.name not in [o.name for o in coll.objects]:
        coll.objects.link(obj)
    return obj


def mesh_from_prims(name, prims):
    """Build one mesh from a list of primitive dicts, join, return object.

    prim keys: kind ('box'|'cyl'|'sphere'|'cone'|'torus'), dims dict,
    loc, rot (deg xyz), scale.
    """
    objs = []
    for i, p in enumerate(prims):
        kind = p["kind"]
        if kind == "box":
            d = {"width": p["dims"].get("w", 1), "depth": p["dims"].get("d", 1),
                 "height": p["dims"].get("h", 1)}
            bpy.ops.mesh.primitive_cube_add(size=1, location=p.get("loc", (0, 0, 0)))
            o = bpy.context.active_object
            o.scale = (d["width"], d["depth"], d["height"])
        elif kind == "cyl":
            bpy.ops.mesh.primitive_cylinder_add(
                radius=p["dims"].get("r", 0.5), depth=p["dims"].get("h", 1),
                vertices=p.get("verts", 24), location=p.get("loc", (0, 0, 0)))
            o = bpy.context.active_object
        elif kind == "cone":
            bpy.ops.mesh.primitive_cone_add(
                radius1=p["dims"].get("r1", 0.5), radius2=p["dims"].get("r2", 0.0),
                depth=p["dims"].get("h", 1), vertices=p.get("verts", 24),
                location=p.get("loc", (0, 0, 0)))
            o = bpy.context.active_object
        elif kind == "sphere":
            bpy.ops.mesh.primitive_uv_sphere_add(
                radius=p["dims"].get("r", 0.5), segments=p.get("seg", 20),
                ring_count=max(8, p.get("seg", 20) // 2), location=p.get("loc", (0, 0, 0)))
            o = bpy.context.active_object
            if p.get("squash"):
                o.scale = p["squash"]
        elif kind == "torus":
            bpy.ops.mesh.primitive_torus_add(
                major_radius=p["dims"].get("R", 1), minor_radius=p["dims"].get("r", 0.1),
                location=p.get("loc", (0, 0, 0)))
            o = bpy.context.active_object
        else:
            raise ValueError(f"unknown kind {kind}")
        o.rotation_euler = [math.radians(a) for a in p.get("rot", (0, 0, 0))]
        if kind != "box":
            s = p.get("scale")
            if s:
                o.scale = s
        objs.append(o)
    for o in objs:
        bpy.context.view_layer.objects.active = None
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    out = bpy.context.active_object
    out.name = name
    out.data.name = name
    return out


def assign_mats(obj, slots):
    """slots: list of material names; faces keep single slot unless face_map given."""
    obj.data.materials.clear()
    for mname in slots:
        obj.data.materials.append(get_mat(mname))


def get_mat(name):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    spec = MAT_SPECS.get(name)
    if bsdf and spec:
        for k, v in spec.items():
            if k == "color":
                bsdf.inputs["Base Color"].default_value = (*v, 1)
            elif k == "metal":
                bsdf.inputs["Metallic"].default_value = v
            elif k == "rough":
                bsdf.inputs["Roughness"].default_value = v
            elif k == "emit":
                bsdf.inputs["Emission Color"].default_value = (*v, 1)
                bsdf.inputs["Emission Strength"].default_value = 4.0
            elif k == "alpha":
                bsdf.inputs["Alpha"].default_value = v
                m.blend_method = "BLEND"
    return m


# palette (name -> spec)
MAT_SPECS = {
    "floor_tile":      {"color": (0.88, 0.86, 0.82), "rough": 0.35},
    "wall_white":      {"color": (0.92, 0.92, 0.94), "rough": 0.7},
    "slab_concrete":   {"color": (0.45, 0.45, 0.47), "rough": 0.9},
    "glass_blue":      {"color": (0.35, 0.55, 0.75), "rough": 0.05, "alpha": 0.25},
    "steel":           {"color": (0.55, 0.56, 0.58), "metal": 0.9, "rough": 0.35},
    "dark_metal":      {"color": (0.12, 0.12, 0.13), "metal": 0.6, "rough": 0.5},
    "rail_black":      {"color": (0.08, 0.08, 0.09), "metal": 0.4, "rough": 0.5},
    "wood_light":      {"color": (0.62, 0.44, 0.26), "rough": 0.6},
    "wood_dark":       {"color": (0.32, 0.20, 0.12), "rough": 0.55},
    "shelf_white":     {"color": (0.85, 0.85, 0.87), "rough": 0.5},
    "sign_red":        {"color": (0.75, 0.08, 0.10), "rough": 0.4, "emit": (0.8, 0.05, 0.05)},
    "sign_amber":      {"color": (0.9, 0.6, 0.1), "emit": (0.9, 0.55, 0.1)},
    "ceiling_panel":   {"color": (0.93, 0.93, 0.93), "rough": 0.8},
    "light_panel":     {"color": (1, 1, 1), "emit": (1.0, 0.98, 0.9)},
    "asphalt":         {"color": (0.16, 0.16, 0.17), "rough": 0.95},
    "road_marking":    {"color": (0.9, 0.9, 0.85), "rough": 0.6},
    "sidewalk":        {"color": (0.6, 0.6, 0.62), "rough": 0.9},
    "grass":           {"color": (0.18, 0.35, 0.12), "rough": 0.95},
    "tree_trunk":      {"color": (0.3, 0.2, 0.12), "rough": 0.9},
    "tree_leaf":       {"color": (0.12, 0.32, 0.10), "rough": 0.9},
    "car_red":         {"color": (0.6, 0.05, 0.06), "rough": 0.25, "metal": 0.6},
    "car_white":       {"color": (0.85, 0.85, 0.86), "rough": 0.25, "metal": 0.6},
    "car_black":       {"color": (0.05, 0.05, 0.06), "rough": 0.2, "metal": 0.7},
    "building_neigh":  {"color": (0.55, 0.52, 0.5), "rough": 0.8},
    "fabric_sofa":     {"color": (0.25, 0.35, 0.55), "rough": 0.95},
    "fabric_warm":     {"color": (0.65, 0.4, 0.3), "rough": 0.95},
    "cushion":         {"color": (0.85, 0.8, 0.7), "rough": 0.95},
    "screen_off":      {"color": (0.02, 0.02, 0.03), "rough": 0.1},
    "screen_on":       {"color": (0.1, 0.1, 0.1), "emit": (0.2, 0.5, 0.9)},
    "plastic_white":   {"color": (0.9, 0.9, 0.9), "rough": 0.4},
    "plastic_red":     {"color": (0.7, 0.05, 0.05), "rough": 0.4},
    "plastic_green":   {"color": (0.1, 0.5, 0.15), "rough": 0.4},
    "plastic_blue":    {"color": (0.1, 0.25, 0.6), "rough": 0.4},
    "plastic_yellow":  {"color": (0.85, 0.7, 0.1), "rough": 0.4},
    "cardboard":       {"color": (0.72, 0.55, 0.35), "rough": 0.9},
    "paper_white":     {"color": (0.95, 0.95, 0.95), "rough": 0.8},
    "can_alu":         {"color": (0.75, 0.76, 0.78), "metal": 1.0, "rough": 0.25},
    "bottle_clear":    {"color": (0.6, 0.75, 0.8), "rough": 0.05, "alpha": 0.4},
    "produce_orange":  {"color": (0.85, 0.4, 0.05), "rough": 0.7},
    "produce_green":   {"color": (0.2, 0.55, 0.1), "rough": 0.7},
    "meat_pink":       {"color": (0.75, 0.35, 0.35), "rough": 0.6},
    "garment_navy":    {"color": (0.1, 0.15, 0.35), "rough": 0.9},
    "garment_grey":    {"color": (0.45, 0.45, 0.48), "rough": 0.9},
    "mannequin_beige": {"color": (0.85, 0.78, 0.7), "rough": 0.7},
    "lamp_shade":      {"color": (0.95, 0.9, 0.8), "emit": (0.95, 0.85, 0.6)},
    "mirror":          {"color": (0.9, 0.9, 0.9), "metal": 1.0, "rough": 0.02},
}


def export_glb(objs, path):
    """Export listed objects to GLB (selected-only), apply transforms baked."""
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True,
        export_apply=True, export_yup=True, export_materials="EXPORT",
        export_image_format="AUTO", export_extras=True,
    )
    sz = os.path.getsize(path)
    assert sz > 1000, f"suspiciously small GLB: {path} ({sz} bytes)"
    print(f"exported {path} ({sz:,} bytes)")
    return sz


def product_obj(model_name, prims, mats):
    """Create a named product object, assign materials, return it."""
    o = mesh_from_prims(model_name, prims)
    if isinstance(mats, str):
        mats = [mats]
    assign_mats(o, mats)
    return o
