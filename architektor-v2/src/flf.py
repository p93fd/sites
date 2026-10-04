import os,sys,shutil,time
from gradio_client import Client, handle_file
a,b,dst,prompt,dur=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],float(sys.argv[5])
c=Client("multimodalart/wan-2-2-first-last-frame",token=os.environ['HF_TOKEN'],verbose=False)
t=time.time()
r=c.predict(start_image_pil=handle_file(a),end_image_pil=handle_file(b),prompt=prompt,duration_seconds=dur,steps=8,guidance_scale=1.0,guidance_scale_2=1.0,seed=21,randomize_seed=False,api_name="/generate_video")
v=r[0]; v=v['video'] if isinstance(v,dict) else v
shutil.copy(v,dst); print('OK',dst,round(time.time()-t))
