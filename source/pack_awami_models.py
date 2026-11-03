import trimesh, numpy as np, struct, gzip, base64, json, pathlib
P=pathlib.Path('/mnt/data')
ARMS=('kurta_shoulder','upper_arm_sleeve','elbow_fabric','lower_arm_sleeve','embroidered_cuff','fighting_fist','thumb')
LEGS=('shalwar_leg','trouser_fabric_pleat','Peshawari_chappal_shoe','shoe_strap')
HEAD=('hair','face','jaw','cheek','eye','sclera','iris','pupil','nose','mouth','lip','ear','eyebrow','expression','temple','tuft','full_','strong_','subtle_')
PIVOTS={'torso':(0,0,0),'head':(0,2.43,0),'armL':(-.55,2.13,0),'armR':(.55,2.13,0),'legL':(-.32,1.17,0),'legR':(.32,1.17,0)}
result=[]
for name in ['imran_khan','nawaz_sharif']:
 s=trimesh.load(P/f'{name}_fighter_v2.glb',force='scene')
 parts={k:bytearray() for k in PIVOTS}
 counts={k:0 for k in PIVOTS}
 for node in s.graph.nodes_geometry:
  mat,geoname=s.graph[node];g=s.geometry[geoname]; nm=node.lower()
  center=g.centroid[0]
  if any(n.lower() in nm for n in ARMS):cat='armL' if center<0 else 'armR'
  elif any(n.lower() in nm for n in LEGS):cat='legL' if center<0 else 'legR'
  elif any(n in nm for n in HEAD) and not ('neck' in nm):cat='head'
  else:cat='torso'
  V=trimesh.transform_points(g.vertices,mat)
  N=g.vertex_normals@mat[:3,:3].T
  N/=np.maximum(1e-8,np.linalg.norm(N,axis=1,keepdims=True))
  # z up -> y up, forward -Y -> +Z
  V=V[:,[0,2,1]];V[:,2]*=-1
  N=N[:,[0,2,1]];N[:,2]*=-1
  V-=np.array(PIVOTS[cat])
  col=g.visual.material.baseColorFactor[:3] if g.visual.material is not None else [220,220,220]
  color=bytes(int(x) for x in col) + b'\xff'
  for tri in g.faces:
   for i in tri:
    pos=V[i];no=N[i];
    norm=bytes(max(0,min(255,round(float(x)*127)+128)) for x in no) + b'\xff'
    # Normal is normalized using shader as (normal_unsigned-0.5)*2
    parts[cat].extend(struct.pack('<3f',*map(float,pos)))
    parts[cat].extend(norm)
    parts[cat].extend(color)
    counts[cat]+=1
 o={'id':name,'groups':{}}
 for k,b in parts.items():
  gz=gzip.compress(bytes(b),compresslevel=9)
  o['groups'][k]={'count':counts[k],'b64':base64.b64encode(gz).decode()}
 print(name,'vertices',sum(counts.values()),'compressed',sum(len(x['b64']) for x in o['groups'].values()),'groups',counts)
 result.append(o)
(P/'awaami_models_packed.json').write_text(json.dumps(result,separators=(',',':')))
