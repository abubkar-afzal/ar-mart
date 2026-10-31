"""Exterior world: city ground, roads, parking lot, cars, trees, neighbouring buildings."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import fresh_scene, product_obj, export_glb, OUT_DIR

def box(w, h, d, loc):
    return {"kind": "box", "dims": {"w": w, "h": h, "d": d}, "loc": loc}

def build_city_ground():
    prims = [
        box(300, 0.2, 300, (0, 0, -0.5)),                      # grass pad
        box(120, 0.21, 90, (0, 6, -0.395)),                    # paved plaza block
    ]
    # main road N-S at x=70
    prims.append(box(14, 0.22, 300, (70, 0, -0.39)))
    for i in range(-14, 15):
        prims.append(box(0.3, 0.225, 4, (70, i*10, -0.385)))
    # road E-W at y=-70
    prims.append(box(300, 0.22, 14, (0, -70, -0.39)))
    for i in range(-14, 15):
        prims.append(box(4, 0.225, 0.3, (i*10, -70, -0.385)))
    # sidewalk ring around mall
    prims.append(box(60, 0.3, 60, (0, 0, -0.25)))
    o = product_obj("city_ground", prims, ["grass", "sidewalk", "asphalt", "road_marking"])
    return o

def build_parking():
    """Asphalt lot with stalls + island curbs, placed in front of the mall (y < -26)."""
    prims = [box(46, 0.24, 26, (0, -38, -0.28))]
    # stall lines: two rows facing a lane
    for row_y in (-31.5, -36.5):
        for i in range(10):
            x = -21 + i * 4.4
            prims.append(box(0.15, 0.245, 5, (x, row_y, -0.27)))
        prims.append(box(44, 0.245, 0.15, (0, row_y + 2.5, -0.27)))
    # light poles
    for px in (-18, -6, 6, 18):
        prims.append({"kind": "cyl", "dims": {"r": 0.12, "h": 7}, "loc": (px, -34, 3.5), "verts": 8})
        prims.append(box(1.4, 0.25, 0.5, (px, -34, 7.0)))
    o = product_obj("parking_lot", prims, ["asphalt", "road_marking", "steel", "light_panel"])
    return o

def car(color):
    return [
        box(1.9, 0.55, 4.4, (0, 0, 0.55)),
        box(1.7, 0.5, 2.2, (0, 0.1, 1.05)),
        box(1.5, 0.35, 1.9, (0, 0.12, 1.12)),   # greenhouse glass approximated
    ]

def build_cars():
    rnd = random.Random(7)
    objs = []
    mats = ["car_red", "car_white", "car_black"]
    positions = []
    for row_y in (-33, -38):
        for i in range(8):
            positions.append((-19 + i*4.4 + 2.2, row_y + (1.2 if row_y < -35 else -1.2)))
    for j, (cx, cy) in enumerate(positions[:14]):
        prims = car(mats[j % 3])
        prims += [
            {"kind": "cyl", "dims": {"r": 0.34, "h": 0.24}, "rot": (0, 90, 0), "loc": (p[0], p[1], 0.34), "verts": 14}
            for p in [(-0.85, 1.35), (0.85, 1.35), (-0.85, -1.35), (0.85, -1.35)]
        ]
        o = product_obj(f"car_{j}", prims, [mats[j % 3], "glass_blue", "dark_metal"])
        o.location = (cx, cy, 0)
        o.rotation_euler[2] = math.radians(rnd.choice([0, 180]))
        objs.append(o)
    return objs

def build_trees():
    objs = []
    spots = [(-32, -30), (-32, -20), (-32, -8), (-32, 6), (-32, 18),
             (32, -30), (32, -20), (32, -8), (32, 6), (32, 18),
             (-20, -28), (0, -28), (20, -28),
             (-60, 30), (-45, 40), (-25, 45), (10, 48), (35, 42), (60, 35),
             (-70, -50), (-50, -55), (50, -50), (70, -45), (85, -20), (85, 10)]
    for i, (tx, ty) in enumerate(spots):
        h = 4 + (i % 3)
        prims = [
            {"kind": "cyl", "dims": {"r": 0.25, "h": h * 0.5}, "loc": (0, 0, h * 0.25), "verts": 8},
            {"kind": "sphere", "dims": {"r": h * 0.32}, "loc": (0, 0, h * 0.62), "seg": 12},
            {"kind": "sphere", "dims": {"r": h * 0.24}, "loc": (h*0.15, h*0.1, h * 0.8), "seg": 10},
        ]
        o = product_obj(f"tree_{i}", prims, ["tree_trunk", "tree_leaf"])
        o.location = (tx, ty, 0)
        objs.append(o)
    return objs

def build_neighbourhood():
    rnd = random.Random(11)
    prims = []
    spots = [(-80, 40), (-80, 0), (-80, -40), (-80, -80),
             (95, 40), (95, 0), (95, -40), (95, -80),
             (-40, 70), (0, 75), (40, 70), (80, 75),
             (-40, -90), (0, -95), (40, -90)]
    for i, (bx, by) in enumerate(spots):
        w = rnd.uniform(12, 20); d = rnd.uniform(12, 20); hh = rnd.uniform(10, 45)
        prims.append(box(w, hh, d, (bx, by, hh/2)))
        # roof cap + windows band
        prims.append(box(w*0.6, 1.5, d*0.6, (bx, by, hh+0.75)))
        for lv in range(int(hh // 6)):
            prims.append(box(w+0.1, 1.2, d+0.1, (bx, by, 3 + lv*6)))
    o = product_obj("neighbourhood", prims, ["building_neigh", "dark_metal", "glass_blue"])
    return o

if __name__ == "__main__":
    fresh_scene()
    outdir = os.path.join(OUT_DIR, "environment")
    os.makedirs(outdir, exist_ok=True)
    export_glb([build_city_ground()], os.path.join(outdir, "city_ground.glb"))
    export_glb([build_parking()], os.path.join(outdir, "parking_lot.glb"))
    export_glb(build_cars(), os.path.join(outdir, "cars.glb"))
    export_glb(build_trees(), os.path.join(outdir, "trees.glb"))
    export_glb([build_neighbourhood()], os.path.join(outdir, "neighbourhood.glb"))
    print("ENVIRONMENT DONE")
