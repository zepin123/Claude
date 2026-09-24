"use client";
import {getApp,getApps,initializeApp,type FirebaseApp,type FirebaseOptions} from 'firebase/app';
import {browserLocalPersistence,getAuth,setPersistence,type Auth} from 'firebase/auth';
import {getFirestore,initializeFirestore,memoryLocalCache,persistentLocalCache,persistentMultipleTabManager,type Firestore} from 'firebase/firestore';
import {getFunctions,type Functions} from 'firebase/functions';

export interface PublicConfig {
  firebase: FirebaseOptions;
  firebaseConfigured: boolean;
  oneSignalAppId: string;
  googleCalendarConfigured: boolean;
  functionsRegion: string;
}

export interface FirebaseServices {app:FirebaseApp;auth:Auth;db:Firestore;functions:Functions;config:PublicConfig}
let servicesPromise:Promise<FirebaseServices|null>|null=null;

async function readConfig():Promise<PublicConfig>{
  const response=await fetch('/api/config',{cache:'no-store'});
  if(!response.ok)throw new Error('No se pudo cargar la configuración de Firebase.');
  return response.json() as Promise<PublicConfig>;
}

export function configureFirebase(){
  if(servicesPromise)return servicesPromise;
  servicesPromise=(async()=>{
    const config=await readConfig();
    if(!config.firebaseConfigured)return null;
    const app=getApps().length?getApp():initializeApp(config.firebase);
    let db:Firestore;
    try{db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})}
    catch{try{db=getFirestore(app)}catch{db=initializeFirestore(app,{localCache:memoryLocalCache()})}}
    const auth=getAuth(app);
    await setPersistence(auth,browserLocalPersistence);
    return {app,auth,db,functions:getFunctions(app,config.functionsRegion||'us-central1'),config};
  })();
  return servicesPromise;
}
