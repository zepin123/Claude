/**
 * The browser application never imports Firebase Admin. Trusted Admin SDK setup
 * lives in functions/src/firebase/admin.ts and is deployed only to Cloud Functions.
 */
export const FIREBASE_ADMIN_LOCATION='functions/src/firebase/admin.ts';
