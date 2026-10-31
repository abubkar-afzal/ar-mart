"""Fashion department (floor 1): garments, shoes, accessories, mannequins, racks."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import fresh_scene, product_obj, export_glb, OUT_DIR

def tshirt(name, mat_):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.42, "h": 0.55, "d": 0.12}, "loc": (0,0,0.6)},
        {"kind": "box", "dims": {"w": 0.14, "h": 0.22, "d": 0.11}, "loc": (-0.27,0,0.78), "rot": (0,0,-25)},
        {"kind": "box", "dims": {"w": 0.14, "h": 0.22, "d": 0.11}, "loc": (0.27,0,0.78), "rot": (0,0,25)},
        {"kind": "cyl", "dims": {"r": 0.09, "h": 0.03}, "loc": (0,0,0.875), "verts": 16},
    ], mat_)

def jeans(name, mat_="garment_navy"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.36, "h": 0.22, "d": 0.16}, "loc": (0,0,0.95)},
        {"kind": "box", "dims": {"w": 0.16, "h": 0.75, "d": 0.15}, "loc": (-0.09,0,0.47)},
        {"kind": "box", "dims": {"w": 0.16, "h": 0.75, "d": 0.15}, "loc": (0.09,0,0.47)},
    ], mat_)

def jacket(name, mat_="wood_dark"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.48, "h": 0.62, "d": 0.18}, "loc": (0,0,0.62)},
        {"kind": "box", "dims": {"w": 0.15, "h": 0.5, "d": 0.14}, "loc": (-0.31,0,0.68)},
        {"kind": "box", "dims": {"w": 0.15, "h": 0.5, "d": 0.14}, "loc": (0.31,0,0.68)},
        {"kind": "box", "dims": {"w": 0.2, "h": 0.12, "d": 0.2}, "loc": (0,0,0.97)},
        {"kind": "box", "dims": {"w": 0.02, "h": 0.55, "d": 0.19}, "loc": (0.05,0,0.62)},
    ], mat_)

def dress(name, mat_):
    return product_obj(name, [
        {"kind": "cone", "dims": {"r1": 0.35, "r2": 0.12, "h": 0.9}, "loc": (0,0,0.45), "verts": 24},
        {"kind": "cyl", "dims": {"r": 0.12, "h": 0.28}, "loc": (0,0,1.04), "verts": 16},
        {"kind": "torus", "dims": {"R": 0.1, "r": 0.015}, "loc": (0,0,1.18)},
    ], mat_)

def shirt_formal(name, mat_="paper_white"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.44, "h": 0.58, "d": 0.13}, "loc": (0,0,0.6)},
        {"kind": "box", "dims": {"w": 0.13, "h": 0.5, "d": 0.12}, "loc": (-0.285,0,0.66)},
        {"kind": "box", "dims": {"w": 0.13, "h": 0.5, "d": 0.12}, "loc": (0.285,0,0.66)},
        {"kind": "box", "dims": {"w": 0.12, "h": 0.08, "d": 0.14}, "loc": (0,0,0.92)},
    ], mat_)

def kurta(name, mat_):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.46, "h": 0.95, "d": 0.16}, "loc": (0,0,0.5)},
        {"kind": "box", "dims": {"w": 0.14, "h": 0.55, "d": 0.13}, "loc": (-0.3,0,0.68)},
        {"kind": "box", "dims": {"w": 0.14, "h": 0.55, "d": 0.13}, "loc": (0.3,0,0.68)},
        {"kind": "box", "dims": {"w": 0.16, "h": 0.1, "d": 0.02}, "loc": (0,-0.09,0.85)},
    ], mat_)

def skirt(name, mat_):
    return product_obj(name, [
        {"kind": "cone", "dims": {"r1": 0.3, "r2": 0.14, "h": 0.6}, "loc": (0,0,0.3), "verts": 24},
        {"kind": "cyl", "dims": {"r": 0.145, "h": 0.08}, "loc": (0,0,0.64), "verts": 20},
    ], mat_)

def sneaker(name, sole="plastic_white", upper="paper_white"):
    o = product_obj(name, [
        {"kind": "box", "dims": {"w": 0.11, "h": 0.04, "d": 0.28}, "loc": (0,0,0.02)},
        {"kind": "box", "dims": {"w": 0.11, "h": 0.09, "d": 0.16}, "loc": (0,0,0.085), },
        {"kind": "sphere", "dims": {"r": 0.055}, "loc": (0, -0.09, 0.06), "squash": (1, 1.3, 0.6), "seg": 14},
        {"kind": "box", "dims": {"w": 0.115, "h": 0.05, "d": 0.1}, "loc": (0, 0.09, 0.1)},
    ], [sole, upper])
    return o

def handbag(name, mat_="wood_dark"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.32, "h": 0.26, "d": 0.12}, "loc": (0,0,0.15)},
        {"kind": "torus", "dims": {"R": 0.1, "r": 0.012}, "loc": (0,0,0.33), "rot": (0,0,0)},
        {"kind": "box", "dims": {"w": 0.33, "h": 0.04, "d": 0.125}, "loc": (0,0,0.27)},
    ], mat_)

def scarf(name, mat_):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.5, "h": 0.03, "d": 0.16}, "loc": (0,0,0.02)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.16, "d": 0.03}, "loc": (0,-0.065,0.1)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.16, "d": 0.03}, "loc": (0,0.065,0.1)},
    ], mat_)

def cap(name, mat_):
    return product_obj(name, [
        {"kind": "sphere", "dims": {"r": 0.11}, "loc": (0,0,0.06), "squash": (1,1,0.7), "seg": 16},
        {"kind": "box", "dims": {"w": 0.16, "h": 0.015, "d": 0.12}, "loc": (0,-0.13,0.045)},
    ], mat_)

def sunglasses(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.055, "h": 0.035, "d": 0.005}, "loc": (-0.032,0,0)},
        {"kind": "box", "dims": {"w": 0.055, "h": 0.035, "d": 0.005}, "loc": (0.032,0,0)},
        {"kind": "box", "dims": {"w": 0.02, "h": 0.006, "d": 0.005}, "loc": (0,0,0.01)},
        {"kind": "box", "dims": {"w": 0.006, "h": 0.006, "d": 0.13}, "loc": (-0.06,0.065,0), "rot": (0,0,0)},
        {"kind": "box", "dims": {"w": 0.006, "h": 0.006, "d": 0.13}, "loc": (0.06,0.065,0)},
    ], "dark_metal")

def watch(name):
    return product_obj(name, [
        {"kind": "cyl", "dims": {"r": 0.022, "h": 0.01}, "loc": (0,0,0.02), "verts": 24},
        {"kind": "torus", "dims": {"R": 0.03, "r": 0.004}, "loc": (0,0,0.02)},
        {"kind": "box", "dims": {"w": 0.018, "h": 0.003, "d": 0.09}, "loc": (0,-0.075,0.02)},
        {"kind": "box", "dims": {"w": 0.018, "h": 0.003, "d": 0.09}, "loc": (0,0.075,0.02)},
    ], ["steel", "mirror"])

# Fixtures
def mannequin():
    return product_obj("f_mannequin", [
        {"kind": "sphere", "dims": {"r": 0.11}, "loc": (0,0,1.62), "seg": 18},
        {"kind": "cyl", "dims": {"r": 0.045, "h": 0.14}, "loc": (0,0,1.44), "verts": 12},
        {"kind": "cone", "dims": {"r1": 0.19, "r2": 0.13, "h": 0.55}, "loc": (0,0,1.1), "verts": 18},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 0.75}, "loc": (0,0,0.42), "verts": 10},
        {"kind": "cyl", "dims": {"r": 0.22, "h": 0.04}, "loc": (0,0,0.04), "verts": 20},
    ], "mannequin_beige")

def clothing_rack():
    prims = [
        {"kind": "cyl", "dims": {"r": 0.02, "h": 1.6}, "loc": (-0.7,0,0.8), "verts": 10},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 1.6}, "loc": (0.7,0,0.8), "verts": 10},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 1.5}, "loc": (0,0,1.58), "rot": (0,90,0), "verts": 10},
        {"kind": "cyl", "dims": {"r": 0.25, "h": 0.03}, "loc": (-0.7,0,0.02), "verts": 16},
        {"kind": "cyl", "dims": {"r": 0.25, "h": 0.03}, "loc": (0.7,0,0.02), "verts": 16},
    ]
    # hanging garment blocks
    for i in range(6):
        x = -0.55 + i * 0.22
        prims.append({"kind": "box", "dims": {"w": 0.18, "h": 0.75, "d": 0.08}, "loc": (x, 0, 1.15)})
    return product_obj("f_clothing_rack", prims, ["steel", "garment_navy"])

def fitting_room():
    return product_obj("f_fitting_room", [
        {"kind": "box", "dims": {"w": 1.4, "h": 2.4, "d": 0.08}, "loc": (0,0.7,1.2)},
        {"kind": "box", "dims": {"w": 0.08, "h": 2.4, "d": 1.4}, "loc": (-0.7,0,1.2)},
        {"kind": "box", "dims": {"w": 0.08, "h": 2.4, "d": 1.4}, "loc": (0.7,0,1.2)},
        {"kind": "box", "dims": {"w": 1.4, "h": 0.08, "d": 1.4}, "loc": (0,0,2.4)},
        {"kind": "box", "dims": {"w": 0.04, "h": 1.6, "d": 0.9}, "loc": (-0.25,-0.68,1.2)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.06, "d": 0.4}, "loc": (0.45,0.5,0.9)},
    ], ["wall_white", "mirror"])

MODELS = {
    "c_tshirt_white": lambda: tshirt("c_tshirt_white", "paper_white"),
    "c_tshirt_black": lambda: tshirt("c_tshirt_black", "dark_metal"),
    "c_jeans_blue":   lambda: jeans("c_jeans_blue", "garment_navy"),
    "c_jeans_black":  lambda: jeans("c_jeans_black", "dark_metal"),
    "c_jacket_leather": lambda: jacket("c_jacket_leather", "wood_dark"),
    "c_jacket_denim": lambda: jacket("c_jacket_denim", "garment_navy"),
    "c_shirt_formal": lambda: shirt_formal("c_shirt_formal", "paper_white"),
    "c_shirt_checked": lambda: shirt_formal("c_shirt_checked", "fabric_sofa"),
    "c_kurta":        lambda: kurta("c_kurta", "cushion"),
    "c_kurta_colored": lambda: kurta("c_kurta_colored", "produce_green"),
    "c_dress_floral": lambda: dress("c_dress_floral", "fabric_warm"),
    "c_dress_evening": lambda: dress("c_dress_evening", "plastic_red"),
    "c_skirt_pleated": lambda: skirt("c_skirt_pleated", "garment_grey"),
    "c_sneakers_white": lambda: sneaker("c_sneakers_white"),
    "c_sneakers_red": lambda: sneaker("c_sneakers_red", sole="dark_metal", upper="plastic_red"),
    "c_loafers":      lambda: product_obj("c_loafers", [
        {"kind": "box", "dims": {"w": 0.1, "h": 0.03, "d": 0.26}, "loc": (0,0,0.015)},
        {"kind": "box", "dims": {"w": 0.1, "h": 0.07, "d": 0.14}, "loc": (0,0.04,0.055)},
        {"kind": "sphere", "dims": {"r": 0.05}, "loc": (0,-0.08,0.045), "squash": (1,1.2,0.6), "seg": 14}], "wood_dark"),
    "c_handbag":      lambda: handbag("c_handbag", "wood_dark"),
    "c_backpack":     lambda: product_obj("c_backpack", [
        {"kind": "box", "dims": {"w": 0.32, "h": 0.46, "d": 0.16}, "loc": (0,0,0.25)},
        {"kind": "box", "dims": {"w": 0.22, "h": 0.14, "d": 0.05}, "loc": (0,-0.1,0.15)},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 0.3}, "loc": (-0.1,0.09,0.5), "verts": 8},
        {"kind": "cyl", "dims": {"r": 0.02, "h": 0.3}, "loc": (0.1,0.09,0.5), "verts": 8}], "plastic_blue"),
    "c_scarf":        lambda: scarf("c_scarf", "fabric_warm"),
    "c_cap":          lambda: cap("c_cap", "plastic_red"),
    "c_sunglasses":   lambda: sunglasses("c_sunglasses"),
    "c_watch":        lambda: watch("c_watch"),
}

if __name__ == "__main__":
    fresh_scene()
    out = os.path.join(OUT_DIR, "products")
    n = 0
    for name, fn in MODELS.items():
        export_glb([fn()], os.path.join(out, f"{name}.glb")); n += 1
    for fx in (mannequin(), clothing_rack(), fitting_room()):
        export_glb([fx], os.path.join(out, f"{fx.name}.glb")); n += 1
    print(f"FASHION DONE: {n} glb files")
