type OneSignalApi = {
  init(options: Record<string, unknown>): Promise<void>;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  Notifications: { permission: boolean; requestPermission(): Promise<void> };
  User: { externalId: string | null; PushSubscription: { optIn(): Promise<void>; optOut(): Promise<void>; optedIn: boolean; id: string | null; token: string | null } };
};

import type {Task} from './model';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(api: OneSignalApi) => void | Promise<void>>;
  }
}

export type PushState =
  | 'checking'
  | 'unavailable'
  | 'install_required'
  | 'prompt'
  | 'blocked'
  | 'disabled'
  | 'identity_error'
  | 'enabled';

let sdk: Promise<OneSignalApi> | null = null;

function load(appId: string) {
  if (sdk) return sdk;
  sdk = new Promise((resolve, reject) => {
    const fail = (error: Error) => {
      sdk = null;
      reject(error);
    };
    const timeout = window.setTimeout(() => fail(new Error('OneSignal no respondió.')), 15000);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (api) => {
      try {
        await api.init({
          appId,
          serviceWorkerPath: 'sw.js',
          serviceWorkerUpdaterPath: 'sw.js',
          serviceWorkerParam: { scope: '/' },
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
          promptOptions: { slidedown: { prompts: [] } },
        });
        window.clearTimeout(timeout);
        resolve(api);
      } catch (error) {
        window.clearTimeout(timeout);
        fail(error instanceof Error ? error : new Error('No se pudo iniciar OneSignal.'));
      }
    });
    if (!document.querySelector('script[data-dayra-onesignal]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      script.dataset.dayraOnesignal = 'true';
      script.onerror = () => {
        window.clearTimeout(timeout);
        fail(new Error('No se pudo cargar OneSignal.'));
      };
      document.head.appendChild(script);
    }
  });
  return sdk;
}

export function needsIosInstall() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  return ios && !standalone;
}

export async function getPushState(appId: string,uid?:string): Promise<PushState> {
  if (!appId) return 'unavailable';
  if (needsIosInstall()) return 'install_required';
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unavailable';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission === 'default') return 'prompt';
  const api = await load(appId);
  if(!api.Notifications.permission)return 'prompt';
  if(!api.User.PushSubscription.optedIn||!api.User.PushSubscription.id||!api.User.PushSubscription.token)return 'disabled';
  if(uid&&api.User.externalId!==uid)return 'identity_error';
  return 'enabled';
}

export async function getCurrentSubscriptionId(appId:string,uid:string){
  if(await getPushState(appId,uid)!=='enabled')return null;
  return (await load(appId)).User.PushSubscription.id;
}

export async function identifyOneSignal(appId: string, uid: string) {
  if (!appId) return;
  const api = await load(appId);
  await api.login(uid);
}

export async function forgetOneSignal(appId: string) {
  if (!appId || !sdk) return;
  const api = await load(appId);
  await api.logout();
}

export async function requestPushPermission(appId: string,uid:string) {
  if (!appId) throw new Error('OneSignal todavía no está configurado.');
  if (needsIosInstall()) throw new Error('Añade la app a la pantalla de inicio para activar notificaciones.');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    throw new Error('Este dispositivo no admite notificaciones web.');
  }
  if (Notification.permission === 'denied') {
    throw new Error('Las notificaciones están bloqueadas. Actívalas desde los ajustes del dispositivo o navegador.');
  }
  const api = await load(appId);
  await api.login(uid);
  if (Notification.permission !== 'granted' || !api.Notifications.permission) {
    await api.Notifications.requestPermission();
  }
  if (Notification.permission !== 'granted' || !api.Notifications.permission) {
    throw new Error('El permiso de notificaciones no fue concedido.');
  }
  await api.User.PushSubscription.optIn();
  for(let attempt=0;attempt<8;attempt++){
    if(await getPushState(appId,uid)==='enabled')return true;
    await new Promise(resolve=>window.setTimeout(resolve,500));
  }
  throw new Error('El permiso está concedido, pero el dispositivo aún no terminó de suscribirse. Inténtalo otra vez.');
}

export type TaskNotificationSync={notificationId:string|null;syncStatus:'pending'|'synced'|'disabled';reminderStatus:Task['reminder_status'];deferred?:boolean};

export async function syncTaskNotification(token:string,task:Task):Promise<TaskNotificationSync>{
  const response=await fetch('/api/notifications/task',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({taskId:task.id,title:task.title,time:task.time,remindAt:task.remind_at,status:task.status,reminderStatus:task.reminder_status,notificationId:task.one_signal_notification_id})});
  const result=await response.json() as TaskNotificationSync&{error?:string};
  if(!response.ok)throw new Error(result.error||'No pudimos sincronizar el recordatorio.');
  return result;
}

export async function cancelTaskNotification(token:string,task:Task):Promise<void>{
  if(!task.one_signal_notification_id)return;
  const response=await fetch('/api/notifications/task',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({taskId:task.id,title:task.title,time:task.time,remindAt:task.remind_at,status:task.status,reminderStatus:task.reminder_status,notificationId:task.one_signal_notification_id,cancelOnly:true})});
  const result=await response.json() as {error?:string};
  if(!response.ok)throw new Error(result.error||'No pudimos cancelar el recordatorio.');
}
