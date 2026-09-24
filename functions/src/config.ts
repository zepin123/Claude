import {defineSecret} from 'firebase-functions/params';
export const oneSignalRestKey=defineSecret('ONESIGNAL_REST_API_KEY');
export const oneSignalAppId=defineSecret('ONESIGNAL_APP_ID');
export const oneSignalWebhookSecret=defineSecret('ONESIGNAL_WEBHOOK_SECRET');
export const googleClientId=defineSecret('GOOGLE_OAUTH_CLIENT_ID');
export const googleClientSecret=defineSecret('GOOGLE_OAUTH_CLIENT_SECRET');
export const googleRedirectUri=defineSecret('GOOGLE_OAUTH_REDIRECT_URI');
export const googleEncryptionKey=defineSecret('GOOGLE_TOKEN_ENCRYPTION_KEY');
export const dayraAppUrl=defineSecret('DAYRA_APP_URL');
