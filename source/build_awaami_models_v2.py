import numpy as np, trimesh, math, os, json, zipfile
from trimesh.visual.material import PBRMaterial
OUT='/mnt/data'
class Builder:
 def __init__(self,name): self.name=name;self.scene=trimesh.Scene();self.count=0
 def put(self,mesh,color,name):
  mesh=mesh.copy();mesh.visual=trimesh.visual.TextureVisuals(material=PBRMaterial(name=name,baseColorFactor=(*color,255),metallicFactor=0,roughnessFactor=.83,doubleSided=True));self.scene.add_geometry(mesh,geom_name=f'{name}_{self.count}');self.count+=1
 def ell(self,xyz,scale,color,name,sub=2):
  m=trimesh.creation.icosphere(subdivisions=sub,radius=1);m.apply_scale(scale);m.apply_translation(xyz);self.put(m,color,name)
 def cone(self,a,b,r1,r2,color,name,sections=12):
  # axis from a to b
  a=np.array(a);b=np.array(b);v=b-a;h=np.linalg.norm(v)
  m=trimesh.creation.conical_frustum if hasattr(trimesh.creation,'conical_frustum') else None
  # manually generate capped tapered cylinder
  p=[]; f=[]
  axis=v/h;helper=np.array([0,0,1]) if abs(axis[2])<.89 else np.array([0,1,0]);u=np.cross(axis,helper);u/=np.linalg.norm(u);w=np.cross(axis,u)
  for center,r in [(a,r1),(b,r2)]:
   for i in range(sections):p.append(center+r*(u*np.cos(i*2*np.pi/sections)+w*np.sin(i*2*np.pi/sections)))
  p.extend([a,b]);
  for i in range(sections):
   j=(i+1)%sections;f.extend([[i,j,sections+j],[i,sections+j,sections+i],[2*sections,j,i],[2*sections+1,sections+i,sections+j]])
  self.put(trimesh.Trimesh(vertices=p,faces=f,process=False),color,name)
 def box(self,xyz,ext,color,name,angles=None):
  m=trimesh.creation.box(extents=ext)
  if angles:
   for axis,ang in zip('xyz',angles):
    if ang:m.apply_transform(trimesh.transformations.rotation_matrix(ang,{'x':[1,0,0],'y':[0,1,0],'z':[0,0,1]}[axis]))
  m.apply_translation(xyz);self.put(m,color,name)
 def arc(self,points,r,color,name):
  for i in range(len(points)-1):self.cone(points[i],points[i+1],r,r,color,name,8)
 def export(self):
  data=self.scene.export(file_type='glb');f=os.path.join(OUT,self.name+'.glb');open(f,'wb').write(data);return f

SKIN_I=(177,132,107);SKIN_N=(192,146,115)
DARK=(23,32,35);GREEN=(27,71,59);IVORY=(233,228,215);WHT=(242,239,224);NAVY=(31,40,59);GOLD=(190,150,78)

def make(who):
 im=who=='imran_khan';B=Builder(who+'_fighter_v2')
 s=1 if im else .96;skin=SKIN_I if im else SKIN_N;outfit=WHT if im else IVORY;vest=GREEN if im else NAVY
 darkhair=(33,30,29) if im else (50,47,45);shoe=(36,38,38) if im else (51,37,30)
 # shoes: feet front along negative y
 for side in (-1,1):
  x=side*(.29 if im else .33)
  B.ell((x,-.105,.105),(.21,.34,.13),shoe,'Peshawari_chappal_shoe',2)
  B.box((x,-.21,.17),(.22,.3,.035),(68,62,48),'shoe_strap')
  B.cone((x,0,.22),(x*.92,0,1.19),.19 if im else .23,.205 if im else .25,outfit,'shalwar_leg',14)
  # textile fold pleats on pants
  for k in [-1,1]:
   B.arc([(x+k*.075,-.195,.28),(x+k*.085,-.19,.49),(x+k*.065,-.20,.81)],.011,(200,196,186),'trouser_fabric_pleat')
 # main kurta torso
 B.cone((0,0,1.08),(0,0,2.19),.56 if im else .67,.43 if im else .56,outfit,'kurta_tunic',20)
 B.box((0,-.015,1.10),(1.13 if im else 1.37,.72,.08),outfit,'tunic_hem')
 # lower kurta slit visible side
 for side in (-1,1): B.box((side*(.52 if im else .63),-.01,1.33),(.017,.42,.48),(209,203,187),'kurta_side_seam')
 # Waistcoat tapered torso cropped
 B.cone((0,-.015,1.55),(0,-.015,2.22),.48 if im else .59,.46 if im else .62,vest,'signature_waistcoat',20)
 # shirt central V and chest panel visible
 B.box((0,-.49 if im else -.60,1.92),(.18,.035,.55),outfit,'shirt_front_visible')
 B.cone((0,-.53 if im else -.63,2.26),(0,-.57 if im else -.65,1.95),.18,.04,outfit,'collar_shirt_white',12)
 # Lapels
 for side in (-1,1):
  B.arc([(side*.06,-.52 if im else -.63,2.25),(side*.19,-.525 if im else -.64,2.06),(side*.13,-.52 if im else -.64,1.89)],.04, (37,92,73) if im else (49,59,79),'waistcoat_lapel')
  # small embroidered piping line vertical
  B.arc([(side*.34,-.36 if im else -.42,1.61),(side*.33,-.39 if im else -.51,1.95)],.012,(66,105,76) if im else (92,90,101),'vest_trim')
 for i in range(4):B.ell((0,-.59 if im else -.68,1.74+i*.115),(.025,.012,.024),GOLD if not im else (84,116,88),'waistcoat_button')
 # shoulders and arms slightly bent fighting pose
 for side in (-1,1):
  sx=side*(.47 if im else .59)
  B.ell((sx,0,2.16),(.25 if im else .30,.26,.25),outfit,'kurta_shoulder')
  elbow=(side*(.77 if im else .94),-.24,1.73)
  wrist=(side*(.66 if im else .84),-.65,1.84)
  B.cone((sx,0,2.15),elbow,.20 if im else .25,.155 if im else .20,outfit,'upper_arm_sleeve',14)
  B.ell(elbow,(.16,.17,.16),outfit,'elbow_fabric')
  B.cone(elbow,wrist,.16,.115,outfit,'lower_arm_sleeve',12)
  B.cone((wrist[0],wrist[1],wrist[2]+.05),(wrist[0],wrist[1],wrist[2]-.07),.125,.135,(211,202,177),'embroidered_cuff')
  B.ell((wrist[0],wrist[1]-.13,wrist[2]),(.142,.16,.15),skin,'fighting_fist')
  B.ell((wrist[0]+side*.075,wrist[1]-.18,wrist[2]-.08),(.065,.09,.07),skin,'thumb')
 # neck with visible collar
 B.cone((0,0,2.16),(0,-.005,2.47),.17,.16,skin,'neck')
 B.ell((0,-.01,2.39),(.205,.19,.065),outfit,'kurta_collar')
 # head (forward negative Y)
 headZ=2.74 if im else 2.69
 B.ell((0,-.015,headZ),(.345 if im else .39,.31 if im else .34,.43 if im else .39),skin,'recognizable_face_head',3)
 # jaw and cheeks
 if im:
  B.ell((0,-.13,headZ-.22),(.255,.225,.22),skin,'long_defined_jaw',2)
  for side in [-1,1]: B.ell((side*.255,-.194,headZ-.115),(.070,.064,.10),(174,126,100),'subtle_cheek_structure')
 else:
  B.ell((0,-.135,headZ-.20),(.332,.26,.23),skin,'fuller_round_jaw',2)
  for side in [-1,1]: B.ell((side*.269,-.22,headZ-.105),(.100,.078,.111),(190,142,112),'full_cheeks')
 # ears
 for side in [-1,1]:
  B.ell((side*(.345 if im else .392),0,headZ-.02),(.071,.07,.125),skin,'ear')
  B.ell((side*(.362 if im else .414),-.063,headZ-.02),(.037,.015,.06),(153,108,88),'ear_detail')
 # eyebrows & eyes forehead oriented forward (negative y)
 eyeY=-.294 if im else -.323
 for side in [-1,1]:
  x=side*.139
  B.ell((x,eyeY-.011,headZ+.080),(.076,.016,.026),(225,217,203),'sclera')
  B.ell((x+side*.015,eyeY-.035,headZ+.078),(.027,.010,.026),(54,42,33),'brown_iris')
  B.ell((x+side*.017,eyeY-.048,headZ+.078),(.012,.009,.019),(20,24,22),'pupil')
  B.arc([(x-side*.091,eyeY-.018,headZ+.185),(x,eyeY-.031,headZ+.204 if im else headZ+.17),(x+side*.079,eyeY-.015,headZ+.171)],.018 if im else .017,darkhair,'strong_signature_eyebrows')
 # nose: projecting from face
 B.cone((0,eyeY+.02,headZ+.085),(0,eyeY-.115,headZ-.093),.055,.046,skin,'prominent_3D_nose',12)
 B.ell((0,eyeY-.09,headZ-.106),(.067,.058,.05),skin,'nose_tip')
 B.ell((0,eyeY-.045,headZ-.235),(.092,.016,.022),(112,69,61) if im else (135,77,73),'mouth_lip')
 B.arc([(-.09,eyeY-.048,headZ-.248),(0,eyeY-.064,headZ-.257),(.095,eyeY-.046,headZ-.248)],.012,(65,44,42),'mouth_line')
 # expression lines
 for side in [-1,1]:
  B.arc([(side*.22,eyeY-.024,headZ+.021),(side*.255,eyeY+.005,headZ-.065)],.007,(144,100,78),'subtle_expression_lines')
 # HAIR - major distinguishing component
 if im:
  # large volume dark swept back textured hair, clearly visible tall outline
  B.ell((0,.04,headZ+.355),(.36,.31,.18),darkhair,'thick_swept_back_hair',3)
  for side in [-1,1]:
   B.ell((side*.26,.024,headZ+.275),(.12,.22,.22),darkhair,'full_side_hair')
  # raised sculpted long swept-back tufts
  for i in range(9):
   x=-.31+i*.075; back=.06+(.02 if i%2 else -.02);z=headZ+.41+(.03 if i%3==0 else 0)
   B.cone((x,-.19,z-.06),(x+.085,.085,z+.15),.093,.007,(38,34,32) if i%2 else (28,27,27),'swept_dark_hair_tuft',8)
  for i in range(4):
   B.arc([(-.24+i*.13,-.23,headZ+.34),(-.19+i*.13,-.19,headZ+.47)],.012,(59,55,53),'hair_sculpt_detail')
 else:
  # receded front, tidy comb over, gray hair at temples
  B.ell((.045,.10,headZ+.335),(.355,.265,.12),darkhair,'side_combed_hair',3)
  for side in [-1,1]:
   B.ell((side*.283,.06,headZ+.24),(.10,.19,.13),(80,78,76),'gray_temples')
  # distinctive broad side part, angled swept comb lines
  for i in range(7):
   x=-.20+i*.065
   B.arc([(x,-.105,headZ+.40),(x+.12,-.015,headZ+.445),(x+.19,.075,headZ+.405)],.016,(77,75,70) if i%2 else (37,36,36),'neatly_combed_hair')
  B.arc([(-.19,-.12,headZ+.34),(-.14,-.09,headZ+.41),(-.1,-.04,headZ+.445)],.014,(166,153,137),'hair_parting_gray_line')
 # full RGB geometry, grounded body
 file=B.export();loaded=trimesh.load(file,force='scene'); tris=sum(len(g.faces) for g in loaded.geometry.values());print(file,os.path.getsize(file),'bytes',tris,'triangles',len(loaded.geometry),'meshes');return file
paths=[make('imran_khan'),make('nawaz_sharif')]
with zipfile.ZipFile(os.path.join(OUT,'awaami_arena_3d_models_v2.zip'),'w',zipfile.ZIP_DEFLATED) as z:
 for p in paths:z.write(p,os.path.basename(p))
