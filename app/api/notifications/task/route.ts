import {authenticatedUid,notificationConfig,uuidFor} from '../server';

export const dynamic='force-dynamic';

type RequestBody={taskId?:unknown;title?:unknown;time?:unknown;remindAt?:unknown;status?:unknown;reminderStatus?:unknown;notificationId?:unknown;cancelOnly?:unknown};
type OneSignalUser={identity?:{external_id?:string};subscriptions?:Array<{enabled?:boolean;type?:string}>};
type OneSignalMessage={id?:string;recipients?:number;data?:{uid?:string;taskId?:string};errors?:unknown};
type FirestoreTask={fields?:Record<string,{stringValue?:string;nullValue?:null}>};

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readJson(response:Response){try{return await response.json() as OneSignalMessage}catch{return {errors:`HTTP ${response.status}`} as OneSignalMessage}}

export async function POST(request:Request){
  const {appId,apiKey,projectId,appUrl}=notificationConfig();
  if(!appId||!apiKey||!projectId)return Response.json({error:'El envío de notificaciones no está configurado.'},{status:503});
  const uid=await authenticatedUid(request,projectId);
  if(!uid)return Response.json({error:'La sesión caducó. Vuelve a iniciar sesión.'},{status:401});
  const bearer=request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  let raw:RequestBody;
  try{raw=await request.json() as RequestBody}catch{return Response.json({error:'Solicitud no válida.'},{status:400})}
  const taskId=typeof raw.taskId==='string'?raw.taskId:'';
  const title=typeof raw.title==='string'?raw.title.trim():'';
  const time=typeof raw.time==='string'?raw.time:null;
  const remindAt=typeof raw.remindAt==='string'?raw.remindAt:null;
  const status=typeof raw.status==='string'?raw.status:'';
  const reminderStatus=typeof raw.reminderStatus==='string'?raw.reminderStatus:'';
  const notificationId=typeof raw.notificationId==='string'?raw.notificationId:null;
  if(!/^[A-Za-z0-9_-]{1,160}$/.test(taskId)||!title||title.length>240||!['pendiente','en_progreso','completada','pospuesta'].includes(status)||!['scheduled','sent','snoozed','completed','cancelled'].includes(reminderStatus)||notificationId&&!uuid.test(notificationId))return Response.json({error:'Los datos del recordatorio no son válidos.'},{status:400});
  const headers={Authorization:`Key ${apiKey}`,'Content-Type':'application/json'};
  const cancelPrevious=async()=>{
    if(!notificationId)return;
    const detailResponse=await fetch(`https://api.onesignal.com/notifications/${encodeURIComponent(notificationId)}?app_id=${encodeURIComponent(appId)}`,{headers,cache:'no-store'});
    if(detailResponse.status===404)return;
    const detail=await readJson(detailResponse);
    if(!detailResponse.ok)throw new Error(`No se pudo comprobar el recordatorio anterior (${detailResponse.status}).`);
    if(detail.data?.uid!==uid||detail.data?.taskId!==taskId)throw new Error('El recordatorio anterior no pertenece a esta tarea.');
    const cancelled=await fetch(`https://api.onesignal.com/notifications/${encodeURIComponent(notificationId)}?app_id=${encodeURIComponent(appId)}`,{method:'DELETE',headers});
    if(!cancelled.ok&&cancelled.status!==400&&cancelled.status!==404)throw new Error(`No se pudo cancelar el recordatorio anterior (${cancelled.status}).`);
  };
  try{
    if(raw.cancelOnly===true){await cancelPrevious();return Response.json({notificationId:null,syncStatus:'disabled',reminderStatus:'cancelled'});}
    const taskResponse=await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}/tasks/${encodeURIComponent(taskId)}`,{headers:{Authorization:`Bearer ${bearer}`},cache:'no-store'});
    if(!taskResponse.ok)return Response.json({error:'No pudimos comprobar esta tarea en tu espacio privado.'},{status:taskResponse.status===404||taskResponse.status===403?403:502});
    const stored=await taskResponse.json() as FirestoreTask;
    const field=(name:string)=>stored.fields?.[name]?.stringValue||null;
    if(field('user_id')!==uid||field('id')!==taskId||field('title')!==title||field('time')!==time||field('remind_at')!==remindAt||field('status')!==status||field('reminder_status')!==reminderStatus||field('one_signal_notification_id')!==notificationId)return Response.json({error:'La tarea cambió. Actualiza la vista e inténtalo de nuevo.'},{status:409});
    const reminder=remindAt?new Date(remindAt):null;
    const validReminder=Boolean(reminder&&Number.isFinite(reminder.getTime()));
    const active=validReminder&&status!=='completada'&&reminderStatus!=='cancelled'&&reminderStatus!=='completed';
    if(!active){await cancelPrevious();return Response.json({notificationId:null,syncStatus:'disabled',reminderStatus:status==='completada'?'completed':'cancelled'});}
    if(reminder!.getTime()<Date.now()-5*60*1000){await cancelPrevious();return Response.json({notificationId:null,syncStatus:'disabled',reminderStatus:'cancelled'});}
    const horizon=29*24*60*60*1000;
    if(reminder!.getTime()-Date.now()>horizon){await cancelPrevious();return Response.json({notificationId:null,syncStatus:'pending',reminderStatus, deferred:true});}
    const userResponse=await fetch(`https://api.onesignal.com/apps/${encodeURIComponent(appId)}/users/by/external_id/${encodeURIComponent(uid)}`,{headers,cache:'no-store'});
    if(!userResponse.ok)return Response.json({error:'Activa las notificaciones en este dispositivo antes de programar el recordatorio.'},{status:409});
    const user=await userResponse.json() as OneSignalUser;
    if(user.identity?.external_id!==uid||!user.subscriptions?.some(subscription=>subscription.enabled===true))return Response.json({error:'No encontramos una suscripción push activa para tu cuenta.'},{status:409});
    await cancelPrevious();
    const body=time?`Lo tienes programado para las ${time.slice(0,5)}.`:'Tienes un pendiente programado.';
    const payload:Record<string,unknown>={app_id:appId,include_aliases:{external_id:[uid]},target_channel:'push',name:`Recordatorio · ${title.slice(0,80)}`,headings:{en:title,es:title},contents:{en:body,es:body},url:`${appUrl.replace(/\/$/,'')}/?task=${encodeURIComponent(taskId)}#Tareas`,data:{uid,taskId},idempotency_key:await uuidFor(`${uid}:${taskId}:${remindAt}:${title}:${time||''}`)};
    const future=reminder!.getTime()>Date.now()+5000;
    if(future)payload.send_after=reminder!.toISOString();
    const sent=await fetch('https://api.onesignal.com/notifications',{method:'POST',headers,body:JSON.stringify(payload)});
    const result=await readJson(sent);
    if(!sent.ok||!result.id||(!future&&result.recipients===0)){
      console.error('OneSignal rejected task reminder',{status:sent.status,errors:result.errors,hasId:Boolean(result.id),recipients:result.recipients,taskId});
      return Response.json({error:'OneSignal no pudo programar este recordatorio.'},{status:502});
    }
    return Response.json({notificationId:result.id,syncStatus:'synced',reminderStatus:future?(reminderStatus==='snoozed'?'snoozed':'scheduled'):'sent'},{headers:{'Cache-Control':'no-store'}});
  }catch(error){
    console.error('Task reminder sync failed',{taskId,message:error instanceof Error?error.message:'Unknown error'});
    return Response.json({error:error instanceof Error?error.message:'No pudimos sincronizar el recordatorio.'},{status:502});
  }
}
