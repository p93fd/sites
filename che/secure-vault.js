/* ЧЕ — локальное AES-GCM хранилище. Парольная фраза остаётся способом восстановления.
 * Необязательный WebAuthn PRF защищает копию фразы для разблокировки с Face ID.
 * Старый формат v1 и его резервные копии сохраняются без миграции.
 */
(function(){
  'use strict';
  const DB='che_finance_vault_v1', TABLE='records', RECORD='main', ITERATIONS=320000;
  const enc=new TextEncoder(),dec=new TextDecoder();
  const b64=b=>{const x=new Uint8Array(b);let out='';for(let i=0;i<x.length;i+=8192)out+=String.fromCharCode(...x.subarray(i,i+8192));return btoa(out)};
  const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const random=n=>crypto.getRandomValues(new Uint8Array(n));
  function validRecord(r){return r?.v===1&&r.alg==='AES-256-GCM'&&r.kdf==='PBKDF2-SHA-256'&&Number.isInteger(r.iterations)&&r.iterations>=200000&&r.iterations<=2000000&&typeof r.salt==='string'&&bytes(r.salt).length===16&&typeof r.iv==='string'&&bytes(r.iv).length===12&&typeof r.ciphertext==='string'&&r.ciphertext.length<=40000000&&bytes(r.ciphertext).length>=16}
  class Vault {
    constructor(){this.key=null;this.salt=null;this.iterations=ITERATIONS;this.queue=Promise.resolve();this.unlocked=false;this.biometric=[];}
    static supported(){return !!(self.isSecureContext&&crypto?.subtle&&self.indexedDB);}
    async db(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(TABLE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
    async read(){const db=await this.db();return new Promise((resolve,reject)=>{const tx=db.transaction(TABLE);const q=tx.objectStore(TABLE).get(RECORD);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);tx.oncomplete=()=>db.close();});}
    async write(v){const db=await this.db();return new Promise((resolve,reject)=>{const tx=db.transaction(TABLE,'readwrite');tx.objectStore(TABLE).put(v,RECORD);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error);};});}
    async isSetup(){return !!(await this.read());}
    async derive(pass,salt,rounds){const base=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:rounds,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
    async encrypted(payload){const iv=random(12);const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},this.key,enc.encode(JSON.stringify(payload)));return {v:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA-256',iterations:this.iterations,salt:b64(this.salt),iv:b64(iv),ciphertext:b64(ciphertext),...(this.biometric.length?{biometric:this.biometric}: {})};}
    async create(pass,initial){if(await this.isSetup())throw Error('Хранилище уже существует');if(pass.length<12)throw Error('Пароль должен содержать хотя бы 12 символов');this.salt=random(16);this.key=await this.derive(pass,this.salt,ITERATIONS);this.unlocked=true;await this.write(await this.encrypted(initial));return initial;}
    async unlock(pass){const r=await this.read();if(!r)throw Error('Нет хранилища');if(!validRecord(r))throw Error('Неизвестная версия зашифрованного хранилища');const key=await this.derive(pass,bytes(r.salt),r.iterations);let data;try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(r.iv)},key,bytes(r.ciphertext));data=JSON.parse(dec.decode(plain));}catch{throw Error('Неверная парольная фраза или повреждённые данные');}this.key=key;this.salt=bytes(r.salt);this.iterations=r.iterations;this.biometric=this.validBiometric(r.biometric);this.unlocked=true;return data;}
    validBiometric(entries){if(!Array.isArray(entries))return [];return entries.filter(e=>{try{return typeof e.id==='string'&&e.id.length<2048&&typeof e.salt==='string'&&bytes(e.salt).length===32&&typeof e.iv==='string'&&bytes(e.iv).length===12&&typeof e.ciphertext==='string'&&bytes(e.ciphertext).length>16&&bytes(e.ciphertext).length<2048;}catch{return false}}).slice(0,5);}
    async biometricCredentials(){const r=await this.read();return this.validBiometric(r?.biometric).map(({id,salt})=>({id,salt}));}
    async biometricKey(prfOutput,salt){const raw=new Uint8Array(prfOutput);if(raw.length!==32||salt.length!==32)throw Error('Face ID не вернул ключ шифрования');const base=await crypto.subtle.importKey('raw',raw,'HKDF',false,['deriveKey']);return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt,info:enc.encode('CHE Face ID password wrap v1')},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
    async enableBiometric(pass,prfOutput,id,salt){if(!this.unlocked||!this.key)throw Error('Сначала открой хранилище');if(typeof pass!=='string'||!pass)throw Error('Введи парольную фразу');if(typeof id!=='string'||!id||id.length>2048)throw Error('Неизвестный ключ устройства');const current=await this.read();if(!validRecord(current))throw Error('Хранилище повреждено');await this.decodeBackup(current,pass);const key=await this.biometricKey(prfOutput,new Uint8Array(salt));const iv=random(12),sealed=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(pass));const entry={id,salt:b64(salt),iv:b64(iv),ciphertext:b64(sealed)};this.queue=this.queue.catch(()=>{}).then(async()=>{const latest=await this.read();if(!validRecord(latest))throw Error('Хранилище изменилось');const next=[...this.validBiometric(latest.biometric).filter(e=>e.id!==id),entry].slice(-5);await this.write({...latest,biometric:next});this.biometric=next;});await this.queue;}
    async unlockWithBiometric(prfOutput,id){const record=await this.read();if(!validRecord(record))throw Error('Хранилище отсутствует или повреждено');const entry=this.validBiometric(record.biometric).find(e=>e.id===id);if(!entry)throw Error('Этот ключ доступа не привязан к хранилищу');try{const key=await this.biometricKey(prfOutput,bytes(entry.salt));const opened=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(entry.iv)},key,bytes(entry.ciphertext));const pass=dec.decode(opened);return await this.unlock(pass);}catch{throw Error('Не удалось открыть хранилище через Face ID. Войди по парольной фразе.');}}
    async disableBiometric(){if(!this.unlocked)throw Error('Сначала открой хранилище');this.queue=this.queue.catch(()=>{}).then(async()=>{const current=await this.read();if(!validRecord(current))throw Error('Хранилище повреждено');const {biometric,...safe}=current;await this.write(safe);this.biometric=[];});await this.queue;}
    save(data){if(!this.unlocked)return Promise.reject(Error('Хранилище заблокировано'));const snapshot=JSON.parse(JSON.stringify(data));this.queue=this.queue.catch(()=>{}).then(async()=>this.write(await this.encrypted(snapshot)));return this.queue;}
    async flush(){await this.queue;}
    async exportEncrypted(){await this.flush();return JSON.stringify(await this.read(),null,2);}
    async decodeBackup(record,pass){if(!validRecord(record))throw Error('Формат резервной копии не поддерживается');const backupKey=await this.derive(pass,bytes(record.salt),record.iterations);try{const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(record.iv)},backupKey,bytes(record.ciphertext));return JSON.parse(dec.decode(pt))}catch{throw Error('Не удалось расшифровать копию: неверная фраза или повреждён файл')}}
    async lock(){await this.flush();this.key=null;this.salt=null;this.biometric=[];this.unlocked=false;}
  }
  self.CheVault=Vault;
})();

