@echo off
chcp 65001 > nul
echo 🔄 Проверка и установка обновлений из GitHub...

:: Проверяем, установлен ли Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Ошибка: Git не установлен на этом компьютере.
    echo Пожалуйста, установите Git перед обновлением.
    pause
    exit /b
)

echo 📥 Загрузка свежего кода...
git fetch origin main
git reset --hard origin/main

echo 📦 Обновление зависимостей Node.js...
call npm install

echo ✨ Проект успешно обновлен до последней версии!
pause
