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
# 🗺️ Интерактивная карта компьютерного клуба SmartShell

Локальное информационное табло для второго монитора администратора. Автоматически подтягивает сетку зала, отображает статусы компьютеров (свободен/занят) в реальном времени и выводит текущие бронирования со значком замка прямо из SmartShell API.

## 🚀 Инструкция по установке на новом компьютере

Выполните эти простые шаги один раз для первоначальной настройки проекта:

1. **Установите Node.js** (версии 18 или выше) с официального сайта: https://nodejs.org
2. **Установите Git** в командной строке (CMD) от имени администратора:
   ```bash
   winget install --id Git.Git -e --source winget
   ```
   *После установки обязательно перезапустите окно CMD.*
3. **Клонируйте (скачайте) этот репозиторий** в любую удобную папку на компьютере:
   ```bash
   git clone HTTPS_ССЫЛКА_НА_ВАШ_РЕПОЗИТОРИЙ
   ```
4. **Перейдите в папку проекта** и установите все необходимые библиотеки:
   ```bash
   cd имя_папки_проекта
   npm install
   ```
5. **Настройте доступы:** Откройте файл `smartshell.js` и укажите ваш реальный пароль и логин от админки клуба.

## 💻 Использование

* **`start.bat`** — дважды кликните по этому файлу для запуска проекта. Он запустит сервер бэкенда и автоматически откроет карту в вашем браузере по адресу `http://localhost:3000`.
* **`update.bat`** — дважды кликните по этому файлу, чтобы мгновенно накатить любые обновления кода, которые вы загрузите на GitHub в будущем. Скрипт сам скачает код и обновит Node-пакеты.
