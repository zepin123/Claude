# Mi día · Dayra

PWA para tareas, agenda, hábitos y listas. Usa Firebase Authentication y Cloud Firestore para cuentas y datos privados, OneSignal para Web Push y Sites para alojar la web.

La pantalla de acceso permite iniciar sesión, recuperar contraseña o crear una cuenta. El registro crea el perfil Firestore con rol `user`. La demostración usa datos temporales y está señalada como tal.

La prueba y los recordatorios de tareas se envían desde rutas seguras del servidor de Sites. La app programa, reprograma y cancela mensajes en OneSignal al guardar, posponer, completar o eliminar una tarea, sin depender de Firebase Functions. Google Calendar continúa como integración opcional.

La PWA incluye manifest, iconos, service worker compartido con OneSignal, modo standalone, safe areas y página offline. No guarda datos privados en la caché estática.

## Desarrollo

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Consulta [SETUP.md](./SETUP.md) para variables, reglas de Firebase, OneSignal, instalación en iPhone y funciones externas pendientes.
