### Authentication Example App

Demo-App für Schulungszwecke.

Die App basiert auf React Native und Expo.

## Installationsanleitung

1. Repository clonen
2. GitHub OAuth App erstellen (https://github.com/settings/developers). Dabei `exp://127.0.0.1:19000/--/oauth/github` als im Feld `Authorization callback URL` hinterlegen.
3. `.env` Datei im Projektverzeichnis erstellen
4. `CLIENT_ID` und `CLIENT_SECRET` der GitHub OAuth App in `.env` Datei hinterlegen
5. In das Projektverzeichnis wechseln
6. `npm install` ausführen
7. `npm start` ausführen

## Hinweis:

Mit Hilfe dieser App wird eine Authentifizierung auf Basis des Authorization Code Flows vereinfacht dargestellt. Der verwendete Code sollte <u>nicht</u> für produktive Apps verwendet werden!

Die App ist derzeit so aufgebaut, dass sie ein Client-Secret benötigt, um einen Access-Token anzufordern. Ein Client-Secret sollte in produktiven App <u>niemals</u> vorhanden sein! Im Sinne von OAuth ist eine App ein öffentlicher und nicht-vertrauenswürdiger Client und darf daher keine Geheimnisse, wie ein Client-Secret enthalten.

Produktive Apps sollten daher den Authorization Code Flow mit <u>Proof Key for Code Exchange</u> (PKCE) umsetzen, da in diesem Fall kein Client-Secret in der App erforderlich ist.

Leider unterstützt GitHub PKCE derzeit nicht: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps.

> The PKCE (Proof Key for Code Exchange) parameters code_challenge and code_challenge_method are not supported at this time.