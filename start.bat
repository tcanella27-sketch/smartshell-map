@echo off
chcp 65001 > nul
echo 🚀 Запуск сервера карты SmartShell...

:: Автоматически открываем карту в браузере по умолчанию
start http://localhost:3000

:: Запускаем Node.js сервер
node server.js
