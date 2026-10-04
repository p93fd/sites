"""Пробный кадр уровня референса: макет здания на столе архитектора. usage: python3 hero.py OUT.jpg W H SPP SHOT"""
import bpy, math, sys, os, random
OUT, W, H, SPP, SHOT = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'as')
random.seed(4)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; cy = sc.cycles
cy.device = 'CPU'; cy.samples = SPP; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.02; cy.use_denoising = True
cy.max_bounces = 8; cy.glossy_bounces = 6; cy.transmission_bounces = 10; cy.transparent_max_bounces = 12; cy.caustics_reflective = False; cy.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 94
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - High Contrast'

def pbr(name, tex, scale=0.3, rough_mul=1.0, tint=None, bump=0.6):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    def img(suffix, cs):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(os.path.join(A, tex + '_' + suffix + '.jpg')); n.image.colorspace_settings.name = cs
        n.projection = 'BOX'; n.projection_blend = 0.25; nt.links.new(mp.outputs['Vector'], n.inputs['Vector']); return n
    d = img('Diffuse', 'sRGB')
    if tint:
        mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1; mx.inputs[2].default_value = tint
        nt.links.new(d.outputs['Color'], mx.inputs[1]); nt.links.new(mx.outputs['Color'], b.inputs['Base Color'])
    else: nt.links.new(d.outputs['Color'], b.inputs['Base Color'])
    r = img('Rough', 'Non-Color'); mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = rough_mul
    nt.links.new(r.outputs['Color'], mm.inputs[0]); nt.links.new(mm.outputs[0], b.inputs['Roughness'])
    n = img('nor_gl', 'Non-Color'); nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = bump
    nt.links.new(n.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m

def flat(name, col, rough=0.5, metal=0.0, emit=None, es=0.0, trans=0.0, ior=1.45):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = col; b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Transmission Weight'].default_value = trans; b.inputs['IOR'].default_value = ior
    if emit: b.inputs['Emission Color'].default_value = emit; b.inputs['Emission Strength'].default_value = es
    return m

M_DESK = pbr('desk', 'dark_wood', 0.16, 0.8, (0.55, 0.5, 0.48, 1), 0.8)
M_CONC = pbr('conc', 'brushed_concrete', 0.5, 1.0, None, 0.5)
M_WOOD = pbr('walnut', 'wood_table_001', 0.5, 0.7, (0.75, 0.62, 0.5, 1), 0.6)
M_BRASS = flat('brass', (0.83, 0.58, 0.26, 1), 0.22, 1.0)
M_STEEL = flat('steel', (0.75, 0.76, 0.78, 1), 0.28, 1.0)
M_GLASS = flat('glass', (0.86, 0.93, 1.0, 1), 0.02, 0.0, trans=1.0)
M_FROST = flat('frost', (0.9, 0.95, 1.0, 1), 0.35, 0.0, trans=1.0)
M_WARM = flat('warm', (1, 0.8, 0.55, 1), 0.5, emit=(1.0, 0.55, 0.22, 1), es=14.0)
M_CORE = flat('core', (1, 0.8, 0.55, 1), 0.5, emit=(1.0, 0.62, 0.3, 1), es=9.0)
M_INK = flat('ink', (0.92, 0.95, 1.0, 1), 0.6)
M_LINE = flat('line', (0.5, 0.75, 1.0, 1), 0.5, emit=(0.35, 0.6, 1.0, 1), es=3.5)
M_LACQ = flat('lacq', (0.015, 0.03, 0.2, 1), 0.12)
M_DARK = flat('darkfig', (0.02, 0.02, 0.025, 1), 0.3)
M_GRAPH = flat('graph', (0.03, 0.03, 0.03, 1), 0.4, 0.3)
# синька: тёмно-синяя бумага с лёгким зерном
M_BLUE = bpy.data.materials.new('blue'); M_BLUE.use_nodes = True; nt = M_BLUE.node_tree; b = nt.nodes['Principled BSDF']
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 8
rp = nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].color = (0.006, 0.022, 0.11, 1); rp.color_ramp.elements[1].color = (0.016, 0.05, 0.2, 1)
nt.links.new(nz.outputs['Fac'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.62
n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 260; bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = 0.08
nt.links.new(n2.outputs['Fac'], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])

def box(size, loc, m, bevel=0.01, rot=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.scale = size; o.rotation_euler = (0, 0, rot); o.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = 3
    return o
def curve(pts, m, depth, z=0.0):
    cu = bpy.data.curves.new('c', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = depth; cu.bevel_resolution = 3; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (c[0], c[1], z, 1)
    o = bpy.data.objects.new('c', cu); sc.collection.objects.link(o); cu.materials.append(m); return o

# стол
bpy.ops.mesh.primitive_plane_add(size=80); bpy.context.object.data.materials.append(M_DESK)
# лист-синька, чуть повёрнут
SH = 0.012
sheet = box((11.5, 8.4, SH), (0, -0.3, SH / 2), M_BLUE, 0, 0.0)
zl = SH + 0.002
for i in range(-5, 6): curve([(i, -4.2), (i, 3.6)], M_INK, 0.0035, zl)
for i in range(-4, 4): curve([(-5.5, i), (5.5, i)], M_INK, 0.0035, zl)
curve([(-5.55, -4.3), (5.55, -4.3), (5.55, 3.7), (-5.55, 3.7), (-5.55, -4.3)], M_INK, 0.008, zl)
curve([(2.6, -4.3), (2.6, -3.5), (5.55, -3.5)], M_INK, 0.006, zl)
BX, BY = 2.0, 1.5
# план светится под зданием и вокруг
curve([(-BX - .45, -BY - .45), (BX + .45, -BY - .45), (BX + .45, BY + .45), (-BX - .45, BY + .45), (-BX - .45, -BY - .45)], M_LINE, 0.012, zl + 0.004)
curve([(-BX - 1.2, -BY - .9), (BX + 1.2, -BY - .9)], M_INK, 0.006, zl); curve([(BX + 1.0, -BY - .6), (BX + 1.0, BY + .6)], M_INK, 0.006, zl)
route = [(1.4, -4.2), (1.5, -3.4), (0.3, -2.8), (0.3, -BY - .3)]
curve(route, M_LINE, 0.022, zl + 0.006)

if SHOT != 'draw':
    FH, NF = 0.9, 5; Z0 = SH
    box((BX * 2 + 0.7, BY * 2 + 0.7, 0.2), (0, 0, Z0 + 0.1), M_WOOD, 0.02)
    Z0 += 0.2
    for ix in range(5):
        for iy in range(4):
            if 0 < ix < 4 and 0 < iy < 3: continue
            x = -BX + 0.07 + ix * (BX * 2 - 0.14) / 4; y = -BY + 0.07 + iy * (BY * 2 - 0.14) / 3
            box((0.12, 0.12, FH * NF - 0.02), (x, y, Z0 + FH * NF / 2), M_CONC, 0.008)
    for i in range(NF + 1):
        z = Z0 + FH * i
        box((BX * 2 + 0.16, BY * 2 + 0.16, 0.085), (0, 0, z + (0.0 if i else 0.04)), M_CONC, 0.008)
        if i < NF:
            # тёплый свет под перекрытием + мебель-намёки
            box((BX * 2 - 0.9, 0.05, 0.02), (0, 0.5, z + FH - 0.07), M_WARM, 0); box((BX * 2 - 0.9, 0.05, 0.02), (0, -0.6, z + FH - 0.07), M_WARM, 0)
            for k in range(3): box((0.5, 0.28, 0.2), (-1.2 + k * 1.2 + random.uniform(-.15, .15), random.uniform(-.5, .6), z + 0.15), M_WOOD, 0.01)
    # ядро-лифт
    box((0.5, 0.5, FH * NF - 0.1), (0.3, -0.2, Z0 + FH * NF / 2), M_CORE, 0)
    # стекло
    for sz, loc in [((BX * 2 + 0.02, 0.025, FH * NF), (0, -BY - 0.02, Z0 + FH * NF / 2)), ((BX * 2 + 0.02, 0.025, FH * NF), (0, BY + 0.02, Z0 + FH * NF / 2)),
                    ((0.025, BY * 2 + 0.02, FH * NF), (-BX - 0.02, 0, Z0 + FH * NF / 2)), ((0.025, BY * 2 + 0.02, FH * NF), (BX + 0.02, 0, Z0 + FH * NF / 2))]:
        box(sz, loc, M_GLASS, 0)
    # латунные ламели
    for s in range(7):
        x = -BX + s * BX * 2 / 6; box((0.022, 0.09, FH * NF + 0.06), (x, -BY - 0.09, Z0 + FH * NF / 2), M_BRASS, 0.004)
    for s in range(5):
        y = -BY + s * BY * 2 / 4; box((0.09, 0.022, FH * NF + 0.06), (BX + 0.09, y, Z0 + FH * NF / 2), M_BRASS, 0.004)
    # комната наверху
    T = Z0 + FH * NF + 0.045
    for px, py in [(-0.6, -0.8), (1.6, -0.8), (-0.6, 0.8), (1.6, 0.8)]: box((0.045, 0.045, 0.9), (px, py, T + 0.45), M_BRASS, 0.004)
    box((2.5, 1.9, 0.06), (0.5, 0, T + 0.93), M_CONC, 0.008); box((1.8, 1.3, 0.015), (0.5, 0, T + 0.89), M_WARM, 0)
    box((0.9, 0.42, 0.035), (0.5, 0, T + 0.36), M_WOOD, 0.006); box((0.05, 0.05, 0.34), (0.5, 0, T + 0.17), M_BRASS, 0.004)
    def person(x, y, z, m, s=1.0):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.07 * s, depth=0.34 * s, location=(x, y, z + 0.17 * s)); o = bpy.context.object; o.data.materials.append(m); bpy.ops.object.shade_smooth()
        o.modifiers.new('b', 'BEVEL').width = 0.02 * s
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.065 * s, location=(x, y, z + 0.43 * s)); o = bpy.context.object; o.data.materials.append(m); bpy.ops.object.shade_smooth()
    person(0.5, 0.42, T, M_DARK); person(0.5, -0.42, T, M_BRASS)
    # люди идут по маршруту
    for (x, y), m in zip([(1.45, -3.9), (1.25, -3.25), (0.6, -2.95), (0.3, -2.3)], [M_BRASS, M_DARK, M_BRASS, M_DARK]): person(x + .1, y, SH, m, 1.25)
    # деревья макета: матовые стеклянные шары на латунных иглах
    for x, y, r in [(-3.3, -2.4, 0.3), (-3.8, 0.3, 0.24), (-3.1, 2.3, 0.33), (3.5, 2.2, 0.28), (3.9, -0.4, 0.22), (3.3, -2.9, 0.3), (-1.6, 2.9, 0.2)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.4, location=(x, y, SH + 0.2)); bpy.context.object.data.materials.append(M_BRASS)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=24, location=(x, y, SH + 0.4 + r * 0.8)); o = bpy.context.object; o.data.materials.append(M_FROST); bpy.ops.object.shade_smooth()

# карандаш и линейка
def pencil(loc, rx, ry, rz):
    bpy.ops.object.empty_add(location=loc); e = bpy.context.object; e.rotation_euler = (rx, ry, rz)
    for prim, kw, m in [('cyl', dict(radius=0.06, depth=1.5, vertices=6, location=(0, 0, 0.97)), M_LACQ), ('cone', dict(radius1=0.06, radius2=0.018, depth=0.17, vertices=6, location=(0, 0, 0.135)), M_WOOD),
                        ('cone', dict(radius1=0.018, radius2=0.002, depth=0.055, vertices=16, location=(0, 0, 0.025)), M_GRAPH), ('cyl', dict(radius=0.064, depth=0.12, vertices=24, location=(0, 0, 1.76)), M_BRASS)]:
        (bpy.ops.mesh.primitive_cylinder_add if prim == 'cyl' else bpy.ops.mesh.primitive_cone_add)(**kw); o = bpy.context.object
        if prim == 'cone': o.rotation_euler = (math.pi, 0, 0)
        o.data.materials.append(m); o.parent = e
    return e
if SHOT == 'draw':
    pencil((BX + .45, -0.2, zl), math.radians(-30), math.radians(26), 0)
else:
    pencil((-4.6, -3.3, SH + 0.055), math.radians(-90), 0, math.radians(-62))
box((4.6, 0.36, 0.012), (-2.6, 3.0, SH + 0.008), M_STEEL, 0.002, math.radians(8))

# свет: студийная карта для бликов + тёплый боковой ключ + холодный контровой
wd = bpy.data.worlds.new('w'); sc.world = wd; wd.use_nodes = True; nt = wd.node_tree; bg = nt.nodes['Background']
env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(os.path.join(A, 'studio.hdr')); lp = nt.nodes.new('ShaderNodeLightPath'); mxw = nt.nodes.new('ShaderNodeMixRGB'); mxw.inputs[2].default_value = (0.012, 0.016, 0.03, 1)
nt.links.new(lp.outputs['Is Camera Ray'], mxw.inputs[0]); nt.links.new(env.outputs['Color'], mxw.inputs[1]); nt.links.new(mxw.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.16
def area(loc, energy, size, col, aim=(0, 0, 1.6)):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object; l.data.energy = energy; l.data.size = size; l.data.color = col
    bpy.ops.object.empty_add(location=aim); t = bpy.context.object; c = l.constraints.new('TRACK_TO'); c.target = t; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
area((10, -5, 4.5), 2600, 3.5, (1.0, 0.72, 0.45))
area((-9, 7, 7), 1500, 6, (0.5, 0.68, 1.0))

bpy.ops.object.empty_add(location=(0.2, -0.3, 2.3) if SHOT != 'draw' else (BX * .4, -0.4, 0.0)); tgt = bpy.context.object
loc = {'hero': (10.5, -13.5, 5.6), 'top': (4.4, -5.0, 6.6), 'draw': (5.2, -5.6, 3.4)}[SHOT]
if SHOT == 'top': tgt.location = (0.5, 0, 5.2)
bpy.ops.object.camera_add(location=loc); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 40 if SHOT == 'hero' else 50
c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
cam.data.dof.use_dof = True; cam.data.dof.focus_object = tgt; cam.data.dof.aperture_fstop = 2.2
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('DONE')
