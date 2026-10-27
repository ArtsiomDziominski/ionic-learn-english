# Сборка релиза для Google Play

## Что нужно один раз

- JDK 21 (Capacitor 8 компилируется под Java 21), например Temurin 21.
- Android SDK с платформой 36.
- Ключ загрузки и `android/keystore.properties` (в git не попадают):

```properties
storeFile=C:/Users/User/keys/learnenglisheasy-upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

Без `keystore.properties` release-сборка получается неподписанной.
Ключ и пароль храните в менеджере паролей и в резервной копии: потеряв
ключ загрузки, придётся просить Google сбросить его через Play Console.

## Каждый релиз

1. Поднимите `versionCode` (на 1) и `versionName` в `android/app/build.gradle`.
2. Соберите веб-часть и перенесите её в Android-проект:
   `npm run build:android`
3. Соберите AAB (PowerShell, из папки `android`):

```powershell
$env:JAVA_HOME = "C:\Users\User\AppData\Local\Programs\Temurin\jdk-21.0.12.1+1"
.\gradlew.bat bundleRelease
```

4. Загрузите `android/app/build/outputs/bundle/release/app-release.aab`
   в Play Console.
