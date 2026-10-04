import os,sys,shutil,time
from gradio_client import Client, handle_file
from PIL import Image
src,dst,prompt=sys.argv[1],sys.argv[2],sys.argv[3]; seed=int(sys.argv[4]) if len(sys.argv)>4 else 7
c=Client("black-forest-labs/FLUX.1-Kontext-Dev",token=os.environ['HF_TOKEN'],verbose=False)
t=time.time()
r=c.predict(input_image=handle_file(src),prompt=prompt,seed=seed,randomize_seed=False,guidance_scale=2.5,steps=28,api_name="/infer")
p=r[0] if isinstance(r[0],str) else r[0]['path']
Image.open(p).convert('RGB').save(dst,quality=94); print('OK',dst,round(time.time()-t))
