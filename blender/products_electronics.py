"""Electronics (floor 2) + Furniture (floor 3) models."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import fresh_scene, product_obj, export_glb, OUT_DIR

# ---- Electronics ----
def phone(name, mat_="dark_metal"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.075, "h": 0.155, "d": 0.008}, "loc": (0,0,0.08)},
        {"kind": "box", "dims": {"w": 0.068, "h": 0.145, "d": 0.001}, "loc": (0,-0.0045,0.08)},
    ], [mat_, "screen_on"])

def tablet(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.17, "h": 0.24, "d": 0.007}, "loc": (0,0,0.12)},
        {"kind": "box", "dims": {"w": 0.158, "h": 0.225, "d": 0.001}, "loc": (0,-0.004,0.12)},
    ], ["dark_metal", "screen_on"])

def laptop_closed(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.33, "h": 0.018, "d": 0.23}, "loc": (0,0,0.01)},
        {"kind": "box", "dims": {"w": 0.33, "h": 0.21, "d": 0.012}, "loc": (0,0.115,0.115), "rot": (-90,0,0)},
    ], "steel")

def laptop_open(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.33, "h": 0.018, "d": 0.23}, "loc": (0,0,0.01)},
        {"kind": "box", "dims": {"w": 0.31, "h": 0.012, "d": 0.17}, "loc": (0,-0.02,0.021)},
        {"kind": "box", "dims": {"w": 0.33, "h": 0.21, "d": 0.012}, "loc": (0,0.11,0.115), "rot": (-78,0,0)},
        {"kind": "box", "dims": {"w": 0.3, "h": 0.185, "d": 0.001}, "loc": (0,0.105,0.12), "rot": (-78,0,0)},
    ], ["dark_metal", "screen_on"])

def tv(name, w=1.25):
    h = w * 0.58
    return product_obj(name, [
        {"kind": "box", "dims": {"w": w, "h": h, "d": 0.05}, "loc": (0,0,h/2+0.35)},
        {"kind": "box", "dims": {"w": w-0.04, "h": h-0.04, "d": 0.002}, "loc": (0,-0.027,h/2+0.35)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.03, "d": 0.25}, "loc": (0,0,0.02)},
        {"kind": "cyl", "dims": {"r": 0.04, "h": 0.3}, "loc": (0,0,0.18), "verts": 10},
    ], ["dark_metal", "screen_on"])

def monitor(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.6, "h": 0.36, "d": 0.03}, "loc": (0,0,0.52)},
        {"kind": "box", "dims": {"w": 0.57, "h": 0.33, "d": 0.002}, "loc": (0,-0.017,0.52)},
        {"kind": "cyl", "dims": {"r": 0.03, "h": 0.3}, "loc": (0,0.02,0.2), "verts": 10},
        {"kind": "box", "dims": {"w": 0.3, "h": 0.02, "d": 0.2}, "loc": (0,0,0.02)},
    ], ["dark_metal", "screen_on"])

def headphones(name, mat_="dark_metal"):
    return product_obj(name, [
        {"kind": "torus", "dims": {"R": 0.09, "r": 0.012}, "loc": (0,0,0.12), "rot": (0,0,0)},
        {"kind": "cyl", "dims": {"r": 0.045, "h": 0.035}, "loc": (-0.09,0,0.06), "rot": (0,90,0), "verts": 18},
        {"kind": "cyl", "dims": {"r": 0.045, "h": 0.035}, "loc": (0.09,0,0.06), "rot": (0,90,0), "verts": 18},
    ], mat_)

def earbuds_case(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.06, "h": 0.03, "d": 0.05}, "loc": (0,0,0.015)},
        {"kind": "sphere", "dims": {"r": 0.012}, "loc": (-0.015,0,0.035), "seg": 12},
        {"kind": "sphere", "dims": {"r": 0.012}, "loc": (0.015,0,0.035), "seg": 12},
    ], "plastic_white")

def speaker(name, mat_="dark_metal"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.12, "h": 0.24, "d": 0.12}, "loc": (0,0,0.12)},
        {"kind": "cyl", "dims": {"r": 0.045, "h": 0.01}, "loc": (0,-0.061,0.08), "rot": (90,0,0), "verts": 18},
        {"kind": "cyl", "dims": {"r": 0.025, "h": 0.01}, "loc": (0,-0.061,0.17), "rot": (90,0,0), "verts": 18},
    ], mat_)

def console(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.26, "h": 0.06, "d": 0.16}, "loc": (0,0,0.03)},
        {"kind": "box", "dims": {"w": 0.24, "h": 0.01, "d": 0.14}, "loc": (0,0,0.062)},
    ], "dark_metal")

def controller(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.17, "h": 0.02, "d": 0.1}, "loc": (0,0,0.01)},
        {"kind": "sphere", "dims": {"r": 0.035}, "loc": (-0.075,0,0.012), "squash": (1,0.8,0.6), "seg": 12},
        {"kind": "sphere", "dims": {"r": 0.035}, "loc": (0.075,0,0.012), "squash": (1,0.8,0.6), "seg": 12},
    ], "garment_grey")

def keyboard(name):
    prims = [{"kind": "box", "dims": {"w": 0.44, "h": 0.02, "d": 0.14}, "loc": (0,0,0.01)}]
    for r in range(4):
        for c in range(14):
            prims.append({"kind": "box", "dims": {"w": 0.024, "h": 0.006, "d": 0.024},
                          "loc": (-0.195+c*0.03, -0.045+r*0.03, 0.023)})
    return product_obj(name, prims, ["dark_metal", "garment_grey"])

def mouse(name):
    return product_obj(name, [
        {"kind": "sphere", "dims": {"r": 0.04}, "loc": (0,0,0.02), "squash": (0.7,1.2,0.5), "seg": 16},
    ], "dark_metal")

def camera_dslr(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.14, "h": 0.09, "d": 0.07}, "loc": (0,0,0.06)},
        {"kind": "cyl", "dims": {"r": 0.035, "h": 0.08}, "loc": (0,-0.07,0.06), "rot": (90,0,0), "verts": 20},
        {"kind": "box", "dims": {"w": 0.04, "h": 0.025, "d": 0.03}, "loc": (0,0.02,0.115)},
    ], "dark_metal")

def smartwatch(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.04, "h": 0.045, "d": 0.012}, "loc": (0,0,0.008)},
        {"kind": "torus", "dims": {"R": 0.03, "r": 0.006}, "loc": (0,0,0.008), "rot": (90,0,0)},
    ], ["dark_metal", "screen_on"])

def fridge_magnet_board(): pass

def appliance_washer(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.6, "h": 0.85, "d": 0.6}, "loc": (0,0,0.425)},
        {"kind": "cyl", "dims": {"r": 0.2, "h": 0.03}, "loc": (0,-0.31,0.45), "rot": (90,0,0), "verts": 24},
        {"kind": "cyl", "dims": {"r": 0.14, "h": 0.01}, "loc": (0,-0.325,0.45), "rot": (90,0,0), "verts": 24},
        {"kind": "box", "dims": {"w": 0.55, "h": 0.1, "d": 0.02}, "loc": (0,-0.3,0.78)},
    ], ["plastic_white", "glass_blue"])

def appliance_microwave(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.5, "h": 0.3, "d": 0.36}, "loc": (0,0,0.15)},
        {"kind": "box", "dims": {"w": 0.34, "h": 0.2, "d": 0.01}, "loc": (-0.05,-0.185,0.15)},
        {"kind": "box", "dims": {"w": 0.1, "h": 0.24, "d": 0.01}, "loc": (0.18,-0.185,0.15)},
    ], ["dark_metal", "glass_blue"])

ELECTRONICS = {
    "e_phone":        lambda: phone("e_phone"),
    "e_phone_gold":   lambda: phone("e_phone_gold", "cardboard"),
    "e_tablet":       lambda: tablet("e_tablet"),
    "e_laptop":       lambda: laptop_open("e_laptop"),
    "e_laptop_closed":lambda: laptop_closed("e_laptop_closed"),
    "e_tv_55":        lambda: tv("e_tv_55", 1.25),
    "e_tv_65":        lambda: tv("e_tv_65", 1.45),
    "e_monitor":      lambda: monitor("e_monitor"),
    "e_headphones":   lambda: headphones("e_headphones"),
    "e_headphones_white": lambda: headphones("e_headphones_white", "plastic_white"),
    "e_earbuds":      lambda: earbuds_case("e_earbuds"),
    "e_speaker":      lambda: speaker("e_speaker"),
    "e_speaker_fabric": lambda: speaker("e_speaker_fabric", "garment_grey"),
    "e_console":      lambda: console("e_console"),
    "e_controller":   lambda: controller("e_controller"),
    "e_keyboard":     lambda: keyboard("e_keyboard"),
    "e_mouse":        lambda: mouse("e_mouse"),
    "e_camera":       lambda: camera_dslr("e_camera"),
    "e_smartwatch":   lambda: smartwatch("e_smartwatch"),
    "e_washer":       lambda: appliance_washer("e_washer"),
    "e_microwave":    lambda: appliance_microwave("e_microwave"),
}

# ---- Furniture ----
def sofa(name, mat_="fabric_sofa"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 2.0, "h": 0.35, "d": 0.9}, "loc": (0,0,0.3)},
        {"kind": "box", "dims": {"w": 2.0, "h": 0.55, "d": 0.22}, "loc": (0,0.34,0.62)},
        {"kind": "box", "dims": {"w": 0.22, "h": 0.35, "d": 0.9}, "loc": (-0.9,0,0.62)},
        {"kind": "box", "dims": {"w": 0.22, "h": 0.35, "d": 0.9}, "loc": (0.9,0,0.62)},
        {"kind": "box", "dims": {"w": 0.75, "h": 0.14, "d": 0.6}, "loc": (-0.4,-0.05,0.52)},
        {"kind": "box", "dims": {"w": 0.75, "h": 0.14, "d": 0.6}, "loc": (0.4,-0.05,0.52)},
    ], [mat_, "cushion"])

def armchair(name, mat_="fabric_warm"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.9, "h": 0.35, "d": 0.85}, "loc": (0,0,0.3)},
        {"kind": "box", "dims": {"w": 0.9, "h": 0.55, "d": 0.2}, "loc": (0,0.32,0.62)},
        {"kind": "box", "dims": {"w": 0.18, "h": 0.3, "d": 0.85}, "loc": (-0.36,0,0.6)},
        {"kind": "box", "dims": {"w": 0.18, "h": 0.3, "d": 0.85}, "loc": (0.36,0,0.6)},
        {"kind": "box", "dims": {"w": 0.6, "h": 0.12, "d": 0.55}, "loc": (0,-0.05,0.5)},
    ], [mat_, "cushion"])

def coffee_table(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 1.1, "h": 0.05, "d": 0.6}, "loc": (0,0,0.42)},
        {"kind": "box", "dims": {"w": 1.0, "h": 0.04, "d": 0.5}, "loc": (0,0,0.15)},
    ] + [{"kind": "cyl", "dims": {"r": 0.03, "h": 0.42}, "loc": (x, z, 0.21), "verts": 8}
        for x in (-0.5, 0.5) for z in (-0.25, 0.25)], "wood_light")

def dining_table(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 1.6, "h": 0.05, "d": 0.9}, "loc": (0,0,0.75)},
    ] + [{"kind": "box", "dims": {"w": 0.08, "h": 0.75, "d": 0.08}, "loc": (x, z, 0.375)}
         for x in (-0.72, 0.72) for z in (-0.38, 0.38)], "wood_dark")

def dining_chair(name, mat_="wood_light"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.45, "h": 0.05, "d": 0.45}, "loc": (0,0,0.45)},
        {"kind": "box", "dims": {"w": 0.45, "h": 0.5, "d": 0.05}, "loc": (0,0.2,0.72)},
    ] + [{"kind": "box", "dims": {"w": 0.04, "h": 0.45, "d": 0.04}, "loc": (x, z, 0.225)}
         for x in (-0.19, 0.19) for z in (-0.19, 0.19)], mat_)

def bed_double(name, mat_="fabric_sofa"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 1.6, "h": 0.3, "d": 2.1}, "loc": (0,0,0.2)},
        {"kind": "box", "dims": {"w": 1.5, "h": 0.25, "d": 1.95}, "loc": (0,0,0.45)},
        {"kind": "box", "dims": {"w": 1.6, "h": 0.9, "d": 0.08}, "loc": (0,1.05,0.6)},
        {"kind": "box", "dims": {"w": 0.6, "h": 0.12, "d": 0.4}, "loc": (-0.4,-0.75,0.62)},
        {"kind": "box", "dims": {"w": 0.6, "h": 0.12, "d": 0.4}, "loc": (0.4,-0.75,0.62)},
    ], ["wood_dark", mat_])

def single_bed(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.95, "h": 0.3, "d": 2.0}, "loc": (0,0,0.2)},
        {"kind": "box", "dims": {"w": 0.85, "h": 0.2, "d": 1.9}, "loc": (0,0,0.42)},
        {"kind": "box", "dims": {"w": 0.95, "h": 0.7, "d": 0.07}, "loc": (0,1.0,0.5)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.1, "d": 0.35}, "loc": (0,-0.7,0.57)},
    ], ["wood_light", "cushion"])

def wardrobe(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 1.2, "h": 2.2, "d": 0.6}, "loc": (0,0,1.1)},
        {"kind": "box", "dims": {"w": 0.58, "h": 2.1, "d": 0.02}, "loc": (-0.3,-0.31,1.1)},
        {"kind": "box", "dims": {"w": 0.58, "h": 2.1, "d": 0.02}, "loc": (0.3,-0.31,1.1)},
        {"kind": "cyl", "dims": {"r": 0.015, "h": 0.18}, "loc": (-0.05,-0.33,1.1)},
        {"kind": "cyl", "dims": {"r": 0.015, "h": 0.18}, "loc": (0.05,-0.33,1.1)},
    ], "wood_light")

def nightstand(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 0.5, "h": 0.5, "d": 0.4}, "loc": (0,0,0.28)},
        {"kind": "box", "dims": {"w": 0.44, "h": 0.14, "d": 0.02}, "loc": (0,-0.2,0.4)},
        {"kind": "box", "dims": {"w": 0.44, "h": 0.14, "d": 0.02}, "loc": (0,-0.2,0.18)},
    ], "wood_dark")

def desk_office(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 1.4, "h": 0.04, "d": 0.7}, "loc": (0,0,0.74)},
        {"kind": "box", "dims": {"w": 0.05, "h": 0.72, "d": 0.65}, "loc": (-0.66,0,0.37)},
        {"kind": "box", "dims": {"w": 0.05, "h": 0.72, "d": 0.65}, "loc": (0.66,0,0.37)},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.3, "d": 0.04}, "loc": (0.35,-0.32,0.55)},
    ], ["wood_light", "steel"])

def office_chair(name):
    return product_obj(name, [
        {"kind": "cyl", "dims": {"r": 0.03, "h": 0.35}, "loc": (0,0,0.4), "verts": 8},
        {"kind": "box", "dims": {"w": 0.5, "h": 0.08, "d": 0.5}, "loc": (0,0,0.6)},
        {"kind": "box", "dims": {"w": 0.46, "h": 0.6, "d": 0.07}, "loc": (0,0.23,0.95), "rot": (6,0,0)},
        {"kind": "box", "dims": {"w": 0.06, "h": 0.2, "d": 0.4}, "loc": (-0.28,0.05,0.72)},
        {"kind": "box", "dims": {"w": 0.06, "h": 0.2, "d": 0.4}, "loc": (0.28,0.05,0.72)},
    ] + [{"kind": "cyl", "dims": {"r": 0.025, "h": 0.06}, "loc": (0.24*math.cos(a), 0.24*math.sin(a), 0.05), "rot": (90,0,math.degrees(a)), "verts": 8}
         for a in [i*2*math.pi/5 for i in range(5)]], ["dark_metal", "garment_grey"])

def bookshelf(name):
    prims = [
        {"kind": "box", "dims": {"w": 0.9, "h": 1.9, "d": 0.3}, "loc": (0,0,0.95)},
    ]
    for i in range(4):
        prims.append({"kind": "box", "dims": {"w": 0.84, "h": 0.03, "d": 0.28}, "loc": (0,0,0.3+i*0.45)})
        for j in range(5):
            prims.append({"kind": "box", "dims": {"w": 0.05, "h": 0.3, "d": 0.2},
                          "loc": (-0.3+j*0.15, 0, 0.47+i*0.45)})
    o = product_obj(name, prims, ["wood_dark"])
    return o

def floor_lamp(name):
    return product_obj(name, [
        {"kind": "cyl", "dims": {"r": 0.16, "h": 0.03}, "loc": (0,0,0.015), "verts": 20},
        {"kind": "cyl", "dims": {"r": 0.015, "h": 1.5}, "loc": (0,0,0.78), "verts": 8},
        {"kind": "cone", "dims": {"r1": 0.22, "r2": 0.14, "h": 0.3}, "loc": (0,0,1.65), "verts": 20},
    ], ["steel", "lamp_shade"])

def side_table(name):
    return product_obj(name, [
        {"kind": "cyl", "dims": {"r": 0.25, "h": 0.04}, "loc": (0,0,0.5), "verts": 24},
        {"kind": "cyl", "dims": {"r": 0.03, "h": 0.5}, "loc": (0,0,0.25), "verts": 10},
        {"kind": "cyl", "dims": {"r": 0.2, "h": 0.03}, "loc": (0,0,0.015), "verts": 20},
    ], ["wood_light", "steel"])

def rug(name, mat_="fabric_warm"):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 2.4, "h": 0.02, "d": 1.7}, "loc": (0,0,0.01)},
        {"kind": "box", "dims": {"w": 2.0, "h": 0.025, "d": 1.3}, "loc": (0,0,0.013)},
    ], [mat_, "cushion"])

def tv_stand(name):
    return product_obj(name, [
        {"kind": "box", "dims": {"w": 1.6, "h": 0.45, "d": 0.45}, "loc": (0,0,0.24)},
        {"kind": "box", "dims": {"w": 0.7, "h": 0.35, "d": 0.02}, "loc": (-0.4,-0.23,0.24)},
        {"kind": "box", "dims": {"w": 0.7, "h": 0.35, "d": 0.02}, "loc": (0.4,-0.23,0.24)},
    ], "wood_dark")

FURNITURE = {
    "fu_sofa":        lambda: sofa("fu_sofa"),
    "fu_sofa_beige":  lambda: sofa("fu_sofa_beige", "cushion"),
    "fu_armchair":    lambda: armchair("fu_armchair"),
    "fu_coffee_table":lambda: coffee_table("fu_coffee_table"),
    "fu_dining_table":lambda: dining_table("fu_dining_table"),
    "fu_dining_chair":lambda: dining_chair("fu_dining_chair"),
    "fu_chair_black": lambda: dining_chair("fu_chair_black", "dark_metal"),
    "fu_bed_double":  lambda: bed_double("fu_bed_double"),
    "fu_bed_single":  lambda: single_bed("fu_bed_single"),
    "fu_wardrobe":    lambda: wardrobe("fu_wardrobe"),
    "fu_nightstand":  lambda: nightstand("fu_nightstand"),
    "fu_desk":        lambda: desk_office("fu_desk"),
    "fu_office_chair":lambda: office_chair("fu_office_chair"),
    "fu_bookshelf":   lambda: bookshelf("fu_bookshelf"),
    "fu_floor_lamp":  lambda: floor_lamp("fu_floor_lamp"),
    "fu_side_table":  lambda: side_table("fu_side_table"),
    "fu_rug":         lambda: rug("fu_rug"),
    "fu_rug_blue":    lambda: rug("fu_rug_blue", "fabric_sofa"),
    "fu_tv_stand":    lambda: tv_stand("fu_tv_stand"),
}

if __name__ == "__main__":
    fresh_scene()
    out = os.path.join(OUT_DIR, "products")
    n = 0
    for group in (ELECTRONICS, FURNITURE):
        for name, fn in group.items():
            export_glb([fn()], os.path.join(out, f"{name}.glb")); n += 1
    print(f"ELEC+FURN DONE: {n} glb files")
