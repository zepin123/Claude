import {createHash} from 'node:crypto';
import {FieldValue} from 'firebase-admin/firestore';
import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import {onRequest} from 'firebase-functions/v2/https';
import {db} from './firebase/admin.js';
import {dayraAppUrl,oneSignalAppId,oneSignalRestKey,oneSignalWebhookSecret} from './config.js';

function uuidFor(value:string){const h=createHash('sha256').update(value).digest('hex').slice(0,32).split('');h[12]='4';h[16]=((parseInt(h[16],16)&3)|8).toString(16);return `${h.slice(0,8).join('')}-${h.slice(8,12).join('')}-${h.slice(12,16).join('')}-${h.slice(16,20).join('')}-${h.slice(20).join('')}`}
async function request(path:string,init:RequestInit):Promise<Record<string,unknown>>{const response=await fetch(`https://api.onesignal.com${path}`,{...init,headers:{'Content-Type':'application/json','Authorization':`Key ${oneSignalRestKey.value()}`,...init.headers}});if(!response.ok&&response.status!==404)throw new Error(`OneSignal ${response.status}: ${await response.text()}`);if(response.status===204||response.status===404)return {};return response.json() as Promise<Record<string,unknown>>}
async function cancel(id?:string|null){if(id)await request(`/notifications/${encodeURIComponent(id)}?app_id=${encodeURIComponent(oneSignalAppId.value())}`,{method:'DELETE'})}

export const syncTaskReminder=onDocumentWritten({document:'users/{uid}/tasks/{taskId}',region:'us-central1',secrets:[oneSignalRestKey,oneSignalAppId,dayraAppUrl]},async event=>{
 const before=event.data?.before.data()||{};const after=event.data?.after.data();const oldId=String(before.one_signal_notification_id||'');
 if(!after){await cancel(oldId);return}
 const reminder=after.remind_at?new Date(String(after.remind_at)):null;const active=reminder&&Number.isFinite(reminder.getTime())&&reminder.getTime()>Date.now()&&after.status!=='completada'&&after.reminder_status!=='cancelled';
 const signature=`${after.remind_at}|${after.title}|${after.status}|${after.reminder_status}`;const oldSignature=`${before.remind_at}|${before.title}|${before.status}|${before.reminder_status}`;
 if(signature===oldSignature&&after.notification_sync_status==='synced')return;
 if(oldId)await cancel(oldId);
 if(!active){if(after.notification_sync_status!=='disabled'||after.one_signal_notification_id)await event.data!.after.ref.set({one_signal_notification_id:null,notification_sync_status:'disabled',reminder_status:after.status==='completada'?'completed':'cancelled',updated_at:new Date().toISOString()},{merge:true});return}
 const taskId=event.params.taskId,uid=event.params.uid;const body=after.time?`Lo tienes programado para las ${String(after.time).slice(0,5)}.`:'Tienes un pendiente programado.';
 const result=await request('/notifications',{method:'POST',body:JSON.stringify({app_id:oneSignalAppId.value(),include_aliases:{external_id:[uid]},target_channel:'push',headings:{es:String(after.title),en:String(after.title)},contents:{es:body,en:body},send_after:reminder!.toISOString(),url:`${dayraAppUrl.value().replace(/\/$/,'')}/tasks/${encodeURIComponent(taskId)}`,data:{uid,taskId},idempotency_key:uuidFor(`${uid}:${taskId}:${after.remind_at}`)})});
 await event.data!.after.ref.set({one_signal_notification_id:String(result.id||''),notification_sync_status:'synced',reminder_status:after.reminder_status==='snoozed'?'snoozed':'scheduled',updated_at:new Date().toISOString()},{merge:true});
});

export const oneSignalDeliveryWebhook=onRequest({region:'us-central1',secrets:[oneSignalWebhookSecret]},async(req,res)=>{if(req.get('authorization')!==`Bearer ${oneSignalWebhookSecret.value()}`){res.status(401).send('Unauthorized');return}const taskId=req.body?.data?.taskId,uid=req.body?.data?.uid;if(typeof taskId==='string'&&typeof uid==='string')await db.doc(`users/${uid}/tasks/${taskId}`).set({reminder_status:'sent',notification_delivered_at:FieldValue.serverTimestamp()},{merge:true});res.status(204).send('')});
