"""Grocery department product models (floor 0). Each -> its own GLB."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import fresh_scene, product_obj, export_glb, OUT_DIR

def bag(name, color, w=0.35, h=0.45, d=0.16):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": w, "h": h, "d": d}, "loc": (0, 0, h/2)},
        {"kind": "box", "dims": {"w": w*0.9, "h": 0.03, "d": d}, "loc": (0, 0, h-0.02)},
        {"kind": "box", "dims": {"w": w*0.7, "h": 0.12, "d": 0.02}, "loc": (0, -d/2-0.005, h*0.55)},
    ], color)

def bottle(name, body_mat, h=0.32, r=0.045, cap=True):
    prims = [
        {"kind": "cyl", "dims": {"r": r, "h": h*0.7}, "loc": (0, 0, h*0.35), "verts": 20},
        {"kind": "cone", "dims": {"r1": r, "r2": r*0.45, "h": h*0.22}, "loc": (0, 0, h*0.81), "verts": 20},
        {"kind": "cyl", "dims": {"r": r*0.42, "h": h*0.1}, "loc": (0, 0, h*0.95), "verts": 16},
    ]
    if cap:
        prims.append({"kind": "cyl", "dims": {"r": r*0.5, "h": 0.025}, "loc": (0, 0, h+0.008), "verts": 16})
    o = product_obj(name, prims, body_mat)
    return o

def can(name, mat_):
    return product_obj(name, [
        {"kind": "cyl", "dims": {"r": 0.033, "h": 0.115}, "loc": (0, 0, 0.0575), "verts": 20},
        {"kind": "cyl", "dims": {"r": 0.036, "h": 0.006}, "loc": (0, 0, 0.115), "verts": 20},
        {"kind": "cyl", "dims": {"r": 0.036, "h": 0.005}, "loc": (0, 0, 0.003), "verts": 20},
    ], mat_)

def carton(name, w=0.09, h=0.2, d=0.06, color="paper_white"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": w, "h": h, "d": d}, "loc": (0, 0, h/2)},
        {"kind": "box", "dims": {"w": w, "h": 0.02, "d": d*0.7}, "loc": (0, 0, h+0.008)},
    ], color)

def box_pkg(name, w, h, d, color):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": w, "h": h, "d": d}, "loc": (0, 0, h/2)},
        {"kind": "box", "dims": {"w": w*1.01, "h": h*0.25, "d": d*1.01}, "loc": (0, 0, h*0.85)},
    ], color)

def fruit(name, mat_, r=0.04, leaf=False):
    prims = [{"kind": "sphere", "dims": {"r": r}, "loc": (0, 0, r)}]
    if leaf:
        prims += [{"kind": "cyl", "dims": {"r": 0.006, "h": 0.03}, "loc": (0, 0, 2*r+0.01)},
                  {"kind": "box", "dims": {"w": 0.04, "h": 0.004, "d": 0.02}, "loc": (0.02, 0, 2*r+0.025)}]
    return product_obj(name, prims, mat_)

def egg(name):
    return product_obj(name, [
        {"kind": "sphere", "dims": {"r": 0.028}, "loc": (0, 0, 0.03), "squash": (1, 1, 1.25)},
    ], "paper_white")

def fridge_drink(name):
    # tall PET bottle with label band
    o = bottle(name, "bottle_clear", h=0.3, r=0.04)
    return o

MODELS = {
    "g_rice_bag":      lambda: bag("g_rice_bag", "plastic_yellow"),
    "g_flour_bag":     lambda: bag("g_flour_bag", "paper_white", w=0.3, h=0.42),
    "g_oil_bottle":    lambda: bottle("g_oil_bottle", "plastic_yellow", h=0.34, r=0.05),
    "g_pasta_box":     lambda: box_pkg("g_pasta_box", 0.18, 0.24, 0.06, "plastic_blue"),
    "g_sugar_bag":     lambda: bag("g_sugar_bag", "plastic_white", w=0.22, h=0.3),
    "g_chips_bag":     lambda: bag("g_chips_bag", "plastic_red", w=0.24, h=0.34),
    "g_biscuit_pack":  lambda: box_pkg("g_biscuit_pack", 0.22, 0.06, 0.09, "plastic_blue"),
    "g_choco_bar":     lambda: box_pkg("g_choco_bar", 0.16, 0.035, 0.07, "wood_dark"),
    "g_water_bottle":  lambda: bottle("g_water_bottle", "bottle_clear", h=0.32),
    "g_cola_can":      lambda: can("g_cola_can", "plastic_red"),
    "g_juice_carton":  lambda: carton("g_juice_carton", color="produce_orange"),
    "g_milk_carton":   lambda: carton("g_milk_carton", w=0.1, h=0.22, color="paper_white"),
    "g_cheese_wedge":  lambda: product_obj("g_cheese_wedge", [
        {"kind": "cone", "dims": {"r1": 0.07, "r2": 0.07, "h": 0.05}, "verts": 3, "loc": (0,0,0.025)}], "plastic_yellow"),
    "g_yogurt_cup":    lambda: product_obj("g_yogurt_cup", [
        {"kind": "cone", "dims": {"r1": 0.045, "r2": 0.038, "h": 0.09}, "loc": (0,0,0.045), "verts": 20},
        {"kind": "cyl", "dims": {"r": 0.046, "h": 0.008}, "loc": (0,0,0.093), "verts": 20}], "plastic_white"),
    "g_orange":        lambda: fruit("g_orange", "produce_orange", leaf=True),
    "g_apple":         lambda: fruit("g_apple", "plastic_red", leaf=True),
    "g_banana":        lambda: product_obj("g_banana", [
        {"kind": "torus", "dims": {"R": 0.09, "r": 0.022}, "rot": (90, 0, 0), "loc": (0,0,0.06)}], "plastic_yellow"),
    "g_tomato":        lambda: fruit("g_tomato", "plastic_red", r=0.035),
    "g_potato":        lambda: product_obj("g_potato", [
        {"kind": "sphere", "dims": {"r": 0.045}, "loc": (0,0,0.035), "squash": (1.2, 1, 0.8)}], "cardboard"),
    "g_onion":         lambda: fruit("g_onion", "cardboard", r=0.04),
    "g_lettuce":       lambda: product_obj("g_lettuce", [
        {"kind": "sphere", "dims": {"r": 0.09}, "loc": (0,0,0.07), "seg": 12, "squash": (1,1,0.75)},
        {"kind": "sphere", "dims": {"r": 0.06}, "loc": (0.04,0.02,0.1), "seg": 10}], "produce_green"),
    "g_chicken":       lambda: product_obj("g_chicken", [
        {"kind": "box", "dims": {"w": 0.2, "h": 0.03, "d": 0.14}, "loc": (0,0,0.015)},
        {"kind": "sphere", "dims": {"r": 0.05}, "loc": (-0.04,0,0.06), "squash": (1.4,1,0.8)},
        {"kind": "sphere", "dims": {"r": 0.035}, "loc": (0.05,0.02,0.05), "squash": (1.2,1,0.8)}], "meat_pink"),
    "g_egg_tray":      lambda: product_obj("g_egg_tray", [
        {"kind": "box", "dims": {"w": 0.24, "h": 0.02, "d": 0.14}, "loc": (0,0,0.01)}] +
        [{"kind": "sphere", "dims": {"r": 0.026}, "loc": (-0.09+0.06*i, -0.045+0.09*j, 0.045), "squash": (1,1,1.2)}
         for i in range(4) for j in range(2)], "cardboard"),
    "g_detergent":     lambda: product_obj("g_detergent", [
        {"kind": "box", "dims": {"w": 0.14, "h": 0.26, "d": 0.08}, "loc": (0,0,0.13)},
        {"kind": "cyl", "dims": {"r": 0.025, "h": 0.05}, "loc": (0.03,0,0.285)}], "plastic_blue"),
    "g_soap_bar":      lambda: product_obj("g_soap_bar", [
        {"kind": "box", "dims": {"w": 0.09, "h": 0.03, "d": 0.055}, "loc": (0,0,0.015)}], "produce_green"),
    "g_tea_box":       lambda: box_pkg("g_tea_box", 0.12, 0.16, 0.08, "plastic_red"),
    "g_coffee_tin":    lambda: product_obj("g_coffee_tin", [
        {"kind": "cyl", "dims": {"r": 0.05, "h": 0.13}, "loc": (0,0,0.065), "verts": 20},
        {"kind": "cyl", "dims": {"r": 0.052, "h": 0.012}, "loc": (0,0,0.135), "verts": 20}], "wood_dark"),
    "g_cereal_box":    lambda: box_pkg("g_cereal_box", 0.2, 0.28, 0.07, "plastic_yellow"),
    "g_ketchup":       lambda: bottle("g_ketchup", "plastic_red", h=0.24, r=0.04),
    "g_honey_jar":     lambda: product_obj("g_honey_jar", [
        {"kind": "cyl", "dims": {"r": 0.05, "h": 0.12}, "loc": (0,0,0.06), "verts": 20},
        {"kind": "cyl", "dims": {"r": 0.045, "h": 0.02}, "loc": (0,0,0.13), "verts": 20}], "bottle_clear"),
    "g_freezer_door":  lambda: None,  # fixture not product
}

# Fixtures used on floor 0
def fridge_unit():
    return product_obj("f_fridge", [
        {"kind": "box", "dims": {"w": 1.0, "h": 2.0, "d": 0.7}, "loc": (0,0,1.0)},
        {"kind": "box", "dims": {"w": 0.96, "h": 1.1, "d": 0.05}, "loc": (0,-0.37,1.45)},
        {"kind": "box", "dims": {"w": 0.96, "h": 0.7, "d": 0.05}, "loc": (0,-0.37,0.45)},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 0.3}, "loc": (0.3,-0.42,1.45)},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 0.3}, "loc": (0.3,-0.42,0.5)},
    ], ["glass_blue", "steel"])

def checkout_counter():
    return product_obj("f_checkout", [
        {"kind": "box", "dims": {"w": 2.2, "h": 0.95, "d": 0.8}, "loc": (0,0,0.475)},
        {"kind": "box", "dims": {"w": 0.6, "h": 0.35, "d": 0.5}, "loc": (-0.5,-0.1,1.12)},
        {"kind": "box", "dims": {"w": 0.55, "h": 0.4, "d": 0.04}, "loc": (-0.5,-0.1,1.5), "rot": (-12,0,0)},
        {"kind": "box", "dims": {"w": 1.0, "h": 0.1, "d": 0.5}, "loc": (0.55,-0.05,0.98)},
    ], ["wood_dark", "steel"])

def basket():
    return product_obj("f_basket", [
        {"kind": "box", "dims": {"w": 0.45, "h": 0.28, "d": 0.32}, "loc": (0,0,0.14)},
        {"kind": "box", "dims": {"w": 0.42, "h": 0.22, "d": 0.29}, "loc": (0,0,0.18)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.04, "d": 0.05}, "loc": (0,0,0.32), "rot": (0,15,0)},
    ], "plastic_red")

if __name__ == "__main__":
    fresh_scene()
    out = os.path.join(OUT_DIR, "products")
    count = 0
    for name, fn in MODELS.items():
        if fn is None: continue
        o = fn()
        if o is None: continue
        export_glb([o], os.path.join(out, f"{name}.glb"))
        count += 1
    for fx in (fridge_unit(), checkout_counter(), basket()):
        export_glb([fx], os.path.join(out, f"{fx.name}.glb"))
        count += 1
    print(f"GROCERY DONE: {count} glb files")
