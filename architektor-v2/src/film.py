"""Фильм «Чертёж»: линия на листе -> здание встаёт само -> люди идут по маршруту -> комната наверху -> вечер.
usage: python3 film.py OUT_DIR W H SAMPLES f1,f2,...   |   python3 film.py OUT_DIR W H SAMPLES a-b"""
import bpy, math, sys, time, os
OUT, W, H, SPP, FR = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
frames = list(range(int(FR.split('-')[0]), int(FR.split('-')[1]) + 1)) if '-' in FR else [int(x) for x in FR.split(',')]
LAST = 210

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 0, LAST
sc.render.engine = 'CYCLES'
cy = sc.cycles
cy.device = 'CPU'; cy.samples = SPP; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.03
cy.use_denoising = True; cy.max_bounces = 5; cy.transparent_max_bounces = 8; cy.caustics_reflective = False; cy.caustics_refractive = False
sc.render.use_persistent_data = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 92
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'

BLUE = (0.02, 0.07, 0.85, 1)
WARM = (1.0, 0.62, 0.3, 1)

def mat(name, col, rough=0.6, emit=None, es=0.0, alpha=1.0, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = col; b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = emit; b.inputs['Emission Strength'].default_value = es
    b.inputs['Alpha'].default_value = alpha
    return m

M_TABLE = mat('table', (0.72, 0.68, 0.62, 1), 0.8)
M_GRID = mat('grid', (0.55, 0.62, 0.8, 1), 0.8)
M_PAPER = mat('paper', (0.88, 0.87, 0.84, 1), 0.85)
M_CLAY = mat('clay', (0.86, 0.85, 0.82, 1), 0.55)
M_DARK = mat('dark', (0.045, 0.05, 0.07, 1), 0.35)
M_LINE = mat('line', BLUE, 0.4, BLUE, 2.2)
M_GLASS = mat('glass', (0.45, 0.62, 1.0, 1), 0.04, alpha=0.13)
M_GLOW = mat('glow', (1, 0.8, 0.6, 1), 0.5, WARM, 0.0)
M_CORE = mat('core', (1, 0.85, 0.7, 1), 0.5, WARM, 0.0)
M_WOOD = mat('wood', (0.5, 0.33, 0.2, 1), 0.5)
M_PENCIL = mat('pencil', (0.06, 0.1, 0.5, 1), 0.3)

def key(o, path, f, v, idx=-1):
    setattr(o, path, v) if idx < 0 else None
    if idx >= 0:
        a = getattr(o, path); a[idx] = v
    o.keyframe_insert(path, frame=f, index=idx)

def box(name, size, loc, m, bevel=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = size; o.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = 2
    return o

def rise(o, f0, f1, depth):
    z = o.location.z
    key(o, 'location', f0, z - depth, 2); key(o, 'location', f1, z, 2)

def grow(o, f0, f1):
    for i in range(3):
        key(o, 'scale', f0, 0.001, i); key(o, 'scale', f1, 1.0, i)

def curve(name, pts, m, depth=0.02, cyclic=False):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = depth; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (c[0], c[1], c[2], 1)
    sp.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o); cu.materials.append(m)
    return o

def draw(o, f0, f1):
    key(o.data, 'bevel_factor_end', f0, 0.0); key(o.data, 'bevel_factor_end', f1, 1.0)

# ---------- стол и лист ----------
bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 0, 0)); bpy.context.object.data.materials.append(M_TABLE)
box('sheet', (10.5, 8.2, 0.012), (0, -0.4, 0.006), M_PAPER, 0)

# ---------- чертёж: контур плана ----------
BX, BY = 2.0, 1.5      # половины здания
z0 = 0.03
outer = [(-BX, -BY, z0), (BX, -BY, z0), (BX, BY, z0), (-BX, BY, z0), (-BX, -BY, z0)]
plan = curve('plan', outer, M_LINE, 0.022); draw(plan, 4, 36)
for i, pts in enumerate([[(-0.6, -BY, z0), (-0.6, BY, z0)], [(-BX, 0.2, z0), (BX, 0.2, z0)], [(0.9, -BY, z0), (0.9, 0.2, z0)]]):
    c = curve('in%d' % i, pts, M_LINE, 0.012); draw(c, 34 + i * 3, 42 + i * 3)
# размерные засечки
for i, pts in enumerate([[(-BX, -BY - 0.5, z0), (BX, -BY - 0.5, z0)], [(BX + 0.5, -BY, z0), (BX + 0.5, BY, z0)]]):
    c = curve('dim%d' % i, pts, M_DARK, 0.005); draw(c, 30 + i * 4, 44 + i * 4)

# ---------- карандаш ----------
bpy.ops.object.empty_add(location=outer[0]); tip = bpy.context.object
bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=1.5, vertices=6, location=(0, 0, 0.95)); body = bpy.context.object; body.data.materials.append(M_PENCIL)
bpy.ops.mesh.primitive_cone_add(radius1=0.055, radius2=0.004, depth=0.2, vertices=24, location=(0, 0, 0.1)); cone = bpy.context.object; cone.rotation_euler = (math.pi, 0, 0); cone.data.materials.append(M_WOOD)
for o in (body, cone): o.parent = tip
tip.rotation_euler = (math.radians(-28), math.radians(24), 0)
per = [0, 4, 7, 11, 14]
for p, d in zip(outer, per):
    f = 4 + 32 * d / 14
    for i in range(3): key(tip, 'location', f, p[i], i)
for fc in tip.animation_data.action.fcurves if hasattr(tip.animation_data.action, 'fcurves') else []:
    for k in fc.keyframe_points: k.interpolation = 'LINEAR'
# карандаш уходит и ложится на стол
for i, v in enumerate((-3.6, -3.2, 0.06)): key(tip, 'location', 52, v, i)
key(tip, 'rotation_euler', 36, math.radians(-28), 0); key(tip, 'rotation_euler', 36, math.radians(24), 1)
key(tip, 'rotation_euler', 52, math.radians(-90), 0); key(tip, 'rotation_euler', 52, math.radians(0), 1)
key(tip, 'rotation_euler', 36, 0.0, 2); key(tip, 'rotation_euler', 52, math.radians(-35), 2)

# ---------- здание: пять этапов встают сами ----------
FH, NF = 0.9, 5
TOP = 0.25 + FH * NF
# 1 фундамент
fnd = box('found', (BX * 2 + 0.5, BY * 2 + 0.5, 0.25), (0, 0, 0.125), M_CLAY, 0.02); rise(fnd, 46, 60, 0.4)
# 2 каркас
n = 0
for ix in range(5):
    for iy in range(4):
        x = -BX + 0.07 + ix * (BX * 2 - 0.14) / 4; y = -BY + 0.07 + iy * (BY * 2 - 0.14) / 3
        if 0 < ix < 4 and 0 < iy < 3: continue
        c = box('col', (0.12, 0.12, FH * NF - 0.04), (x, y, 0.25 + FH * NF / 2 - 0.02), M_CLAY, 0.01)
        rise(c, 60 + n, 74 + n, FH * NF + 0.4); n += 1
# 3 перекрытия
for i in range(NF):
    s = box('slab%d' % i, (BX * 2, BY * 2, 0.09), (0, 0, 0.25 + FH * (i + 1) - 0.045), M_CLAY, 0.01)
    grow(s, 80 + i * 4, 94 + i * 4)
# 4 фасад
for j, (sz, loc) in enumerate([((BX * 2 + 0.04, 0.03, FH * NF), (0, -BY - 0.02, 0.25 + FH * NF / 2)), ((BX * 2 + 0.04, 0.03, FH * NF), (0, BY + 0.02, 0.25 + FH * NF / 2)),
                               ((0.03, BY * 2 + 0.04, FH * NF), (-BX - 0.02, 0, 0.25 + FH * NF / 2)), ((0.03, BY * 2 + 0.04, FH * NF), (BX + 0.02, 0, 0.25 + FH * NF / 2))]):
    g = box('glass%d' % j, sz, loc, M_GLASS, 0); rise(g, 104 + j * 3, 120 + j * 3, FH * NF + 0.4)
# вертикальные ламели на фасаде
n = 0
for sx in range(9):
    x = -BX + sx * BX * 2 / 8
    l = box('fin', (0.035, 0.1, FH * NF), (x, -BY - 0.08, 0.25 + FH * NF / 2), M_CLAY, 0); rise(l, 106 + n, 122 + n, FH * NF + 0.4); n += 1
# свет в этажах (включится вечером)
for i in range(NF):
    lp = box('lamp%d' % i, (BX * 2 - 0.5, BY * 2 - 0.5, 0.02), (0, 0, 0.25 + FH * (i + 1) - 0.11), M_GLOW, 0); grow(lp, 80 + i * 4, 94 + i * 4)
# 5 комната наверху
pav = []
pz = TOP
for (sz, loc, m) in [((2.3, 1.7, 0.07), (0.5, 0, pz + 0.95), M_CLAY), ((0.06, 0.06, 0.9), (-0.6, -0.8, pz + 0.45), M_CLAY), ((0.06, 0.06, 0.9), (1.6, -0.8, pz + 0.45), M_CLAY),
                     ((0.06, 0.06, 0.9), (-0.6, 0.8, pz + 0.45), M_CLAY), ((0.06, 0.06, 0.9), (1.6, 0.8, pz + 0.45), M_CLAY),
                     ((0.9, 0.45, 0.04), (0.5, 0, pz + 0.36), M_WOOD), ((0.05, 0.05, 0.34), (0.5, 0, pz + 0.17), M_DARK),
                     ((1.6, 1.2, 0.015), (0.5, 0, pz + 0.9), M_CORE)]:
    pav.append(box('pav', sz, loc, m, 0.006))

def person(x, y, z, m=M_DARK, s=1.0):
    bpy.ops.object.empty_add(location=(x, y, z)); e = bpy.context.object
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075 * s, depth=0.36 * s, location=(0, 0, 0.18 * s)); b = bpy.context.object; b.data.materials.append(m); b.parent = e
    bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07 * s, location=(0, 0, 0.45 * s)); h = bpy.context.object; h.data.materials.append(m); h.parent = e
    bpy.ops.object.shade_smooth()
    return e
host = person(0.5, 0.42, pz, M_DARK); guest = person(0.5, -0.42, pz, M_CLAY)
pav += [host, guest]
for i, o in enumerate(pav):
    z = o.location.z; key(o, 'location', 122, z + 3.5, 2); key(o, 'location', 136, z, 2)
    for a in range(3): key(o, 'scale', 122, 0.001, a); key(o, 'scale', 130, 1.0, a)

# сетка чертежа и деревья макета
for i in range(-5, 6):
    curve('gx%d' % i, [(i, -4.4, 0.014), (i, 3.6, 0.014)], M_GRID, 0.004)
for i in range(-4, 4):
    curve('gy%d' % i, [(-5.1, i, 0.014), (5.1, i, 0.014)], M_GRID, 0.004)
for j, (x, y, r) in enumerate([(-3.4, -2.6, 0.3), (-3.9, 0.4, 0.24), (-3.2, 2.4, 0.34), (3.5, 2.3, 0.28), (3.9, -0.3, 0.22), (3.3, -2.9, 0.3), (-1.6, 3.0, 0.2), (1.9, 3.1, 0.25)]):
    bpy.ops.object.empty_add(location=(x, y, 0.012)); e = bpy.context.object
    bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.34, location=(0, 0, 0.17)); t = bpy.context.object; t.data.materials.append(M_WOOD); t.parent = e
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(0, 0, 0.34 + r * 0.8)); b = bpy.context.object; b.data.materials.append(M_CLAY); b.parent = e; bpy.ops.object.shade_smooth()
    for a in range(3): key(e, 'scale', 96 + j * 4, 0.001, a); key(e, 'scale', 108 + j * 4, 1.0, a)

# ---------- путь клиента ----------
path_pts = [(1.2, -11.0, z0), (1.6, -8.5, z0), (0.2, -6.4, z0), (-0.9, -4.6, z0), (0.3, -3.0, z0), (0.3, -BY - 0.1, z0)]
route = curve('route', path_pts, M_LINE, 0.03); draw(route, 132, 150)
lift = curve('lift', [(0.3, -0.9, 0.3), (0.3, -0.9, TOP + 0.05)], M_LINE, 0.03); draw(lift, 150, 168)
def along(t):
    t = max(0, min(0.9999, t)) * (len(path_pts) - 1); i = int(t); a, b = path_pts[i], path_pts[i + 1]; k = t - i
    return (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)
for j in range(7):
    p = person(0, 0, 0.012, M_DARK if j % 3 else M_CLAY, 1.5)
    st = 136 + j * 5
    for s in range(11):
        x, y = along(s / 10); f = st + s * 3.2
        key(p, 'location', f, x + (0.12 if j % 2 else -0.12), 0); key(p, 'location', f, y, 1)
    for a in range(3): key(p, 'scale', st - 1, 0.001, a); key(p, 'scale', st + 3, 1.0, a); key(p, 'scale', st + 32, 1.0, a); key(p, 'scale', st + 35, 0.001, a)

# ---------- свет ----------
bpy.ops.object.light_add(type='AREA', location=(9, -7, 11)); sun = bpy.context.object; sun.data.size = 5; sun.data.color = (1, 0.92, 0.8)
bpy.ops.object.empty_add(location=(0, 0, 1.5)); aim = bpy.context.object
c = sun.constraints.new('TRACK_TO'); c.target = aim; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
key(sun.data, 'energy', 0, 7500.0); key(sun.data, 'energy', 172, 7500.0); key(sun.data, 'energy', 200, 260.0)
wd = bpy.data.worlds.new('w'); sc.world = wd; wd.use_nodes = True; bg = wd.node_tree.nodes['Background']
def wkey(f, col, s):
    bg.inputs[0].default_value = col; bg.inputs[1].default_value = s
    bg.inputs[0].keyframe_insert('default_value', frame=f); bg.inputs[1].keyframe_insert('default_value', frame=f)
wkey(0, (0.9, 0.92, 1.0, 1), 0.38); wkey(172, (0.9, 0.92, 1.0, 1), 0.38); wkey(200, (0.03, 0.06, 0.2, 1), 0.3)
for m, s1 in ((M_GLOW, 9.0), (M_CORE, 30.0)):
    e = m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength']
    e.default_value = 0.0; e.keyframe_insert('default_value', frame=176); e.default_value = s1; e.keyframe_insert('default_value', frame=200)
e = M_LINE.node_tree.nodes['Principled BSDF'].inputs['Emission Strength']
e.default_value = 2.2; e.keyframe_insert('default_value', frame=172); e.default_value = 22.0; e.keyframe_insert('default_value', frame=200)

# ---------- камера ----------
bpy.ops.object.empty_add(location=(0, 0, 0)); tgt = bpy.context.object
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 40; cam.data.sensor_width = 36
c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
cam.data.dof.use_dof = True; cam.data.dof.focus_object = tgt; cam.data.dof.aperture_fstop = 2.8
SHOTS = [(0, (0.3, -2.6, 8.6), (0, -0.2, 0)), (40, (3.2, -6.8, 7.2), (0, 0, 0.2)), (82, (9.5, -11.0, 5.6), (0, 0, 1.9)), (128, (10.5, -9.6, 7.0), (0, 0, 2.7)),
         (152, (4.6, -13.0, 1.7), (0.2, -3.0, 1.3)), (178, (3.9, -4.6, 6.2), (0.5, 0, 5.05)), (210, (11.5, -14.0, 3.2), (0, 0, 2.7))]
for f, cl, tl in SHOTS:
    for i in range(3): key(cam, 'location', f, cl[i], i); key(tgt, 'location', f, tl[i], i)

os.makedirs(OUT, exist_ok=True)
for f in frames:
    t = time.time(); sc.frame_set(f); sc.render.filepath = os.path.join(OUT, 'f_%03d.jpg' % f); bpy.ops.render.render(write_still=True)
    print('FRAME', f, round(time.time() - t, 1), flush=True)
