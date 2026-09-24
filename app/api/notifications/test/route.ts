import {authenticatedUid,notificationConfig} from '../server';

export const dynamic='force-dynamic';

type OneSignalUser={identity?:{external_id?:string};subscriptions?:Array<{id?:string;enabled?:boolean;type?:string}>};

export async function POST(request:Request){
  const {appId,apiKey,projectId}=notificationConfig();
  if(!appId||!apiKey||!projectId)return Response.json({error:'El envío de notificaciones no está configurado.'},{status:503});
  const uid=await authenticatedUid(request,projectId);
  if(!uid)return Response.json({error:'La sesión caducó. Vuelve a iniciar sesión.'},{status:401});
  let subscriptionId='';
  try{const body=await request.json() as {subscriptionId?:unknown};subscriptionId=typeof body.subscriptionId==='string'?body.subscriptionId:''}catch{return Response.json({error:'Solicitud no válida.'},{status:400})}
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionId))return Response.json({error:'Este dispositivo todavía no está suscrito.'},{status:400});
  const headers={Authorization:`Key ${apiKey}`,'Content-Type':'application/json'};
  try{
    const userResponse=await fetch(`https://api.onesignal.com/apps/${encodeURIComponent(appId)}/users/by/external_id/${encodeURIComponent(uid)}`,{headers,cache:'no-store'});
    if(!userResponse.ok)return Response.json({error:'No pudimos verificar la suscripción de este dispositivo en OneSignal.'},{status:502});
    const user=await userResponse.json() as OneSignalUser;
    const subscription=user.subscriptions?.find(item=>item.id===subscriptionId);
    if(user.identity?.external_id!==uid||!subscription||subscription.enabled!==true)return Response.json({error:'Este dispositivo no tiene una suscripción push activa para tu cuenta.'},{status:409});
    const title='Prueba de notificación';
    const message='Las notificaciones están funcionando correctamente.';
    const sent=await fetch('https://api.onesignal.com/notifications',{method:'POST',headers,body:JSON.stringify({app_id:appId,include_subscription_ids:[subscriptionId],target_channel:'push',headings:{en:title,es:title},contents:{en:message,es:message}})});
    const result=await sent.json() as {id?:string;recipients?:number;errors?:unknown};
    if(!sent.ok||!result.id||result.recipients===0){
      console.error('OneSignal rejected test notification',{status:sent.status,errors:result.errors,hasId:Boolean(result.id),recipients:result.recipients});
      return Response.json({error:'OneSignal no aceptó el envío a este dispositivo.'},{status:502});
    }
    return Response.json({accepted:true,message:'OneSignal aceptó el envío. Comprueba que la notificación aparezca en tu dispositivo.'},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'No pudimos contactar con OneSignal. Inténtalo de nuevo.'},{status:502})}
}
