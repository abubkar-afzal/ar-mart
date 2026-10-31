"""Mall structural assets: per-floor interior GLBs, shell, escalator, roof."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import fresh_scene, product_obj, export_glb, OUT_DIR

BW, BD = 40.0, 44.0     # building width (x), depth (y)
FH = 6.0                # floor height
SLAB = 0.4              # slab thickness
WT = 0.5                # wall thickness
OPEN_X = (-4, 4)        # atrium opening in x
OPEN_Y = (-22, -4)      # atrium opening in y (front half)

def box(w, h, d, loc):
    return {"kind": "box", "dims": {"w": w, "h": h, "d": d}, "loc": loc}

def perimeter_wall_prims(y0, y1, z0, z1, with_front=False):
    """Left/right walls spanning y0..y1 at given heights; back wall optional."""
    prims = []
    L = y1 - y0
    cy = (y0 + y1) / 2
    h = z1 - z0
    # left wall (x = -BW/2), right wall
    prims.append(box(WT, h, L, (-BW/2 + WT/2, cy, z0 + h/2)))
    prims.append(box(WT, h, L, (BW/2 - WT/2, cy, z0 + h/2)))
    return prims

def build_floor_interior(fi):
    """Interior mesh for one floor: floor plate with atrium hole, walls with
    openings, columns, ceiling panels, light strips, storefront fascia bands."""
    z0 = fi * FH                      # walking surface of this floor
    prims = []
    # --- floor plate split around atrium opening (only floors 1-3 have hole) ---
    if fi == 0:
        prims.append(box(BW, 0.1, BD, (0, 0, z0 + 0.05)))
    else:
        # back strip (y from OPEN_Y[1] to BD/2) full width
        yA0, yA1 = OPEN_Y[1], BD/2
        prims.append(box(BW, 0.1, yA1 - yA0, (0, (yA0+yA1)/2, z0+0.05)))
        # front-left and front-right wings beside atrium
        prims.append(box(BW/2 + OPEN_X[0], 0.1, OPEN_Y[1]-OPEN_Y[0],
                         ((-BW/2 + OPEN_X[0])/2, (OPEN_Y[0]+OPEN_Y[1])/2, z0+0.05)))
        prims.append(box(BW/2 - OPEN_X[1], 0.1, OPEN_Y[1]-OPEN_Y[0],
                         ((BW/2 + OPEN_X[1])/2, (OPEN_Y[0]+OPEN_Y[1])/2, z0+0.05)))
        # narrow strips closing atrium sides in x
        prims.append(box(OPEN_X[0]-(-BW/2), 0.1, 0.0, (0,0,0)))  # noop keep simple
    # --- outer walls (with glass front on ground floor) ---
    h = FH - SLAB
    zc = z0 + h/2
    # back wall solid
    prims.append(box(BW, h, WT, (0, BD/2 - WT/2, zc)))
    # side walls: split by stairwell door gaps — keep solid
    prims.append(box(WT, h, BD, (-BW/2 + WT/2, 0, zc)))
    prims.append(box(WT, h, BD, (BW/2 - WT/2, 0, zc)))
    # front facade: mullions + glass panels (ground floor entrance gap centre)
    n_panels = 8
    seg = BW / n_panels
    for i in range(n_panels):
        x = -BW/2 + seg*(i+0.5)
        if fi == 0 and abs(x) < 3.0:
            continue  # entrance gap
        prims.append(box(seg-0.3, h*0.75, 0.06, (x, -BD/2 + 0.15, z0 + h*0.42)))
    for i in range(n_panels + 1):
        x = -BW/2 + seg*i
        prims.append(box(0.3, h, 0.4, (x, -BD/2 + 0.15, zc)))
    # --- columns along the atrium edge and mid-room grid ---
    cols = []
    for cx in (-8, 8):
        for cy in (-16, -8, 0):
            cols.append((cx, cy))
    for cx in (-16, -8, 0, 8, 16):
        for cy in (8, 16):
            cols.append((cx, cy))
    for cx, cy in cols:
        prims.append(box(0.7, h, 0.7, (cx, cy, zc)))
    # --- ceiling grid beams + light strips (just below next slab) ---
    ztop = z0 + h
    for cy in range(-20, 21, 8):
        prims.append(box(BW-1, 0.25, 0.5, (0, cy, ztop - 0.15)))
    for lx in (-14, -6, 6, 14):
        for ly in (-16, -4, 8, 18):
            prims.append(box(6, 0.08, 0.5, (lx, ly, ztop - 0.32)))
    # --- storefront fascia bands along department edges (signage look) ---
    if fi == 0:
        prims.append(box(16, 0.9, 0.15, (-10, 2.0, z0+3.6)))
        prims.append(box(16, 0.9, 0.15, (10, 2.0, z0+3.6)))
    elif fi == 1:
        prims.append(box(16, 0.9, 0.15, (-10, 6, z0+3.6)))
        prims.append(box(16, 0.9, 0.15, (10, 6, z0+3.6)))
    elif fi == 2:
        prims.append(box(16, 0.9, 0.15, (-10, 6, z0+3.6)))
        prims.append(box(16, 0.9, 0.15, (10, 6, z0+3.6)))
    else:
        prims.append(box(32, 0.9, 0.15, (0, 10, z0+3.6)))
    # --- atrium railings on floors 1-3 ---
    if fi >= 1:
        ox0, ox1 = OPEN_X
        oy0, oy1 = OPEN_Y
        rh = 1.1
        rz = z0 + 0.1 + rh/2
        prims.append(box(ox1-ox0, 0.08, 0.08, (0, oy1, z0+0.1+rh)))       # top rail back
        prims.append(box(0.08, 0.08, oy1-oy0, (ox0, (oy0+oy1)/2, z0+0.1+rh)))
        prims.append(box(0.08, 0.08, oy1-oy0, (ox1, (oy0+oy1)/2, z0+0.1+rh)))
        for i in range(9):
            yy = oy0 + (oy1-oy0)*i/8
            prims.append(box(0.05, rh, 0.05, (ox0+0.1, yy, rz)))
            prims.append(box(0.05, rh, 0.05, (ox1-0.1, yy, rz)))
        for i in range(7):
            xx = ox0 + (ox1-ox0)*i/6
            prims.append(box(0.05, rh, 0.05, (xx, oy1-0.1, rz)))
    # --- shelving units along back/side walls (department fixtures baked in) ---
    def shelf_run(x, y, rot_z, n_units, w=1.2, levels=3):
        import math as _m
        for u in range(n_units):
            ux = x + (0 if rot_z else u*w)
            uy = y + (u*w if rot_z else 0)
            prims.append(box(w-0.1, 2.2, 0.5, (ux, uy, z0+1.1)))
            for l in range(levels):
                zz = z0 + 0.5 + l*0.6
                bx = w-0.15; bz = 0.06; bd = 0.48
                prims.append({"kind": "box", "dims": {"w": bx, "h": bz, "d": bd},
                              "loc": (ux, uy, zz), "rot": (0, 0, rot_z)})
    if fi == 0:
        shelf_run(-16, 14, 0, 12)          # back wall run
        shelf_run(-16, 8, 0, 10)
        shelf_run(-16, -0.5, 0, 10)
        shelf_run(10, 14, 0, 12)
        shelf_run(10, 8, 0, 10)
        shelf_run(10, -0.5, 0, 10)
        shelf_run(-18.5, -12, 90, 6)       # side runs
        shelf_run(18.5, -12, 90, 6)
    elif fi == 1:
        shelf_run(-16, 12, 0, 10)
        shelf_run(8, 12, 0, 10)
        shelf_run(-16, 4, 0, 8)
        shelf_run(8, 4, 0, 8)
        shelf_run(-18.5, -14, 90, 8)
        shelf_run(18.5, -14, 90, 8)
    elif fi == 2:
        shelf_run(-16, 12, 0, 8)
        shelf_run(10, 12, 0, 8)
        shelf_run(-16, 3, 0, 8)
        shelf_run(10, 3, 0, 8)
        shelf_run(-18.5, -15, 90, 5)
        shelf_run(18.5, -15, 90, 5)
    else:
        shelf_run(-17, 14, 0, 6)
        shelf_run(-17, 6, 0, 6)
        shelf_run(12, 14, 0, 6)
        shelf_run(12, 6, 0, 6)
        shelf_run(-18.5, -14, 90, 6)
        shelf_run(18.5, -14, 90, 6)
    o = product_obj(f"mall_interior_f{fi}", prims, ["floor_tile", "wall_white", "light_panel", "rail_black", "shelf_white"])
    return o

def build_shell():
    """Exterior shell: slabs with atrium holes, spandrel glass band, roof line,
    core walls, so that flying outside you see a real multi-storey mall."""
    prims = []
    for fi in range(4):
        zslab = fi*FH - SLAB
        if fi == 0:
            prims.append(box(BW+1.0, SLAB, BD+1.0, (0, 0, zslab + SLAB/2)))
        else:
            yA0, yA1 = OPEN_Y
            prims.append(box(BW+1.0, SLAB, BD/2 - yA1, (0, (yA1+BD/2)/2, zslab+SLAB/2)))
            prims.append(box(BW/2 + OPEN_X[0] + 0.5, SLAB, yA1-yA0,
                             ((-BW/2-0.5+OPEN_X[0])/2, (yA0+yA1)/2, zslab+SLAB/2)))
            prims.append(box(BW/2 - OPEN_X[1] + 0.5, SLAB, yA1-yA0,
                             ((BW/2+0.5+OPEN_X[1])/2, (yA0+yA1)/2, zslab+SLAB/2)))
        # spandrel + facade exterior cladding on three closed sides
        zc = fi*FH + (FH-SLAB)/2
        h = FH - SLAB
        prims.append(box(BW+1.2, h*0.35, 0.3, (0, BD/2+0.45, fi*FH + h + 0.15)) if fi < 3 else box(BW+1.2, 1.2, 0.3, (0, BD/2+0.45, 4*FH-0.6)))
    # parapet
    pz = 4*FH - 0.3
    prims.append(box(BW+1.4, 0.9, 0.35, (0, BD/2+0.5, pz)))
    prims.append(box(BW+1.4, 0.9, 0.35, (0, -BD/2-0.5, pz)))
    prims.append(box(0.35, 0.9, BD+1.4, (-BW/2-0.5, 0, pz)))
    prims.append(box(0.35, 0.9, BD+1.4, (BW/2+0.5, 0, pz)))
    # stairwell core (solid shaft up all floors, x=-17..-15, y=18..21)
    prims.append(box(2.2, 4*FH, 3.0, (-16.4, 19.5, 2*FH)))
    prims.append(box(2.2, 4*FH, 3.0, (16.4, 19.5, 2*FH)))
    # big signage band above entrance
    prims.append(box(14, 1.6, 0.4, (0, -BD/2-0.3, 3*FH-1)))
    o = product_obj("mall_shell", prims, ["slab_concrete", "glass_blue", "wall_white", "dark_metal", "sign_red"])
    return o

def build_escalator():
    """One straight escalator module, rises FH over run 9m, centred at origin,
    going +Y->-Y direction, base at z=0."""
    ang = math.atan2(FH, 9.0)
    L = math.hypot(FH, 9.0)
    prims = []
    # truss/girder under steps
    prims.append({"kind": "box", "dims": {"w": 1.8, "h": 0.5, "d": L}, "loc": (0, 0, L*math.sin(ang)/2 - 0.25),
                  "rot": (-math.degrees(ang), 0, 0)})
    # balustrades (glass) both sides
    for sx in (-0.85, 0.85):
        prims.append({"kind": "box", "dims": {"w": 0.1, "h": 1.0, "d": L}, "loc": (sx, 0, L*math.sin(ang)/2 + 0.5),
                      "rot": (-math.degrees(ang), 0, 0)})
        prims.append({"kind": "box", "dims": {"w": 0.16, "h": 0.12, "d": L}, "loc": (sx, 0, L*math.sin(ang)/2 + 1.02),
                      "rot": (-math.degrees(ang), 0, 0)})
    # steps as small boxes along incline
    n = 22
    for i in range(n):
        t = i/(n-1)
        yy = -L/2 + t*L
        zz = (t*L)*math.sin(ang)
        prims.append({"kind": "box", "dims": {"w": 1.5, "h": 0.06, "d": 0.42}, "loc": (0, yy, zz+0.05)})
    # landings
    prims.append({"kind": "box", "dims": {"w": 2.2, "h": 0.2, "d": 1.2}, "loc": (0, -L/2-0.5, -0.1+0.1)})
    prims.append({"kind": "box", "dims": {"w": 2.2, "h": 0.2, "d": 1.2}, "loc": (0, L/2+0.5, L*math.sin(ang)-0.1)})
    o = product_obj("escalator", prims, ["steel", "glass_blue", "rail_black"])
    return o

def build_roof():
    prims = [
        box(BW, 0.15, BD, (0, 0, 4*FH - SLAB + 0.08)),
        box(6, 1.2, 6, (-12, 14, 4*FH + 0.6)),
        box(6, 1.2, 6, (12, 14, 4*FH + 0.6)),
        box(4, 0.8, 3, (0, -16, 4*FH + 0.4)),
    ]
    # skylight glass over atrium
    prims.append(box(9, 0.12, 19, (0, -13, 4*FH + 0.5)))
    for i in range(5):
        prims.append(box(0.2, 0.3, 19, (-4+i*2, -13, 4*FH+0.58)))
    o = product_obj("mall_roof", prims, ["slab_concrete", "dark_metal", "glass_blue"])
    return o

def build_props():
    """Benches, planters, bins, info kiosk, food court tables, security booth."""
    out = {}
    out["bench"] = product_obj("p_bench", [
        box(1.8, 0.08, 0.5, (0,0,0.45)), box(1.8, 0.4, 0.08, (0,0.24,0.7)),
    ] + [{"kind": "cyl", "dims": {"r": 0.04, "h": 0.45}, "loc": (x, z, 0.22), "verts": 8}
         for x in (-0.8, 0.8) for z in (-0.2, 0.2)], ["wood_light", "steel"])
    out["planter"] = product_obj("p_planter", [
        box(1.0, 0.5, 1.0, (0,0,0.25)),
        {"kind": "sphere", "dims": {"r": 0.5}, "loc": (0,0,0.85), "seg": 12},
        {"kind": "sphere", "dims": {"r": 0.35}, "loc": (0.3,0.2,1.1), "seg": 10},
    ], ["cardboard", "grass"])
    out["bin"] = product_obj("p_bin", [
        {"kind": "cone", "dims": {"r1": 0.28, "r2": 0.22, "h": 0.7}, "loc": (0,0,0.35), "verts": 16},
        {"kind": "cyl", "dims": {"r": 0.3, "h": 0.06}, "loc": (0,0,0.72), "verts": 16},
    ], "produce_green")
    out["kiosk"] = product_obj("p_kiosk", [
        box(2.4, 2.4, 2.4, (0,0,1.2)),
        box(2.6, 0.2, 2.6, (0,0,2.5)),
        box(1.6, 0.9, 0.1, (0,-1.21,1.3)),
        box(2.0, 0.5, 0.15, (0,-1.25,2.05)),
    ], ["wood_dark", "screen_on", "sign_amber"])
    out["food_table"] = product_obj("p_food_table", [
        {"kind": "cyl", "dims": {"r": 0.5, "h": 0.05}, "loc": (0,0,0.75), "verts": 24},
        {"kind": "cyl", "dims": {"r": 0.05, "h": 0.72}, "loc": (0,0,0.37), "verts": 10},
        {"kind": "cyl", "dims": {"r": 0.35, "h": 0.05}, "loc": (0,0,0.03), "verts": 20},
    ], ["plastic_white", "steel"])
    out["food_chair"] = product_obj("p_food_chair", [
        {"kind": "cyl", "dims": {"r": 0.22, "h": 0.06}, "loc": (0,0,0.45), "verts": 16},
        {"kind": "cyl", "dims": {"r": 0.04, "h": 0.42}, "loc": (0,0,0.24), "verts": 8},
        {"kind": "cyl", "dims": {"r": 0.25, "h": 0.04}, "loc": (0,0,0.02), "verts": 16},
        {"kind": "box", "dims": {"w": 0.4, "h": 0.45, "d": 0.05}, "loc": (0,0.2,0.7)},
    ], ["plastic_red", "steel"])
    out["booth"] = product_obj("p_booth", [
        box(1.6, 2.2, 1.6, (0,0,1.1)),
        box(1.0, 0.7, 0.05, (0,-0.83,1.5)),
        box(1.8, 0.15, 1.8, (0,0,2.28)),
    ], ["wall_white", "glass_blue"])
    out["water_fountain"] = product_obj("p_fountain", [
        {"kind": "cyl", "dims": {"r": 0.5, "h": 0.15}, "loc": (0,0,0.08), "verts": 24},
        {"kind": "cyl", "dims": {"r": 0.12, "h": 1.0}, "loc": (0,0,0.6), "verts": 12},
        {"kind": "sphere", "dims": {"r": 0.18}, "loc": (0,0,1.15), "seg": 12},
    ], "steel")
    return out

if __name__ == "__main__":
    fresh_scene()
    outdir = os.path.join(OUT_DIR, "structure")
    os.makedirs(outdir, exist_ok=True)
    for fi in range(4):
        export_glb([build_floor_interior(fi)], os.path.join(outdir, f"mall_interior_f{fi}.glb"))
    export_glb([build_shell()], os.path.join(outdir, "mall_shell.glb"))
    export_glb([build_escalator()], os.path.join(outdir, "escalator.glb"))
    export_glb([build_roof()], os.path.join(outdir, "mall_roof.glb"))
    props = build_props()
    for name, o in props.items():
        export_glb([o], os.path.join(outdir, f"{name}.glb"))
    print("STRUCTURE DONE")
