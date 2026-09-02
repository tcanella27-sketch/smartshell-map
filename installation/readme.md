1. Установить node.js
далее всё через cmd
2. переходим в папку с файлом server.js (cd ..\..\)
3. в первый раз запускаем:
   npm install @xlsft/smartshell-sdk
   npm install express
4. Запуск сайта 
   node server.js

режим киоск:
chrome --kiosk http://localhost:3000
или
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk http://localhost:3000


полезные ключи:
--kiosk
--start-fullscreen
--disable-infobars
--autoplay-policy=no-user-gesture-required

**win**
chrome --kiosk --disable-infobars http://localhost:3000
или
msedge --kiosk http://localhost:3000 --edge-kiosk-type=public-browsing

**Linux:**
google-chrome --kiosk http://localhost:3000
или 
chromium-browser --kiosk http://localhost:3000
