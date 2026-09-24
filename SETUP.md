# Configuración de Mi día

## Firebase

El proyecto actual es `dayra-mi-dia` (plan Spark). Activa Authentication con correo y contraseña y autoriza el dominio publicado. Configura las variables públicas de `.env.example` en Sites y publica `firestore.rules` antes de usar «Crear mi cuenta». El registro crea una cuenta en Auth y un perfil `users/{uid}` con `role: user`; el cliente no puede darse permisos de administrador. Para un administrador, asigna el rol desde un entorno de confianza. Mantén las reglas cerradas por UID.

Para desplegar reglas desde una sesión con acceso al proyecto:

```sh
npx firebase-tools login
npx firebase-tools use dayra-mi-dia
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Las credenciales públicas de Firebase son las de la aplicación web, no secretos. El inicio de sesión persiste en el dispositivo. Los cambios de tareas, agenda, listas y hábitos se guardan en Firestore.

## OneSignal

Configura Web Push para el dominio publicado, con `/sw.js` y scope `/`. Guarda `ONESIGNAL_APP_ID` como variable pública de Sites. Guarda `ONESIGNAL_REST_API_KEY` **solo como secreto del servidor en Sites**: la ruta `/api/notifications/test` verifica el token de Firebase, comprueba que la suscripción pertenece al UID y envía la prueba a ese dispositivo. Nunca pongas esta clave en el navegador.

En iPhone o iPad: abre la web en Safari, añádela a la pantalla de inicio, ábrela desde el icono, inicia sesión y activa las notificaciones desde Ajustes. El permiso debe solicitarse desde ese botón. Pulsa «Enviar notificación de prueba» y comprueba que aparezca físicamente en el dispositivo. La confirmación de la API solo significa que OneSignal aceptó el envío.

Los recordatorios de tareas se programan desde el backend de Sites usando la clave privada de OneSignal. Al guardar, posponer, completar o eliminar una tarea, la app sincroniza el aviso y conserva su identificador en Firestore. Los avisos con más de 29 días de anticipación quedan pendientes y se programan automáticamente cuando la app vuelve a abrirse dentro de ese plazo.

## Google Calendar

La integración existente usa Firebase Functions para OAuth, sincronización y cifrado de tokens. También permanece desactivada en Spark. Para activarla, habilita Google Calendar API, crea el cliente OAuth y configura `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_TOKEN_ENCRYPTION_KEY` y `DAYRA_APP_URL` como secretos de Functions. Despliega Functions, verifica conexión y sincronización, y solo entonces activa `GOOGLE_CALENDAR_ENABLED` en Sites. La agenda local funciona sin esa conexión.

## Verificación

Ejecuta lint, TypeScript, pruebas y build. Después prueba con una cuenta real: registro, nueva sesión, guardar una tarea, recargar, cerrar y volver a abrir, instalación PWA y notificación física. Prueba con una segunda cuenta para confirmar que no puede leer datos ajenos. Si faltan reglas publicadas o la clave REST, esas funciones siguen pendientes aunque el build pase.
