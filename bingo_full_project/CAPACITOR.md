
# Generar APK usando Capacitor (Ionic / Capacitor)

1. Desde tu proyecto React:
   - npm run build
   - npm install @capacitor/core @capacitor/cli --save
   - npx cap init com.tuempresa.bingo "BingoApp"
   - npx cap add android
   - Edita capacitor.config.json si es necesario (webDir: "build")
   - npx cap copy android
   - Abre Android Studio: npx cap open android
   - En Android Studio: Build > Generate Signed Bundle / APK

Requisitos: Android Studio, JDK, herramientas de firma (keystore).
