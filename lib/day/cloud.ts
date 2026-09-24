import {collection,getDocs} from 'firebase/firestore';
import {httpsCallable} from 'firebase/functions';
import type {FirebaseServices} from '@/firebase/client';
import type {Profile} from './model';

export async function listProfiles(services:FirebaseServices):Promise<Profile[]>{const snap=await getDocs(collection(services.db,'users'));return snap.docs.map(d=>{const p=d.data();return {id:d.id,display_name:String(p.name||p.email||'Usuario'),role:p.role==='admin'?'admin':'user',active:p.active!==false,created_at:String(p.createdAt||'')}})}
export async function setUserActive(services:FirebaseServices,uid:string,active:boolean){await httpsCallable<{uid:string;active:boolean},void>(services.functions,'setUserActive')({uid,active})}
export async function beginGoogleCalendarConnection(services:FirebaseServices){const result=await httpsCallable<Record<string,never>,{authUrl:string}>(services.functions,'beginGoogleCalendarConnection')({});if(!result.data.authUrl)throw new Error('No se recibió el enlace de Google.');window.location.assign(result.data.authUrl)}
export async function syncGoogleCalendar(services:FirebaseServices){await httpsCallable<Record<string,never>,{ok:boolean}>(services.functions,'syncGoogleCalendar')({})}
