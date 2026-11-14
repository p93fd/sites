/* ЧЕ: локальная разблокировка зашифрованной базы через WebAuthn PRF.
 * Парольная фраза остаётся резервным способом входа и восстановления.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id),gate=$('lockGate'),status=$('authStatus');
let enrolled=[];
const random=n=>crypto.getRandomValues(new Uint8Array(n));
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const un64=s=>{s=String(s||'').replace(/-/g,'+').replace(/_/g,'/').replace(/[^A-Za-z0-9+/]/g,'');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
const supported=()=>!!(window.isSecureContext&&window.PublicKeyCredential&&navigator.credentials);
const output=c=>c?.getClientExtensionResults?.()?.prf?.results?.first;
const message=e=>e?.name==='NotAllowedError'?'Проверка устройства отменена. Повтори или войди по паролю.':e?.message||'Проверка устройства не удалась.';
const creds=async()=>window.cheGetVault?.()?.biometricCredentials()||[];
function fallback(){gate.hidden=true;document.body.style.overflow='';$('cheVaultGate').hidden=false;$('cheVaultPassword').focus();}
function showGate(){$('cheVaultGate').hidden=true;gate.hidden=false;document.body.style.overflow='hidden';$('previewUnlock').hidden=false;$('previewUnlock').textContent='Войти по парольной фразе';$('unlockFace').textContent='Войти по Face ID';$('lockMessage').textContent='Нажми «Использовать ключ входа» — дальше Face ID.';}
async function state(){const list=await creds();enrolled=list;$('disableFace').hidden=!list.length;status.textContent=!supported()?'В этом браузере Face ID недоступен, входи по парольной фразе.':list.length?'Face ID подключён к зашифрованной базе. Пароль остаётся запасным входом.':'Face ID ещё не подключён. Сейчас база защищена парольной фразой.';return list;}
function getOptions(items){const prf=items.length===1?{eval:{first:un64(items[0].salt)}}:{evalByCredential:Object.fromEntries(items.map(e=>[e.id,{first:un64(e.salt)}]))};return {challenge:random(32),rpId:location.hostname,timeout:60000,userVerification:'required',allowCredentials:items.map(e=>({type:'public-key',id:un64(e.id)})),extensions:{prf}};}
async function unlock(){
 if(!supported()){$('lockMessage').textContent='Используй вход по парольной фразе.';return;}
 let items=enrolled;if(!items.length){fallback();return;}
 let last='';try{last=localStorage.getItem('che-face-last')||'';}catch{}
 if(items.length>1&&items.some(e=>e.id===last))items=items.filter(e=>e.id===last);
 const btn=$('unlockFace');btn.disabled=true;$('lockMessage').textContent='Подтверди системный запрос устройства…';
 try{
  // Важно для Safari: вызов WebAuthn непосредственно по нажатию.
  const pending=navigator.credentials.get({publicKey:getOptions(items)});
  const c=await pending,prf=output(c);
  if(!prf)throw Error('iPhone не выдал ключ PRF. Войди по паролю.');
  const data=await window.cheGetVault().unlockWithBiometric(prf,c.id);
  try{localStorage.setItem('che-face-last',c.id);}catch{}
  window.cheAcceptUnlockedVault(data);gate.hidden=true;document.body.style.overflow='';
 }catch(e){$('lockMessage').textContent='Face ID: '+message(e);}
 finally{btn.disabled=false;}
}
function register(){
 if(!supported()){status.textContent='Для подключения нужен Safari с поддержкой PRF и HTTPS.';return;}
 const vault=window.cheGetVault?.();
 if(!vault?.unlocked){status.textContent='Сначала открой хранилище парольной фразой.';return;}
 const d=document.createElement('dialog');d.className='passkey-dialog';
 d.innerHTML='<h2>Подключить Face ID</h2><p>Подтверди парольную фразу. Она останется для восстановления.</p><label>Парольная фраза <input id="localFacePass" type="password" autocomplete="off" maxlength="256"></label><p id="localFaceHint" class="passkey-progress" role="status" aria-live="polite"></p><div class="section-cta"><button class="btn primary" id="localFaceContinue" type="button">Проверить пароль</button><button class="btn" id="localFaceCancel" type="button">Отмена</button></div>';
 document.body.append(d);d.showModal();
 const pass=d.querySelector('#localFacePass'),button=d.querySelector('#localFaceContinue'),hint=d.querySelector('#localFaceHint');
 let stage='password',id='',salt=random(32);
 d.querySelector('#localFaceCancel').onclick=()=>d.close();
 d.addEventListener('close',()=>{pass.value='';d.remove()},{once:true});
 button.onclick=async()=>{
  if(stage==='done'){d.close();return;}
  if(stage==='password'){
   button.disabled=true;
   try{await vault.decodeBackup(await vault.read(),pass.value);stage='create';button.textContent='Создать ключ устройства';hint.textContent='Пароль верный. Нажми ещё раз для Face ID.';}
   catch{hint.textContent='Неверная парольная фраза.';}
   finally{button.disabled=false;}
   return;
  }
  button.disabled=true;hint.textContent='Подтверди запрос устройства…';
  try{
   if(stage==='create'){
    // Отдельный пользовательский клик до любого await.
    const pending=navigator.credentials.create({publicKey:{challenge:random(32),rp:{name:'Финансы · ЧЕ',id:location.hostname},user:{id:random(16),name:'che-owner',displayName:'Владелец'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'preferred',userVerification:'required'},attestation:'none',timeout:60000,extensions:{prf:{eval:{first:salt}}}}});
    const c=await pending;if(!c)throw Error('Создание отменено');id=c.id;
    const key=output(c);
    if(key){await vault.enableBiometric(pass.value,key,id,salt);await state();stage='done';button.textContent='Готово';hint.textContent='Face ID подключён. Данные сохранены.';}
    else{stage='confirm';button.textContent='Подтвердить Face ID ещё раз';hint.textContent='Ключ создан. Для шифрования нужно ещё одно подтверждение.';}
    return;
   }
   if(stage==='confirm'){
    const pending=navigator.credentials.get({publicKey:getOptions([{id,salt:b64(salt)}])});
    const c=await pending,key=output(c);
    if(!key)throw Error('Устройство не поддерживает PRF для шифрования. Парольный вход сохранён.');
    await vault.enableBiometric(pass.value,key,c.id,salt);
    await state();stage='done';button.textContent='Готово';hint.textContent='Face ID подключён. Данные сохранены.';
   }
  }catch(e){hint.textContent=message(e);}
  finally{button.disabled=false;}
 };
}
async function disable(){const vault=window.cheGetVault?.();if(!vault?.unlocked)return;if(!confirm('Отключить Face ID? Данные и пароль останутся.'))return;try{await vault.disableBiometric();await state();}catch(e){status.textContent=message(e);}}

// 10.6.3: Face ID сразу после входа по паролю и автозапуск при открытии.
let pendingPass='';
async function prfReady(){try{const caps=await PublicKeyCredential.getClientCapabilities?.();if(caps&&'extension:prf' in caps)return !!caps['extension:prf'];}catch{}return supported();}
async function autoUnlock(){
 if(!enrolled.length)return;
 try{await unlock();}
 catch{}
 if(!gate.hidden&&/отменена/.test($('lockMessage').textContent))$('lockMessage').textContent='Коснись экрана — откроется Face ID.';
}
function watchPasswordUnlock(){
 document.addEventListener('submit',e=>{if(e.target?.id==='cheVaultForm')pendingPass=$('cheVaultPassword').value||'';},true);
 new MutationObserver(async()=>{
  const g=$('cheVaultGate');if(!g.hidden||!pendingPass)return;
  const pass=pendingPass;pendingPass='';
  const vault=window.cheGetVault?.();if(!vault?.unlocked)return;
  try{if((await state()).length)return;}catch{return;}
  let skip=false;try{skip=localStorage.getItem('che-face-offer')==='later'&&Date.now()-Number(localStorage.getItem('che-face-offer-at')||0)<864e5;}catch{}
  if(skip||!(await prfReady()))return;
  offer(pass);
 }).observe($('cheVaultGate'),{attributes:true,attributeFilter:['hidden']});
}
function offer(pass){
 const vault=window.cheGetVault();
 const d=document.createElement('dialog');d.className='passkey-dialog che-face-offer';
 d.innerHTML='<div class="offer-glyph" aria-hidden="true">'+(gate.querySelector('.face-glyph')?.innerHTML||'')+'</div><h2>Входить по Face ID?</h2><p>Пароль больше вводить не придётся. Он останется запасным входом.</p><p class="passkey-progress" role="status" aria-live="polite"></p><div class="section-cta"><button class="btn primary" type="button" data-act="go">Включить Face ID</button><button class="btn" type="button" data-act="later">Не сейчас</button></div>';
 document.body.append(d);d.showModal();
 const btn=d.querySelector('[data-act="go"]'),hint=d.querySelector('.passkey-progress');
 let stage='create',id='';const salt=random(32);
 d.addEventListener('close',()=>{pass='';d.remove();},{once:true});
 d.querySelector('[data-act="later"]').onclick=()=>{try{localStorage.setItem('che-face-offer','later');localStorage.setItem('che-face-offer-at',String(Date.now()));}catch{}d.close();};
 btn.onclick=async()=>{
  if(stage==='done'){d.close();return;}
  btn.disabled=true;hint.textContent='Посмотри на iPhone…';
  try{
   if(stage==='create'){
    const pending=navigator.credentials.create({publicKey:{challenge:random(32),rp:{name:'Финансы · ЧЕ',id:location.hostname},user:{id:random(16),name:'che-owner',displayName:'Владелец'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'preferred',userVerification:'required'},attestation:'none',timeout:60000,extensions:{prf:{eval:{first:salt}}}}});
    const c=await pending;if(!c)throw Error('Создание отменено');id=c.id;const key=output(c);
    if(key){await vault.enableBiometric(pass,key,id,salt);}
    else{stage='confirm';btn.textContent='Подтвердить лицом ещё раз';hint.textContent='Почти готово. Нужно ещё одно подтверждение.';return;}
   }else{
    const pending=navigator.credentials.get({publicKey:getOptions([{id,salt:b64(salt)}])});
    const c=await pending,key=output(c);
    if(!key)throw Error('Этот iPhone не отдал ключ для шифрования. Вход по паролю остаётся.');
    await vault.enableBiometric(pass,key,c.id,salt);id=c.id;
   }
   try{localStorage.setItem('che-face-last',id||'');}catch{}await state();stage='done';btn.textContent='Готово';hint.textContent='Face ID включён. В следующий раз приложение откроется по лицу.';d.querySelector('[data-act="later"]').hidden=true;
  }catch(e){hint.textContent=message(e);}
  finally{btn.disabled=false;}
 };
}
async function init(){
 $('activateFace').addEventListener('click',register);
 $('unlockFace').addEventListener('click',unlock);
 gate.addEventListener('click',e=>{if(e.target.closest('#previewUnlock,#unlockFace'))return;if(!$('unlockFace').disabled)unlock();});
 $('previewUnlock').addEventListener('click',fallback);
 $('disableFace').addEventListener('click',disable);
 $('lockNow').addEventListener('click',async()=>{try{await window.cheLockVault?.();location.reload();}catch{status.textContent='Не удалось завершить сохранение. Повтори.';}});
 await window.cheVaultSetupReady;
 try{if((await state()).length&&!window.cheGetVault()?.unlocked&&!$('cheVaultGate').hidden){showGate();autoUnlock();}}catch{status.textContent='Face ID сейчас недоступен. Можно войти по паролю.';}
 watchPasswordUnlock();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

