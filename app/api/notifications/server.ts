import {env} from 'cloudflare:workers';

type FirebaseClaims={aud?:string;iss?:string;sub?:string;exp?:number;iat?:number;auth_time?:number};

function decodeBase64Url(value:string):ArrayBuffer{
  const bytes=atob(value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'='));
  const result=new Uint8Array(new ArrayBuffer(bytes.length));
  for(let index=0;index<bytes.length;index++)result[index]=bytes.charCodeAt(index);
  return result.buffer;
}

export function notificationConfig(){
  const vars=env as unknown as Record<string,string|undefined>;
  const read=(name:string)=>vars[name]||process.env[name]||'';
  return {appId:read('ONESIGNAL_APP_ID'),apiKey:read('ONESIGNAL_REST_API_KEY'),projectId:read('FIREBASE_PROJECT_ID'),appUrl:read('DAYRA_APP_URL')||'https://dayra-mi-dia.antonioramal567.chatgpt.site'};
}

async function verifyFirebaseToken(token:string,projectId:string):Promise<string|null>{
  const parts=token.split('.');
  if(parts.length!==3)return null;
  try{
    const header=JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as {alg?:string;kid?:string};
    const claims=JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as FirebaseClaims;
    const now=Math.floor(Date.now()/1000);
    if(header.alg!=='RS256'||!header.kid||claims.aud!==projectId||claims.iss!==`https://securetoken.google.com/${projectId}`||!claims.sub||claims.sub.length>128||!claims.exp||claims.exp<=now||!claims.iat||claims.iat>now||!claims.auth_time||claims.auth_time>now)return null;
    const response=await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    if(!response.ok)return null;
    const jwks=await response.json() as {keys?:Array<JsonWebKey&{kid?:string}>};
    const jwk=jwks.keys?.find(key=>key.kid===header.kid);
    if(!jwk)return null;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decodeBase64Url(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return valid?claims.sub:null;
  }catch{return null}
}

export async function authenticatedUid(request:Request,projectId:string){
  const bearer=request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  return bearer?verifyFirebaseToken(bearer,projectId):null;
}

export async function uuidFor(value:string){
  const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).slice(0,16);
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=[...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
